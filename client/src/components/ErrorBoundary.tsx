/**
 * MCP Integration Platform - Error Boundary Component
 * 
 * This component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // This lifecycle method runs when an error is thrown in a child component
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  // This lifecycle method allows logging the error
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to console
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
    
    // Store error info for display
    this.setState({ errorInfo });
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // Reset error state when props change if requested
  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      this.props.children !== prevProps.children
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }
  
  // Method to manually reset the error boundary
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    // If there's an error, show fallback UI
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise use default error UI
      return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800 my-4 mx-auto max-w-2xl">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-semibold">Something went wrong</h3>
          </div>
          
          <p className="mb-4">
            The application encountered an error. Try refreshing the page or contact support if the problem persists.
          </p>
          
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-xs max-h-48">
              {this.state.error?.toString() || 'Unknown error'}
              {this.state.errorInfo?.componentStack || ''}
            </pre>
          </details>
          
          <button
            onClick={this.resetErrorBoundary}
            className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    // Otherwise, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
