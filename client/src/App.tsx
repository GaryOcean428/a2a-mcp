import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuthHook";
import { NavigationProvider } from "@/hooks/use-navigation";
import { StylesProtectedRoot } from "@/components/ui/StylesProtectedRoot";
import { ThemeProvider } from "./components/ThemeProvider";
import ErrorBoundary from "@/components/error-boundary";

// Import our new unified WebSocket system
import { WebSocketUtils } from "./lib/websocket-system";

// Initialize CSS recovery system
import { initializeCssSystem } from "./utils/css-system";

// Import global styles
import "./styles/global.css";
import "./styles/fix-critical.css"; // Additional critical CSS fixes

// Import LazyLoad utility for code splitting
import { createLazyComponent } from "./components/LazyLoad";

// Lazy load all pages for better performance
const Home = createLazyComponent(() => import("@/pages/Home-fixed"));
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
import StyleFixer from "@/components/StyleFixerNew"; // Import the new StyleFixer component
import WebSocketReconnectManager from "@/components/WebSocketReconnectManagerNew"; // Import new WebSocket reconnect manager
import WebSocketProviderNew from "@/components/WebSocketProviderNew"; // Import new WebSocket provider

function Router() {
  
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
  
  // We've implemented proper session-based authentication with PostgreSQL
  // The AuthProvider handles authentication state and operations
  // Protected routes automatically redirect to the auth page if the user is not authenticated
  
  useEffect(() => {
    // Initialize WebSocket fixes to handle connection issues
    WebSocketUtils.applyConnectionFixes();
    console.log('Applied WebSocket connection fixes');
    
    // Initialize CSS recovery system
    initializeCssSystem();
    console.log('Initialized unified CSS recovery system');
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
              <WebSocketProviderNew autoConnect={true}>
                <ErrorBoundary>
                  <Router />
                </ErrorBoundary>
                <StyleFixer />
                <WebSocketReconnectManager />
                <Toaster />
              </WebSocketProviderNew>
            </NavigationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StylesProtectedRoot>
  );
}

export default App;
