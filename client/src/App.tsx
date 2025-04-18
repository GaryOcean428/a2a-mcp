import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

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

// Components
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />
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
  );
}

function App() {
  // Check URL for bypass auth parameter - this allows testing in production
  // Example: /?bypassAuth=true
  // This only works once and is designed for testing the deployed application
  const searchParams = new URLSearchParams(window.location.search);
  const bypassAuth = searchParams.get('bypassAuth');
  
  if (bypassAuth === 'true') {
    console.log('Auth bypass mode enabled via URL parameter');
    localStorage.setItem('bypassAuth', 'true');
    // Clean URL (remove the query parameter)
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
