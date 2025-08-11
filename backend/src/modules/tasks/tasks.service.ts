import { Injectable } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { ITask, CreateTaskData, UpdateTaskData, TaskQuery } from './interfaces/task.interface';
import { 
  TaskNotFoundException, 
  TaskForbiddenException, 
  TaskInvalidDateException 
} from '../../common/exceptions';
import { OwnershipValidationService } from '../../common/services/ownership-validation.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly ownershipValidationService: OwnershipValidationService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<ITask> {
    // Validar fechas si se proporcionan
    this.validateTaskDates(createTaskDto.startTime, createTaskDto.endTime);

    const taskData: CreateTaskData = {
      title: createTaskDto.title,
      description: createTaskDto.description,
      priority: createTaskDto.priority,
      type: createTaskDto.type,
      taskDate: createTaskDto.taskDate ? new Date(createTaskDto.taskDate) : undefined,
      startTime: createTaskDto.startTime ? new Date(createTaskDto.startTime) : undefined,
      endTime: createTaskDto.endTime ? new Date(createTaskDto.endTime) : undefined,
    };

    return await this.tasksRepository.create(taskData, userId);
  }

  async findAll(query: TaskQueryDto, userId: string): Promise<{
    tasks: ITask[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const taskQuery: TaskQuery = {
      page: query.page || 1,
      limit: query.limit || 10,
      search: query.search,
      priority: query.priority,
      type: query.type,
      completed: query.completed,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    };

    // Validar fechas si se proporcionan
    if (taskQuery.dateFrom && taskQuery.dateTo) {
      if (taskQuery.dateFrom > taskQuery.dateTo) {
        throw new TaskInvalidDateException('La fecha desde no puede ser mayor que la fecha hasta');
      }
    }

    return await this.tasksRepository.findMany(null, taskQuery); // Pasamos null en lugar de userId para traer todas las tareas
  }

  async findOne(id: string, userId: string): Promise<ITask> {
    const task = await this.tasksRepository.findById(id, userId);
    
    if (!task) {
      throw new TaskNotFoundException(id);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<ITask> {
    // Validar fechas si se proporcionan
    this.validateTaskDates(updateTaskDto.startTime, updateTaskDto.endTime);

    const updateData: UpdateTaskData = {
      title: updateTaskDto.title,
      description: updateTaskDto.description,
      completed: updateTaskDto.completed,
      priority: updateTaskDto.priority,
      type: updateTaskDto.type,
      taskDate: updateTaskDto.taskDate ? new Date(updateTaskDto.taskDate) : undefined,
      startTime: updateTaskDto.startTime ? new Date(updateTaskDto.startTime) : undefined,
      endTime: updateTaskDto.endTime ? new Date(updateTaskDto.endTime) : undefined,
    };

    // Si completed es true, establecer completedById
    if (updateData.completed === true) {
      updateData.completedById = userId;
    }

    try {
      return await this.tasksRepository.update(id, updateData);
    } catch (error) {
      throw new TaskNotFoundException(id);
    }
  }

  async remove(id: string, userId: string): Promise<ITask> {
    try {
      return await this.tasksRepository.delete(id);
    } catch (error) {
      throw new TaskNotFoundException(id);
    }
  }

  // Método para validar ownership
  private async validateTaskOwnership(taskId: string, userId: string): Promise<void> {
    await this.ownershipValidationService.validateTaskOwnership(taskId, userId);
  }

  // Método para validar fechas
  private validateTaskDates(startTime?: string, endTime?: string): void {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (start >= end) {
        throw new TaskInvalidDateException('La hora de inicio debe ser anterior a la hora de fin');
      }
    }
  }

  // Métodos adicionales para estadísticas
  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const allTasks = await this.tasksRepository.findMany(null, { // null para traer todas las tareas
      page: 1,
      limit: 1000, // Obtener todas las tareas para estadísticas
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    const tasks = allTasks.tasks;
    
    const stats = {
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      pending: tasks.filter(task => !task.completed).length,
      byPriority: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };

    // Contar por prioridad
    tasks.forEach(task => {
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
      stats.byType[task.type] = (stats.byType[task.type] || 0) + 1;
    });

    return stats;
  }
}