import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, HelpCircle, Database, Zap as ZapIcon } from 'lucide-react';
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
    provider: 'pinecone', // Default to Pinecone
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
    const provider = config.provider || 'pinecone';
    
    switch (config.operation) {
      case 'search':
        return {
          provider,
          operation: 'search',
          collection: config.collection || 'default',
          query: 'semantic search query',
          limit: config.limit || 10
        };
      case 'retrieve':
        return {
          provider,
          operation: 'retrieve',
          collection: config.collection || 'default',
          ids: ['doc-123', 'doc-456']
        };
      case 'store':
        return {
          provider,
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
          provider,
          operation: 'delete',
          collection: config.collection || 'default',
          ids: ['doc-123']
        };
      default:
        return {
          provider,
          operation: 'search',
          collection: config.collection || 'default',
          query: 'semantic search query',
          limit: 10
        };
    }
  };

  // Configuration presets
  const presets = [
    {
      name: 'Pinecone Semantic Search',
      description: 'Optimized for finding semantically similar content',
      config: {
        provider: 'pinecone',
        operation: 'search',
        collection: 'semantic_search',
        query: '',
        limit: 10
      }
    },
    {
      name: 'Weaviate Semantic Search',
      description: 'Search using Weaviate\'s GraphQL capabilities',
      config: {
        provider: 'weaviate',
        operation: 'search',
        collection: 'SearchArticles',
        query: '',
        limit: 10,
        weaviateOptions: {
          className: 'SearchArticles'
        }
      }
    },
    {
      name: 'Knowledge Base',
      description: 'Store and retrieve structured knowledge',
      config: {
        provider: 'pinecone',
        operation: 'store',
        collection: 'knowledge_base',
        data: {
          title: 'Example document',
          tags: ['knowledge', 'example'],
          source: 'manual'
        },
        query: 'This is an example document for knowledge storage and retrieval.'
      }
    },
    {
      name: 'Weaviate Document Archive',
      description: 'Archive and search documents with Weaviate',
      config: {
        provider: 'weaviate',
        operation: 'store',
        collection: 'Documents',
        data: {
          title: 'Document Title',
          author: 'Author Name',
          date: new Date().toISOString().split('T')[0],
          category: 'Documentation'
        },
        query: 'Document content goes here. This will be converted to an embedding vector.',
        weaviateOptions: {
          className: 'Documents'
        }
      }
    }
  ];

  // Handle applying a preset
  const handleApplyPreset = (presetConfig: any) => {
    setConfig(presetConfig);
    toast({
      title: "Preset Applied",
      description: "Configuration preset has been applied successfully.",
    });
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
      
      {/* Vector Database Status Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Pinecone Database Status */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-primary" />
                  Pinecone Vector Database
                </CardTitle>
                <CardDescription>
                  High-performance vector database for semantic search
                </CardDescription>
              </div>
              {toolStatus && (
                <Badge 
                  variant={toolStatus.available ? "default" : "destructive"} 
                  className={`h-6 ${toolStatus.available ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  {toolStatus.available ? "Connected" : "Disconnected"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <p className="text-sm">
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                  ) : toolStatus?.available ? (
                    <span className="text-green-600 font-medium">Ready</span>
                  ) : (
                    <span className="text-red-600 font-medium">{toolStatus?.error || "Not available"}</span>
                  )}
                </p>
              </div>
              <div className="bg-muted/30 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">Response Time</h4>
                <p className="text-sm">
                  {toolStatus?.latency ? `${toolStatus.latency}ms` : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weaviate Database Status */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-500" />
                  Weaviate Vector Database
                </CardTitle>
                <CardDescription>
                  Open-source vectorizer with GraphQL interface
                </CardDescription>
              </div>
              {toolStatus && (
                <Badge 
                  variant={toolStatus.available ? "default" : "destructive"} 
                  className={`h-6 ${toolStatus.available ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  {toolStatus.available ? "Connected" : "Disconnected"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <p className="text-sm">
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                  ) : toolStatus?.available ? (
                    <span className="text-green-600 font-medium">Ready</span>
                  ) : (
                    <span className="text-red-600 font-medium">{toolStatus?.error || "Not available"}</span>
                  )}
                </p>
              </div>
              <div className="bg-muted/30 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">Response Time</h4>
                <p className="text-sm">
                  {toolStatus?.latency ? `${toolStatus.latency}ms` : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Info */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center">
            <div className="bg-muted/30 py-2 px-3 rounded-md">
              <h4 className="text-sm font-medium">Vector Dimensions</h4>
              <p className="text-sm">1536 (text-embedding-3-small)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      {/* Configuration Presets */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Configuration Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((preset, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleApplyPreset(preset.config)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{preset.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-500 mb-3">{preset.description}</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs py-1 px-2 rounded-full bg-primary/10 text-primary">
                    {preset.config.operation}
                  </span>
                  <span className="text-xs ml-2 py-1 px-2 rounded-full bg-gray-100">
                    {preset.config.collection}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyPreset(preset.config);
                  }}
                >
                  <ZapIcon className="h-3 w-3 mr-1" />
                  Apply Preset
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
