import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function LoginButton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">MCP Integration Platform</h1>
        <p className="text-lg text-gray-700">Please log in to continue</p>
        <Link href="/auth">
          <Button size="lg" className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Go to Login Page
          </Button>
        </Link>
      </div>
    </div>
  );
}