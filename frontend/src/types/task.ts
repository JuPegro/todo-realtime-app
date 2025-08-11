export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'personal' | 'work' | 'other';
  taskDate?: string;
  startTime?: string;
  endTime?: string;
  userId: string;
  completedById?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  completedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type: 'FEATURE' | 'BUG_FIX' | 'REFACTOR' | 'TESTING' | 'DOCUMENTATION' | 'CODE_REVIEW' | 'DEPLOYMENT' | 'RESEARCH' | 'OPTIMIZATION' | 'MAINTENANCE';
  taskDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  type?: 'personal' | 'work' | 'other';
  taskDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface TaskQuery {
  page?: number;
  limit?: number;
  search?: string;
  priority?: 'low' | 'medium' | 'high';
  type?: 'personal' | 'work' | 'other';
  completed?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}