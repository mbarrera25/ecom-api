import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { AuthService } from './auth.service';
import { UsersService, SafeUser } from '../users/users.service';
import { JWT_REFRESH_EXPIRES_TOKEN } from './auth.constants';

describe('AuthService', () => {
  let authService: AuthService;
  let passwordService: PasswordService;
  let jwtService: JwtService;
  const usersServiceMock: jest.Mocked<
    Pick<UsersService, 'createUser' | 'findByEmail' | 'toSafeUser' | 'findById' | 'updatePassword'>
  > = {
    createUser: jest.fn(),
    findByEmail: jest.fn(),
    toSafeUser: jest.fn(),
    findById: jest.fn(),
    updatePassword: jest.fn(),
  };

  const cacheMock = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    usersServiceMock.createUser.mockReset();
    usersServiceMock.findByEmail.mockReset();
    usersServiceMock.toSafeUser.mockReset();
    usersServiceMock.findById.mockReset();
    usersServiceMock.updatePassword.mockReset();
    cacheMock.set.mockReset();
    cacheMock.get.mockReset();
    cacheMock.del.mockReset();

    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [
        AuthService,
        PasswordService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheMock,
        },
        {
          provide: JWT_REFRESH_EXPIRES_TOKEN,
          useValue: '7d',
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    passwordService = moduleRef.get(PasswordService);
    jwtService = moduleRef.get(JwtService);
  });

  it('registers a new user and returns tokens', async () => {
    const safeUser: SafeUser = {
      id: 'user-id',
      email: 'customer@example.com',
      name: 'Customer',
      roles: ['customer'],
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usersServiceMock.createUser.mockResolvedValue(safeUser);

    const result = await authService.register({
      email: 'customer@example.com',
      name: 'Customer',
      password: 'Password123!',
    });

    expect(usersServiceMock.createUser).toHaveBeenCalledTimes(1);
    const createArgs = usersServiceMock.createUser.mock.calls[0][0];
    expect(createArgs.email).toBe('customer@example.com');
    expect(createArgs.passwordHash).not.toEqual('Password123!');
    expect(result.user).toEqual(safeUser);
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
    expect(result.tokens.tokenType).toBe('Bearer');
    expect(await jwtService.verifyAsync(result.tokens.accessToken)).toBeDefined();
  });

  it('logs in an existing user with valid credentials', async () => {
    const safeUser: SafeUser = {
      id: 'user-id',
      email: 'customer@example.com',
      name: 'Customer',
      roles: ['customer'],
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const passwordHash = await passwordService.hashPassword('Password123!');

    const userDocumentMock: any = {
      _id: 'user-id',
      email: safeUser.email,
      name: safeUser.name,
      roles: safeUser.roles,
      passwordHash,
      toObject: () => ({
        _id: 'user-id',
        email: safeUser.email,
        name: safeUser.name,
        roles: safeUser.roles,
        addresses: [],
        createdAt: safeUser.createdAt,
        updatedAt: safeUser.updatedAt,
      }),
    };

    usersServiceMock.findByEmail.mockResolvedValue(userDocumentMock);
    usersServiceMock.toSafeUser.mockReturnValue(safeUser);

    const result = await authService.login({
      email: 'customer@example.com',
      password: 'Password123!',
    });

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('customer@example.com', {
      includePassword: true,
    });
    expect(usersServiceMock.toSafeUser).toHaveBeenCalledWith(userDocumentMock);
    expect(result.user).toEqual(safeUser);
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });
});

