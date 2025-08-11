import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksGateway } from './tasks.gateway';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { ITask } from './interfaces/task.interface';
import { HttpStatus } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: jest.Mocked<TasksService>;
  let tasksGateway: jest.Mocked<TasksGateway>;

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

  const mockRequest = {
    user: {
      sub: 'user1',
      email: 'test@example.com',
    },
  };

  const mockFindAllResponse = {
    tasks: [mockTask],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockTaskStats = {
    total: 5,
    completed: 2,
    pending: 3,
    byPriority: { high: 2, medium: 2, low: 1 },
    byType: { work: 3, personal: 2 },
  };

  beforeEach(async () => {
    const mockTasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getTaskStats: jest.fn(),
    };

    const mockTasksGateway = {
      emitTaskCreated: jest.fn(),
      emitTaskUpdated: jest.fn(),
      emitTaskDeleted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: TasksGateway,
          useValue: mockTasksGateway,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get(TasksService);
    tasksGateway = module.get(TasksGateway);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task and emit WebSocket event', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        type: 'work',
        taskDate: '2024-01-20',
        startTime: '2024-01-20T09:00:00Z',
        endTime: '2024-01-20T11:00:00Z',
      };

      tasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, mockRequest);

      expect(result).toEqual(mockTask);
      expect(tasksService.create).toHaveBeenCalledWith(createTaskDto, 'user1');
      expect(tasksGateway.emitTaskCreated).toHaveBeenCalledWith(mockTask);
    });

    it('should handle service errors', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        type: 'work',
      };

      const error = new Error('Service error');
      tasksService.create.mockRejectedValue(error);

      await expect(controller.create(createTaskDto, mockRequest)).rejects.toThrow(error);
      expect(tasksGateway.emitTaskCreated).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tasks with query parameters', async () => {
      const query: TaskQueryDto = {
        page: 1,
        limit: 10,
        search: 'test',
        priority: 'high',
      };

      tasksService.findAll.mockResolvedValue(mockFindAllResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockFindAllResponse);
      expect(tasksService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return all tasks without query parameters', async () => {
      const query: TaskQueryDto = {};

      tasksService.findAll.mockResolvedValue(mockFindAllResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockFindAllResponse);
      expect(tasksService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getStats', () => {
    it('should return task statistics', async () => {
      tasksService.getTaskStats.mockResolvedValue(mockTaskStats);

      const result = await controller.getStats(mockRequest);

      expect(result).toEqual(mockTaskStats);
      expect(tasksService.getTaskStats).toHaveBeenCalledWith('user1');
    });
  });

  describe('findOne', () => {
    it('should return a specific task', async () => {
      const taskId = '1';

      tasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(taskId, mockRequest);

      expect(result).toEqual(mockTask);
      expect(tasksService.findOne).toHaveBeenCalledWith(taskId, 'user1');
    });
  });

  describe('update', () => {
    it('should update a task and emit WebSocket event', async () => {
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        completed: true,
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };
      tasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(taskId, updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(tasksService.update).toHaveBeenCalledWith(taskId, updateTaskDto);
      expect(tasksGateway.emitTaskUpdated).toHaveBeenCalledWith(updatedTask);
    });

    it('should handle service errors during update', async () => {
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      const error = new Error('Update failed');
      tasksService.update.mockRejectedValue(error);

      await expect(controller.update(taskId, updateTaskDto)).rejects.toThrow(error);
      expect(tasksGateway.emitTaskUpdated).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a task and emit WebSocket event', async () => {
      const taskId = '1';

      tasksService.remove.mockResolvedValue(mockTask);

      const result = await controller.remove(taskId);

      expect(result).toEqual(mockTask);
      expect(tasksService.remove).toHaveBeenCalledWith(taskId);
      expect(tasksGateway.emitTaskDeleted).toHaveBeenCalledWith(taskId, mockTask);
    });

    it('should handle service errors during remove', async () => {
      const taskId = '1';

      const error = new Error('Remove failed');
      tasksService.remove.mockRejectedValue(error);

      await expect(controller.remove(taskId)).rejects.toThrow(error);
      expect(tasksGateway.emitTaskDeleted).not.toHaveBeenCalled();
    });
  });

  describe('HTTP status codes', () => {
    it('should return CREATED status for create endpoint', () => {
      // This test verifies the @HttpCode decorator is applied
      const createMethod = Reflect.getMetadata('__httpCode__', controller.create);
      expect(createMethod).toBe(HttpStatus.CREATED);
    });

    it('should return OK status for remove endpoint', () => {
      // This test verifies the @HttpCode decorator is applied
      const removeMethod = Reflect.getMetadata('__httpCode__', controller.remove);
      expect(removeMethod).toBe(HttpStatus.OK);
    });
  });

  describe('Guards', () => {
    it('should have JwtAuthGuard applied to the controller', () => {
      const guards = Reflect.getMetadata('__guards__', TasksController);
      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
    });
  });
});