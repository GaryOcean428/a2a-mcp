/**
 * MCP Integration Platform - LazyLoad Component
 * 
 * This component provides a standardized way to handle code splitting and
 * lazy loading of components with loading states and error boundaries.
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Loading spinner component props
export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'light' | 'dark';
  className?: string;
  fullWidth?: boolean;
}

// Loading spinner component with size and variant support
export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
  fullWidth = true
}: LoadingSpinnerProps) {
  // Size mappings
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };
  
  // Variant mappings
  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    light: 'text-white',
    dark: 'text-gray-800'
  };
  
  // Combine classes
  const spinnerClasses = `
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    animate-spin 
    ${className}
  `;
  
  return (
    <div className={`flex justify-center items-center py-2 ${fullWidth ? 'w-full' : ''}`}>
      <Loader2 className={spinnerClasses} />
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

// Lazy load ToolSidebar and LoginPrompt components
export const ToolSidebar = createLazyComponent(() => import('@/components/ToolSidebar'));
export const LoginPrompt = createLazyComponent(() => import('@/components/LoginPrompt'));
