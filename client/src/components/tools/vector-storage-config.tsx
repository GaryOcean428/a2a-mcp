import React, { useState } from 'react';
import { VectorStorageParams } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Info, Database } from 'lucide-react';

interface VectorStorageConfigProps {
  config: Partial<VectorStorageParams>;
  onChange: (config: Partial<VectorStorageParams>) => void;
}

export function VectorStorageConfig({ config, onChange }: VectorStorageConfigProps) {
  const [selectedOperation, setSelectedOperation] = useState<string>(config.operation || 'search');
  
  const handleOperationChange = (operation: string) => {
    setSelectedOperation(operation);
    onChange({ ...config, operation: operation as any });
  };
  
  const handleCollectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, collection: e.target.value });
  };
  
  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      onChange({ ...config, limit: value });
    }
  };
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...config, query: e.target.value });
  };
  
  const handleFiltersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const filters = JSON.parse(e.target.value);
      onChange({ ...config, filters });
    } catch (error) {
      // Invalid JSON, don't update
      console.error('Invalid JSON for filters:', error);
    }
  };
  
  const handleIdsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const ids = JSON.parse(e.target.value);
      if (Array.isArray(ids)) {
        onChange({ ...config, ids });
      }
    } catch (error) {
      // Invalid JSON, don't update
      console.error('Invalid JSON for IDs:', error);
    }
  };
  
  const handleDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const data = JSON.parse(e.target.value);
      onChange({ ...config, data });
    } catch (error) {
      // Invalid JSON, don't update
      console.error('Invalid JSON for data:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Operation Selection */}
      <div>
        <h3 className="text-lg font-medium mb-2">Vector Storage Operation</h3>
        <p className="text-gray-500 text-sm mb-4">Select the operation to perform on vector data.</p>
        
        <div className="grid grid-cols-4 gap-4">
          {['search', 'retrieve', 'store', 'delete'].map((operation) => (
            <Card 
              key={operation}
              className={`border ${selectedOperation === operation ? 'border-primary' : 'border-gray-200'} ${
                selectedOperation === operation ? 'bg-primary bg-opacity-5' : ''
              } hover:border-gray-300 transition-colors cursor-pointer`}
              onClick={() => handleOperationChange(operation)}
            >
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 rounded-full border border-primary relative">
                    {selectedOperation === operation && (
                      <div className="absolute inset-0.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <Label htmlFor={`operation-${operation}`} className="ml-2 font-medium capitalize">{operation}</Label>
                </div>
                <p className="text-gray-500 text-sm">
                  {operation === 'search' && 'Find vectors by semantic similarity'}
                  {operation === 'retrieve' && 'Get vectors by specific IDs'}
                  {operation === 'store' && 'Save new vector data'}
                  {operation === 'delete' && 'Remove vectors by IDs'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Database Provider Settings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Database Settings</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              // Open connection modal or handle new connection click
              alert('This feature is coming soon! It will allow creating new database connections.');
            }}
          >
            <Database className="h-4 w-4 mr-1" />
            New Connection
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="provider" className="block text-sm font-medium mb-1">Vector Database Provider</Label>
            <Select 
              value={(config.provider as any) || 'pinecone'} 
              onValueChange={(value) => onChange({ ...config, provider: value as "pinecone" | "weaviate" })}
            >
              <SelectTrigger id="provider" className="w-full">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pinecone">Pinecone</SelectItem>
                <SelectItem value="weaviate">Weaviate</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">Vector database provider to use</p>
          </div>
        </div>
      </div>

      {/* Collection Settings */}
      <div>
        <h3 className="text-lg font-medium mb-2">Collection Settings</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="collection-name" className="block text-sm font-medium mb-1">Collection Name</Label>
            <Input 
              type="text" 
              id="collection-name"
              placeholder="my_vectors"
              value={config.collection || ''}
              onChange={handleCollectionChange}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">Vector collection to operate on</p>
          </div>
          
          {selectedOperation === 'search' && (
            <div>
              <Label htmlFor="result-limit" className="block text-sm font-medium mb-1">Result Limit</Label>
              <Input 
                type="number" 
                id="result-limit"
                value={config.limit || 10}
                onChange={handleLimitChange}
                min={1}
                max={100}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">Maximum number of results (1-100)</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Provider-Specific Settings */}
      {config.provider === 'weaviate' && (
        <div>
          <h3 className="text-lg font-medium mb-2">Weaviate Settings</h3>
          <Card>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="class-name" className="block text-sm font-medium mb-1">Class Name (Optional)</Label>
                  <Input 
                    type="text" 
                    id="class-name"
                    placeholder="MyClassName"
                    value={config.weaviateOptions?.className || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      onChange({ 
                        ...config, 
                        weaviateOptions: {
                          ...config.weaviateOptions,
                          className: value
                        }
                      });
                    }}
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">Capitalized class name (defaults to collection name if not provided)</p>
                </div>
                
                <div>
                  <Label htmlFor="consistency-level" className="block text-sm font-medium mb-1">Consistency Level</Label>
                  <Select 
                    value={(config.weaviateOptions?.consistencyLevel as any) || 'ONE'} 
                    onValueChange={(value) => {
                      onChange({ 
                        ...config, 
                        weaviateOptions: {
                          ...config.weaviateOptions,
                          consistencyLevel: value as "ONE" | "QUORUM" | "ALL"
                        }
                      });
                    }}
                  >
                    <SelectTrigger id="consistency-level" className="w-full">
                      <SelectValue placeholder="Select Consistency Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONE">ONE (Fastest)</SelectItem>
                      <SelectItem value="QUORUM">QUORUM (Balanced)</SelectItem>
                      <SelectItem value="ALL">ALL (Most Consistent)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">Consistency level for write operations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Operation-Specific Settings */}
      {selectedOperation === 'search' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Search Parameters</h3>
            <Button variant="link" size="sm" className="text-primary">
              <Info className="h-4 w-4 mr-1" />
              Search Guide
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-query" className="block text-sm font-medium mb-1">Search Query</Label>
                  <Textarea 
                    id="search-query"
                    placeholder="Enter your search query text..."
                    value={config.query || ''}
                    onChange={handleQueryChange}
                    rows={3}
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">Text query for semantic search</p>
                </div>
                
                <div>
                  <Label htmlFor="search-filters" className="block text-sm font-medium mb-1">Metadata Filters (JSON)</Label>
                  <Textarea 
                    id="search-filters"
                    placeholder={`{\n  "category": "article",\n  "author": "John Doe"\n}`}
                    value={config.filters ? JSON.stringify(config.filters, null, 2) : ''}
                    onChange={handleFiltersChange}
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Optional metadata filters for search</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {selectedOperation === 'retrieve' && (
        <div>
          <h3 className="text-lg font-medium mb-2">Retrieve Parameters</h3>
          
          <Card>
            <CardContent className="p-5">
              <div>
                <Label htmlFor="retrieve-ids" className="block text-sm font-medium mb-1">Document IDs (JSON Array)</Label>
                <Textarea 
                  id="retrieve-ids"
                  placeholder={`[\n  "doc-123",\n  "doc-456",\n  "doc-789"\n]`}
                  value={config.ids ? JSON.stringify(config.ids, null, 2) : ''}
                  onChange={handleIdsChange}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">IDs of documents to retrieve</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {selectedOperation === 'store' && (
        <div>
          <h3 className="text-lg font-medium mb-2">Store Parameters</h3>
          
          <Card>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="store-data" className="block text-sm font-medium mb-1">Vector Data (JSON)</Label>
                  <Textarea 
                    id="store-data"
                    placeholder={`{\n  "content": "Document content here",\n  "metadata": {\n    "title": "Example Document",\n    "tags": ["mcp", "vector"]\n  }\n}`}
                    value={config.data ? JSON.stringify(config.data, null, 2) : ''}
                    onChange={handleDataChange}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Data to store in the vector database</p>
                </div>
                
                <div>
                  <Label htmlFor="store-query" className="block text-sm font-medium mb-1">Content Text</Label>
                  <Textarea 
                    id="store-query"
                    placeholder="Enter the text content to generate embedding for..."
                    value={config.query || ''}
                    onChange={handleQueryChange}
                    rows={3}
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">Text content to generate embedding for (if not providing pre-computed embedding)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {selectedOperation === 'delete' && (
        <div>
          <h3 className="text-lg font-medium mb-2">Delete Parameters</h3>
          
          <Card>
            <CardContent className="p-5">
              <div>
                <Label htmlFor="delete-ids" className="block text-sm font-medium mb-1">Document IDs to Delete (JSON Array)</Label>
                <Textarea 
                  id="delete-ids"
                  placeholder={`[\n  "doc-123",\n  "doc-456",\n  "doc-789"\n]`}
                  value={config.ids ? JSON.stringify(config.ids, null, 2) : ''}
                  onChange={handleIdsChange}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">IDs of documents to delete from the vector database</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
