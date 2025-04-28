import { createContext, ReactNode, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  lastLogin: string | null;
  apiKey: string | null;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  isAuthenticated: boolean;
}

// Create authentication context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
    queryFn: async ({ signal }) => {
      try {
        console.log('Fetching user data from /api/user');
        const response = await fetch('/api/user', { 
          signal,
          credentials: 'include',  // Important for cookies in production
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.status === 401) {
          console.log('Not authenticated (401), returning null');
          // Not authenticated, return null instead of throwing
          return null;
        }
        
        if (!response.ok) {
          console.error('Failed to fetch user data:', response.status, response.statusText);
          throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
        }
        
        const userData = await response.json();
        console.log('User data received:', userData ? 'User authenticated' : 'No user data');
        return userData;
      } catch (err) {
        // If it's a network error or abort, return null
        if (err instanceof Error) {
          console.error('Error fetching user data:', err.message);
          if (err.name === 'AbortError' || err.message.includes('fetch')) {
            return null;
          }
        }
        throw err;
      }
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        console.log('Attempting login for:', credentials.username);
        const response = await apiRequest('POST', '/api/login', credentials);
        
        // Handle non-OK responses
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Login error response:', errorData);
          throw new Error(errorData.error || 'Login failed');
        }
        
        // Parse and return successful response
        const userData = await response.json();
        console.log('Login successful, user data received');
        return userData;
      } catch (error) {
        console.error('Login request failed:', error);
        // Re-throw for proper handling in onError
        throw error;
      }
    },
    onSuccess: (user: User) => {
      console.log('Login mutation success, updating cache');
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: 'Login successful!',
        description: `Welcome back, ${user.username}!`,
      });
      
      // Navigate to home page, ensuring we use a hard redirect if needed
      // This helps with some production routing issues
      const currentPath = window.location.pathname;
      if (currentPath === '/auth' || currentPath === '/login') {
        navigate('/');
      }
    },
    onError: (error: any) => {
      console.error('Login mutation error handler:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Unable to login. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/logout', {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Logout failed');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: 'Logout successful',
        description: 'You have been logged out.',
      });
      navigate('/auth');
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest('POST', '/api/register', credentials);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      return await response.json();
    },
    onSuccess: (user: User) => {
      toast({
        title: 'Registration successful!',
        description: 'Your account has been created.',
      });
      // Automatically log in after registration
      queryClient.setQueryData(['/api/user'], user);
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Simplified functions that use the mutations
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const register = async (credentials: RegisterCredentials) => {
    await registerMutation.mutateAsync(credentials);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  // Production environment check to ensure consistent auth behavior
  const PRODUCTION_AUTH_CHECK = process.env.NODE_ENV === 'production' || import.meta.env.PROD;
  
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}