import { useAuth } from '@/hooks/useAuth';
import { Redirect, Route } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  // Use the auth context directly to ensure consistent auth state
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Checking authentication...</span>
          </div>
        )}
      </Route>
    );
  }
  
  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to /auth");
    return (
      <Route path={path}>
        {() => {
          // Ensure the auth page will be accessible
          // Use window.location for hard redirect in production if needed
          if (process.env.NODE_ENV === 'production') {
            window.location.href = '/auth';
            return null;
          }
          return <Redirect to="/auth" />;
        }}
      </Route>
    );
  }
  
  // Render the protected component if authenticated
  return (
    <Route path={path}>
      {(params) => <Component {...params} user={user} />}
    </Route>
  );
}