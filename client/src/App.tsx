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
import NotFound from "@/pages/not-found";

// Components
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
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
