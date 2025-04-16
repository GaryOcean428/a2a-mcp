import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileText, Terminal, Code, ExternalLink } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Documentation</h2>
          <p className="text-gray-500">Learn how to use the MCP Integration Platform</p>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>MCP Integration Platform Overview</CardTitle>
              <CardDescription>Understanding the Model Context Protocol</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h3>What is MCP?</h3>
              <p>
                The Model Context Protocol (MCP) is a standardized interface for enabling AI models to interact with
                external tools and capabilities. It provides a consistent way for AI applications to access functionality
                beyond their training data, such as web search, form automation, and data scraping.
              </p>
              
              <h3>Key Concepts</h3>
              <ul>
                <li>
                  <strong>Tools:</strong> Discrete capabilities that can be invoked by AI models, such as web search or form filling.
                </li>
                <li>
                  <strong>Transports:</strong> MCP supports multiple communication mechanisms including STDIO and Server-Sent Events (SSE).
                </li>
                <li>
                  <strong>Schemas:</strong> Each tool provides a JSON schema that describes its parameters and capabilities.
                </li>
                <li>
                  <strong>Annotations:</strong> Metadata that helps AI models understand how to use the tools properly.
                </li>
              </ul>
              
              <h3>Architecture</h3>
              <p>
                The MCP Integration Platform serves as a bridge between AI models and external systems. It implements the MCP
                protocol to standardize how these interactions occur, providing security, rate limiting, and consistent interfaces.
              </p>
              
              <div className="not-prose my-4 p-4 bg-gray-50 rounded-md">
                <pre className="text-sm overflow-auto">
{`┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                         CLIENT APPLICATIONS                    │
│                                                                │
└───────────────────────────┬────────────────────────────────────┘
                           │
                           │ MCP Protocol (STDIO/SSE)
                           │
┌───────────────────────────▼────────────────────────────────────┐
│                                                                │
│                      MCP INTEGRATION PLATFORM                  │
│                                                                │
│  ┌─────────────┐   ┌────────────┐   ┌────────────┐   ┌───────┐ │
│  │ Web Search  │   │    Form    │   │   Vector   │   │ Data  │ │
│  │   Module    │   │Automation  │   │  Storage   │   │Scraper│ │
│  └──────┬──────┘   └─────┬──────┘   └─────┬──────┘   └───┬───┘ │
│         │                │                │              │     │
└─────────┼────────────────┼────────────────┼──────────────┼─────┘
          │                │                │              │
          ▼                ▼                ▼              ▼
┌─────────────────┐ ┌────────────┐ ┌─────────────┐ ┌────────────┐
│  Search APIs    │ │ Websites & │ │   Vector    │ │ Websites & │
│ (Google, Bing)  │ │ Web Apps   │ │  Databases  │ │    APIs    │
└─────────────────┘ └────────────┘ └─────────────┘ └────────────┘`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="getting-started" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Set up and integrate with the MCP platform</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h3>Installation</h3>
              <p>
                The MCP Integration Platform can be installed using npm:
              </p>
              
              <div className="not-prose bg-gray-800 text-white p-3 rounded-md font-mono text-sm mb-4">
                <code>npm install mcp-integration-platform</code>
              </div>
              
              <h3>Configuration</h3>
              <p>
                Configure the platform by setting the required environment variables:
              </p>
              
              <div className="not-prose bg-gray-800 text-white p-3 rounded-md font-mono text-sm mb-4">
                <code>
                  OPENAI_API_KEY=your_openai_key<br />
                  TAVILY_API_KEY=your_tavily_key<br />
                  PERPLEXITY_API_KEY=your_perplexity_key<br />
                  ENABLE_STDIO_TRANSPORT=true
                </code>
              </div>
              
              <h3>Your First MCP Integration</h3>
              <p>
                Here's a simple example of using the MCP web search tool with OpenAI:
              </p>
              
              <div className="not-prose bg-gray-800 text-white p-3 rounded-md font-mono text-sm mb-4">
                <pre>{`import { mcpClient } from 'mcp-client';

async function searchExample() {
  const response = await mcpClient.sendRequest({
    name: 'web_search',
    parameters: {
      query: 'What is MCP protocol?',
      provider: 'openai',
      resultCount: 3
    }
  });
  
  console.log(response.results);
}

searchExample();`}</pre>
              </div>
              
              <h3>Integration with OpenAI Agents</h3>
              <p>
                To use MCP tools with OpenAI's Agent framework:
              </p>
              
              <div className="not-prose bg-gray-800 text-white p-3 rounded-md font-mono text-sm mb-4">
                <pre>{`from openai_agents import Agent, MCPServerStdio

async def initialize_agent():
    server_params = {
        "command": "node",
        "args": ["./dist/mcp-server.js"]
    }
    
    async with MCPServerStdio(params=server_params) as mcp_server:
        agent = Agent(
            name="Research Assistant",
            instructions="Use the tools to search for information.",
            model="gpt-4o",
            mcp_servers=[mcp_server]
        )
        
        return agent`}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Tools</CardTitle>
              <CardDescription>Documentation for each MCP tool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Web Search
                </h3>
                <p className="text-gray-500 mb-2">
                  Search the web for information using multiple provider options.
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Providers:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>OpenAI:</strong> Utilizes GPT-4o's built-in web search capabilities</li>
                    <li><strong>Tavily:</strong> Specialized search API with topic filtering</li>
                    <li><strong>Perplexity:</strong> AI-powered search with Sonar models</li>
                  </ul>
                  
                  <h4 className="font-medium mt-4 mb-2">Basic Usage:</h4>
                  <pre className="text-sm bg-gray-100 p-2 rounded">
{`// Search the web
const result = await mcpClient.sendRequest({
  name: 'web_search',
  parameters: {
    query: 'What is the Model Context Protocol?',
    provider: 'openai',
    resultCount: 5
  }
});`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Terminal className="h-5 w-5 mr-2 text-green-600" />
                  Form Automation
                </h3>
                <p className="text-gray-500 mb-2">
                  Fill and submit web forms programmatically with validation.
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Fill in form fields by name or CSS selector</li>
                    <li>Handle checkboxes, radio buttons, and select dropdowns</li>
                    <li>Submit forms and wait for navigation</li>
                    <li>Capture screenshots of results</li>
                  </ul>
                  
                  <h4 className="font-medium mt-4 mb-2">Basic Usage:</h4>
                  <pre className="text-sm bg-gray-100 p-2 rounded">
{`// Automate a login form
const result = await mcpClient.sendRequest({
  name: 'form_automation',
  parameters: {
    url: 'https://example.com/login',
    formData: {
      username: 'user@example.com',
      password: 'password123',
      remember: true
    },
    submitForm: true,
    waitForNavigation: true
  }
});`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Code className="h-5 w-5 mr-2 text-purple-600" />
                  Vector Storage
                </h3>
                <p className="text-gray-500 mb-2">
                  Connect to embeddings databases for semantic search and retrieval.
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Operations:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>search:</strong> Find semantically similar vectors</li>
                    <li><strong>retrieve:</strong> Get specific vectors by ID</li>
                    <li><strong>store:</strong> Save new vector data</li>
                    <li><strong>delete:</strong> Remove vectors by ID</li>
                  </ul>
                  
                  <h4 className="font-medium mt-4 mb-2">Basic Usage:</h4>
                  <pre className="text-sm bg-gray-100 p-2 rounded">
{`// Search for similar content
const result = await mcpClient.sendRequest({
  name: 'vector_storage',
  parameters: {
    operation: 'search',
    collection: 'documents',
    query: 'How does vector search work?',
    limit: 5
  }
});`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2 text-amber-600" />
                  Data Scraping
                </h3>
                <p className="text-gray-500 mb-2">
                  Extract structured data from websites with configurable policies.
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Extract data using CSS selectors</li>
                    <li>Support for pagination to scrape multiple pages</li>
                    <li>JavaScript rendering support for dynamic content</li>
                    <li>Multiple output formats (JSON, CSV, text)</li>
                  </ul>
                  
                  <h4 className="font-medium mt-4 mb-2">Basic Usage:</h4>
                  <pre className="text-sm bg-gray-100 p-2 rounded">
{`// Scrape product information
const result = await mcpClient.sendRequest({
  name: 'data_scraper',
  parameters: {
    url: 'https://example.com/products',
    selectors: {
      title: 'h1.product-title',
      price: '.product-price',
      description: '.product-description'
    },
    format: 'json'
  }
});`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-reference" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>Detailed API documentation</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h3>HTTP API</h3>
              <p>
                All MCP tools can be accessed through a unified HTTP endpoint:
              </p>
              
              <div className="not-prose bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">POST /api/mcp</h4>
                <p className="text-sm mb-3">
                  Send an MCP request to execute a tool operation.
                </p>
                
                <h5 className="font-medium text-sm mb-1">Headers:</h5>
                <pre className="text-sm bg-gray-100 p-2 rounded mb-3">
{`Content-Type: application/json
X-API-Key: your_api_key`}
                </pre>
                
                <h5 className="font-medium text-sm mb-1">Request Body:</h5>
                <pre className="text-sm bg-gray-100 p-2 rounded mb-3">
{`{
  "id": "request-123",       // Unique request identifier
  "name": "tool_name",       // Name of the MCP tool to use
  "parameters": {            // Tool-specific parameters
    // Parameters specific to the tool
  }
}`}
                </pre>
                
                <h5 className="font-medium text-sm mb-1">Response:</h5>
                <pre className="text-sm bg-gray-100 p-2 rounded">
{`{
  "id": "request-123",       // The same ID from the request
  "results": {               // Results of the tool execution
    // Tool-specific response data
  }
}

// Or in case of error:
{
  "id": "request-123",
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}`}
                </pre>
              </div>
              
              <h3 className="mt-6">WebSocket API</h3>
              <p>
                For real-time communication, you can use the WebSocket API:
              </p>
              
              <div className="not-prose bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">WebSocket Connection: ws://your-server/ws</h4>
                
                <h5 className="font-medium text-sm mb-1">Message Format (Client to Server):</h5>
                <pre className="text-sm bg-gray-100 p-2 rounded mb-3">
{`{
  "type": "mcp_request",
  "request": {
    "id": "request-123",
    "name": "tool_name",
    "parameters": {
      // Tool-specific parameters
    }
  }
}`}
                </pre>
                
                <h5 className="font-medium text-sm mb-1">Message Format (Server to Client):</h5>
                <pre className="text-sm bg-gray-100 p-2 rounded">
{`{
  "event": "response",
  "data": {
    "id": "request-123",
    "results": {
      // Tool-specific response data
    }
  }
}

// Or in case of error:
{
  "event": "error",
  "data": {
    "message": "Error description",
    "requestId": "request-123"
  }
}`}
                </pre>
              </div>
              
              <h3 className="mt-6">STDIO Transport</h3>
              <p>
                For local development and desktop applications, STDIO transport is available:
              </p>
              
              <div className="not-prose bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Input Format (Write to stdin):</h4>
                <pre className="text-sm bg-gray-100 p-2 rounded mb-3">
{`{
  "id": "request-123",
  "name": "tool_name",
  "parameters": {
    // Tool-specific parameters
  }
}`}
                </pre>
                
                <h4 className="font-medium mb-2">Output Format (Read from stdout):</h4>
                <pre className="text-sm bg-gray-100 p-2 rounded">
{`{
  "id": "request-123",
  "results": {
    // Tool-specific response data
  }
}

// Or in case of error:
{
  "id": "request-123",
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}`}
                </pre>
              </div>
              
              <div className="not-prose mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md flex">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">API Documentation</h4>
                  <p className="text-sm text-blue-700">
                    For detailed schema information and request/response formats for each tool, visit the specific tool
                    pages in the platform interface.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
