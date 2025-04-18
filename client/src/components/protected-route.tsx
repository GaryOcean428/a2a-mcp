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

  // Use a single effect to check authentication and handle any side effects
  useEffect(() => {
    // Only handle the authentication check once
    if (isLoading) {
      // Check if user is authenticated - for development, always authenticate
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        console.log('Development mode: Bypassing authentication');
        setIsAuthenticated(true);
      } else {
        const user = localStorage.getItem("user");
        setIsAuthenticated(!!user);
      }
      setIsLoading(false);
    } 
    
    // Show toast if authentication failed and loading is complete
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this feature",
        variant: "destructive"
      });
    }
  }, [isLoading, isAuthenticated, toast]);

  // The render logic uses a single return statement with conditional content
  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        if (!isAuthenticated) {
          return <Redirect to="/" />;
        }
        
        return <Component />;
      }}
    </Route>
  );
}