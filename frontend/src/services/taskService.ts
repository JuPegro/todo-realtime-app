import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Task, CreateTaskData, UpdateTaskData, TaskQuery, TasksResponse, TaskStats } from '../types/task';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import offlineService from './offlineService';

class TaskService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getAuthHeaders() {
    const token = await this.getAuthToken();
    console.log('Auth token for request:', token ? 'Token found' : 'No token');
    return {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  }

  async getTasks(query?: TaskQuery): Promise<TasksResponse> {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected || !netInfo.isInternetReachable) {
        // Return cached tasks when offline
        const cachedTasks = await offlineService.getCachedTasks();
        if (cachedTasks) {
          return {
            tasks: cachedTasks,
            total: cachedTasks.length,
            page: 1,
            limit: cachedTasks.length,
            totalPages: 1,
          };
        }
        throw new Error('No hay conexión a internet y no hay datos en caché disponibles.');
      }

      const params = new URLSearchParams();
      
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const url = `${API_BASE_URL}/tasks${params.toString() ? `?${params.toString()}` : ''}`;
      const headers = await this.getAuthHeaders();
      
      const response: AxiosResponse<TasksResponse> = await axios.get(url, headers);
      
      // Cache tasks when online
      await offlineService.cacheTasks(response.data.tasks);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      
      // Try to return cached data on error
      const cachedTasks = await offlineService.getCachedTasks();
      if (cachedTasks) {
        return {
          tasks: cachedTasks,
          total: cachedTasks.length,
          page: 1,
          limit: cachedTasks.length,
          totalPages: 1,
        };
      }
      
      throw this.handleError(error);
    }
  }

  async getTask(id: string): Promise<Task> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<Task> = await axios.get(`${API_BASE_URL}/tasks/${id}`, headers);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw this.handleError(error);
    }
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected || !netInfo.isInternetReachable) {
        // Queue for offline sync
        await offlineService.queueOfflineAction({
          type: 'CREATE',
          data: taskData,
        });
        
        // Create optimistic task
        const optimisticTask: Task = {
          id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: taskData.title,
          description: taskData.description || '',
          status: 'PENDING',
          priority: taskData.priority || 'MEDIUM',
          type: taskData.type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'offline-user',
          isOptimistic: true,
        };
        
        return optimisticTask;
      }
      
      const headers = await this.getAuthHeaders();
      console.log("Creating task:", taskData);
      const response: AxiosResponse<Task> = await axios.post(
        `${API_BASE_URL}/tasks`,
        taskData,
        headers
      );
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      
      // If online request fails, queue for offline sync
      await offlineService.queueOfflineAction({
        type: 'CREATE',
        data: taskData,
      });
      
      throw this.handleError(error);
    }
  }

  async updateTask(id: string, taskData: UpdateTaskData): Promise<Task> {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected || !netInfo.isInternetReachable) {
        // Queue for offline sync
        await offlineService.queueOfflineAction({
          type: 'UPDATE',
          taskId: id,
          data: taskData,
        });
        
        // Return optimistic update (will be handled by context)
        throw new Error('Sin conexión. Los cambios se sincronizarán cuando vuelva la conexión.');
      }
      
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<Task> = await axios.patch(
        `${API_BASE_URL}/tasks/${id}`,
        taskData,
        headers
      );
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      
      // If online request fails, queue for offline sync
      await offlineService.queueOfflineAction({
        type: 'UPDATE',
        taskId: id,
        data: taskData,
      });
      
      throw this.handleError(error);
    }
  }

  async deleteTask(id: string): Promise<Task> {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected || !netInfo.isInternetReachable) {
        // Queue for offline sync
        await offlineService.queueOfflineAction({
          type: 'DELETE',
          taskId: id,
        });
        
        // Return fake task for optimistic delete
        throw new Error('Sin conexión. La eliminación se sincronizará cuando vuelva la conexión.');
      }
      
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<Task> = await axios.delete(`${API_BASE_URL}/tasks/${id}`, headers);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // If online request fails, queue for offline sync
      await offlineService.queueOfflineAction({
        type: 'DELETE',
        taskId: id,
      });
      
      throw this.handleError(error);
    }
  }

  async getTaskStats(): Promise<TaskStats> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<TaskStats> = await axios.get(`${API_BASE_URL}/tasks/stats`, headers);
      return response.data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw this.handleError(error);
    }
  }

  // Offline Sync Methods
  async syncOfflineActions(): Promise<void> {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected || !netInfo.isInternetReachable) {
        console.log('No hay conexión disponible para sincronizar');
        return;
      }

      const offlineActions = await offlineService.getOfflineActions();
      console.log(`Sincronizando ${offlineActions.length} acciones offline`);

      for (const action of offlineActions) {
        try {
          switch (action.type) {
            case 'CREATE':
              if (action.data) {
                await this.createTaskSync(action.data as CreateTaskData);
              }
              break;
            case 'UPDATE':
              if (action.taskId && action.data) {
                await this.updateTaskSync(action.taskId, action.data as UpdateTaskData);
              }
              break;
            case 'DELETE':
              if (action.taskId) {
                await this.deleteTaskSync(action.taskId);
              }
              break;
          }
          
          // Remove successful action
          await offlineService.removeOfflineAction(action.id);
          console.log(`Acción ${action.type} sincronizada correctamente`);
        } catch (error) {
          console.error(`Error sincronizando acción ${action.type}:`, error);
          // Keep action in queue for next sync attempt
        }
      }
    } catch (error) {
      console.error('Error during offline sync:', error);
    }
  }

  private async createTaskSync(taskData: CreateTaskData): Promise<Task> {
    const headers = await this.getAuthHeaders();
    const response: AxiosResponse<Task> = await axios.post(
      `${API_BASE_URL}/tasks`,
      taskData,
      headers
    );
    return response.data;
  }

  private async updateTaskSync(id: string, taskData: UpdateTaskData): Promise<Task> {
    const headers = await this.getAuthHeaders();
    const response: AxiosResponse<Task> = await axios.patch(
      `${API_BASE_URL}/tasks/${id}`,
      taskData,
      headers
    );
    return response.data;
  }

  private async deleteTaskSync(id: string): Promise<Task> {
    const headers = await this.getAuthHeaders();
    const response: AxiosResponse<Task> = await axios.delete(`${API_BASE_URL}/tasks/${id}`, headers);
    return response.data;
  }

  async hasOfflineActions(): Promise<boolean> {
    return await offlineService.hasOfflineActions();
  }

  async getOfflineActionsCount(): Promise<number> {
    return await offlineService.getOfflineActionsCount();
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      const status = error.response?.status;
      
      if (status === 401) {
        // Token expired or invalid
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }
      
      if (status === 403) {
        throw new Error('No tienes permisos para realizar esta acción.');
      }
      
      if (status === 404) {
        throw new Error('Tarea no encontrada.');
      }
      
      if (status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      }
      
      throw new Error(message || 'Error en la petición');
    }
    
    throw new Error('Error de conexión. Verifica tu conexión a internet.');
  }
}

export default new TaskService();