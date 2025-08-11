export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskType = 
  | 'FEATURE' 
  | 'BUG_FIX' 
  | 'REFACTOR' 
  | 'TESTING' 
  | 'DOCUMENTATION' 
  | 'CODE_REVIEW' 
  | 'DEPLOYMENT' 
  | 'RESEARCH' 
  | 'OPTIMIZATION' 
  | 'MAINTENANCE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  type: TaskType;
  taskDate: string;
  startTime?: string;
  endTime?: string;
  completedAt?: string;
  completedById?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  type?: TaskType;
  taskDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  type?: TaskType;
  taskDate?: string;
  startTime?: string;
  endTime?: string;
}