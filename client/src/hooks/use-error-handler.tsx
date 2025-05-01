/**
 * MCP Integration Platform - Error Handler Hook
 * 
 * This custom hook provides consistent error handling and reporting across the application.
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { isDevelopment } from '@/utils/environment';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';

interface ErrorHandlerOptions {
  // Default messages for different types of errors
  defaultMessages?: {
    network?: string;
    server?: string;
    validation?: string;
    auth?: string;
    notFound?: string;
    unknown?: string;
  };
  // Whether to show toast notifications for errors
  showToast?: boolean;
  // Whether to include error details in the toast (useful in development)
  showDetails?: boolean;
  // Module name for logging
  module?: string;
  // Tags for error logging
  tags?: string[];
}

interface ErrorState {
  // Whether there is an active error
  hasError: boolean;
  // The error message to display to the user
  message: string;
  // The original error object
  error: Error | null;
  // Additional details about the error context
  details?: Record<string, any>;
  // Severity level of the error
  severity: ErrorSeverity;
}

interface ErrorHandler {
  // Current error state
  errorState: ErrorState;
  // Set an error with a given message and options
  setError: (message: string, error?: Error | unknown, options?: Partial<ErrorHandlerOptions> & { severity?: ErrorSeverity, details?: Record<string, any> }) => void;
  // Handle an error with automatic classification
  handleError: (error: Error | unknown, options?: Partial<ErrorHandlerOptions>) => void;
  // Clear the current error
  clearError: () => void;
  // Check if the current error is of a specific type
  isNetworkError: (error: Error | unknown) => boolean;
  isValidationError: (error: Error | unknown) => boolean;
  isAuthError: (error: Error | unknown) => boolean;
  isNotFoundError: (error: Error | unknown) => boolean;
}

const DEFAULT_MESSAGES = {
  network: 'Network error. Please check your internet connection and try again.',
  server: 'The server encountered an error. Please try again later.',
  validation: 'Please check your input and try again.',
  auth: 'Authentication error. Please log in and try again.',
  notFound: 'The requested resource could not be found.',
  unknown: 'An unexpected error occurred. Please try again.'
};

// Utility functions to check error types
function isNetworkError(error: Error | unknown): boolean {
  if (!error) return false;
  
  // Check for fetch/network related errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Check for custom error types with status code
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as any).status === 0;
  }
  
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('offline') ||
    message.includes('cors') ||
    message.includes('certificate')
  );
}

function isValidationError(error: Error | unknown): boolean {
  if (!error) return false;
  
  // Check for status code
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as any).status === 400 || (error as any).status === 422;
  }
  
  // Check error name
  if (error instanceof Error) {
    return (
      error.name === 'ValidationError' ||
      error.name === 'ZodError' ||
      error.message.toLowerCase().includes('validation')
    );
  }
  
  return false;
}

function isAuthError(error: Error | unknown): boolean {
  if (!error) return false;
  
  // Check for status code
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as any).status === 401 || (error as any).status === 403;
  }
  
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('permission') ||
    message.includes('access denied') ||
    message.includes('not allowed') ||
    message.includes('authentication') ||
    message.includes('auth')
  );
}

function isNotFoundError(error: Error | unknown): boolean {
  if (!error) return false;
  
  // Check for status code
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as any).status === 404;
  }
  
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('not found') ||
    message.includes('doesn\'t exist') ||
    message.includes('no such')
  );
}

function isServerError(error: Error | unknown): boolean {
  if (!error) return false;
  
  // Check for status code
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as any).status >= 500;
  }
  
  return false;
}

/**
 * Custom hook for consistent error handling
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}): ErrorHandler {
  const { toast } = useToast();
  
  // Destructure options with defaults
  const {
    defaultMessages = DEFAULT_MESSAGES,
    showToast = true,
    showDetails = isDevelopment(),
    module = 'App',
    tags = ['error-handler']
  } = options;
  
  // Error state
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: '',
    error: null,
    severity: 'error'
  });
  
  // Helper to set an error
  const setError = useCallback((message: string, error?: Error | unknown, options?: Partial<ErrorHandlerOptions> & { severity?: ErrorSeverity, details?: Record<string, any> }) => {
    const severity = options?.severity || 'error';
    const details = options?.details || {};
    
    // Create an error object if one wasn't passed
    const errorObj = error instanceof Error 
      ? error 
      : error 
        ? new Error(String(error))
        : new Error(message);
    
    // Update error state
    setErrorState({
      hasError: true,
      message,
      error: errorObj,
      details,
      severity
    });
    
    // Log the error
    if (severity === 'fatal' || severity === 'error') {
      logger.error(message, {
        tags: [...(options?.tags || tags), module.toLowerCase()],
        error: errorObj,
        data: details
      });
    } else if (severity === 'warning') {
      logger.warn(message, {
        tags: [...(options?.tags || tags), module.toLowerCase()],
        error: errorObj,
        data: details
      });
    } else {
      logger.info(message, {
        tags: [...(options?.tags || tags), module.toLowerCase()],
        error: errorObj,
        data: details
      });
    }
    
    // Show toast if enabled
    if (options?.showToast !== false && showToast) {
      toast({
        title: severity === 'fatal' ? 'Critical Error' : severity === 'error' ? 'Error' : severity === 'warning' ? 'Warning' : 'Notice',
        description: showDetails && errorObj.message ? `${message}\n${errorObj.message}` : message,
        variant: severity === 'info' ? 'default' : severity === 'error' || severity === 'fatal' ? 'destructive' : 'default'
      });
    }
  }, [toast, showToast, showDetails, module, tags]);
  
  // Process and classify errors automatically
  const handleError = useCallback((error: Error | unknown, options?: Partial<ErrorHandlerOptions>) => {
    // Try to determine the error type and use an appropriate message
    let message = defaultMessages.unknown || 'An unexpected error occurred';
    let severity: ErrorSeverity = 'error';
    
    if (isNetworkError(error)) {
      message = defaultMessages.network || 'Network error occurred';
      // Network errors are usually temporary
      severity = 'warning';
    } else if (isServerError(error)) {
      message = defaultMessages.server || 'Server error occurred';
      // Server errors might need to be reported
      severity = 'error';
    } else if (isValidationError(error)) {
      message = defaultMessages.validation || 'Validation error occurred';
      // Validation errors are usually user fixable
      severity = 'warning';
    } else if (isAuthError(error)) {
      message = defaultMessages.auth || 'Authentication error occurred';
      // Auth errors might need user action
      severity = 'error';
    } else if (isNotFoundError(error)) {
      message = defaultMessages.notFound || 'Resource not found';
      severity = 'warning';
    }
    
    // Get error message from the error object if available
    const errorMessage = error instanceof Error 
      ? error.message 
      : error && typeof error === 'object' && 'message' in error
        ? String((error as any).message)
        : error
          ? String(error)
          : 'Unknown error';
    
    // Include original error message for more context
    const details = {
      errorType: error instanceof Error ? error.name : typeof error,
      errorMessage,
      ...(options?.defaultMessages || {})
    };
    
    // Set the error using our helper
    setError(message, error, { 
      ...options, 
      severity,
      details
    });
  }, [setError, defaultMessages]);
  
  // Clear the error state
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      message: '',
      error: null,
      severity: 'error'
    });
  }, []);
  
  return {
    errorState,
    setError,
    handleError,
    clearError,
    isNetworkError,
    isValidationError,
    isAuthError,
    isNotFoundError
  };
}
