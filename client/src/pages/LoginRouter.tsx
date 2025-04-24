import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn } from 'lucide-react';
import StandaloneAuthPage from './StandaloneAuthPage';

export default function LoginRouter() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authAttemptCount, setAuthAttemptCount] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // Try different authentication approaches
  useEffect(() => {
    async function attemptAuth() {
      try {
        if (authAttemptCount === 0) {
          // First try: direct redirect to standalone auth page
          console.log('LoginRouter: Redirecting to standalone auth page');
          setIsRedirecting(true);
          window.location.href = '/standalone-auth.html';
          return;
        } else if (authAttemptCount === 1) {
          // Second try: wouter navigation within SPA
          console.log('LoginRouter: Navigating to /auth with wouter');
          navigate('/auth');
          return;
        }
        // Additional attempts can be added here if needed
      } catch (error) {
        console.error('LoginRouter error:', error);
        setAuthError('Navigation failed. Please try manual login options below.');
      } finally {
        setIsRedirecting(false);
      }
    }

    const timer = setTimeout(() => {
      attemptAuth();
    }, 1000);

    return () => clearTimeout(timer);
  }, [authAttemptCount, navigate]);

  // Try the next authentication approach if the current one fails
  useEffect(() => {
    if (authError) {
      setAuthAttemptCount(prev => prev + 1);
      setAuthError(null);
    }
  }, [authError]);

  // If we've tried automatic approaches and they failed, show the standalone auth page
  if (authAttemptCount >= 2) {
    return <StandaloneAuthPage />;
  }

  // Show loading screen while attempting redirects
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Authentication</h1>
        
        {isRedirecting ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p>Select login method:</p>
            
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/standalone-auth.html'}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Open Login Page
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/auth')}
              >
                Use Authentication Portal
              </Button>
              
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => window.location.href = '/login'}
              >
                Simple Login
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 mt-4">
              <p>Having trouble? Try going directly to <a href="/auth" className="text-purple-600 underline">the login page</a>.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}