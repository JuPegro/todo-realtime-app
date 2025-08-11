import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { WsJwtAuthGuard } from './ws-jwt-auth.guard';
import { Socket } from 'socket.io';

describe('WsJwtAuthGuard', () => {
  let guard: WsJwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let mockSocket: jest.Mocked<Socket>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;

  beforeEach(async () => {
    const mockJwtService = {
      verify: jest.fn(),
    };

    mockSocket = {
      handshake: {
        headers: {},
        query: {},
        auth: {},
      },
      data: {},
    } as any;

    mockExecutionContext = {
      switchToWs: jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(mockSocket),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsJwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<WsJwtAuthGuard>(WsJwtAuthGuard);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true with valid token from Authorization header', () => {
      const payload = { sub: 'user1', email: 'test@example.com' };
      mockSocket.handshake.headers.authorization = 'Bearer valid-token';
      jwtService.verify.mockReturnValue(payload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(mockSocket.data.user).toEqual(payload);
    });

    it('should return true with valid token from query string', () => {
      const payload = { sub: 'user1', email: 'test@example.com' };
      mockSocket.handshake.query.token = 'valid-token';
      jwtService.verify.mockReturnValue(payload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(mockSocket.data.user).toEqual(payload);
    });

    it('should return true with valid token from auth object', () => {
      const payload = { sub: 'user1', email: 'test@example.com' };
      mockSocket.handshake.auth.token = 'valid-token';
      jwtService.verify.mockReturnValue(payload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(mockSocket.data.user).toEqual(payload);
    });

    it('should throw WsException when no token is provided', () => {
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(WsException);
    });

    it('should throw WsException when token is invalid', () => {
      mockSocket.handshake.headers.authorization = 'Bearer invalid-token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(WsException);
    });

    it('should throw WsException when Authorization header is malformed', () => {
      mockSocket.handshake.headers.authorization = 'InvalidBearer token';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(WsException);
    });

    it('should handle query token as array', () => {
      mockSocket.handshake.query.token = ['token1', 'token2'];

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(WsException);
    });

    it('should prioritize Authorization header over query string', () => {
      const payload = { sub: 'user1', email: 'test@example.com' };
      mockSocket.handshake.headers.authorization = 'Bearer header-token';
      mockSocket.handshake.query.token = 'query-token';
      jwtService.verify.mockReturnValue(payload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('header-token');
    });

    it('should fall back to query string when Authorization header is missing', () => {
      const payload = { sub: 'user1', email: 'test@example.com' };
      mockSocket.handshake.query.token = 'query-token';
      jwtService.verify.mockReturnValue(payload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('query-token');
    });

    it('should fall back to auth object when Authorization header and query are missing', () => {
      const payload = { sub: 'user1', email: 'test@example.com' };
      mockSocket.handshake.auth.token = 'auth-token';
      jwtService.verify.mockReturnValue(payload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('auth-token');
    });
  });
});