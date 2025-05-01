import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

// Define User type
interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  // Password excluded from returned user
}

// Define login credentials type
interface LoginCredentials {
  username: string;
  password: string;
}

// Define registration data type
interface RegistrationData extends LoginCredentials {
  email: string;
  name?: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegistrationData) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider component for auth context
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);
  
  // Query to fetch the current user
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/user", null, { on401: "returnNull" });
        if (response.status === 401) {
          return null;
        }
        return await response.json();
      } catch (err) {
        logger.error("Failed to fetch user", { error: err });
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
  
  // Mutation for login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return await response.json();
    },
    onSuccess: (user: User) => {
      logger.info("Login successful", { tags: ["auth", "login"] });
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      logger.error("Login failed", { error, tags: ["auth", "login", "error"] });
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
      throw error; // Rethrow for component error handling
    },
  });
  
  // Mutation for registration
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await apiRequest("POST", "/api/register", data);
      return await response.json();
    },
    onSuccess: (user: User) => {
      logger.info("Registration successful", { tags: ["auth", "register"] });
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration Successful",
        description: `Welcome, ${user.username}! Your account has been created.`,
      });
    },
    onError: (error: Error) => {
      logger.error("Registration failed", { error, tags: ["auth", "register", "error"] });
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
      throw error; // Rethrow for component error handling
    },
  });
  
  // Mutation for logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      logger.info("Logout successful", { tags: ["auth", "logout"] });
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      logger.error("Logout failed", { error, tags: ["auth", "logout", "error"] });
      toast({
        title: "Logout Failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    },
  });
  
  // Function to handle login
  const login = async (credentials: LoginCredentials): Promise<User> => {
    return await loginMutation.mutateAsync(credentials);
  };
  
  // Function to handle registration
  const register = async (data: RegistrationData): Promise<User> => {
    return await registerMutation.mutateAsync(data);
  };
  
  // Function to handle logout
  const logout = async (): Promise<void> => {
    return await logoutMutation.mutateAsync();
  };
  
  // Function to check authentication status
  const checkAuth = async (): Promise<User | null> => {
    // Set a timestamp to prevent too frequent checks
    const now = Date.now();
    if (now - lastAuthCheck < 1000) {
      return user || null;
    }
    
    setLastAuthCheck(now);
    const result = await refetchUser();
    return result.data || null;
  };
  
  // Provide auth context value
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
