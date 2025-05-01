/**
 * MCP Integration Platform - Authentication Hook
 * 
 * This hook provides a React interface for authentication operations,
 * including login, logout, and registration.
 */

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/utils/api';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  email?: string;
  name?: string;
}

interface AuthContextType {
  // User state
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  
  // Auth operations
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<User>;
}

// Create a context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => { throw new Error('AuthContext not initialized'); },
  register: async () => { throw new Error('AuthContext not initialized'); },
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Track authentication state
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch current user
  const {
    data: user,
    isLoading,
    error: queryError,
  } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const data = await apiGet<User>('/api/user');
        return data;
      } catch (error) {
        // If we get a 401, we're not authenticated - this is normal
        if ((error as any)?.status === 401) {
          logger.debug('Not authenticated (401), returning null');
          return null;
        }
        throw error;
      }
    },
    retry: false, // Don't retry auth requests
  });
  
  // Update error state when query error changes
  useEffect(() => {
    if (queryError) {
      setError(queryError as Error);
    }
  }, [queryError]);
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      logger.info('Attempting login', { 
        tags: ['auth', 'login'],
        data: { username: credentials.username }
      });
      const data = await apiPost<User>('/api/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      logger.info('Login successful', { 
        tags: ['auth', 'login', 'success'],
        data: { userId: data.id, username: data.username }
      });
      
      // Clear any previous errors
      setError(null);
      
      // Update user data
      queryClient.setQueryData(['auth', 'user'], data);
      
      // Show success toast
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.username}!`,
      });
    },
    onError: (error: Error) => {
      logger.error('Login failed', { 
        tags: ['auth', 'login', 'error'],
        error
      });
      
      // Update error state
      setError(error);
      
      // Show error toast
      toast({
        title: 'Login Failed',
        description: error.message || 'An error occurred during login',
        variant: 'destructive',
      });
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      logger.info('Logging out', { tags: ['auth', 'logout'] });
      await apiPost('/api/logout', {});
    },
    onSuccess: () => {
      logger.info('Logout successful', { tags: ['auth', 'logout', 'success'] });
      
      // Clear user data
      queryClient.setQueryData(['auth', 'user'], null);
      
      // Clear any errors
      setError(null);
      
      // Show success toast
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully.',
      });
    },
    onError: (error: Error) => {
      logger.error('Logout failed', { 
        tags: ['auth', 'logout', 'error'],
        error
      });
      
      // Update error state
      setError(error);
      
      // Show error toast
      toast({
        title: 'Logout Failed',
        description: error.message || 'An error occurred during logout',
        variant: 'destructive',
      });
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      logger.info('Attempting registration', { 
        tags: ['auth', 'register'],
        data: { username: credentials.username }
      });
      const data = await apiPost<User>('/api/register', credentials);
      return data;
    },
    onSuccess: (data) => {
      logger.info('Registration successful', { 
        tags: ['auth', 'register', 'success'],
        data: { userId: data.id, username: data.username }
      });
      
      // Clear any previous errors
      setError(null);
      
      // Update user data
      queryClient.setQueryData(['auth', 'user'], data);
      
      // Show success toast
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${data.username}!`,
      });
    },
    onError: (error: Error) => {
      logger.error('Registration failed', { 
        tags: ['auth', 'register', 'error'],
        error
      });
      
      // Update error state
      setError(error);
      
      // Show error toast
      toast({
        title: 'Registration Failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    },
  });
  
  // Login function (returns a promise that resolves to user data)
  const login = async (credentials: LoginCredentials): Promise<User> => {
    return loginMutation.mutateAsync(credentials);
  };
  
  // Logout function (returns a promise that resolves when logout is complete)
  const logout = async (): Promise<void> => {
    return logoutMutation.mutateAsync();
  };
  
  // Register function (returns a promise that resolves to user data)
  const register = async (credentials: RegisterCredentials): Promise<User> => {
    return registerMutation.mutateAsync(credentials);
  };
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Combine all values for context
  const authContextValue: AuthContextType = {
    user: user ?? null, // Ensure it's not undefined
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    register,
  };
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for accessing auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
