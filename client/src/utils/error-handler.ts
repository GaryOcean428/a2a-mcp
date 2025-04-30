/**
 * MCP Integration Platform - Error Handler Utility
 * 
 * This utility provides centralized error handling for the application.
 * It includes logging, user-friendly error messages, and categorization
 * of different error types.
 */

import { toast } from '@/hooks/use-toast';
import { ERROR_MESSAGES } from '../config/constants';

// Error categorization types
export type ErrorCategory = 
  | 'api' 
  | 'auth' 
  | 'network' 
  | 'validation' 
  | 'websocket' 
  | 'unknown';

// Error level for severity
export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

// Extended error interface with additional metadata
export interface ErrorWithMetadata extends Error {
  category?: ErrorCategory;
  level?: ErrorLevel;
  code?: string;
  statusCode?: number;
  retry?: boolean;
}

/**
 * Creates an error with additional metadata
 */
export function createError(
  message: string, 
  options: {
    category?: ErrorCategory;
    level?: ErrorLevel;
    code?: string;
    statusCode?: number;
    retry?: boolean;
    cause?: Error;
  } = {}
): ErrorWithMetadata {
  const error = new Error(message) as ErrorWithMetadata;
  
  // Add metadata
  error.category = options.category || 'unknown';
  error.level = options.level || 'error';
  error.code = options.code;
  error.statusCode = options.statusCode;
  error.retry = options.retry;
  
  // Include the cause if provided (for error chaining)
  if (options.cause) {
    error.cause = options.cause;
  }
  
  return error;
}

/**
 * Categorize an error based on its properties
 */
export function categorizeError(error: Error): ErrorCategory {
  if ((error as ErrorWithMetadata).category) {
    return (error as ErrorWithMetadata).category!;
  }
  
  // Check for network errors
  if (
    error.message.includes('network') ||
    error.message.includes('Network') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError') ||
    error.message.includes('AbortError')
  ) {
    return 'network';
  }
  
  // Check for authentication errors
  if (
    error.message.includes('unauthorized') ||
    error.message.includes('Unauthorized') ||
    error.message.includes('Authentication') ||
    error.message.includes('auth') ||
    (error as any).statusCode === 401 ||
    (error as any).status === 401
  ) {
    return 'auth';
  }
  
  // Check for WebSocket errors
  if (
    error.message.includes('WebSocket') ||
    error.message.includes('socket')
  ) {
    return 'websocket';
  }
  
  // Check for validation errors
  if (
    error.message.includes('validation') ||
    error.message.includes('Validation') ||
    error.message.includes('invalid') ||
    error.message.includes('Invalid') ||
    (error as any).statusCode === 400 ||
    (error as any).status === 400
  ) {
    return 'validation';
  }
  
  // Default to API errors if none of the above
  if (
    error.message.includes('API') ||
    error.message.includes('api') ||
    (error as any).statusCode ||
    (error as any).status
  ) {
    return 'api';
  }
  
  return 'unknown';
}

/**
 * Get a user-friendly error message based on category
 */
export function getUserFriendlyErrorMessage(error: Error): string {
  const category = categorizeError(error);
  
  // Use the specific error message if it exists
  if (error.message && !error.message.includes('[object Object]')) {
    return error.message;
  }
  
  // Otherwise use category-based default messages
  switch (category) {
    case 'network':
      return ERROR_MESSAGES.NETWORK;
    case 'auth':
      return ERROR_MESSAGES.AUTHENTICATION;
    case 'websocket':
      return ERROR_MESSAGES.WEBSOCKET;
    case 'validation':
      return ERROR_MESSAGES.VALIDATION;
    case 'api':
      return ERROR_MESSAGES.API_TIMEOUT;
    case 'unknown':
    default:
      return ERROR_MESSAGES.GENERAL;
  }
}

/**
 * Handle an error - logs, displays toast, and returns user-friendly message
 */
export function handleError(
  error: Error, 
  options: {
    silent?: boolean;
    level?: ErrorLevel;
    toast?: boolean;
    retry?: () => void;
  } = {}
): string {
  // Default options
  const opts = {
    silent: false,
    level: 'error' as ErrorLevel,
    toast: true,
    ...options
  };
  
  // Get error category and user-friendly message
  const category = categorizeError(error);
  const friendlyMessage = getUserFriendlyErrorMessage(error);
  
  // Log the error with appropriate level unless silent
  if (!opts.silent) {
    const logPrefix = `[${category.toUpperCase()}]`;
    
    switch (opts.level) {
      case 'info':
        console.info(logPrefix, friendlyMessage, error);
        break;
      case 'warning':
        console.warn(logPrefix, friendlyMessage, error);
        break;
      case 'critical':
        console.error(logPrefix, 'CRITICAL:', friendlyMessage, error);
        break;
      case 'error':
      default:
        console.error(logPrefix, friendlyMessage, error);
    }
  }
  
  // Show a toast notification if enabled
  if (opts.toast) {
    toast({
      title: category === 'unknown' ? 'Error' : `${category.charAt(0).toUpperCase() + category.slice(1)} Error`,
      description: friendlyMessage,
      variant: 'destructive'
    });
  }
  
  return friendlyMessage;
}

/**
 * Create and handle an API error from a response object
 */
export async function handleApiError(
  response: Response, 
  options: {
    silent?: boolean;
    toast?: boolean;
  } = {}
): Promise<ErrorWithMetadata> {
  let errorMessage: string;
  let errorData: any;
  
  try {
    // Try to parse the response as JSON
    errorData = await response.json();
    errorMessage = errorData.message || errorData.error || `API Error: ${response.status} ${response.statusText}`;
  } catch (e) {
    // If parsing fails, use status text
    errorMessage = `API Error: ${response.status} ${response.statusText}`;
  }
  
  // Create error with metadata
  const error = createError(errorMessage, {
    category: 'api',
    statusCode: response.status,
    code: response.status.toString(),
    level: response.status >= 500 ? 'critical' : 'error',
    retry: response.status >= 500 || response.status === 429
  });
  
  // Handle the error (logs and toast)
  handleError(error, options);
  
  return error;
}