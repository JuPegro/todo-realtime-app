import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createMockUser } from '../../../test/mocks/prisma.mock';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockResponse = {
        user: createMockUser({ email: registerDto.email, name: registerDto.name }),
        access_token: 'jwt-token',
      };

      // Remove password from mock response
      delete (mockResponse.user as any).password;

      authService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        user: createMockUser({ email: loginDto.email }),
        access_token: 'jwt-token',
      };

      // Remove password from mock response
      delete (mockResponse.user as any).password;

      authService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const mockUser = createMockUser();

      const result = await controller.getProfile(mockUser);

      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        }),
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user without password', async () => {
      const mockUser = createMockUser();

      const result = await controller.getCurrentUser(mockUser);

      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        }),
      );
    });
  });

  describe('logout', () => {
    it('should return success message and logout user', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer jwt-token',
        },
      } as any;

      authService.logout = jest.fn();

      const result = await controller.logout(mockRequest);

      expect(authService.logout).toHaveBeenCalledWith('jwt-token');
      expect(result).toEqual({
        message: 'Sesión cerrada exitosamente',
        statusCode: 200,
      });
    });

    it('should return success message even without token', async () => {
      const mockRequest = {
        headers: {},
      } as any;

      authService.logout = jest.fn();

      const result = await controller.logout(mockRequest);

      expect(authService.logout).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Sesión cerrada exitosamente',
        statusCode: 200,
      });
    });
  });
});