import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CreateTaskData, UpdateTaskData, TaskQuery, TasksResponse, TaskStats } from '../types/task';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

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
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
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
      throw this.handleError(error);
    }
  }

  async updateTask(id: string, taskData: UpdateTaskData): Promise<Task> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<Task> = await axios.patch(
        `${API_BASE_URL}/tasks/${id}`,
        taskData,
        headers
      );
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw this.handleError(error);
    }
  }

  async deleteTask(id: string): Promise<Task> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<Task> = await axios.delete(`${API_BASE_URL}/tasks/${id}`, headers);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
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