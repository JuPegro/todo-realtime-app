import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Función para obtener la URL del API dinámicamente
const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // En desarrollo, obtener IP del servidor de desarrollo de Expo
    const { expoConfig } = Constants;
    
    // Obtener la IP del servidor de desarrollo
    const debuggerHost = expoConfig?.hostUri?.split(':')[0];
    
    // Puerto configurable via variable de entorno o default 3000
    const apiPort = process.env.EXPO_PUBLIC_API_PORT || '3000';
    
    if (debuggerHost) {
      const baseUrl = `http://${debuggerHost}:${apiPort}/api`;
      console.log('🌐 API_BASE_URL (dynamic):', baseUrl);
      return baseUrl;
    }
    
    // Fallback para desarrollo local
    const fallbackUrl = Platform.select({
      ios: `http://localhost:${apiPort}/api`,
      android: `http://10.0.2.2:${apiPort}/api`, // Android emulator
      default: `http://localhost:${apiPort}/api`,
    });
    
    console.log('🌐 API_BASE_URL (fallback):', fallbackUrl);
    return fallbackUrl;
  }
  
  // Producción
  return process.env.EXPO_PUBLIC_API_URL || 'https://your-production-api.com/api';
};

// API Configuration - Se obtiene dinámicamente
export const API_BASE_URL = getApiBaseUrl();

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@realtime_todo:auth_token',
  USER_DATA: '@realtime_todo:user_data',
} as const;

// Priority Colors
export const PRIORITY_COLORS = {
  LOW: '#28a745',
  MEDIUM: '#ffc107', 
  HIGH: '#fd7e14',
  URGENT: '#dc3545',
} as const;

// Task Type Colors
export const TASK_TYPE_COLORS = {
  FEATURE: '#007bff',
  BUG_FIX: '#dc3545',
  REFACTOR: '#6f42c1',
  TESTING: '#20c997',
  DOCUMENTATION: '#6c757d',
  CODE_REVIEW: '#fd7e14',
  DEPLOYMENT: '#e83e8c',
  RESEARCH: '#17a2b8',
  OPTIMIZATION: '#28a745',
  MAINTENANCE: '#ffc107',
} as const;