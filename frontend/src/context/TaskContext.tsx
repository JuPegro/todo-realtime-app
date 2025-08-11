import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, CreateTaskData, UpdateTaskData, TaskQuery, TaskStats } from '../types/task';
import taskService from '../services/taskService';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
  stats: TaskStats | null;
  optimisticTasks: Task[];
  searchQuery: string;
  filters: TaskQuery;
}

type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TASKS'; payload: { tasks: Task[]; total: number; page: number; totalPages: number } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_STATS'; payload: TaskStats }
  | { type: 'ADD_OPTIMISTIC_TASK'; payload: Task }
  | { type: 'REMOVE_OPTIMISTIC_TASK'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: TaskQuery }
  | { type: 'RESET_STATE' };

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,
  stats: null,
  optimisticTasks: [],
  searchQuery: '',
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload.tasks,
        total: action.payload.total,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        optimisticTasks: [], // Clear optimistic tasks when real data arrives
      };
    
    case 'ADD_TASK':
      // Remove from optimistic tasks if it exists
      const filteredOptimistic = state.optimisticTasks.filter(
        task => task.id !== action.payload.id
      );
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        total: state.total + 1,
        optimisticTasks: filteredOptimistic,
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        optimisticTasks: state.optimisticTasks.filter(
          task => task.id !== action.payload.id
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        total: Math.max(0, state.total - 1),
        optimisticTasks: state.optimisticTasks.filter(
          task => task.id !== action.payload
        ),
      };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'ADD_OPTIMISTIC_TASK':
      return {
        ...state,
        optimisticTasks: [action.payload, ...state.optimisticTasks],
      };
    
    case 'REMOVE_OPTIMISTIC_TASK':
      return {
        ...state,
        optimisticTasks: state.optimisticTasks.filter(
          task => task.id !== action.payload
        ),
      };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

interface TaskContextType {
  state: TaskState;
  // CRUD operations
  fetchTasks: (query?: TaskQuery) => Promise<void>;
  createTask: (taskData: CreateTaskData, optimistic?: boolean) => Promise<Task | null>;
  updateTask: (id: string, taskData: UpdateTaskData, optimistic?: boolean) => Promise<Task | null>;
  deleteTask: (id: string, optimistic?: boolean) => Promise<boolean>;
  fetchTaskStats: () => Promise<void>;
  // Utility functions
  refreshTasks: () => Promise<void>;
  loadMoreTasks: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: TaskQuery) => void;
  clearError: () => void;
  getAllTasks: () => Task[]; // Returns merged tasks + optimistic tasks
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Setup socket listeners
  useEffect(() => {
    if (isAuthenticated) {
      const setupSocketListeners = async () => {
        await socketService.connect();

        const handleTaskCreated = (task: Task) => {
          dispatch({ type: 'ADD_TASK', payload: task });
        };

        const handleTaskUpdated = (task: Task) => {
          dispatch({ type: 'UPDATE_TASK', payload: task });
        };

        const handleTaskDeleted = (data: { id: string; task: Task }) => {
          dispatch({ type: 'DELETE_TASK', payload: data.id });
        };

        socketService.on('task-created', handleTaskCreated);
        socketService.on('task-updated', handleTaskUpdated);
        socketService.on('task-deleted', handleTaskDeleted);
      };

      setupSocketListeners();

      return () => {
        socketService.disconnect();
      };
    } else {
      socketService.disconnect();
      dispatch({ type: 'RESET_STATE' });
    }
  }, [isAuthenticated]);

  const fetchTasks = async (query?: TaskQuery) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const finalQuery = { ...state.filters, ...query };
      const response = await taskService.getTasks(finalQuery);
      
      dispatch({
        type: 'SET_TASKS',
        payload: {
          tasks: response.tasks,
          total: response.total,
          page: response.page,
          totalPages: response.totalPages,
        },
      });

      // Update filters with the query used
      dispatch({ type: 'SET_FILTERS', payload: finalQuery });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error fetching tasks' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createTask = async (taskData: CreateTaskData, optimistic = true): Promise<Task | null> => {
    let optimisticId: string | null = null;
    
    try {
      // Optimistic update
      if (optimistic) {
        optimisticId = `temp-${Date.now()}`;
        const optimisticTask: Task = {
          id: optimisticId,
          ...taskData,
          completed: false,
          userId: 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: { id: 'current-user', name: 'You', email: '' },
        };
        dispatch({ type: 'ADD_OPTIMISTIC_TASK', payload: optimisticTask });
      }

      const task = await taskService.createTask(taskData);
      
      if (optimistic && optimisticId) {
        // Remove optimistic task when real task arrives
        dispatch({ type: 'REMOVE_OPTIMISTIC_TASK', payload: optimisticId });
      }
      
      // Real task will be added via socket event
      return task;
    } catch (error) {
      if (optimistic && optimisticId) {
        dispatch({ type: 'REMOVE_OPTIMISTIC_TASK', payload: optimisticId });
      }
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error creating task' });
      return null;
    }
  };

  const updateTask = async (id: string, taskData: UpdateTaskData, optimistic = true): Promise<Task | null> => {
    try {
      // Optimistic update
      if (optimistic) {
        const currentTask = state.tasks.find(task => task.id === id);
        if (currentTask) {
          const optimisticTask: Task = {
            ...currentTask,
            ...taskData,
            updatedAt: new Date().toISOString(),
          };
          dispatch({ type: 'UPDATE_TASK', payload: optimisticTask });
        }
      }

      const task = await taskService.updateTask(id, taskData);
      
      // Real task will be updated via socket event
      return task;
    } catch (error) {
      // Revert optimistic update on error
      if (optimistic) {
        await refreshTasks();
      }
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error updating task' });
      return null;
    }
  };

  const deleteTask = async (id: string, optimistic = true): Promise<boolean> => {
    try {
      // Optimistic update
      if (optimistic) {
        dispatch({ type: 'DELETE_TASK', payload: id });
      }

      await taskService.deleteTask(id);
      
      // Real deletion will be handled via socket event
      return true;
    } catch (error) {
      // Revert optimistic update on error
      if (optimistic) {
        await refreshTasks();
      }
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error deleting task' });
      return false;
    }
  };

  const fetchTaskStats = async () => {
    try {
      const stats = await taskService.getTaskStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  };

  const refreshTasks = async () => {
    await fetchTasks({ ...state.filters, page: 1 });
  };

  const loadMoreTasks = async () => {
    if (state.currentPage < state.totalPages && !state.loading) {
      await fetchTasks({ ...state.filters, page: state.currentPage + 1 });
    }
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    const newFilters = { ...state.filters, search: query, page: 1 };
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  };

  const setFilters = (filters: TaskQuery) => {
    dispatch({ type: 'SET_FILTERS', payload: { ...filters, page: 1 } });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const getAllTasks = (): Task[] => {
    return [...state.optimisticTasks, ...state.tasks];
  };

  const value: TaskContextType = {
    state,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchTaskStats,
    refreshTasks,
    loadMoreTasks,
    setSearchQuery,
    setFilters,
    clearError,
    getAllTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};