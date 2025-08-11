import { Test, TestingModule } from '@nestjs/testing';
import { OwnershipValidationService } from './ownership-validation.service';
import { PrismaService } from './prisma.service';
import { TaskForbiddenException, TaskNotFoundException } from '../exceptions';

describe('OwnershipValidationService', () => {
  let service: OwnershipValidationService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      task: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipValidationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OwnershipValidationService>(OwnershipValidationService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTaskOwnership', () => {
    it('should pass validation when user owns the task', async () => {
      const taskId = '1';
      const userId = 'user1';

      prismaService.task.findUnique.mockResolvedValue({
        id: taskId,
        userId: userId,
      });

      await expect(service.validateTaskOwnership(taskId, userId)).resolves.not.toThrow();
    });

    it('should throw TaskNotFoundException when task does not exist', async () => {
      const taskId = '999';
      const userId = 'user1';

      prismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.validateTaskOwnership(taskId, userId)).rejects.toThrow(TaskNotFoundException);
    });

    it('should throw TaskForbiddenException when user does not own the task', async () => {
      const taskId = '1';
      const userId = 'user1';
      const anotherUserId = 'user2';

      prismaService.task.findUnique.mockResolvedValue({
        id: taskId,
        userId: anotherUserId,
      });

      await expect(service.validateTaskOwnership(taskId, userId)).rejects.toThrow(TaskForbiddenException);
    });
  });

  describe('validateUserOwnership', () => {
    it('should pass validation when user validates themselves', async () => {
      const userId = 'user1';

      prismaService.user.findUnique.mockResolvedValue({
        id: userId,
      });

      await expect(service.validateUserOwnership(userId, userId, 'user')).resolves.not.toThrow();
    });

    it('should throw TaskNotFoundException when user does not exist', async () => {
      const resourceId = '999';
      const userId = 'user1';

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUserOwnership(resourceId, userId, 'user')).rejects.toThrow(TaskNotFoundException);
    });

    it('should throw TaskForbiddenException when user tries to access another user', async () => {
      const resourceId = 'user2';
      const userId = 'user1';

      prismaService.user.findUnique.mockResolvedValue({
        id: resourceId,
      });

      await expect(service.validateUserOwnership(resourceId, userId, 'user')).rejects.toThrow(TaskForbiddenException);
    });
  });

  describe('taskExists', () => {
    it('should return true when task exists', async () => {
      const taskId = '1';

      prismaService.task.findUnique.mockResolvedValue({
        id: taskId,
      });

      const result = await service.taskExists(taskId);
      expect(result).toBe(true);
    });

    it('should return false when task does not exist', async () => {
      const taskId = '999';

      prismaService.task.findUnique.mockResolvedValue(null);

      const result = await service.taskExists(taskId);
      expect(result).toBe(false);
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      const userId = 'user1';

      prismaService.user.findUnique.mockResolvedValue({
        id: userId,
      });

      const result = await service.userExists(userId);
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      const userId = '999';

      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.userExists(userId);
      expect(result).toBe(false);
    });
  });
});