import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogIn, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthHook';

export default function LoginPrompt() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // If user is logged in, don't show the prompt
  if (isAuthenticated && user) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 my-4 flex items-center justify-between">
        <div className="flex items-center">
          <User className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h3 className="font-medium">Welcome, {user.username}!</h3>
            <p className="text-sm text-green-700">You are successfully logged in.</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/settings">Go to Settings</Link>
        </Button>
      </div>
    );
  }

  // If not authenticated, show prominent login options
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 my-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-purple-800">Sign in to access all features</h3>
          <p className="text-sm text-purple-700">Create an account or sign in to access protected features</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" asChild>
            <a href="/auth">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </a>
          </Button>
          <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50" asChild>
            <a href="/auth?tab=register">Register</a>
          </Button>
        </div>
      </div>

      {/* Direct links that work without JavaScript as a fallback */}
      <div className="text-center mt-3 text-xs text-purple-600">
        <span>Problems logging in? Try these direct links: </span>
        <a 
          href="/auth" 
          className="underline hover:text-purple-800 mx-1"
          target="_self"
        >
          Login Page
        </a>
        <span>|</span>
        <a 
          href="/login" 
          className="underline hover:text-purple-800 mx-1"
          target="_self"
        >
          Simplified Login
        </a>
      </div>
    </div>
  );
}
