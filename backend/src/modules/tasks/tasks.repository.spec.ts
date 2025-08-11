import { Test, TestingModule } from '@nestjs/testing';
import { TasksRepository } from './tasks.repository';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateTaskData, UpdateTaskData, TaskQuery } from './interfaces/task.interface';

describe('TasksRepository', () => {
  let repository: TasksRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    type: 'personal',
    taskDate: new Date('2024-01-15'),
    startTime: new Date('2024-01-15T09:00:00Z'),
    endTime: new Date('2024-01-15T10:00:00Z'),
    userId: 'user1',
    completedById: null,
    completedAt: null,
    createdAt: new Date('2024-01-10T00:00:00Z'),
    updatedAt: new Date('2024-01-10T00:00:00Z'),
    user: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
    },
    completedBy: null,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      task: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<TasksRepository>(TasksRepository);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const createData: CreateTaskData = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        type: 'work',
        taskDate: new Date('2024-01-20'),
        startTime: new Date('2024-01-20T09:00:00Z'),
        endTime: new Date('2024-01-20T11:00:00Z'),
      };
      const userId = 'user1';

      prismaService.task.create.mockResolvedValue(mockTask);

      const result = await repository.create(createData, userId);

      expect(result).toEqual(mockTask);
      expect(prismaService.task.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          userId,
        },
        include: expect.objectContaining({
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          completedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        }),
      });
    });
  });

  describe('findById', () => {
    it('should find a task by id and userId', async () => {
      const taskId = '1';
      const userId = 'user1';

      prismaService.task.findFirst.mockResolvedValue(mockTask);

      const result = await repository.findById(taskId, userId);

      expect(result).toEqual(mockTask);
      expect(prismaService.task.findFirst).toHaveBeenCalledWith({
        where: {
          id: taskId,
          userId,
        },
        include: expect.any(Object),
      });
    });

    it('should return null when task is not found', async () => {
      const taskId = '999';
      const userId = 'user1';

      prismaService.task.findFirst.mockResolvedValue(null);

      const result = await repository.findById(taskId, userId);

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should find tasks with pagination', async () => {
      const userId = 'user1';
      const query: TaskQuery = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const mockTasks = [mockTask];
      const mockCount = 1;

      prismaService.task.findMany.mockResolvedValue(mockTasks);
      prismaService.task.count.mockResolvedValue(mockCount);

      const result = await repository.findMany(userId, query);

      expect(result).toEqual({
        tasks: mockTasks,
        total: mockCount,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(prismaService.task.count).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should handle search filter', async () => {
      const userId = 'user1';
      const query: TaskQuery = {
        page: 1,
        limit: 10,
        search: 'test',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      prismaService.task.findMany.mockResolvedValue([]);
      prismaService.task.count.mockResolvedValue(0);

      await repository.findMany(userId, query);

      expect(prismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            OR: [
              { title: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should handle priority filter', async () => {
      const userId = 'user1';
      const query: TaskQuery = {
        page: 1,
        limit: 10,
        priority: 'high',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      prismaService.task.findMany.mockResolvedValue([]);
      prismaService.task.count.mockResolvedValue(0);

      await repository.findMany(userId, query);

      expect(prismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            priority: 'high',
          },
        }),
      );
    });

    it('should handle date range filter', async () => {
      const userId = 'user1';
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-01-31');
      const query: TaskQuery = {
        page: 1,
        limit: 10,
        dateFrom,
        dateTo,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      prismaService.task.findMany.mockResolvedValue([]);
      prismaService.task.count.mockResolvedValue(0);

      await repository.findMany(userId, query);

      expect(prismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            taskDate: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),
      );
    });
  });

  describe('findAllTasks', () => {
    it('should find all tasks without userId filter', async () => {
      const query: TaskQuery = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const mockTasks = [mockTask];
      const mockCount = 1;

      prismaService.task.findMany.mockResolvedValue(mockTasks);
      prismaService.task.count.mockResolvedValue(mockCount);

      const result = await repository.findAllTasks(query);

      expect(result).toEqual({
        tasks: mockTasks,
        total: mockCount,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const taskId = '1';
      const userId = 'user1';
      const updateData: UpdateTaskData = {
        title: 'Updated Task',
        completed: true,
      };

      const updatedTask = { ...mockTask, ...updateData };
      prismaService.task.update.mockResolvedValue(updatedTask);

      const result = await repository.update(taskId, updateData, userId);

      expect(result).toEqual(updatedTask);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId, userId },
        data: expect.objectContaining({
          ...updateData,
          completedAt: expect.any(Date),
          completedById: userId,
        }),
        include: expect.any(Object),
      });
    });

    it('should clear completion data when marking as incomplete', async () => {
      const taskId = '1';
      const userId = 'user1';
      const updateData: UpdateTaskData = {
        completed: false,
      };

      prismaService.task.update.mockResolvedValue(mockTask);

      await repository.update(taskId, updateData, userId);

      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId, userId },
        data: expect.objectContaining({
          completed: false,
          completedAt: undefined,
          completedById: undefined,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('updateWithoutValidation', () => {
    it('should update a task without userId validation', async () => {
      const taskId = '1';
      const updateData: UpdateTaskData = {
        title: 'Updated Task',
        completed: true,
      };

      const updatedTask = { ...mockTask, ...updateData };
      prismaService.task.update.mockResolvedValue(updatedTask);

      const result = await repository.updateWithoutValidation(taskId, updateData);

      expect(result).toEqual(updatedTask);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: expect.objectContaining({
          ...updateData,
          completedAt: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('delete', () => {
    it('should delete a task successfully', async () => {
      const taskId = '1';
      const userId = 'user1';

      prismaService.task.delete.mockResolvedValue(mockTask);

      const result = await repository.delete(taskId, userId);

      expect(result).toEqual(mockTask);
      expect(prismaService.task.delete).toHaveBeenCalledWith({
        where: { id: taskId, userId },
        include: expect.any(Object),
      });
    });
  });

  describe('deleteWithoutValidation', () => {
    it('should delete a task without userId validation', async () => {
      const taskId = '1';

      prismaService.task.delete.mockResolvedValue(mockTask);

      const result = await repository.deleteWithoutValidation(taskId);

      expect(result).toEqual(mockTask);
      expect(prismaService.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
        include: expect.any(Object),
      });
    });
  });

  describe('findByIdForOwnership', () => {
    it('should find task ownership info', async () => {
      const taskId = '1';
      const ownershipInfo = { id: taskId, userId: 'user1' };

      prismaService.task.findUnique.mockResolvedValue(ownershipInfo);

      const result = await repository.findByIdForOwnership(taskId);

      expect(result).toEqual(ownershipInfo);
      expect(prismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
        select: {
          id: true,
          userId: true,
        },
      });
    });
  });
});