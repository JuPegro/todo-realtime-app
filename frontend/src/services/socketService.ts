import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';
import { STORAGE_KEYS, API_BASE_URL } from '../utils/constants';

// Extraer la URL base del socket del API_BASE_URL
const SOCKET_URL = API_BASE_URL.replace('/api', '');

export interface SocketEvents {
  'task-created': (task: Task) => void;
  'task-updated': (task: Task) => void;
  'task-deleted': (data: { id: string; task: Task }) => void;
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        console.warn('No auth token found, socket connection skipped');
        return;
      }

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      return new Promise((resolve, reject) => {
        this.socket = io(SOCKET_URL, {
          auth: {
            token: token,
          },
          extraHeaders: {
            'Authorization': `Bearer ${token}`
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: false,
          autoConnect: true,
        });

        this.socket.on('connect', () => {
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          reject(error);
        });

        this.setupEventListeners();
      });
      
    } catch (error) {
      console.error('Error connecting to socket:', error);
      this.handleReconnection();
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        this.handleReconnection();
      }
    });
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (this.socket) {
      this.socket.on(event as string, callback as any);
    }
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (this.socket) {
      this.socket.off(event as string, callback as any);
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Métodos específicos para tareas
  createTask(data: any): void {
    this.emit('create-task', data);
  }

  updateTask(id: string, data: any): void {
    this.emit('update-task', { id, updateTaskDto: data });
  }

  deleteTask(id: string): void {
    this.emit('delete-task', { id });
  }
}

export default new SocketService();