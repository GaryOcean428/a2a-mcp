/**
 * MCP Integration Platform - Protected Route Component
 * 
 * This component ensures routes are only accessible to authenticated users.
 * Unauthenticated users are redirected to the auth page.
 */

import React from 'react';
import { useLocation, Route, Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthHook';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Log route access attempt for security auditing
  React.useEffect(() => {
    logger.debug(`Protected route access attempt: ${path}`, {
      tags: ['auth', 'route', 'access'],
      data: { path, authenticated: !!user, isLoading },
    });
  }, [path, user, isLoading]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying authentication...</p>
          </div>
        </div>
      </Route>
    );
  }
  
  // If user is not authenticated, redirect to auth page with return URL
  if (!user) {
    logger.info(`Redirecting unauthenticated user from ${path} to auth page`, {
      tags: ['auth', 'redirect'],
    });
    
    return (
      <Route path={path}>
        <Redirect to={`/auth?returnUrl=${encodeURIComponent(location)}`} />
      </Route>
    );
  }
  
  // If user is authenticated, render the protected component
  return <Route path={path} component={Component} />;
}
