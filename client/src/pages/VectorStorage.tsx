import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, HelpCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VectorStorageConfig } from '@/components/tools/vector-storage-config';
import { ToolSchema } from '@/components/ui/tool-schema';
import { TestConsole } from '@/components/ui/test-console';
import { VectorStorageParams } from '@shared/schema';
import { mcpClient } from '@/lib/mcp-client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function VectorStorage() {
  const [config, setConfig] = useState<Partial<VectorStorageParams>>({
    operation: 'search',
    collection: 'default',
    limit: 10
  });
  const [schema, setSchema] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('configuration');
  const [toolStatus, setToolStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchema();
    fetchToolStatus();
  }, []);

  const fetchSchema = async () => {
    try {
      const toolSchema = await mcpClient.getToolSchema('vector_storage');
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
  
  const fetchToolStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/status/vector_storage');
      if (response.ok) {
        const statusData = await response.json();
        setToolStatus(statusData[0]);
      } else {
        throw new Error('Failed to fetch tool status');
      }
    } catch (error) {
      console.error('Failed to fetch tool status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = () => {
    // In a real app, this would save the configuration to the backend
    toast({
      title: 'Configuration Saved',
      description: 'Vector storage configuration has been saved successfully.'
    });
  };

  const handleTestTool = () => {
    setActiveTab('test-console');
  };

  const getDefaultParams = () => {
    switch (config.operation) {
      case 'search':
        return {
          operation: 'search',
          collection: config.collection || 'default',
          query: 'semantic search query',
          limit: config.limit || 10
        };
      case 'retrieve':
        return {
          operation: 'retrieve',
          collection: config.collection || 'default',
          ids: ['doc-123', 'doc-456']
        };
      case 'store':
        return {
          operation: 'store',
          collection: config.collection || 'default',
          data: {
            content: 'Document content',
            metadata: {
              title: 'Example Document',
              tags: ['mcp', 'vector']
            }
          },
          query: 'Document content to generate embedding'
        };
      case 'delete':
        return {
          operation: 'delete',
          collection: config.collection || 'default',
          ids: ['doc-123']
        };
      default:
        return {
          operation: 'search',
          collection: config.collection || 'default',
          query: 'semantic search query',
          limit: 10
        };
    }
  };

  return (
    <div className="container mx-auto px-6 py-6">
      {/* Tool Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Vector Storage</h2>
          <p className="text-gray-500">Connect to vector databases for semantic search and retrieval</p>
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
            <VectorStorageConfig config={config} onChange={setConfig} />
            {schema && (
              <div className="mt-6">
                <ToolSchema schema={schema} onRefresh={fetchSchema} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="test-console" className="m-0">
            <TestConsole 
              toolName="vector_storage" 
              defaultParams={getDefaultParams()}
              inputSchema={schema?.inputSchema}
            />
          </TabsContent>

          <TabsContent value="api-reference" className="p-6 m-0">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">API Reference</h3>
              <p className="text-gray-500">Details on how to integrate with the Vector Storage tool via MCP protocol.</p>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Endpoint</h4>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">POST /api/mcp</p>
                
                <h4 className="font-medium mt-4 mb-2">Authentication</h4>
                <p className="text-sm">Requires API key in <code>X-API-Key</code> header.</p>
                
                <h4 className="font-medium mt-4 mb-2">Request Format</h4>
                <pre className="font-mono text-sm bg-gray-100 p-2 rounded overflow-auto">
{`{
  "id": "request-123",
  "name": "vector_storage",
  "parameters": {
    "operation": "search",
    "collection": "my_vectors",
    "query": "semantic search query",
    "filters": { "category": "article" },
    "limit": 10
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
        "id": "doc-123",
        "score": 0.85,
        "metadata": { "title": "Example Document" }
      }
    ],
    "operation": "search",
    "collection": "my_vectors",
    "metadata": {
      "processingTime": 120,
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
              <p className="text-gray-500">Recent Vector Storage tool requests and responses.</p>
              
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
