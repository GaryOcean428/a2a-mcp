/**
 * MCP Integration Platform - LazyLoad Component
 * 
 * This component provides a standardized way to handle code splitting and
 * lazy loading of components with loading states and error boundaries.
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Loading spinner component
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-20 w-full py-4">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

// Function to lazily load a component with proper typing
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  LoadingComponent: React.ComponentType = LoadingSpinner,
  minDelay = 0 // Optional minimum delay for UI continuity
): T {
  // Create the lazy component
  const LazyComponent = lazy(() => {
    // If no delay is set, just load the component
    if (minDelay <= 0) {
      return importFunc();
    }
    
    // Otherwise, add a minimum delay to prevent flickering
    return Promise.all([
      importFunc(),
      new Promise(resolve => setTimeout(resolve, minDelay))
    ]).then(([module]) => module);
  });
  
  // Create a wrapper component that handles rendering
  const ComponentWithLoading = ((props: any) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  )) as unknown as T;
  
  return ComponentWithLoading;
}

// Helper function that creates lazy-loaded components with standard configuration
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  minDelay = 300 // Default minimum delay to prevent loading flicker
): T {
  return lazyLoad(importFunc, LoadingSpinner, minDelay);
}

// LazyRoute component for code-split routes
interface LazyRouteProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

export function LazyRoute({ component: Component }: LazyRouteProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
}

// Export a type-safe version of React.lazy
export function lazyImport<
  T extends ComponentType<any>,
  I extends { [K2 in K]: T },
  K extends keyof I
>(factory: () => Promise<I>, name: K): I {
  return {
    [name]: lazyLoad(() => factory().then((module) => ({ default: module[name] })))
  } as unknown as I;
}