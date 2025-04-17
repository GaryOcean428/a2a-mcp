import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataScrapingConfig } from '@/components/tools/data-scraping-config';
import { ToolSchema } from '@/components/ui/tool-schema';
import { TestConsole } from '@/components/ui/test-console';
import { DataScraperParams } from '@shared/schema';
import { mcpClient } from '@/lib/mcp-client';
import { useToast } from '@/hooks/use-toast';

export default function DataScraping() {
  const [config, setConfig] = useState<Partial<DataScraperParams>>({
    url: '',
    format: 'json',
    javascript: true,
    timeout: 10000,
    pagination: {
      enabled: false,
      maxPages: 1
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
      const toolSchema = await mcpClient.getToolSchema('data_scraper');
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
      description: 'Data scraping configuration has been saved successfully.'
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
          <h2 className="text-2xl font-semibold">Data Scraping</h2>
          <p className="text-gray-500">Extract structured data from websites with configurable policies</p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200">
            <TabsList className="border-b-0">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="test-console">Test Console</TabsTrigger>
              <TabsTrigger value="api-reference">API Reference</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="configuration" className="p-6 m-0">
          <DataScrapingConfig config={config} onChange={setConfig} />
          {schema && (
            <div className="mt-6">
              <ToolSchema schema={schema} onRefresh={fetchSchema} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="test-console" className="m-0">
          <TestConsole 
            toolName="data_scraper" 
            defaultParams={{
              url: "https://example.com",
              selectors: {
                title: "h1",
                description: "meta[name='description']",
                content: ".main-content",
                links: "a"
              },
              format: "json",
              javascript: true,
              timeout: 10000
            }}
            inputSchema={schema?.inputSchema}
          />
        </TabsContent>

        <TabsContent value="api-reference" className="p-6 m-0">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">API Reference</h3>
            <p className="text-gray-500">Details on how to integrate with the Data Scraping tool via MCP protocol.</p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Endpoint</h4>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">POST /api/mcp</p>
              
              <h4 className="font-medium mt-4 mb-2">Authentication</h4>
              <p className="text-sm">Requires API key in <code>X-API-Key</code> header.</p>
              
              <h4 className="font-medium mt-4 mb-2">Request Format</h4>
              <pre className="font-mono text-sm bg-gray-100 p-2 rounded overflow-auto">
{`{
  "id": "request-123",
  "name": "data_scraper",
  "parameters": {
    "url": "https://example.com",
    "selectors": {
      "title": "h1",
      "description": "meta[name=\\"description\\"]",
      "content": ".main-content"
    },
    "format": "json",
    "javascript": true,
    "timeout": 10000
  }
}`}
              </pre>
              
              <h4 className="font-medium mt-4 mb-2">Response Format</h4>
              <pre className="font-mono text-sm bg-gray-100 p-2 rounded overflow-auto">
{`{
  "id": "request-123",
  "results": {
    "data": [
      {
        "title": "Example Domain",
        "description": "Example page description",
        "content": "Main content of the page..."
      }
    ],
    "format": "json",
    "metadata": {
      "url": "https://example.com",
      "timestamp": "2023-06-15T12:30:45.123Z",
      "processingTime": 1250,
      "pagesScraped": 1
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
            <p className="text-gray-500">Recent Data Scraping tool requests and responses.</p>
            
            <div className="bg-gray-50 p-4 rounded-md text-center py-8">
              <p className="text-gray-400">No recent logs available</p>
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
