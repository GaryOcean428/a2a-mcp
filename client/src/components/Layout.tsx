import React from 'react';
import { SidebarNav } from '@/components/ui/sidebar-nav';
import { StatusBar } from '@/components/ui/status-bar';
import Header from '@/components/Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
      
      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
