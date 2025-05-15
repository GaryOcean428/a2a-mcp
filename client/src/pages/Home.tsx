import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Database, Code, ArrowRight, Activity, Sparkles, Layers, Zap, LogIn } from 'lucide-react';
import { mcpClient } from '@/lib/mcp-client';
import { SystemStatus } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import LoginPrompt from '@/components/LoginPrompt';
import FeatureCard from '@/components/FeatureCard';

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
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white py-20 mb-12 rounded-xl shadow-lg border border-purple-100/50 relative overflow-hidden">
        {/* Enhanced grid background with animations */}
        <div className="absolute inset-0 bg-grid-gray-100 opacity-50 pointer-events-none"></div>
        
        {/* Animated decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl">
            {/* New badge element */}
            <div className="inline-block mb-4 animate-fade-in-down">
              <span className="px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full border border-indigo-200 shadow-sm">
                New in v2.5
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              <span 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text"
                style={{
                  color: 'transparent',
                  backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}>
                MCP Integration Platform 
              </span>
              <span className="inline-block ml-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xl shadow-sm">v2.5</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              A secure, high-performance Model Context Protocol (MCP) integration platform that provides standardized interfaces for AI-powered applications to leverage web search, form automation, vector storage, and data scraping.
            </p>
            
            {/* Featured labels */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Secure API
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                Multiple Providers
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Vector Database
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                style={{
                  backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #7e22ce, #4338ca)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #9333ea, #4f46e5)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
              >
                <a href="/auth">
                  <span className="flex items-center">Sign In / Register <LogIn className="ml-2 h-5 w-5" /></span>
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm hover:shadow transition-all">
                <Link href="/documentation">
                  <span className="flex items-center">Documentation <FileText className="ml-2 h-5 w-5" /></span>
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="bg-gray-100 hover:bg-gray-200 shadow-sm hover:shadow transition-all">
                <Link href="/settings">
                  <span className="flex items-center">Get Started <ArrowRight className="ml-2 h-5 w-5" /></span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Authentication Prompt */}
      <div className="container mx-auto px-6 mb-6">
        <LoginPrompt />
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-6 mb-16">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text inline-block mb-4"
            style={{
              color: 'transparent',
              backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}>
            Key Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our MCP Integration Platform provides multiple tools to enhance your AI applications with powerful capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-white" />}
            title="Standardized Protocols"
            description="Implement a consistent interface for AI interactions with external tools through the MCP protocol."
            iconClassName="from-purple-500 to-indigo-500"
          />
          
          <FeatureCard
            icon={<Layers className="h-6 w-6 text-white" />}
            title="Multiple Providers"
            description="Configure each tool to use your preferred provider with customizable options for optimal results."
            iconClassName="from-indigo-500 to-blue-500"
          />
          
          <FeatureCard
            icon={<Sparkles className="h-6 w-6 text-white" />}
            title="Seamless Integration"
            description="Easily integrate with Cline's VS Code extension or make direct API calls from any application."
            iconClassName="from-violet-500 to-purple-500"
          />
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Platform Status Card */}
          <Card className="shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-purple-200 overflow-hidden">
            <div 
              className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{
                height: '0.375rem',
                width: '100%',
                backgroundImage: 'linear-gradient(to right, #a855f7, #6366f1)'
              }}
            ></div>
            <CardHeader className="pb-3 border-b">
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
          <Card className="shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-purple-200 overflow-hidden">
            <div 
              className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-blue-500"
              style={{
                height: '0.375rem',
                width: '100%',
                backgroundImage: 'linear-gradient(to right, #6366f1, #3b82f6)'
              }}
            ></div>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-xl">
                <Code className="h-5 w-5 mr-2 text-indigo-600" />
                Quick Start Guide
              </CardTitle>
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
              <Button variant="outline" asChild className="w-full bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 transition-all">
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
            <span 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text"
              style={{
                color: 'transparent',
                backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}>
              Available Tools
            </span>
            <div className="h-1 flex-1 bg-gradient-to-r from-purple-100 to-transparent ml-4 rounded-full"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolCards.map((card, index) => (
              <Link key={index} href={card.href}>
                <Card className="h-full hover:shadow-md transition-all cursor-pointer overflow-hidden border-gray-200 hover:border-purple-200">
                  <div 
                    className={`h-2 w-full bg-gradient-to-r ${card.color}`}
                    style={{
                      height: '0.5rem',
                      width: '100%',
                      backgroundImage: `linear-gradient(to right, ${card.color.includes('blue') ? '#3b82f6, #60a5fa' : 
                        card.color.includes('green') ? '#10b981, #34d399' : 
                        card.color.includes('purple') ? '#8b5cf6, #a855f7' : 
                        card.color.includes('amber') ? '#f59e0b, #f97316' : 
                        '#9333ea, #6366f1'})`
                    }}
                  ></div>
                  <CardHeader>
                    <div 
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-3`}
                      style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.75rem',
                        backgroundImage: `linear-gradient(to right, ${card.color.includes('blue') ? '#3b82f6, #60a5fa' : 
                          card.color.includes('green') ? '#10b981, #34d399' : 
                          card.color.includes('purple') ? '#8b5cf6, #a855f7' : 
                          card.color.includes('amber') ? '#f59e0b, #f97316' : 
                          '#9333ea, #6366f1'})`
                      }}
                    >
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
        <div 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-10 rounded-xl mb-12 shadow-lg relative overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)',
            color: 'white',
            padding: '2.5rem',
            borderRadius: '0.75rem',
            marginBottom: '3rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
            <div className="mb-8 md:mb-0 md:mr-8">
              <h3 className="text-3xl font-bold mb-3">Ready to integrate with your AI models?</h3>
              <p className="text-purple-100 max-w-lg text-lg">
                Get started with MCP Integration Platform today and enhance your AI applications with powerful web search, form automation, vector storage, and data scraping capabilities.
              </p>
              
              <div className="flex items-center mt-4 text-sm text-purple-200">
                <span className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-1.5"></div>
                  Easy Setup
                </span>
                <span className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-1.5"></div>
                  Secure API
                </span>
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-1.5"></div>
                  Comprehensive Docs
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-purple-700 hover:bg-gray-100 border-none shadow-md hover:shadow-lg transition-all">
                <Link href="/cline-integration">
                  <span className="flex items-center">Cline Integration <ArrowRight className="ml-2 h-4 w-4" /></span>
                </Link>
              </Button>
              <Button size="lg" className="bg-purple-800 hover:bg-purple-900 text-white shadow-md hover:shadow-lg transition-all border border-purple-500/30">
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
