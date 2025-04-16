import React from 'react';
import { Link } from 'wouter';
import { PlusCircle, Code, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-primary" />
          <Link href="/">
            <a className="text-xl font-semibold">MCP Integration Platform</a>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Connection
          </Button>
          <div className="relative">
            <button className="rounded-full bg-gray-200 p-1">
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
