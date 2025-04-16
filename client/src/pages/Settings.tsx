import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, RefreshCw, Shield, Key, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [apiKeys, setApiKeys] = useState({
    openai: process.env.OPENAI_API_KEY || '●●●●●●●●●●●●●●●●●●',
    tavily: process.env.TAVILY_API_KEY || '',
    perplexity: process.env.PERPLEXITY_API_KEY || ''
  });
  
  const [rateLimits, setRateLimits] = useState({
    global: 120,
    toolSpecific: 60
  });
  
  const [transportMode, setTransportMode] = useState<string>('STDIO');
  const [logLevel, setLogLevel] = useState<string>('info');
  
  const { toast } = useToast();
  
  const handleSaveGeneral = () => {
    toast({
      title: 'General Settings Saved',
      description: 'Your general settings have been saved successfully.'
    });
  };
  
  const handleSaveApiKeys = () => {
    toast({
      title: 'API Keys Saved',
      description: 'Your API keys have been saved successfully.'
    });
  };
  
  const handleGenerateKey = () => {
    const newKey = 'mcp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    toast({
      title: 'API Key Generated',
      description: 'New API key has been generated.'
    });
  };
  
  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Settings</h2>
          <p className="text-gray-500">Configure the MCP Integration Platform</p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="mb-6">
        <TabsList>
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="transport-mode">Transport Mode</Label>
                  <Select
                    value={transportMode}
                    onValueChange={setTransportMode}
                  >
                    <SelectTrigger id="transport-mode">
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STDIO">STDIO</SelectItem>
                      <SelectItem value="SSE">Server-Sent Events (SSE)</SelectItem>
                      <SelectItem value="BOTH">Both (STDIO + SSE)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">MCP transport protocol to use</p>
                </div>
                
                <div>
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select
                    value={logLevel}
                    onValueChange={setLogLevel}
                  >
                    <SelectTrigger id="log-level">
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Logging verbosity level</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug-mode" className="font-medium">Debug Mode</Label>
                  <p className="text-xs text-gray-500">Enable detailed debugging information</p>
                </div>
                <Switch id="debug-mode" />
              </div>
              
              <Button onClick={handleSaveGeneral}>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-keys" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider API Keys</CardTitle>
              <CardDescription>Configure API keys for external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                <div className="relative mt-1">
                  <Input 
                    id="openai-api-key"
                    type="password"
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                  />
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 p-0 w-8"
                    onClick={() => {}}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Used for OpenAI web search provider</p>
              </div>
              
              <div>
                <Label htmlFor="tavily-api-key">Tavily API Key</Label>
                <div className="relative mt-1">
                  <Input 
                    id="tavily-api-key"
                    type="password"
                    value={apiKeys.tavily}
                    onChange={(e) => setApiKeys({...apiKeys, tavily: e.target.value})}
                  />
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 p-0 w-8"
                    onClick={() => {}}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Used for Tavily web search provider</p>
              </div>
              
              <div>
                <Label htmlFor="perplexity-api-key">Perplexity API Key</Label>
                <div className="relative mt-1">
                  <Input 
                    id="perplexity-api-key"
                    type="password"
                    value={apiKeys.perplexity}
                    onChange={(e) => setApiKeys({...apiKeys, perplexity: e.target.value})}
                  />
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 p-0 w-8"
                    onClick={() => {}}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Used for Perplexity web search provider</p>
              </div>
              
              <Button onClick={handleSaveApiKeys}>Save API Keys</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>Manage your MCP platform API keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="api-key">Your API Key</Label>
                <div className="relative mt-1 flex">
                  <Input 
                    id="api-key"
                    value="mcp_v58zSSsVuNu77gqEKd22DfTwP0OeUxyb"
                    readOnly
                    className="flex-1"
                  />
                  <Button 
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() => {
                      navigator.clipboard.writeText("mcp_v58zSSsVuNu77gqEKd22DfTwP0OeUxyb");
                      toast({
                        title: "Copied to clipboard",
                        description: "API key has been copied to clipboard"
                      });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleGenerateKey}>Generate New API Key</Button>
                <Button variant="outline">Revoke API Key</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>MCP Protocol Usage</CardTitle>
              <CardDescription>How to use the MCP tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>To use the MCP tools, include your API key in the request headers:</p>
              
              <div className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto font-mono text-sm">
                <pre>{`// JavaScript example
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    id: 'request-id',
    name: 'web_search',
    parameters: {
      query: 'Your search query',
      provider: 'tavily',
      max_results: 5
    }
  })
});`}</pre>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold text-lg mb-2">Available Tools</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="font-semibold">web_search</span> - Search the web with multiple provider options</li>
                  <li><span className="font-semibold">form_automation</span> - Fill and submit web forms programmatically</li>
                  <li><span className="font-semibold">vector_storage</span> - Connect to vector databases for semantic search</li>
                  <li><span className="font-semibold">data_scraper</span> - Extract structured data from websites</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and rate limiting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="global-rate-limit">Global Rate Limit</Label>
                  <div className="flex items-center mt-1">
                    <Input 
                      id="global-rate-limit"
                      type="number"
                      value={rateLimits.global}
                      onChange={(e) => setRateLimits({...rateLimits, global: parseInt(e.target.value)})}
                      min={1}
                    />
                    <span className="ml-2 text-gray-500 text-sm">requests/min</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Maximum requests per minute across all endpoints</p>
                </div>
                
                <div>
                  <Label htmlFor="tool-rate-limit">Tool-Specific Rate Limit</Label>
                  <div className="flex items-center mt-1">
                    <Input 
                      id="tool-rate-limit"
                      type="number"
                      value={rateLimits.toolSpecific}
                      onChange={(e) => setRateLimits({...rateLimits, toolSpecific: parseInt(e.target.value)})}
                      min={1}
                    />
                    <span className="ml-2 text-gray-500 text-sm">requests/min</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Maximum requests per minute for each tool</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Security Warning</h4>
                  <p className="text-sm text-yellow-700">
                    Ensure all API keys are stored securely and rate limits are configured appropriately 
                    to prevent abuse. Consider implementing IP allowlisting for production deployments.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ip-allowlist" className="font-medium">IP Allowlisting</Label>
                  <p className="text-xs text-gray-500">Restrict API access to specific IP addresses</p>
                </div>
                <Switch id="ip-allowlist" />
              </div>
              
              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
