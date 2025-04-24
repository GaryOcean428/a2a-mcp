import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";

// Page imports
import Home from "@/pages/Home";
import WebSearch from "@/pages/WebSearch";
import FormAutomation from "@/pages/FormAutomation";
import VectorStorage from "@/pages/VectorStorage";
import DataScraping from "@/pages/DataScraping";
import Settings from "@/pages/Settings";
import Documentation from "@/pages/Documentation";
import ClineIntegration from "@/pages/ClineIntegration";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import LoginButton from "@/pages/LoginButton";
import LoginRouter from "@/pages/LoginRouter";

// Components
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/protected-route";

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
              <Route component={NotFound} />
            </Switch>
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
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
