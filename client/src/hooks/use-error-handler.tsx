/**
 * MCP Integration Platform - Error Handler Hook
 * 
 * This hook provides error handling functionality for both caught exceptions
 * and async errors across the application.
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ErrorState {
  hasError: boolean;
  message: string;
  timestamp: number;
  source?: string;
  details?: unknown;
}

interface UseErrorHandlerOptions {
  logToConsole?: boolean;
  showToast?: boolean;
  context?: string;
  onError?: (error: ErrorState) => void;
}

export type ErrorHandler = (error: unknown, source?: string) => void;

/**
 * Hook for centralized error handling
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    logToConsole = true,
    showToast = true,
    context = 'application',
    onError
  } = options;

  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  /**
   * Format an error into a readable message
   */
  const formatErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    } else {
      return 'An unknown error occurred';
    }
  }, []);

  /**
   * Handle an error
   */
  const handleError = useCallback((error: unknown, source?: string): void => {
    const message = formatErrorMessage(error);
    const timestamp = Date.now();
    const sourceInfo = source || context;

    // Create error state object
    const newErrorState: ErrorState = {
      hasError: true,
      message,
      timestamp,
      source: sourceInfo,
      details: error
    };

    // Update error state
    setErrorState(newErrorState);

    // Log to console if enabled
    if (logToConsole) {
      console.error(`[Error] ${sourceInfo}: ${message}`, error);
    }

    // Show toast notification if enabled
    if (showToast) {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }

    // Call custom error handler if provided
    if (onError) {
      onError(newErrorState);
    }
  }, [context, formatErrorMessage, logToConsole, onError, showToast, toast]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  /**
   * Try to execute a function, catching and handling any errors
   */
  const tryCatch = useCallback(<T extends unknown>(
    fn: () => T,
    source?: string
  ): T | undefined => {
    try {
      return fn();
    } catch (error) {
      handleError(error, source);
      return undefined;
    }
  }, [handleError]);

  /**
   * Create a wrapped version of an async function that handles errors
   */
  const wrapAsync = useCallback(<T extends unknown>(
    fn: (...args: any[]) => Promise<T>,
    source?: string
  ) => {
    return async (...args: any[]): Promise<T | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, source);
        return undefined;
      }
    };
  }, [handleError]);

  return {
    error: errorState,
    handleError,
    clearError,
    tryCatch,
    wrapAsync,
  };
}
