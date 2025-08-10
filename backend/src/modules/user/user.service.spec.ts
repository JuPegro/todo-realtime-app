import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../common/services/prisma.service';
import { EmailAlreadyExistsException, UserNotFoundException } from '../../common/exceptions/custom.exceptions';
import { createMockUser } from '../../../test/mocks/prisma.mock';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService, DeepMockProxy<PrismaClient>>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create a user successfully', async () => {
      const hashedPassword = 'hashed_password';
      const expectedUser = createMockUser({
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
      });

      prisma.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      prisma.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          name: createUserDto.name,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw EmailAlreadyExistsException when email exists', async () => {
      const existingUser = createMockUser({ email: createUserDto.email });
      prisma.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        EmailAlreadyExistsException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const email = 'test@example.com';
      const expectedUser = createMockUser({ email });
      prisma.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findByEmail(email);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      const email = 'notfound@example.com';
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const userId = 'user-id';
      const expectedUser = createMockUser({ id: userId });
      prisma.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findById(userId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw UserNotFoundException when user not found', async () => {
      const userId = 'nonexistent-id';
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashed_password';
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validatePassword(plainPassword, hashedPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const plainPassword = 'wrongpassword';
      const hashedPassword = 'hashed_password';
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validatePassword(plainPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = 'user-id';
      const updateDto = { name: 'Updated Name' };
      const existingUser = createMockUser({ id: userId });
      const updatedUser = createMockUser({ id: userId, name: updateDto.name });

      prisma.user.findUnique.mockResolvedValue(existingUser);
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateDto,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should hash password when updating password', async () => {
      const userId = 'user-id';
      const newPassword = 'newpassword123';
      const hashedPassword = 'new_hashed_password';
      const updateDto = { password: newPassword };
      const existingUser = createMockUser({ id: userId });
      const updatedUser = createMockUser({ id: userId, password: hashedPassword });

      prisma.user.findUnique.mockResolvedValue(existingUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      prisma.user.update.mockResolvedValue(updatedUser);

      await service.update(userId, updateDto);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    });
  });
});