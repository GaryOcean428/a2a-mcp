/**
 * MCP Integration Platform - Protected Route Component
 * 
 * This component restricts access to routes based on authentication status.
 * Unauthenticated users are redirected to the login page.
 */

import React, { ComponentType } from 'react';
import { Route, Redirect, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthHook';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  // The path this route should match
  path: string;
  // The component to render when authenticated
  component: ComponentType;
  // Optional fallback URL to redirect to (defaults to /auth)
  fallbackUrl?: string;
}

/**
 * Protected Route Component
 * 
 * Wraps a Route component to require authentication.
 * If the user is not authenticated, they are redirected to the login page.
 */
export function ProtectedRoute({
  path,
  component: Component,
  fallbackUrl = '/auth',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // Log access attempts to protected routes
  React.useEffect(() => {
    if (location === path) {
      if (isAuthenticated) {
        logger.debug(`Authenticated access to protected route: ${path}`, {
          tags: ['auth', 'route', 'access'],
          data: { path, userId: user?.id }
        });
      } else if (!isLoading) {
        logger.warn(`Unauthenticated access attempt to protected route: ${path}`, {
          tags: ['auth', 'route', 'denied'],
          data: { path, redirectTo: fallbackUrl }
        });
      }
    }
  }, [location, path, isAuthenticated, isLoading, user, fallbackUrl]);
  
  return (
    <Route path={path}>
      {() => {
        // Show loading spinner while checking authentication
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg text-muted-foreground">
                Checking authentication...
              </span>
            </div>
          );
        }
        
        // If authenticated, render the component
        if (isAuthenticated) {
          return <Component />;
        }
        
        // Otherwise, redirect to login with a return URL
        const returnUrl = encodeURIComponent(path);
        const redirectTo = `${fallbackUrl}?returnUrl=${returnUrl}`;
        return <Redirect to={redirectTo} />;
      }}
    </Route>
  );
}
