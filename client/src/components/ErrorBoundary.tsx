/**
 * MCP Integration Platform - Error Boundary
 * 
 * This component catches React errors in its child component tree and displays
 * a fallback UI instead of crashing the entire application.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our logging service
    logger.error('React error boundary caught error', {
      tags: ['react', 'error-boundary'],
      error, 
      data: { componentStack: errorInfo.componentStack }
    });
    
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // We also set errorInfo in state so we can display the component stack trace
    this.setState({ errorInfo });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise, show our default error UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="p-6 mx-auto max-w-3xl rounded-lg shadow-lg bg-card border border-border">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
              
              <p className="text-muted-foreground mb-2">
                The application encountered an unexpected error. Please try again or reload the page.
              </p>
              
              {/* Error details (for development environments) */}
              <div className="w-full overflow-auto text-left bg-muted p-4 rounded-md">
                <p className="font-semibold text-foreground">{this.state.error?.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-xs text-muted-foreground">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
              
              <div className="flex gap-4 mt-4">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  Try Again
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
