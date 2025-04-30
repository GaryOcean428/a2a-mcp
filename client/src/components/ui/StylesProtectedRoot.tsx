import React, { useEffect, useState } from 'react';
import { getUILoadingState, UILoadingState } from '@/ui-loading-controller';

interface StylesProtectedRootProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that only renders its children when CSS is properly loaded.
 * This provides an additional layer of protection against unstyled content flashes.
 */
export function StylesProtectedRoot({ 
  children, 
  fallback 
}: StylesProtectedRootProps) {
  const [isStylesReady, setIsStylesReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if we're already in the READY state
    const currentState = getUILoadingState();
    
    if (currentState === UILoadingState.READY) {
      setIsStylesReady(true);
      return;
    }
    
    // Otherwise, wait for the ready event
    const handleReady = () => {
      console.log('[StylesProtectedRoot] UI ready event received');
      setIsStylesReady(true);
    };
    
    // Listen for the ready event
    document.addEventListener('mcp:ui-ready', handleReady);
    
    // Set up timeout fallback in case the event never fires
    const timeoutId = setTimeout(() => {
      console.warn('[StylesProtectedRoot] Timeout waiting for UI ready event, proceeding anyway');
      setIsStylesReady(true);
    }, 3000);
    
    // Clean up
    return () => {
      document.removeEventListener('mcp:ui-ready', handleReady);
      clearTimeout(timeoutId);
    };
  }, []);

  // Error boundary
  if (error) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }

  // Show fallback while loading
  if (!isStylesReady) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="styles-loading">
        <div className="loading-spinner" />
        <p>Loading application...</p>
      </div>
    );
  }

  // Wrap in error boundary
  return (
    <ErrorBoundary onError={setError}>
      {children}
    </ErrorBoundary>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onError: (error: Error) => void;
}> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}