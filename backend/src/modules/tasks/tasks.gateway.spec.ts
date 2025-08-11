import { Test, TestingModule } from '@nestjs/testing';
import { TasksGateway } from './tasks.gateway';
import { TasksService } from './tasks.service';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { ITask } from './interfaces/task.interface';
import { Socket, Server } from 'socket.io';
import { ExecutionContext } from '@nestjs/common';

describe('TasksGateway', () => {
  let gateway: TasksGateway;
  let tasksService: jest.Mocked<TasksService>;
  let mockSocket: jest.Mocked<Socket>;
  let mockServer: jest.Mocked<Server>;

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

  beforeEach(async () => {
    const mockTasksService = {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockSocket = {
      id: 'socket1',
      data: {
        user: {
          sub: 'user1',
          email: 'test@example.com',
        },
      },
      emit: jest.fn(),
    } as any;

    mockServer = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksGateway,
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
    .overrideGuard(WsJwtAuthGuard)
    .useValue({
      canActivate: jest.fn().mockReturnValue(true),
    })
    .compile();

    gateway = module.get<TasksGateway>(TasksGateway);
    tasksService = module.get(TasksService);
    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('Connection handling', () => {
    it('should handle client connection', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      gateway.handleConnection(mockSocket);
      
      expect(consoleSpy).toHaveBeenCalledWith(`Client connected: ${mockSocket.id}`);
      consoleSpy.mockRestore();
    });

    it('should handle client disconnection', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      gateway.handleDisconnect(mockSocket);
      
      expect(consoleSpy).toHaveBeenCalledWith(`Client disconnected: ${mockSocket.id}`);
      consoleSpy.mockRestore();
    });
  });

  describe('handleCreateTask', () => {
    it('should create a task and emit to all clients', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        type: 'work',
      };

      tasksService.create.mockResolvedValue(mockTask);

      const result = await gateway.handleCreateTask(createTaskDto, mockSocket);

      expect(result).toEqual({
        success: true,
        data: mockTask,
      });

      expect(tasksService.create).toHaveBeenCalledWith(createTaskDto, 'user1');
      expect(mockServer.emit).toHaveBeenCalledWith('task-created', mockTask);
    });

    it('should handle errors during task creation', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        type: 'work',
      };

      const error = new Error('Creation failed');
      tasksService.create.mockRejectedValue(error);

      const result = await gateway.handleCreateTask(createTaskDto, mockSocket);

      expect(result).toEqual({
        success: false,
        error: 'Creation failed',
      });

      expect(mockServer.emit).not.toHaveBeenCalled();
    });
  });

  describe('handleUpdateTask', () => {
    it('should update a task and emit to all clients', async () => {
      const updateData = {
        id: '1',
        updateTaskDto: {
          title: 'Updated Task',
          completed: true,
        } as UpdateTaskDto,
      };

      const updatedTask = { ...mockTask, ...updateData.updateTaskDto };
      tasksService.update.mockResolvedValue(updatedTask);

      const result = await gateway.handleUpdateTask(updateData, mockSocket);

      expect(result).toEqual({
        success: true,
        data: updatedTask,
      });

      expect(tasksService.update).toHaveBeenCalledWith('1', updateData.updateTaskDto);
      expect(mockServer.emit).toHaveBeenCalledWith('task-updated', updatedTask);
    });

    it('should handle errors during task update', async () => {
      const updateData = {
        id: '1',
        updateTaskDto: {
          title: 'Updated Task',
        } as UpdateTaskDto,
      };

      const error = new Error('Update failed');
      tasksService.update.mockRejectedValue(error);

      const result = await gateway.handleUpdateTask(updateData, mockSocket);

      expect(result).toEqual({
        success: false,
        error: 'Update failed',
      });

      expect(mockServer.emit).not.toHaveBeenCalled();
    });
  });

  describe('handleDeleteTask', () => {
    it('should delete a task and emit to all clients', async () => {
      const deleteData = { id: '1' };

      tasksService.remove.mockResolvedValue(mockTask);

      const result = await gateway.handleDeleteTask(deleteData, mockSocket);

      expect(result).toEqual({
        success: true,
        data: mockTask,
      });

      expect(tasksService.remove).toHaveBeenCalledWith('1');
      expect(mockServer.emit).toHaveBeenCalledWith('task-deleted', { 
        id: '1', 
        task: mockTask 
      });
    });

    it('should handle errors during task deletion', async () => {
      const deleteData = { id: '1' };

      const error = new Error('Delete failed');
      tasksService.remove.mockRejectedValue(error);

      const result = await gateway.handleDeleteTask(deleteData, mockSocket);

      expect(result).toEqual({
        success: false,
        error: 'Delete failed',
      });

      expect(mockServer.emit).not.toHaveBeenCalled();
    });
  });

  describe('Emit methods', () => {
    it('should emit task created event', () => {
      gateway.emitTaskCreated(mockTask);

      expect(mockServer.emit).toHaveBeenCalledWith('task-created', mockTask);
    });

    it('should emit task updated event', () => {
      gateway.emitTaskUpdated(mockTask);

      expect(mockServer.emit).toHaveBeenCalledWith('task-updated', mockTask);
    });

    it('should emit task deleted event', () => {
      const taskId = '1';
      
      gateway.emitTaskDeleted(taskId, mockTask);

      expect(mockServer.emit).toHaveBeenCalledWith('task-deleted', { 
        id: taskId, 
        task: mockTask 
      });
    });
  });

  describe('WebSocket decorators and configuration', () => {
    it('should have WebSocketGateway decorator applied', () => {
      expect(gateway).toBeDefined();
      expect(typeof gateway.handleConnection).toBe('function');
      expect(typeof gateway.handleDisconnect).toBe('function');
    });

    it('should have message handler methods', () => {
      expect(typeof gateway.handleCreateTask).toBe('function');
      expect(typeof gateway.handleUpdateTask).toBe('function');
      expect(typeof gateway.handleDeleteTask).toBe('function');
    });

    it('should have emit methods for WebSocket events', () => {
      expect(typeof gateway.emitTaskCreated).toBe('function');
      expect(typeof gateway.emitTaskUpdated).toBe('function');
      expect(typeof gateway.emitTaskDeleted).toBe('function');
    });
  });
});