import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { UserService } from '../../user/user.service';
import { createMockUser } from '../../../../test/mocks/prisma.mock';
import { UserNotFoundException } from '../../../common/exceptions/custom.exceptions';
import { TokenBlacklistService } from '../services/token-blacklist.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userService: jest.Mocked<UserService>;
  let tokenBlacklistService: jest.Mocked<TokenBlacklistService>;

  beforeEach(async () => {
    const mockUserService = {
      findById: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const mockTokenBlacklistService = {
      isBlacklisted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TokenBlacklistService, useValue: mockTokenBlacklistService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get(UserService);
    tokenBlacklistService = module.get(TokenBlacklistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const mockPayload: JwtPayload = {
      sub: 'user-id',
      email: 'test@example.com',
      iat: Date.now(),
      exp: Date.now() + 3600,
    };

    const mockRequest = {
      headers: {
        authorization: 'Bearer jwt-token',
      },
    } as any;

    it('should return user when payload and token are valid', async () => {
      const mockUser = createMockUser({ id: mockPayload.sub });
      userService.findById.mockResolvedValue(mockUser);
      tokenBlacklistService.isBlacklisted.mockReturnValue(false);

      const result = await strategy.validate(mockRequest, mockPayload);

      expect(tokenBlacklistService.isBlacklisted).toHaveBeenCalledWith('jwt-token');
      expect(userService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when token is blacklisted', async () => {
      tokenBlacklistService.isBlacklisted.mockReturnValue(true);

      await expect(strategy.validate(mockRequest, mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when no token in header', async () => {
      const mockRequestWithoutToken = { headers: {} } as any;

      await expect(strategy.validate(mockRequestWithoutToken, mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      tokenBlacklistService.isBlacklisted.mockReturnValue(false);
      userService.findById.mockRejectedValue(new UserNotFoundException());

      await expect(strategy.validate(mockRequest, mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});