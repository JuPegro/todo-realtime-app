import { Task, Priority } from '@prisma/client';

export interface TaskFixture {
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  userId: string;
}

export const taskFixtures: Omit<TaskFixture, 'userId'>[] = [
  {
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the task management system',
    completed: false,
    priority: Priority.HIGH,
  },
  {
    title: 'Review code changes',
    description: 'Review and approve pending pull requests',
    completed: false,
    priority: Priority.MEDIUM,
  },
  {
    title: 'Deploy to production',
    description: 'Deploy the latest version to production environment',
    completed: true,
    priority: Priority.HIGH,
  },
  {
    title: 'Fix bug in user authentication',
    description: 'Investigate and fix the reported authentication issue',
    completed: false,
    priority: Priority.URGENT,
  },
  {
    title: 'Update dependencies',
    description: 'Update all npm dependencies to their latest versions',
    completed: false,
    priority: Priority.LOW,
  },
];

export function createTaskFixture(userId: string, taskData?: Partial<TaskFixture>): TaskFixture {
  const defaultTask = taskFixtures[0];
  return {
    ...defaultTask,
    userId,
    ...taskData,
  };
}

export function createMultipleTaskFixtures(userId: string, count: number = 5): TaskFixture[] {
  const tasks: TaskFixture[] = [];
  
  for (let i = 0; i < count; i++) {
    const baseTask = taskFixtures[i] || taskFixtures[0];
    const task = createTaskFixture(userId, {
      ...baseTask,
      title: `${baseTask.title} ${i + 1}`,
    });
    tasks.push(task);
  }
  
  return tasks;
}

export function createTasksForMultipleUsers(userIds: string[]): TaskFixture[] {
  const allTasks: TaskFixture[] = [];
  
  userIds.forEach((userId, userIndex) => {
    const userTasks = createMultipleTaskFixtures(userId, 3);
    userTasks.forEach((task, taskIndex) => {
      task.title = `User ${userIndex + 1} Task ${taskIndex + 1}`;
    });
    allTasks.push(...userTasks);
  });
  
  return allTasks;
}