import React, { useState, useEffect } from 'react';
import { StatusBar } from '@/components/ui/status-bar';
import Header from '@/components/Header';
import Footer from '@/components/ui/footer';
import ToolSidebar from '@/components/ToolSidebar';
import { useLocation } from 'wouter';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useNavigation } from '@/hooks/use-navigation';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar }: LayoutProps) {
  const [location] = useLocation();
  const { activeRoute } = useNavigation();
  const [shouldShowSidebar, setShouldShowSidebar] = useState(false);
  
  // Determine if we should show the sidebar based on the current route
  useEffect(() => {
    if (showSidebar !== undefined) {
      setShouldShowSidebar(showSidebar);
    } else {
      // Show sidebar on tool pages but not on the home page or documentation
      const isToolPage = location !== '/' && 
                         location !== '/documentation' && 
                         location !== '/auth' &&
                         !location.includes('/login');
      setShouldShowSidebar(isToolPage);
    }
  }, [location, showSidebar]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with integrated navigation */}
      <Header />
      
      {/* Main content area with optional sidebar */}
      <main className="flex-1 bg-gray-50">
        <div className="flex relative">
          {/* Conditional Tool Sidebar */}
          {shouldShowSidebar && (
            <div className="tool-sidebar">
              <ToolSidebar />
            </div>
          )}
          
          {/* Page Content */}
          <div className={`flex-1 pt-6 pb-8 px-6 ${shouldShowSidebar ? 'mcp-content-wrapper' : 'w-full'}`}>
            {/* Breadcrumb Navigation (only shown on pages with activeRoute) */}
            {activeRoute && <Breadcrumb />}
            
            {/* Page Content */}
            <div className="mt-4">
              {children}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
