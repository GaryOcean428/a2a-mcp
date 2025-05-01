/**
 * MCP Integration Platform - API Utilities
 * 
 * This utility provides helpers for making API requests
 * with proper error handling and authentication.
 */

import { logger } from './logger';
import { isDevelopment, isProduction } from './environment';

/**
 * Get the base URL for API requests
 */
export function getApiBaseUrl(): string {
  // In development, we use the current hostname
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}`;
  }
  
  // Fallback for server-side rendering or tests
  return isDevelopment() ? 'http://localhost:5000' : '';
}

/**
 * Options for API requests
 */
export interface ApiRequestOptions extends RequestInit {
  // Whether to include authentication headers
  authenticate?: boolean;
  // Custom tags for logging
  tags?: string[];
  // Timeout in milliseconds
  timeout?: number;
  // Custom headers
  headers?: Record<string, string>;
  // Whether to parse the response as JSON
  parseJson?: boolean;
}

/**
 * Make an API request with consistent error handling
 */
export async function apiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  // Ensure endpoint starts with a slash or is a full URL
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Default options
  const defaultOptions: ApiRequestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
    parseJson: true,
    timeout: 30000, // 30 second timeout
  };
  
  // Merge options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  // Log the request
  logger.debug(`API Request: ${mergedOptions.method} ${url}`, {
    tags: ['api', 'request', ...(mergedOptions.tags || [])],
    data: { 
      method: mergedOptions.method,
      url,
      headers: Object.keys(mergedOptions.headers || {}),
    },
  });
  
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, mergedOptions.timeout);
    
    // Add the signal to the fetch options
    const fetchOptions = {
      ...mergedOptions,
      signal: controller.signal,
    };
    
    // Make the request
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    // Check if the response is successful
    if (!response.ok) {
      // Try to parse error message
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Couldn't parse JSON, use status text
        errorData = { message: response.statusText };
      }
      
      // Log the error
      logger.error(`API Error: ${response.status} ${response.statusText}`, {
        tags: ['api', 'error', ...(mergedOptions.tags || [])],
        data: { 
          status: response.status,
          statusText: response.statusText,
          url,
          errorData,
        },
      });
      
      // Special handling for authentication errors
      if (response.status === 401) {
        logger.warn('Authentication required', {
          tags: ['api', 'auth', 'error'],
        });
      }
      
      // Create error with additional properties
      const error = new Error(
        errorData.message || `API Error: ${response.status} ${response.statusText}`
      ) as any;
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;
      throw error;
    }
    
    // Log success
    logger.debug(`API Success: ${response.status} ${url}`, {
      tags: ['api', 'success', ...(mergedOptions.tags || [])],
      data: { 
        status: response.status,
        url,
      },
    });
    
    return response;
  } catch (error: any) {
    // Handle abort errors (timeouts)
    if (error.name === 'AbortError') {
      logger.error(`API Timeout: ${url}`, {
        tags: ['api', 'timeout', ...(mergedOptions.tags || [])],
        error,
        data: { 
          url,
          timeout: mergedOptions.timeout,
        },
      });
      
      throw new Error(`API request timed out after ${mergedOptions.timeout}ms`);
    }
    
    // Handle network errors
    logger.error(`API Error: ${error.message}`, {
      tags: ['api', 'error', ...(mergedOptions.tags || [])],
      error,
      data: { 
        url,
      },
    });
    
    throw error;
  }
}

/**
 * Make a GET request and parse the response as JSON
 */
export async function apiGet<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'GET',
    ...options,
  });
  
  return await response.json() as T;
}

/**
 * Make a POST request with a JSON body
 */
export async function apiPost<T = any>(
  endpoint: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
  
  return await response.json() as T;
}

/**
 * Make a PUT request with a JSON body
 */
export async function apiPut<T = any>(
  endpoint: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
  
  return await response.json() as T;
}

/**
 * Make a DELETE request
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'DELETE',
    ...options,
  });
  
  return await response.json() as T;
}
