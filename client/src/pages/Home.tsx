import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Database, Code, ArrowRight, Activity, Sparkles, Layers, Zap, LogIn } from 'lucide-react';
import { mcpClient } from '@/lib/mcp-client';
import { SystemStatus } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Check for auth bypass on home page load
  useEffect(() => {
    const bypassAuth = localStorage.getItem('bypassAuth') === 'true';
    const user = localStorage.getItem('user');
    
    // If we don't have a user and we're not in development mode
    if (!user && !bypassAuth) {
      // Check URL for bypass parameter
      const urlParams = new URLSearchParams(window.location.search);
      const bypassParam = urlParams.get('bypassAuth');
      
      if (bypassParam === 'true') {
        console.log('Home: Auth bypass enabled via URL parameter');
        localStorage.setItem('bypassAuth', 'true');
        
        // Create a mock user
        localStorage.setItem("user", JSON.stringify({
          id: 1,
          username: "testuser",
          role: "admin",
          lastLogin: new Date().toISOString()
        }));
        
        // Reload the page to apply the auth changes
        window.location.reload();
        
        toast({
          title: "Authentication Bypassed",
          description: "You are now using a testing account"
        });
      }
    }
  }, []);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const systemStatus = await mcpClient.getStatus();
        setStatus(systemStatus);
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();
  }, []);

  const toolCards = [
    {
      title: "Web Search",
      description: "Search the web with multiple provider options including OpenAI, Tavily, and Perplexity",
      icon: <Search className="h-5 w-5" />,
      href: "/web-search",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Form Automation",
      description: "Fill and submit web forms programmatically with validation",
      icon: <FileText className="h-5 w-5" />,
      href: "/form-automation",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Vector Storage",
      description: "Connect to embeddings databases for semantic search and retrieval",
      icon: <Database className="h-5 w-5" />,
      href: "/vector-storage",
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Data Scraping",
      description: "Extract structured data from websites with configurable policies",
      icon: <Code className="h-5 w-5" />,
      href: "/data-scraping",
      color: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white py-12 mb-12 rounded-lg shadow-sm">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                MCP Integration Platform
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              A secure, high-performance Model Context Protocol (MCP) integration platform that provides standardized interfaces for AI-powered applications to leverage web search, form automation, vector storage, and data scraping.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <Link href="/settings">
                  <span className="flex items-center">Get Started <ArrowRight className="ml-2 h-5 w-5" /></span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                <Link href="/documentation">
                  <span className="flex items-center">Documentation <FileText className="ml-2 h-5 w-5" /></span>
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="bg-gray-100 hover:bg-gray-200">
                <Link href="/auth">
                  <span className="flex items-center">Sign In <LogIn className="ml-2 h-5 w-5" /></span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-6 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text inline-block mb-4">
            Key Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our MCP Integration Platform provides multiple tools to enhance your AI applications with powerful capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Standardized Protocols</h3>
            <p className="text-gray-600">Implement a consistent interface for AI interactions with external tools through the MCP protocol.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Providers</h3>
            <p className="text-gray-600">Configure each tool to use your preferred provider with customizable options for optimal results.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Seamless Integration</h3>
            <p className="text-gray-600">Easily integrate with Cline's VS Code extension or make direct API calls from any application.</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Platform Status Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center text-xl">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                Platform Status
              </CardTitle>
              <CardDescription>
                Current system status and active tools
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-5 bg-gray-200 rounded w-4/5"></div>
                </div>
              ) : status ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 mb-1">Version</p>
                      <p className="font-semibold text-lg">{status.version}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-indigo-800 mb-1">Transport</p>
                      <p className="font-semibold text-lg">{status.transport}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Uptime</p>
                      <p className="font-semibold text-lg">
                        {Math.floor(status.uptime / 60)} mins, {status.uptime % 60} secs
                      </p>
                    </div>
                    <div className="bg-violet-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-violet-800 mb-1">Active Tools</p>
                      <p className="font-semibold text-lg">{status.activeTools?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">Tool Status</p>
                    <div className="space-y-3">
                      {status.activeTools?.map(tool => (
                        <div key={tool.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <span className="font-medium capitalize flex items-center text-gray-800">
                            <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>
                            {tool.name.replace(/_/g, ' ')}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            tool.available 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {tool.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <Activity className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  <p>Unable to fetch system status</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Start Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-xl">Quick Start Guide</CardTitle>
              <CardDescription>
                Get started with the MCP Integration Platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="http">
                <TabsList className="mb-4 grid grid-cols-3 w-full">
                  <TabsTrigger value="http">HTTP</TabsTrigger>
                  <TabsTrigger value="stdio">STDIO</TabsTrigger>
                  <TabsTrigger value="sse">SSE</TabsTrigger>
                </TabsList>
                
                <TabsContent value="http" className="mt-0">
                  <div className="bg-gray-900 p-4 rounded-md font-mono text-sm overflow-x-auto text-gray-300">
                    <pre>{`// Make an HTTP request to the MCP endpoint
fetch('/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    id: 'request-123',
    name: 'web_search',
    parameters: {
      query: 'How does MCP protocol work?',
      provider: 'openai'
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));`}</pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="stdio" className="mt-0">
                  <div className="bg-gray-900 p-4 rounded-md font-mono text-sm overflow-x-auto text-gray-300">
                    <pre>{`// Send a request via STDIO
const request = {
  id: 'request-123',
  name: 'web_search',
  parameters: {
    query: 'How does MCP protocol work?',
    provider: 'openai'
  }
};

// Write to stdin
process.stdout.write(JSON.stringify(request) + '\\n');

// Handle response from stdout
process.stdin.on('data', (chunk) => {
  const response = JSON.parse(chunk.toString());
  console.log(response);
});`}</pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="sse" className="mt-0">
                  <div className="bg-gray-900 p-4 rounded-md font-mono text-sm overflow-x-auto text-gray-300">
                    <pre>{`// Connect via WebSocket
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onopen = () => {
  // Send a request
  ws.send(JSON.stringify({
    type: 'mcp_request',
    request: {
      id: 'request-123',
      name: 'web_search',
      parameters: {
        query: 'How does MCP protocol work?',
        provider: 'openai'
      }
    }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.event === 'response') {
    console.log(data.data);
  }
};`}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" asChild className="w-full bg-gray-50 hover:bg-gray-100">
                <Link href="/documentation">
                  <span className="flex items-center justify-center">
                    View Full Documentation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Tool Cards */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              Available Tools
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-100 to-transparent ml-4"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolCards.map((card, index) => (
              <Link key={index} href={card.href}>
                <Card className="h-full hover:shadow-md transition-all cursor-pointer overflow-hidden border-gray-200 hover:border-purple-200">
                  <div className={`h-2 w-full bg-gradient-to-r ${card.color}`}></div>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-3`}>
                      <div className="text-white">
                        {card.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="ghost" size="sm" className="ml-auto text-gray-600 hover:text-purple-700 hover:bg-purple-50">
                      Configure <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 rounded-xl mb-12 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-2xl font-bold mb-2">Ready to integrate with your AI models?</h3>
              <p className="text-purple-100 max-w-lg">
                Get started with MCP Integration Platform today and enhance your AI applications with powerful web search, form automation, vector storage, and data scraping capabilities.
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-purple-700 hover:bg-gray-100 border-none">
                <Link href="/cline-integration">
                  <span className="flex items-center">Cline Integration <ArrowRight className="ml-2 h-4 w-4" /></span>
                </Link>
              </Button>
              <Button size="lg" className="bg-purple-800 hover:bg-purple-900 text-white">
                <Link href="/settings">
                  <span className="flex items-center">API Settings <ArrowRight className="ml-2 h-4 w-4" /></span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
