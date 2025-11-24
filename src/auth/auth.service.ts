import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import type { StringValue } from 'ms';
import { randomUUID } from 'crypto';
import { UsersService, SafeUser } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponseDto,
  AuthTokensDto,
  ForgotPasswordResponseDto,
  LogoutResponseDto,
  ResetPasswordResponseDto,
} from './dto/auth-response.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset.dto';
import { PasswordService } from './password.service';
import { JWT_REFRESH_EXPIRES_TOKEN } from './auth.constants';

const RESET_PASSWORD_TTL_SECONDS = 60 * 15; // 15 minutos

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  type?: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    @Inject(JWT_REFRESH_EXPIRES_TOKEN) private readonly refreshExpiresIn: StringValue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = this.normalizeEmail(dto.email);
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    const user = await this.usersService.createUser({
      email,
      name: dto.name,
      passwordHash,
    });

    const tokens = await this.generateTokens(user);
    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = this.normalizeEmail(dto.email);
    const userDoc = await this.usersService.findByEmail(email, {
      includePassword: true,
    });

    if (!userDoc?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.passwordService.comparePassword(
      dto.password,
      userDoc.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = this.usersService.toSafeUser(userDoc);
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async refresh(dto: RefreshDto): Promise<AuthResponseDto> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    return { user, tokens };
  }

  async logout(): Promise<LogoutResponseDto> {
    return { success: true };
  }

  async forgot(dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    const userDoc = await this.usersService.findByEmail(this.normalizeEmail(dto.email));

    if (!userDoc) {
      return { success: true, resetToken: '' };
    }

    const user = this.usersService.toSafeUser(userDoc);
    const resetToken = randomUUID();
    await this.cacheManager.set(this.buildResetCacheKey(resetToken), user.id, RESET_PASSWORD_TTL_SECONDS);

    return { success: true, resetToken };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    const cacheKey = this.buildResetCacheKey(dto.token);
    const userId = await this.cacheManager.get<string>(cacheKey);

    if (!userId) {
      throw new BadRequestException('Reset token is invalid or expired');
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);
    await this.usersService.updatePassword(userId, passwordHash);
    await this.cacheManager.del(cacheKey);

    return { success: true };
  }

  private async generateTokens(user: SafeUser): Promise<AuthTokensDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      type: 'access',
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn: this.refreshExpiresIn },
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private buildResetCacheKey(token: string): string {
    return `auth:reset:${token}`;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
