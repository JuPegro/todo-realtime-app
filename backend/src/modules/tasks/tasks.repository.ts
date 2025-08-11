import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { 
  ITaskRepository, 
  ITask, 
  CreateTaskData, 
  UpdateTaskData, 
  TaskQuery 
} from './interfaces/task.interface';
import { Task } from '@prisma/client';

@Injectable()
export class TasksRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTaskData, userId: string): Promise<ITask> {
    return await this.prisma.task.create({
      data: {
        ...data,
        userId,
      },
      include: {
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
      },
    });
  }

  async findById(id: string, userId: string): Promise<ITask | null> {
    return await this.prisma.task.findFirst({
      where: {
        id,
        userId, // Solo puede ver sus propias tareas
      },
      include: {
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
      },
    });
  }

  async findMany(userId: string | null, query: TaskQuery): Promise<{
    tasks: ITask[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (query.page - 1) * query.limit;
    
    // Construir filtros dinámicos
    const where: any = {};
    
    // Solo filtrar por userId si se proporciona
    if (userId) {
      where.userId = userId;
    }

    // Filtro por búsqueda de texto
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (query.priority !== undefined) {
      where.priority = query.priority;
    }

    if (query.type !== undefined) {
      where.type = query.type;
    }

    if (query.completed !== undefined) {
      where.completed = query.completed;
    }

    // Filtros por fecha
    if (query.dateFrom || query.dateTo) {
      where.taskDate = {};
      if (query.dateFrom) {
        where.taskDate.gte = query.dateFrom;
      }
      if (query.dateTo) {
        where.taskDate.lte = query.dateTo;
      }
    }

    // Ordenamiento dinámico con validación
    const validSortFields = ['id', 'title', 'description', 'completed', 'priority', 'type', 'taskDate', 'startTime', 'endTime', 'completedAt', 'createdAt', 'updatedAt', 'userId'];
    const sortField = validSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    
    const orderBy: any = {};
    orderBy[sortField] = query.sortOrder;
    
    console.log('Query sortBy:', query.sortBy);
    console.log('Validated sort field:', sortField);
    console.log('OrderBy object:', orderBy);

    // Ejecutar consultas en paralelo
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
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
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      tasks,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async update(id: string, data: UpdateTaskData, userId: string): Promise<ITask> {
    // Si se marca como completada, agregar datos de completado
    if (data.completed === true && !data.completedAt) {
      data.completedAt = new Date();
      data.completedById = userId;
    }

    // Si se desmarca como completada, limpiar datos de completado
    if (data.completed === false) {
      data.completedAt = undefined;
      data.completedById = undefined;
    }

    return await this.prisma.task.update({
      where: {
        id,
        userId, // Solo puede actualizar sus propias tareas
      },
      data,
      include: {
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
      },
    });
  }

  async delete(id: string, userId: string): Promise<ITask> {
    return await this.prisma.task.delete({
      where: {
        id,
        userId, // Solo puede eliminar sus propias tareas
      },
      include: {
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
      },
    });
  }

  async findByIdForOwnership(id: string): Promise<Pick<Task, 'id' | 'userId'> | null> {
    return await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });
  }

  async findAllTasks(query: TaskQuery): Promise<{
    tasks: ITask[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (query.page - 1) * query.limit;
    
    // Construir filtros dinámicos (sin filtro por userId)
    const where: any = {};

    // Filtro por búsqueda de texto
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (query.priority !== undefined) {
      where.priority = query.priority;
    }

    if (query.type !== undefined) {
      where.type = query.type;
    }

    if (query.completed !== undefined) {
      where.completed = query.completed;
    }

    // Filtros por fecha
    if (query.dateFrom || query.dateTo) {
      where.taskDate = {};
      if (query.dateFrom) {
        where.taskDate.gte = query.dateFrom;
      }
      if (query.dateTo) {
        where.taskDate.lte = query.dateTo;
      }
    }

    // Ordenamiento dinámico
    const orderBy: any = {};
    orderBy[query.sortBy] = query.sortOrder;

    // Ejecutar consultas en paralelo
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
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
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      tasks,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async updateWithoutValidation(id: string, data: UpdateTaskData): Promise<ITask> {
    // Si se marca como completada, agregar datos de completado
    if (data.completed === true && !data.completedAt) {
      data.completedAt = new Date();
    }

    // Si se desmarca como completada, limpiar datos de completado
    if (data.completed === false) {
      data.completedAt = undefined;
      data.completedById = undefined;
    }

    return await this.prisma.task.update({
      where: { id },
      data,
      include: {
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
      },
    });
  }

  async deleteWithoutValidation(id: string): Promise<ITask> {
    return await this.prisma.task.delete({
      where: { id },
      include: {
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
      },
    });
  }
}