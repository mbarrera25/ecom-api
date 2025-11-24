import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWT_REFRESH_EXPIRES_TOKEN } from './auth.constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PasswordService } from './password.service';

@Global()
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        const accessExpiresEnv = process.env.JWT_ACCESS_EXPIRES;
        const accessExpiresIn: StringValue = accessExpiresEnv
          ? (accessExpiresEnv as StringValue)
          : '15m';

        return {
          secret: process.env.JWT_SECRET || 'change-me',
          signOptions: {
            expiresIn: accessExpiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    JwtAuthGuard,
    JwtStrategy,
    {
      provide: JWT_REFRESH_EXPIRES_TOKEN,
      useFactory: (): StringValue => {
        const refreshExpiresEnv = process.env.JWT_REFRESH_EXPIRES;
        return (refreshExpiresEnv ?? '7d') as StringValue;
      },
    },
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    PasswordService,
    JwtAuthGuard,
    JWT_REFRESH_EXPIRES_TOKEN,
  ],
})
export class AuthModule {}
