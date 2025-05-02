/**
 * Error Boundary Component
 * 
 * This component catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our logging service
    logger.error('UI Error Boundary caught an error', {
      data: {
        message: error.message,
        componentStack: errorInfo.componentStack
      },
      error: error,
      tags: ['error-boundary', 'ui-error']
    });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 flex items-center justify-center min-h-[300px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              <p className="mb-4">An unexpected error occurred while rendering this component.</p>
              <p className="text-xs font-mono mb-3 whitespace-pre-wrap">
                {this.state.error?.message}
              </p>
              <Button 
                variant="outline" 
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;