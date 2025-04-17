import React, { useState } from 'react';
import { WebSearchParams } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Info } from 'lucide-react';

interface WebSearchConfigProps {
  config: Partial<WebSearchParams>;
  onChange: (config: Partial<WebSearchParams>) => void;
}

export function WebSearchConfig({ config, onChange }: WebSearchConfigProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>(config.provider || 'openai');
  
  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    onChange({ ...config, provider });
  };
  
  const handleResultCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 50) {
      onChange({ ...config, resultCount: value });
    }
  };
  
  const handleOpenAIOptionChange = (key: string, value: any) => {
    const openaiOptions = { ...config.openaiOptions, [key]: value };
    onChange({ ...config, openaiOptions });
  };
  
  const handleTavilyOptionChange = (key: string, value: any) => {
    const tavilyOptions = { ...config.tavilyOptions, [key]: value };
    onChange({ ...config, tavilyOptions });
  };
  
  const handlePerplexityOptionChange = (key: string, value: any) => {
    const perplexityOptions = { ...config.perplexityOptions, [key]: value };
    onChange({ ...config, perplexityOptions });
  };
  
  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div>
        <h3 className="text-lg font-medium mb-2">Provider</h3>
        <p className="text-gray-500 text-sm mb-4">Select the search provider to use for web searches.</p>
        
        <RadioGroup value={selectedProvider} onValueChange={handleProviderChange} className="grid grid-cols-3 gap-4">
          <Card 
            className={`border ${selectedProvider === 'openai' ? 'border-primary' : 'border-gray-200'} ${
              selectedProvider === 'openai' ? 'bg-primary bg-opacity-5' : ''
            } hover:border-gray-300 transition-colors cursor-pointer`}
            onClick={() => handleProviderChange('openai')}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <RadioGroupItem 
                  id="provider-openai" 
                  value="openai" 
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="provider-openai" className="ml-2 font-medium">OpenAI</Label>
              </div>
              <p className="text-gray-500 text-sm">Uses OpenAI's web search capabilities through GPT-4o.</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`border ${selectedProvider === 'tavily' ? 'border-primary' : 'border-gray-200'} ${
              selectedProvider === 'tavily' ? 'bg-primary bg-opacity-5' : ''
            } hover:border-gray-300 transition-colors cursor-pointer`}
            onClick={() => handleProviderChange('tavily')}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <RadioGroupItem 
                  id="provider-tavily" 
                  value="tavily" 
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="provider-tavily" className="ml-2 font-medium">Tavily</Label>
              </div>
              <p className="text-gray-500 text-sm">Tavily Search API with topic-specific capabilities.</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`border ${selectedProvider === 'perplexity' ? 'border-primary' : 'border-gray-200'} ${
              selectedProvider === 'perplexity' ? 'bg-primary bg-opacity-5' : ''
            } hover:border-gray-300 transition-colors cursor-pointer`}
            onClick={() => handleProviderChange('perplexity')}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <RadioGroupItem 
                  id="provider-perplexity" 
                  value="perplexity" 
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="provider-perplexity" className="ml-2 font-medium">Perplexity</Label>
              </div>
              <p className="text-gray-500 text-sm">Perplexity AI's search with Sonar models.</p>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>
      
      {/* General Settings */}
      <div>
        <h3 className="text-lg font-medium mb-2">General Settings</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="result-count" className="block text-sm font-medium mb-1">Result Count</Label>
            <div className="flex items-center">
              <Input 
                type="number" 
                id="result-count"
                value={config.resultCount || 5}
                onChange={handleResultCountChange}
                min={1}
                max={50}
                className="flex-1"
              />
              <span className="ml-2 text-gray-500 text-sm">results</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Number of search results to return (1-50)</p>
          </div>
        </div>
      </div>
      
      {/* Provider-Specific Settings */}
      {selectedProvider === 'openai' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">OpenAI Provider Settings</h3>
            <Button variant="link" size="sm" className="text-primary" asChild>
              <a href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer">
                <Info className="h-4 w-4 mr-1" />
                API Documentation
              </a>
            </Button>
          </div>
          
          <Card className="bg-gray-50">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="openai-api-key" className="block text-sm font-medium mb-1">API Key</Label>
                  <div className="relative">
                    <Input 
                      type="password" 
                      id="openai-api-key"
                      value="●●●●●●●●●●●●●●●●●●●●●●●●"
                      readOnly
                      className="w-full"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Your OpenAI API key (set via environment variable)</p>
                </div>
                
                <div>
                  <Label htmlFor="openai-model" className="block text-sm font-medium mb-1">Model</Label>
                  <Select 
                    value="gpt-4o" 
                    onValueChange={(value) => {}}
                  >
                    <SelectTrigger id="openai-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">OpenAI model to use for search capabilities</p>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-1">Search Context Size</Label>
                  <RadioGroup 
                    value={config.openaiOptions?.searchContextSize || 'medium'}
                    onValueChange={(value) => handleOpenAIOptionChange('searchContextSize', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="low" id="context-low" />
                      <Label htmlFor="context-low" className="ml-2 text-sm">Low</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="medium" id="context-medium" />
                      <Label htmlFor="context-medium" className="ml-2 text-sm">Medium</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="high" id="context-high" />
                      <Label htmlFor="context-high" className="ml-2 text-sm">High</Label>
                    </div>
                  </RadioGroup>
                  <p className="mt-1 text-xs text-gray-500">Amount of search context to retrieve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {selectedProvider === 'tavily' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Tavily Provider Settings</h3>
            <Button variant="link" size="sm" className="text-primary" asChild>
              <a href="https://tavily.com/docs" target="_blank" rel="noopener noreferrer">
                <Info className="h-4 w-4 mr-1" />
                API Documentation
              </a>
            </Button>
          </div>
          
          <Card className="bg-gray-50">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tavily-search-depth" className="block text-sm font-medium mb-1">Search Depth</Label>
                  <Select 
                    value={config.tavilyOptions?.searchDepth || 'basic'}
                    onValueChange={(value) => handleTavilyOptionChange('searchDepth', value)}
                  >
                    <SelectTrigger id="tavily-search-depth">
                      <SelectValue placeholder="Select depth" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">Depth of search to perform</p>
                </div>
                
                <div>
                  <Label htmlFor="tavily-topic" className="block text-sm font-medium mb-1">Topic</Label>
                  <Select 
                    value={config.tavilyOptions?.topic || 'general'}
                    onValueChange={(value) => handleTavilyOptionChange('topic', value)}
                  >
                    <SelectTrigger id="tavily-topic">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">Topic of search query</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {selectedProvider === 'perplexity' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Perplexity Provider Settings</h3>
            <Button variant="link" size="sm" className="text-primary" asChild>
              <a href="https://docs.perplexity.ai" target="_blank" rel="noopener noreferrer">
                <Info className="h-4 w-4 mr-1" />
                API Documentation
              </a>
            </Button>
          </div>
          
          <Card className="bg-gray-50">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="perplexity-model" className="block text-sm font-medium mb-1">Model</Label>
                  <Select 
                    value={config.perplexityOptions?.model || 'sonar'}
                    onValueChange={(value) => handlePerplexityOptionChange('model', value)}
                  >
                    <SelectTrigger id="perplexity-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sonar">Sonar</SelectItem>
                      <SelectItem value="sonar-pro">Sonar Pro</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">Perplexity model to use</p>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-1">Search Context Size</Label>
                  <RadioGroup 
                    value={config.perplexityOptions?.searchContextSize || 'medium'}
                    onValueChange={(value) => handlePerplexityOptionChange('searchContextSize', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="low" id="perplexity-context-low" />
                      <Label htmlFor="perplexity-context-low" className="ml-2 text-sm">Low</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="medium" id="perplexity-context-medium" />
                      <Label htmlFor="perplexity-context-medium" className="ml-2 text-sm">Medium</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="high" id="perplexity-context-high" />
                      <Label htmlFor="perplexity-context-high" className="ml-2 text-sm">High</Label>
                    </div>
                  </RadioGroup>
                  <p className="mt-1 text-xs text-gray-500">Amount of search context to retrieve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
