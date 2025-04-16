import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Database, Code, ArrowRight, Activity } from 'lucide-react';
import { mcpClient } from '@/lib/mcp-client';
import { SystemStatus } from '@shared/schema';

export default function Home() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: "Form Automation",
      description: "Fill and submit web forms programmatically with validation",
      icon: <FileText className="h-5 w-5" />,
      href: "/form-automation",
      color: "bg-green-50 text-green-700"
    },
    {
      title: "Vector Storage",
      description: "Connect to embeddings databases for semantic search and retrieval",
      icon: <Database className="h-5 w-5" />,
      href: "/vector-storage",
      color: "bg-purple-50 text-purple-700"
    },
    {
      title: "Data Scraping",
      description: "Extract structured data from websites with configurable policies",
      icon: <Code className="h-5 w-5" />,
      href: "/data-scraping",
      color: "bg-amber-50 text-amber-700"
    }
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to MCP Integration Platform</h1>
          <p className="text-gray-500 mt-1">
            A secure, high-performance Model Context Protocol (MCP) integration platform for AI-powered applications
          </p>
        </div>
        <Button asChild>
          <Link href="/documentation">
            <span className="flex items-center">View Documentation <ArrowRight className="ml-2 h-4 w-4" /></span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Platform Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Platform Status
            </CardTitle>
            <CardDescription>
              Current system status and active tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : status ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Version</p>
                    <p className="font-medium">{status.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transport</p>
                    <p className="font-medium">{status.transport}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Uptime</p>
                    <p className="font-medium">
                      {Math.floor(status.uptime / 60)} minutes, {status.uptime % 60} seconds
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Tools</p>
                    <p className="font-medium">{status.activeTools?.length || 0}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Tool Status</p>
                  <div className="space-y-2">
                    {status.activeTools?.map(tool => (
                      <div key={tool.name} className="flex items-center justify-between text-sm border-b border-gray-100 pb-1">
                        <span className="font-medium capitalize">{tool.name.replace(/_/g, ' ')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${tool.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tool.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Unable to fetch system status
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Start Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>
              Get started with the MCP Integration Platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="http">
              <TabsList className="mb-4">
                <TabsTrigger value="http">HTTP</TabsTrigger>
                <TabsTrigger value="stdio">STDIO</TabsTrigger>
                <TabsTrigger value="sse">SSE</TabsTrigger>
              </TabsList>
              
              <TabsContent value="http" className="mt-0">
                <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-x-auto">
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
                <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-x-auto">
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
                <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-x-auto">
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
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/documentation">
                View Full Documentation
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tool Cards */}
      <h2 className="text-xl font-semibold mb-4">Available Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {toolCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center mb-2`}>
                  {card.icon}
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">{card.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto">
                  Configure <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
