import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { OwnershipValidationService } from '../../common/services/ownership-validation.service';
import { TaskNotFoundException, TaskInvalidDateException } from '../../common/exceptions';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { ITask } from './interfaces/task.interface';

describe('TasksService', () => {
  let service: TasksService;
  let tasksRepository: jest.Mocked<TasksRepository>;
  let ownershipValidationService: jest.Mocked<OwnershipValidationService>;

  const mockTask: ITask = {
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

  const mockRepositoryResponse = {
    tasks: [mockTask],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const mockTasksRepository = {
      create: jest.fn(),
      findAllTasks: jest.fn(),
      findById: jest.fn(),
      updateWithoutValidation: jest.fn(),
      deleteWithoutValidation: jest.fn(),
      findMany: jest.fn(),
    };

    const mockOwnershipValidationService = {
      validateTaskOwnership: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useValue: mockTasksRepository,
        },
        {
          provide: OwnershipValidationService,
          useValue: mockOwnershipValidationService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    tasksRepository = module.get(TasksRepository);
    ownershipValidationService = module.get(OwnershipValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        type: 'work',
        taskDate: '2024-01-20',
        startTime: '2024-01-20T09:00:00Z',
        endTime: '2024-01-20T11:00:00Z',
      };
      const userId = 'user1';

      tasksRepository.create.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, userId);

      expect(result).toEqual(mockTask);
      expect(tasksRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: createTaskDto.title,
          description: createTaskDto.description,
          priority: createTaskDto.priority,
          type: createTaskDto.type,
          taskDate: new Date(createTaskDto.taskDate),
          startTime: new Date(createTaskDto.startTime),
          endTime: new Date(createTaskDto.endTime),
        }),
        userId,
      );
    });

    it('should throw TaskInvalidDateException when start time is after end time', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        type: 'work',
        startTime: '2024-01-20T11:00:00Z',
        endTime: '2024-01-20T09:00:00Z', // End time before start time
      };
      const userId = 'user1';

      await expect(service.create(createTaskDto, userId)).rejects.toThrow(
        TaskInvalidDateException,
      );
      expect(tasksRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tasks successfully', async () => {
      const query: TaskQueryDto = {
        page: 1,
        limit: 10,
      };

      tasksRepository.findAllTasks.mockResolvedValue(mockRepositoryResponse);

      const result = await service.findAll(query);

      expect(result).toEqual(mockRepositoryResponse);
      expect(tasksRepository.findAllTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      );
    });

    it('should throw TaskInvalidDateException when dateFrom is after dateTo', async () => {
      const query: TaskQueryDto = {
        dateFrom: '2024-01-20',
        dateTo: '2024-01-15', // Date to before date from
      };

      await expect(service.findAll(query)).rejects.toThrow(
        TaskInvalidDateException,
      );
      expect(tasksRepository.findAllTasks).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task successfully', async () => {
      const taskId = '1';
      const userId = 'user1';

      tasksRepository.findById.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId, userId);

      expect(result).toEqual(mockTask);
      expect(tasksRepository.findById).toHaveBeenCalledWith(taskId, userId);
    });

    it('should throw TaskNotFoundException when task is not found', async () => {
      const taskId = '999';
      const userId = 'user1';

      tasksRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(taskId, userId)).rejects.toThrow(
        TaskNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        completed: true,
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };
      tasksRepository.updateWithoutValidation.mockResolvedValue(updatedTask);

      const result = await service.update(taskId, updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(tasksRepository.updateWithoutValidation).toHaveBeenCalledWith(
        taskId,
        expect.objectContaining({
          title: updateTaskDto.title,
          completed: updateTaskDto.completed,
        }),
      );
    });

    it('should throw TaskNotFoundException when update fails', async () => {
      const taskId = '999';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      tasksRepository.updateWithoutValidation.mockRejectedValue(new Error('Task not found'));

      await expect(service.update(taskId, updateTaskDto)).rejects.toThrow(
        TaskNotFoundException,
      );
    });

    it('should throw TaskInvalidDateException when dates are invalid', async () => {
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        startTime: '2024-01-20T11:00:00Z',
        endTime: '2024-01-20T09:00:00Z', // End time before start time
      };

      await expect(service.update(taskId, updateTaskDto)).rejects.toThrow(
        TaskInvalidDateException,
      );
      expect(tasksRepository.updateWithoutValidation).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a task successfully', async () => {
      const taskId = '1';

      tasksRepository.deleteWithoutValidation.mockResolvedValue(mockTask);

      const result = await service.remove(taskId);

      expect(result).toEqual(mockTask);
      expect(tasksRepository.deleteWithoutValidation).toHaveBeenCalledWith(taskId);
    });

    it('should throw TaskNotFoundException when delete fails', async () => {
      const taskId = '999';

      tasksRepository.deleteWithoutValidation.mockRejectedValue(new Error('Task not found'));

      await expect(service.remove(taskId)).rejects.toThrow(
        TaskNotFoundException,
      );
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', async () => {
      const userId = 'user1';
      const mockTasks = [
        { ...mockTask, priority: 'high', type: 'work', completed: true },
        { ...mockTask, id: '2', priority: 'low', type: 'personal', completed: false },
        { ...mockTask, id: '3', priority: 'high', type: 'work', completed: false },
      ];

      const mockResponse = {
        tasks: mockTasks,
        total: 3,
        page: 1,
        limit: 1000,
        totalPages: 1,
      };

      tasksRepository.findMany.mockResolvedValue(mockResponse);

      const result = await service.getTaskStats(userId);

      expect(result).toEqual({
        total: 3,
        completed: 1,
        pending: 2,
        byPriority: {
          high: 2,
          low: 1,
        },
        byType: {
          work: 2,
          personal: 1,
        },
      });

      expect(tasksRepository.findMany).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });
  });
});