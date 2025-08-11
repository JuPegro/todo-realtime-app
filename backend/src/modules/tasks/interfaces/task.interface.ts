import { Priority, TaskType, Task } from '@prisma/client';

export interface ITask extends Task {
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  completedBy?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface ITaskWithoutUser extends Omit<Task, 'user' | 'completedBy'> {}

export interface ITaskRepository {
  create(data: CreateTaskData, userId: string): Promise<ITask>;
  findById(id: string, userId: string): Promise<ITask | null>;
  findMany(userId: string, query: TaskQuery): Promise<{
    tasks: ITask[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  update(id: string, data: UpdateTaskData, userId: string): Promise<ITask>;
  delete(id: string, userId: string): Promise<ITask>;
  findByIdForOwnership(id: string): Promise<Pick<Task, 'id' | 'userId'> | null>;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: Priority;
  type?: TaskType;
  taskDate?: Date;
  startTime?: Date;
  endTime?: Date;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  type?: TaskType;
  taskDate?: Date;
  startTime?: Date;
  endTime?: Date;
  completedAt?: Date;
  completedById?: string;
}

export interface TaskQuery {
  page: number;
  limit: number;
  search?: string;
  priority?: Priority;
  type?: TaskType;
  completed?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}