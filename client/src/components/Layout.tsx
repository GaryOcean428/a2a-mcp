import React from 'react';
import { SidebarNav } from '@/components/ui/sidebar-nav';
import { StatusBar } from '@/components/ui/status-bar';
import Header from '@/components/Header';
import Footer from '@/components/ui/footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav />
        <main className="flex-1 overflow-y-auto bg-background flex flex-col">
          <div className="flex-1 p-4">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer - Moved outside the main content area */}
      <Footer />
      
      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
