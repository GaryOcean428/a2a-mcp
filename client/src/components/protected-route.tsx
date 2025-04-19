import { useQuery } from '@tanstack/react-query';
import { Redirect, Route } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  // Fetch the current user to check authentication
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Checking authentication...</span>
        </div>
      </Route>
    );
  }
  
  // Redirect to auth page if not authenticated
  if (isError || !user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // Render the protected component if authenticated
  return <Route path={path} component={Component} />;
}