import React, { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyLoadProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  props?: Record<string, any>;
}

/**
 * LazyLoad Component
 * 
 * This component provides a standardized way to lazy-load components with
 * built-in loading states and error handling.
 */
export function LazyLoad({ 
  component, 
  fallback = <LoadingSpinner />, 
  errorFallback,
  props = {}
}: LazyLoadProps) {
  // Lazy load the component
  const LazyComponent = lazy(component);

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Create a lazy-loaded component with standardized error and loading handling
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    fallback?: ReactNode;
    errorFallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  } = {}
): React.FC<P> {
  const LazyComponent = lazy(importFn);

  return (props: P) => (
    <ErrorBoundary fallback={options.errorFallback}>
      <Suspense fallback={options.fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}