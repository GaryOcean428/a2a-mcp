/**
 * MCP Integration Platform - Query Client Configuration
 * 
 * This file sets up the TanStack Query client with default configurations,
 * including error handling and authentication state management.
 */

import { QueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/logger';

// Default fetch options for API calls
interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
  on401?: '401' | 'throw' | 'returnNull';
}

// Create a client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Wrapper for fetch with error handling
export async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  data?: any,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<Response> {
  const isFormData = data instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    'Accept': 'application/json',
    ...options.headers,
  };
  
  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: options.credentials || 'include',
    ...(data && { body: isFormData ? data : JSON.stringify(data) }),
  };
  
  logger.debug(`API ${method} request to ${endpoint}`, {
    tags: ['api', 'request', method.toLowerCase()],
  });
  
  const response = await fetch(endpoint, fetchOptions);
  
  if (!response.ok) {
    const status = response.status;
    const statusText = response.statusText;
    
    // Handle 401 Unauthorized specially (for authentication flows)
    if (status === 401 && options.on401 === 'returnNull') {
      logger.debug('Not authenticated (401), returning null', {
        tags: ['api', 'auth', '401'],
      });
      return response;
    }
    
    try {
      // Try to parse error response
      const errorData = await response.json();
      const errorMessage = errorData.error || `${status} ${statusText}`;
      
      logger.error(`API error: ${errorMessage}`, {
        tags: ['api', 'error', `status-${status}`],
        data: { status, endpoint, errorData },
      });
      
      throw new Error(errorMessage);
    } catch (jsonError) {
      // If we can't parse the error, throw a generic one
      logger.error(`API error: ${status} ${statusText}`, {
        tags: ['api', 'error', `status-${status}`],
        data: { status, endpoint },
      });
      
      throw new Error(`API error: ${status} ${statusText}`);
    }
  }
  
  return response;
}

// Query function factory for use with useQuery
export function getQueryFn<T = any>(options: FetchOptions = {}) {
  return async ({ queryKey }: { queryKey: any }) => {
    const [endpoint] = queryKey;
    
    try {
      const response = await apiRequest<T>('GET', endpoint, null, options);
      
      // Handle 401 specially for authentication
      if (response.status === 401 && options.on401 === 'returnNull') {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      logger.error(`Query error for ${endpoint}`, {
        tags: ['query', 'error'],
        error,
      });
      throw error;
    }
  };
}
