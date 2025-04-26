import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface ToolRoute {
  id: string;
  path: string;
  name: string;
  description?: string;
  category: 'tool' | 'settings' | 'docs' | 'auth';
}

// Define all application routes with metadata
const routes: ToolRoute[] = [
  {
    id: 'web-search',
    path: '/web-search',
    name: 'Web Search',
    description: 'Search the web for information with multiple provider options',
    category: 'tool'
  },
  {
    id: 'form-automation',
    path: '/form-automation',
    name: 'Form Automation',
    description: 'Fill and submit web forms with validation',
    category: 'tool'
  },
  {
    id: 'vector-storage',
    path: '/vector-storage',
    name: 'Vector Storage',
    description: 'Connect to vector databases for semantic search and retrieval',
    category: 'tool'
  },
  {
    id: 'data-scraping',
    path: '/data-scraping',
    name: 'Data Scraping',
    description: 'Extract structured data from websites with configurable policies',
    category: 'tool'
  },
  {
    id: 'settings',
    path: '/settings',
    name: 'Settings',
    description: 'Configure platform settings and API keys',
    category: 'settings'
  },
  {
    id: 'documentation',
    path: '/documentation',
    name: 'Documentation',
    description: 'Platform documentation and guides',
    category: 'docs'
  },
  {
    id: 'auth',
    path: '/auth',
    name: 'Authentication',
    description: 'Sign in or register for an account',
    category: 'auth'
  }
];

// Define the context type
interface NavigationContextType {
  activeRoute: ToolRoute | null;
  routeList: ToolRoute[];
  getRouteById: (id: string) => ToolRoute | undefined;
  getRouteByPath: (path: string) => ToolRoute | undefined;
  navigateToTool: (id: string) => void;
  getToolRoutes: () => ToolRoute[];
  getPreviousRoute: () => ToolRoute | null;
}

// Create the context
const NavigationContext = createContext<NavigationContextType | null>(null);

// Provider component
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [activeRoute, setActiveRoute] = useState<ToolRoute | null>(null);
  const [previousRoute, setPreviousRoute] = useState<ToolRoute | null>(null);

  // Update the active route when the location changes
  useEffect(() => {
    const currentRoute = getRouteByPath(location);
    
    if (currentRoute && activeRoute?.id !== currentRoute.id) {
      setPreviousRoute(activeRoute);
      setActiveRoute(currentRoute);
    } else if (!currentRoute && location === '/') {
      setActiveRoute(null);
    }
  }, [location]);

  // Utility functions for working with routes
  const getRouteById = (id: string): ToolRoute | undefined => {
    return routes.find(route => route.id === id);
  };

  const getRouteByPath = (path: string): ToolRoute | undefined => {
    return routes.find(route => route.path === path);
  };

  const navigateToTool = (id: string) => {
    const route = getRouteById(id);
    if (route) {
      setLocation(route.path);
    }
  };

  const getToolRoutes = (): ToolRoute[] => {
    return routes.filter(route => route.category === 'tool');
  };

  const getPreviousRoute = (): ToolRoute | null => {
    return previousRoute;
  };

  // Context value
  const value = {
    activeRoute,
    routeList: routes,
    getRouteById,
    getRouteByPath,
    navigateToTool,
    getToolRoutes,
    getPreviousRoute
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// Custom hook for using the navigation context
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}