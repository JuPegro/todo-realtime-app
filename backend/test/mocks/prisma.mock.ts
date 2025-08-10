import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export const createMockPrisma = (): DeepMockProxy<PrismaClient> => {
  return mockDeep<PrismaClient>();
};

// Mock PrismaService provider for testing
export const mockPrismaProvider = {
  provide: 'PrismaService',
  useFactory: createMockPrisma,
};

// Helper function to create mock data
export const createMockUser = (override = {}) => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  password: 'hashedpassword',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});

export const createMockTask = (override = {}) => ({
  id: 'mock-task-id',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  priority: 'MEDIUM',
  type: 'FEATURE',
  taskDate: new Date(),
  startTime: null,
  endTime: null,
  completedAt: null,
  completedById: null,
  userId: 'mock-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});

export const createMockTaskStats = (override = {}) => ({
  id: 'mock-stats-id',
  userId: 'mock-user-id',
  date: new Date(),
  tasksCompleted: 5,
  tasksByType: { FEATURE: 3, BUG_FIX: 2 },
  tasksByPriority: { HIGH: 2, MEDIUM: 3 },
  totalHoursWorked: 8.5,
  averageCompletionTime: 2.5,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});