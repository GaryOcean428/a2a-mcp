import { Switch, Route, useLocation } from "wouter";
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
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

// Components
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  const [location] = useLocation();

  // Don't show layout on auth page
  if (location === "/auth") {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
      </Switch>
    );
  }

  // Show layout for all other pages
  return (
    <Layout>
      <Switch>
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/web-search" component={WebSearch} />
        <ProtectedRoute path="/form-automation" component={FormAutomation} />
        <ProtectedRoute path="/vector-storage" component={VectorStorage} />
        <ProtectedRoute path="/data-scraping" component={DataScraping} />
        <ProtectedRoute path="/settings" component={Settings} />
        <Route path="/documentation" component={Documentation} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
