import { useEffect, useState } from "react";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);
    setIsLoading(false);
  }, []);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Redirect to home page if not authenticated and show a notification
  if (!isAuthenticated) {
    return (
      <Route path={path}>
        {() => {
          // Only show the toast once when redirecting
          useEffect(() => {
            toast({
              title: "Authentication required",
              description: "Please log in to access this feature",
              variant: "destructive"
            });
          }, []);
          
          return <Redirect to="/" />;
        }}
      </Route>
    );
  }

  // Render the protected component if authenticated
  return (
    <Route path={path}>
      {(params) => <Component {...params} />}
    </Route>
  );
}