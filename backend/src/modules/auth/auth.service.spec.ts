import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { InvalidCredentialsException } from '../../common/exceptions/custom.exceptions';
import { createMockUser } from '../../../test/mocks/prisma.mock';
import { TokenBlacklistService } from './services/token-blacklist.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let tokenBlacklistService: jest.Mocked<TokenBlacklistService>;

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      validatePassword: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockTokenBlacklistService = {
      addToBlacklist: jest.fn(),
      isBlacklisted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: TokenBlacklistService, useValue: mockTokenBlacklistService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    tokenBlacklistService = module.get(TokenBlacklistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockUser = createMockUser({
        email: registerDto.email,
        name: registerDto.name,
      });

      const mockToken = 'jwt-token';

      userService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.register(registerDto);

      expect(userService.create).toHaveBeenCalledWith(registerDto);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: expect.not.objectContaining({ password: expect.anything() }),
        access_token: mockToken,
      });
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockUser({ email: loginDto.email });
      const mockToken = 'jwt-token';

      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(userService.validatePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: expect.not.objectContaining({ password: expect.anything() }),
        access_token: mockToken,
      });
    });

    it('should throw InvalidCredentialsException when user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );

      expect(userService.validatePassword).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException with invalid password', async () => {
      const mockUser = createMockUser({ email: loginDto.email });
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      const userId = 'user-id';
      const mockUser = createMockUser({ id: userId });

      userService.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(userService.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should add token to blacklist', async () => {
      const token = 'jwt-token';

      await service.logout(token);

      expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(token);
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true for blacklisted token', () => {
      const token = 'blacklisted-token';
      tokenBlacklistService.isBlacklisted.mockReturnValue(true);

      const result = service.isTokenBlacklisted(token);

      expect(tokenBlacklistService.isBlacklisted).toHaveBeenCalledWith(token);
      expect(result).toBe(true);
    });

    it('should return false for non-blacklisted token', () => {
      const token = 'valid-token';
      tokenBlacklistService.isBlacklisted.mockReturnValue(false);

      const result = service.isTokenBlacklisted(token);

      expect(result).toBe(false);
    });
  });
});