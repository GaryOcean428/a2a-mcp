/**
 * MCP Integration Platform - API Utilities
 * 
 * This utility provides standardized API request handling with proper
 * error management, type safety, and authentication.
 */

import { getApiBaseUrl } from './environment';
import { logger } from './logger';

/**
 * API Error class for consistent error handling
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;
  url: string;
  
  constructor(url: string, status: number, statusText: string, message: string, data?: any) {
    super(message || statusText);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.data = data;
  }
  
  /**
   * Check if this is an unauthorized error (401)
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }
  
  /**
   * Check if this is a not found error (404)
   */
  isNotFound(): boolean {
    return this.status === 404;
  }
  
  /**
   * Check if this is a server error (500+)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }
  
  /**
   * Check if this error is retryable
   */
  isRetryable(): boolean {
    // Network errors and some server errors are retryable
    return (
      this.status === 0 || // Network error
      this.status === 408 || // Request timeout
      this.status === 429 || // Too many requests
      this.status >= 500 // Server error
    );
  }
  
  /**
   * Convert to a user-friendly error message
   */
  toUserMessage(): string {
    if (this.status === 0) {
      return 'Network error: Please check your internet connection';
    } else if (this.status === 401) {
      return 'Authentication required: Please log in to continue';
    } else if (this.status === 403) {
      return 'Access denied: You do not have permission to perform this action';
    } else if (this.status === 404) {
      return 'Resource not found: The requested item could not be found';
    } else if (this.status === 429) {
      return 'Too many requests: Please try again later';
    } else if (this.status >= 500) {
      return 'Server error: The server encountered an unexpected error';
    } else {
      return this.message || 'An unexpected error occurred';
    }
  }
}

/**
 * API request options
 */
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
  parseResponse?: boolean;
}

/**
 * Default API request options
 */
const defaultOptions: ApiRequestOptions = {
  timeout: 30000, // 30 seconds
  retry: 1, // 1 retry by default
  retryDelay: 1000, // 1 second
  parseResponse: true
};

/**
 * Timeout a promise after a specific duration
 */
function timeoutPromise<T>(promise: Promise<T>, ms: number, url: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new ApiError(
        url,
        408,
        'Request Timeout',
        `Request to ${url} timed out after ${ms}ms`
      ));
    }, ms);
    
    promise.then(
      (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

/**
 * Build a URL with query parameters
 */
function buildUrl(baseUrl: string, path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const url = new URL(path, baseUrl);
  
  // Add query parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * Parse response based on content type
 */
async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      logger.warn('Failed to parse JSON response', {
        error,
        data: { url: response.url, status: response.status }
      });
      return null;
    }
  } else if (contentType.includes('text/')) {
    return response.text();
  } else {
    // For binary data or other formats, return as blob
    return response.blob();
  }
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    retry: number;
    retryDelay: number;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<T> {
  const { retry, retryDelay, onRetry } = options;
  
  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = error instanceof ApiError && error.isRetryable();
      const isLastAttempt = attempt === retry;
      
      if (!isRetryable || isLastAttempt) {
        throw error;
      }
      
      // Call onRetry callback
      if (onRetry) {
        onRetry(attempt + 1, error as Error);
      }
      
      // Wait with exponential backoff
      const delay = retryDelay * Math.pow(1.5, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but TypeScript requires a return
  throw new Error('Retry loop exited unexpectedly');
}

/**
 * Make an API request with error handling and retries
 */
export async function apiRequest<T = any>(
  method: string,
  path: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const mergedOptions: ApiRequestOptions = { ...defaultOptions, ...options };
  const { 
    params, 
    timeout, 
    retry, 
    retryDelay, 
    onRetry, 
    parseResponse: shouldParseResponse,
    ...fetchOptions 
  } = mergedOptions;
  
  // Build the full URL
  const url = buildUrl(baseUrl, path, params);
  
  // Create request configuration
  const config: RequestInit = {
    method,
    ...fetchOptions,
    headers: {
      'Content-Type': data ? 'application/json' : 'text/plain',
      'Accept': 'application/json',
      ...fetchOptions.headers,
    }
  };
  
  // Add body for non-GET requests
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }
  
  // Make the request with retries
  return await retryWithBackoff(
    async () => {
      try {
        // Make the request with timeout
        const fetchPromise = fetch(url, config);
        const response = await timeoutPromise(fetchPromise, timeout!, url);
        
        // Parse response data
        const responseData = shouldParseResponse ? await parseResponse(response) : await response.blob();
        
        // Check for error status
        if (!response.ok) {
          let errorMessage = `HTTP error ${response.status}`;
          
          // Try to extract error message from response
          if (responseData && typeof responseData === 'object') {
            const message = responseData.message || responseData.error || JSON.stringify(responseData);
            if (message) {
              errorMessage = message;
            }
          }
          
          throw new ApiError(
            url,
            response.status,
            response.statusText,
            errorMessage,
            responseData
          );
        }
        
        return responseData as T;
      } catch (error) {
        // Convert fetch errors to ApiErrors
        if (!(error instanceof ApiError)) {
          throw new ApiError(
            url,
            0,
            'Network Error',
            error instanceof Error ? error.message : String(error)
          );
        }
        throw error;
      }
    },
    { retry: retry!, retryDelay: retryDelay!, onRetry }
  );
}

/**
 * Convenience method for GET requests
 */
export function apiGet<T = any>(path: string, params?: Record<string, string | number | boolean | undefined | null>, options?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>('GET', path, undefined, { ...options, params });
}

/**
 * Convenience method for POST requests
 */
export function apiPost<T = any>(path: string, data?: any, options?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>('POST', path, data, options);
}

/**
 * Convenience method for PUT requests
 */
export function apiPut<T = any>(path: string, data?: any, options?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>('PUT', path, data, options);
}

/**
 * Convenience method for PATCH requests
 */
export function apiPatch<T = any>(path: string, data?: any, options?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>('PATCH', path, data, options);
}

/**
 * Convenience method for DELETE requests
 */
export function apiDelete<T = any>(path: string, options?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>('DELETE', path, undefined, options);
}
