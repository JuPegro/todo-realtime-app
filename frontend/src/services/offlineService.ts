import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CreateTaskData, UpdateTaskData } from '../types/task';
import { STORAGE_KEYS } from '../utils/constants';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  taskId?: string;
  data?: CreateTaskData | UpdateTaskData;
  timestamp: number;
}

export interface CachedTasks {
  tasks: Task[];
  timestamp: number;
}

class OfflineService {
  private static readonly OFFLINE_ACTIONS_KEY = `${STORAGE_KEYS.TASKS}_offline_actions`;
  private static readonly CACHED_TASKS_KEY = `${STORAGE_KEYS.TASKS}_cache`;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Cache Management
  async cacheTasks(tasks: Task[]): Promise<void> {
    try {
      const cacheData: CachedTasks = {
        tasks,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        OfflineService.CACHED_TASKS_KEY,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Error caching tasks:', error);
    }
  }

  async getCachedTasks(): Promise<Task[] | null> {
    try {
      const cachedData = await AsyncStorage.getItem(OfflineService.CACHED_TASKS_KEY);
      if (!cachedData) return null;

      const { tasks, timestamp }: CachedTasks = JSON.parse(cachedData);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > OfflineService.CACHE_DURATION) {
        await AsyncStorage.removeItem(OfflineService.CACHED_TASKS_KEY);
        return null;
      }

      return tasks;
    } catch (error) {
      console.error('Error getting cached tasks:', error);
      return null;
    }
  }

  async clearTasksCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OfflineService.CACHED_TASKS_KEY);
    } catch (error) {
      console.error('Error clearing tasks cache:', error);
    }
  }

  // Offline Actions Management
  async queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    try {
      const offlineAction: OfflineAction = {
        ...action,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      const existingActions = await this.getOfflineActions();
      const updatedActions = [...existingActions, offlineAction];
      
      await AsyncStorage.setItem(
        OfflineService.OFFLINE_ACTIONS_KEY,
        JSON.stringify(updatedActions)
      );
      
      console.log('Offline action queued:', offlineAction);
    } catch (error) {
      console.error('Error queueing offline action:', error);
    }
  }

  async getOfflineActions(): Promise<OfflineAction[]> {
    try {
      const actionsData = await AsyncStorage.getItem(OfflineService.OFFLINE_ACTIONS_KEY);
      return actionsData ? JSON.parse(actionsData) : [];
    } catch (error) {
      console.error('Error getting offline actions:', error);
      return [];
    }
  }

  async removeOfflineAction(actionId: string): Promise<void> {
    try {
      const existingActions = await this.getOfflineActions();
      const updatedActions = existingActions.filter(action => action.id !== actionId);
      
      await AsyncStorage.setItem(
        OfflineService.OFFLINE_ACTIONS_KEY,
        JSON.stringify(updatedActions)
      );
    } catch (error) {
      console.error('Error removing offline action:', error);
    }
  }

  async clearOfflineActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OfflineService.OFFLINE_ACTIONS_KEY);
    } catch (error) {
      console.error('Error clearing offline actions:', error);
    }
  }

  // Optimistic Updates
  async applyOptimisticUpdate(tasks: Task[], action: OfflineAction): Promise<Task[]> {
    switch (action.type) {
      case 'CREATE':
        if (action.data) {
          const newTask: Task = {
            id: action.id,
            title: (action.data as CreateTaskData).title,
            description: (action.data as CreateTaskData).description || '',
            status: 'PENDING',
            priority: (action.data as CreateTaskData).priority || 'MEDIUM',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'offline-user',
            // Mark as optimistic update
            isOptimistic: true,
          };
          return [newTask, ...tasks];
        }
        break;

      case 'UPDATE':
        if (action.taskId && action.data) {
          return tasks.map(task => 
            task.id === action.taskId
              ? {
                  ...task,
                  ...(action.data as UpdateTaskData),
                  updatedAt: new Date().toISOString(),
                  isOptimistic: true,
                }
              : task
          );
        }
        break;

      case 'DELETE':
        if (action.taskId) {
          return tasks.filter(task => task.id !== action.taskId);
        }
        break;
    }
    
    return tasks;
  }

  // Sync Management
  async hasOfflineActions(): Promise<boolean> {
    const actions = await this.getOfflineActions();
    return actions.length > 0;
  }

  async getOfflineActionsCount(): Promise<number> {
    const actions = await this.getOfflineActions();
    return actions.length;
  }
}

export default new OfflineService();