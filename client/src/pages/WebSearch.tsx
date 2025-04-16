import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebSearchConfig } from '@/components/tools/web-search-config';
import { ToolSchema } from '@/components/ui/tool-schema';
import { TestConsole } from '@/components/ui/test-console';
import { WebSearchParams } from '@shared/schema';
import { mcpClient } from '@/lib/mcp-client';
import { useToast } from '@/hooks/use-toast';

export default function WebSearch() {
  const [config, setConfig] = useState<Partial<WebSearchParams>>({
    provider: 'openai',
    resultCount: 5,
    openaiOptions: {
      searchContextSize: 'medium'
    }
  });
  const [schema, setSchema] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('configuration');
  const { toast } = useToast();

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const toolSchema = await mcpClient.getToolSchema('web_search');
      setSchema(toolSchema);
    } catch (error) {
      console.error('Failed to fetch schema:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tool schema',
        variant: 'destructive'
      });
    }
  };

  const handleSaveConfig = () => {
    // In a real app, this would save the configuration to the backend
    toast({
      title: 'Configuration Saved',
      description: 'Web search configuration has been saved successfully.'
    });
  };

  const handleTestTool = () => {
    setActiveTab('test-console');
  };

  return (
    <div className="container mx-auto px-6 py-6">
      {/* Tool Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Web Search</h2>
          <p className="text-gray-500">Search the web using multiple provider options</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleTestTool}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Tool
          </Button>
          <Button onClick={handleSaveConfig}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Card className="mb-6 overflow-hidden shadow-sm">
        <div className="border-b border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b-0">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="test-console">Test Console</TabsTrigger>
              <TabsTrigger value="api-reference">API Reference</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <TabsContent value="configuration" className="p-6 m-0">
          <WebSearchConfig config={config} onChange={setConfig} />
          {schema && (
            <div className="mt-6">
              <ToolSchema schema={schema} onRefresh={fetchSchema} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="test-console" className="m-0">
          <TestConsole 
            toolName="web_search" 
            defaultParams={{
              query: "What are the latest developments in MCP protocol for AI?",
              provider: config.provider,
              resultCount: config.resultCount
            }}
            inputSchema={schema?.inputSchema}
          />
        </TabsContent>

        <TabsContent value="api-reference" className="p-6 m-0">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">API Reference</h3>
            <p className="text-gray-500">Details on how to integrate with the Web Search tool via MCP protocol.</p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Endpoint</h4>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">POST /api/mcp</p>
              
              <h4 className="font-medium mt-4 mb-2">Authentication</h4>
              <p className="text-sm">Requires API key in <code>X-API-Key</code> header.</p>
              
              <h4 className="font-medium mt-4 mb-2">Request Format</h4>
              <pre className="font-mono text-sm bg-gray-100 p-2 rounded overflow-auto">
{`{
  "id": "request-123",
  "name": "web_search",
  "parameters": {
    "query": "Search query text",
    "provider": "openai",
    "resultCount": 5,
    "openaiOptions": {
      "searchContextSize": "medium"
    }
  }
}`}
              </pre>
              
              <h4 className="font-medium mt-4 mb-2">Response Format</h4>
              <pre className="font-mono text-sm bg-gray-100 p-2 rounded overflow-auto">
{`{
  "id": "request-123",
  "results": {
    "results": [
      {
        "title": "Result title",
        "url": "https://example.com",
        "snippet": "Result snippet text..."
      }
    ],
    "metadata": {
      "provider": "openai",
      "processingTime": 850,
      "timestamp": "2023-06-15T12:30:45.123Z"
    }
  }
}`}
              </pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="p-6 m-0">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Request Logs</h3>
            <p className="text-gray-500">Recent Web Search tool requests and responses.</p>
            
            <div className="bg-gray-50 p-4 rounded-md text-center py-8">
              <p className="text-gray-400">No recent logs available</p>
            </div>
          </div>
        </TabsContent>
      </Card>
    </div>
  );
}
