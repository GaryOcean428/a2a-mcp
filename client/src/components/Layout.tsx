import React, { useState, useEffect } from 'react';
import { StatusBar } from '@/components/ui/status-bar';
import Header from '@/components/Header';
import Footer from '@/components/ui/footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [headerLoaded, setHeaderLoaded] = useState(false);

  // This is a hacky way to ensure the header loads even if there are synchronization issues
  useEffect(() => {
    // Check if authentication bypass is enabled 
    const bypassAuth = localStorage.getItem('bypassAuth') === 'true';
    
    // Add a mock user if bypass is enabled but no user exists
    if (bypassAuth && !localStorage.getItem('user')) {
      console.log('Layout: Creating mock user for bypass authentication');
      localStorage.setItem("user", JSON.stringify({
        id: 1,
        username: "testuser",
        role: "admin",
        lastLogin: new Date().toISOString()
      }));
    }
    
    // Mark header as loaded
    setHeaderLoaded(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with integrated navigation */}
      {headerLoaded && <Header />}
      
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
