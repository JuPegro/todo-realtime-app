import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (token) {
        const userData = await authService.validateToken(token);
        setUser(userData);
      }
    } catch (error) {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      console.log('CONTEXT - Starting registration process');
      setIsLoading(true);
      
      const response = await authService.register(credentials);
      console.log('CONTEXT - Registration response received:', { hasToken: !!response.access_token, hasUser: !!response.user });
      
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
      console.log('CONTEXT - Token saved to AsyncStorage');
      
      setUser(response.user);
      console.log('CONTEXT - User state updated');
    } catch (error: any) {
      console.log('CONTEXT - Registration error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('CONTEXT - Registration process completed');
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};