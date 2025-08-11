import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials, AuthUser } from '../types/auth.types';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

console.log('AUTH_SERVICE - Initializing with API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await import('@react-native-async-storage/async-storage').then(
      (AsyncStorage) => AsyncStorage.default.getItem(STORAGE_KEYS.AUTH_TOKEN)
    );
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      import('@react-native-async-storage/async-storage').then(
        (AsyncStorage) => AsyncStorage.default.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      );
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('LOGIN - Attempting login with:', { email: credentials.email });
      console.log('LOGIN - API URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await api.post('/auth/login', credentials);
      console.log('LOGIN - Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('LOGIN - Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      const message = error.response?.data?.message || 'Error during login';
      throw new Error(message);
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('REGISTER - Attempting registration with:', { 
        name: credentials.name, 
        email: credentials.email 
      });
      console.log('REGISTER - API URL:', `${API_BASE_URL}/auth/register`);
      
      const response = await api.post('/auth/register', credentials);
      console.log('REGISTER - Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('REGISTER - Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        timeout: error.code === 'ECONNABORTED'
      });
      const message = error.response?.data?.message || 'Error during registration';
      throw new Error(message);
    }
  },

  async validateToken(token: string): Promise<AuthUser> {
    try {
      const response = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Invalid token');
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to refresh token');
    }
  },
};