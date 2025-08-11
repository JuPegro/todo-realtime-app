// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

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