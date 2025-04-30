/**
 * MCP Integration Platform - Error Boundary Component
 * 
 * This component provides a standardized way to catch and handle errors
 * in React components, preventing the entire application from crashing
 * when an error occurs in one component.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { handleError } from '../utils/error-handler';
import { AlertTriangle } from 'lucide-react';

// Define the error fallback props type
export type FallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

// Type definition for the error fallback render function
export type FallbackRender = (props: FallbackProps) => ReactNode;

// Props for the ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | FallbackRender;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<unknown>;
}

// State for the ErrorBoundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Default error fallback component
export function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-5 w-5 mr-2" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="mt-2 text-sm">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </AlertDescription>
      <div className="mt-4">
        <Button variant="outline" onClick={resetErrorBoundary} size="sm">
          Try Again
        </Button>
      </div>
    </Alert>
  );
}

/**
 * Error Boundary component that catches errors in its child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log the error
    console.error('[ErrorBoundary] Caught error:', error, info);
    
    // Handle the error with our error handler
    handleError(error, { toast: false });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }
  
  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset the error state if any reset key has changed
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }
  
  resetErrorBoundary() {
    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    // Reset the error state
    this.setState({ hasError: false, error: null });
  }
  
  render() {
    const { hasError, error } = this.state;
    
    // If no error, render children
    if (!hasError || !error) {
      return this.props.children;
    }
    
    // Render the fallback UI
    const { fallback } = this.props;
    
    // If fallback is a function, call it with error and reset function
    if (typeof fallback === 'function') {
      return fallback({
        error,
        resetErrorBoundary: this.resetErrorBoundary
      });
    }
    
    // If fallback is a ReactNode, render it
    if (fallback) {
      return fallback;
    }
    
    // Otherwise, render the default fallback
    return (
      <DefaultErrorFallback 
        error={error} 
        resetErrorBoundary={this.resetErrorBoundary} 
      />
    );
  }
}