import React, { useEffect } from "react";
import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuthHook";
import { NavigationProvider } from "@/hooks/use-navigation";
import { StylesProtectedRoot } from "@/components/ui/StylesProtectedRoot";
import { ThemeProvider } from "./components/ThemeProvider";
import { mcpWebSocketClient } from "./utils/mcp-websocket-client";
import { WebSocketProvider } from "./components/WebSocketProvider";
import { initWebSocketFixes } from "./utils/websocket-fix";
import ErrorBoundary from "@/components/error-boundary";

// Import CSS utilities - order matters for proper CSS recovery
import "./utils/css-injector";
import "./utils/css-recovery-manager";
import "./utils/css-verifier"; // Add CSS verification
import "./utils/css-recovery-enhanced"; // Enhanced CSS recovery system
import "./utils/improved-css-recovery"; // Improved CSS recovery system
import "./utils/css-direct-fix"; // Direct CSS fixes applied to DOM

// Import global styles
import "./styles/global.css";
import "./styles/fix-critical.css"; // Additional critical CSS fixes

// Import LazyLoad utility for code splitting
import { createLazyComponent, LoadingSpinner } from "./components/LazyLoad";

// Lazy load all pages for better performance
const Home = createLazyComponent(() => import("@/pages/Home"));
const WebSearch = createLazyComponent(() => import("@/pages/WebSearch"));
const FormAutomation = createLazyComponent(() => import("@/pages/FormAutomation"));
const VectorStorage = createLazyComponent(() => import("@/pages/VectorStorage"));
const DataScraping = createLazyComponent(() => import("@/pages/DataScraping"));
const Settings = createLazyComponent(() => import("@/pages/Settings"));
const Documentation = createLazyComponent(() => import("@/pages/Documentation"));
const ClineIntegration = createLazyComponent(() => import("@/pages/ClineIntegration"));
const AuthPage = createLazyComponent(() => import("@/pages/auth-page"));
const NotFound = createLazyComponent(() => import("@/pages/not-found"));
const LoginButton = createLazyComponent(() => import("@/pages/LoginButton"));
const LoginRouter = createLazyComponent(() => import("@/pages/LoginRouter"));
const WebSocketTest = createLazyComponent(() => import("@/pages/WebSocketTest"));

// Components
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/protected-route";
import ToolSidebar from "@/components/ToolSidebar";
import LoginPrompt from "@/components/LoginPrompt";
import StyleFixer from "@/components/StyleFixer"; // Import the StyleFixer component

function Router() {
  // Production authentication fix - this ensures authentication state is preserved
  const AUTH_PRODUCTION_FIX = process.env.NODE_ENV === 'production' || import.meta.env.PROD;
  
  // Split routes: AuthPage doesn't use the main layout, everything else does
  return (
    <Switch>
      {/* Authentication Routes - These need to be defined first and consistently available */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={LoginButton} />
      <Route path="/login-router" component={LoginRouter} />
      
      {/* All other routes use the main layout */}
      <Route>
        {() => (
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <ProtectedRoute path="/web-search" component={WebSearch} />
              <ProtectedRoute path="/form-automation" component={FormAutomation} />
              <ProtectedRoute path="/vector-storage" component={VectorStorage} />
              <ProtectedRoute path="/data-scraping" component={DataScraping} />
              <ProtectedRoute path="/settings" component={Settings} />
              <Route path="/documentation" component={Documentation} />
              <Route path="/docs" component={Documentation} />
              <Route path="/cline-integration" component={ClineIntegration} />
              <Route path="/websocket-test" component={WebSocketTest} />
              <Route component={NotFound} />
            </Switch>
            <ToolSidebar />
            <LoginPrompt />
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  // Environment check for production-specific behavior
  const PRODUCTION_ENV_CHECK = process.env.NODE_ENV === 'production' || import.meta.env.PROD;
  
  // We've implemented proper session-based authentication with PostgreSQL
  // The AuthProvider handles authentication state and operations
  // Protected routes automatically redirect to the auth page if the user is not authenticated
  
  useEffect(() => {
    // Set a global flag for production environment
    if (PRODUCTION_ENV_CHECK) {
      document.documentElement.dataset.productionEnv = 'true';
      console.log('Running in production mode - applying production optimizations');
    }
    
    // Initialize WebSocket fixes to handle connection issues
    if (initWebSocketFixes()) {
      console.log('Applied WebSocket connection fixes');
    }
  }, []);
  
  return (
    <StylesProtectedRoot
      fallback={
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem' }}>Loading MCP Integration Platform...</p>
        </div>
      }
    >
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NavigationProvider>
              <WebSocketProvider autoConnect={true}>
                <ErrorBoundary>
                  <Router />
                </ErrorBoundary>
                <StyleFixer />
                <Toaster />
              </WebSocketProvider>
            </NavigationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StylesProtectedRoot>
  );
}

export default App;
