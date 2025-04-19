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
      // Check if user is authenticated
      // For consistency between development and production, check for a user first
      const user = localStorage.getItem("user");
      
      // If we have a user, or if we're in development mode, or if BYPASS_AUTH is enabled via a flag
      // This makes authentication behavior consistent across environments
      const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
      const bypassAuthFlag = localStorage.getItem("bypassAuth") === 'true';
      
      // Check URL for bypass parameter (works anywhere in the app)
      const urlParams = new URLSearchParams(window.location.search);
      const bypassParam = urlParams.get('bypassAuth');
      
      // If bypass is in URL but not in localStorage yet, set it
      if (bypassParam === 'true' && !bypassAuthFlag) {
        console.log('ProtectedRoute: Auth bypass enabled via URL parameter');
        localStorage.setItem('bypassAuth', 'true');
        
        // Remove the parameter from URL
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
        
        // Force reload to apply changes
        window.location.reload();
        return;
      }
      
      if (user || isDevelopment || bypassAuthFlag) {
        if (isDevelopment || bypassAuthFlag) {
          console.log('Authentication bypassed (development mode or bypass flag enabled)');
          
          // Create a mock user if one doesn't exist
          if (!user) {
            localStorage.setItem("user", JSON.stringify({
              id: 1,
              username: bypassAuthFlag ? "testuser" : "devuser",
              role: "admin",
              lastLogin: new Date().toISOString()
            }));
          }
        }
        
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
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
          // Redirect to auth page instead of home page
          return <Redirect to="/auth" />;
        }
        
        return <Component />;
      }}
    </Route>
  );
}