import React from 'react';
import { StatusBar } from '@/components/ui/status-bar';
import Header from '@/components/Header';
import Footer from '@/components/ui/footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with integrated navigation */}
      <Header />
      
      {/* Main content area */}
      <main className="flex-1 bg-gray-50 pt-6 pb-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
