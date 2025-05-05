import React, { useState, useEffect } from 'react';
import { StatusBar } from '@/components/ui/status-bar';
import Header from '@/components/Header';
import Footer from '@/components/ui/footer';
import ToolSidebar from '@/components/ToolSidebar';
import { useLocation } from 'wouter';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useNavigation } from '@/hooks/use-navigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  fullWidth?: boolean;
}

export default function Layout({ children, showSidebar, fullWidth = false }: LayoutProps) {
  const [location] = useLocation();
  const { activeRoute } = useNavigation();
  const [shouldShowSidebar, setShouldShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header with integrated navigation */}
      <div className="sticky top-0 z-40 w-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <Header onToggleSidebar={toggleSidebar} sidebarVisible={shouldShowSidebar} />
      </div>
      
      {/* Main content area with optional sidebar */}
      <main className="flex-1 content-container transition-all duration-200">
        <div className="flex relative h-full">
          {/* Conditional Tool Sidebar */}
          {shouldShowSidebar && (
            <div 
              className={cn(
                "sidebar-container transition-all duration-200 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-sm",
                sidebarCollapsed ? "w-20" : "w-64"
              )}
            >
              <ToolSidebar collapsed={sidebarCollapsed} />
            </div>
          )}
          
          {/* Page Content */}
          <div className={cn(
            "main-content flex-1 pt-6 pb-12 transition-all duration-200",
            fullWidth ? "px-4 md:px-6" : "px-4 md:px-8 lg:px-12 max-w-7xl mx-auto"
          )}>
            {/* Breadcrumb Navigation (only shown on pages with activeRoute) */}
            {activeRoute && <Breadcrumb className="mb-6" />}
            
            {/* Content Container with subtle gradient and soft shadow */}
            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-md">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-transparent dark:from-primary-950/10 pointer-events-none opacity-60"></div>
              
              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 bg-grid-gray-100 dark:bg-grid-gray-900 opacity-[0.15] pointer-events-none"></div>
              
              {/* Actual content */}
              <div className="relative p-6 md:p-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer with gradient effect */}
      <div className="relative overflow-hidden border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-50/10 to-transparent dark:from-primary-950/10 pointer-events-none"></div>
        <Footer />
      </div>
      
      {/* Status bar with glassmorphism effect */}
      <div className="sticky bottom-0 z-30 backdrop-blur-md bg-gray-900/80 border-t border-gray-800">
        <StatusBar />
      </div>
    </div>
  );
}
