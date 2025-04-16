import React from 'react';
import { DataScraperParams } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataScrapingConfigProps {
  config: Partial<DataScraperParams>;
  onChange: (config: Partial<DataScraperParams>) => void;
}

export function DataScrapingConfig({ config, onChange }: DataScrapingConfigProps) {
  const handleChange = (key: keyof DataScraperParams, value: any) => {
    onChange({ ...config, [key]: value });
  };
  
  const handlePaginationChange = (key: keyof typeof config.pagination, value: any) => {
    const pagination = { ...config.pagination, [key]: value };
    onChange({ ...config, pagination });
  };
  
  const handleSelectorsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const selectors = JSON.parse(e.target.value);
      handleChange('selectors', selectors);
    } catch (error) {
      // Invalid JSON, don't update
      console.error('Invalid JSON for selectors:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div>
        <h3 className="text-lg font-medium mb-2">Data Scraping Settings</h3>
        <p className="text-gray-500 text-sm mb-4">Configure settings for extracting data from websites.</p>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="scrape-url" className="block text-sm font-medium mb-1">URL to Scrape</Label>
            <Input 
              type="url" 
              id="scrape-url"
              placeholder="https://example.com/page-to-scrape"
              value={config.url || ''}
              onChange={(e) => handleChange('url', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">URL of the webpage to scrape data from</p>
          </div>
          
          <div>
            <Label htmlFor="format" className="block text-sm font-medium mb-1">Output Format</Label>
            <Select 
              value={config.format || 'json'}
              onValueChange={(value) => handleChange('format', value)}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="text">Plain Text</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">Format for the scraped data output</p>
          </div>
        </div>
      </div>
      
      {/* Advanced Options */}
      <div>
        <h3 className="text-lg font-medium mb-2">Advanced Options</h3>
        
        <Card>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="javascript" className="font-medium">Execute JavaScript</Label>
                  <p className="text-xs text-gray-500">Whether to execute JavaScript on the page</p>
                </div>
                <Switch 
                  id="javascript"
                  checked={config.javascript !== false}
                  onCheckedChange={(checked) => handleChange('javascript', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="timeout" className="block text-sm font-medium mb-1">Timeout (ms)</Label>
                <Input 
                  type="number" 
                  id="timeout"
                  value={config.timeout || 10000}
                  onChange={(e) => handleChange('timeout', parseInt(e.target.value))}
                  min={1000}
                  max={60000}
                  step={1000}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum time to wait for scraping completion (1000-60000ms)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pagination Settings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Pagination Settings</h3>
          <Button variant="link" size="sm" className="text-primary">
            <Info className="h-4 w-4 mr-1" />
            Pagination Guide
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pagination-enabled" className="font-medium">Enable Pagination</Label>
                  <p className="text-xs text-gray-500">Whether to scrape multiple pages</p>
                </div>
                <Switch 
                  id="pagination-enabled"
                  checked={config.pagination?.enabled || false}
                  onCheckedChange={(checked) => handlePaginationChange('enabled', checked)}
                />
              </div>
              
              {config.pagination?.enabled && (
                <>
                  <div>
                    <Label htmlFor="next-selector" className="block text-sm font-medium mb-1">Next Page Selector</Label>
                    <Input 
                      type="text" 
                      id="next-selector"
                      placeholder="a.next-page, button.pagination-next"
                      value={config.pagination?.nextSelector || ''}
                      onChange={(e) => handlePaginationChange('nextSelector', e.target.value)}
                      className="w-full"
                    />
                    <p className="mt-1 text-xs text-gray-500">CSS selector for the next page button/link</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="max-pages" className="block text-sm font-medium mb-1">Maximum Pages</Label>
                    <Input 
                      type="number" 
                      id="max-pages"
                      value={config.pagination?.maxPages || 1}
                      onChange={(e) => handlePaginationChange('maxPages', parseInt(e.target.value))}
                      min={1}
                      max={50}
                      className="w-full"
                    />
                    <p className="mt-1 text-xs text-gray-500">Maximum number of pages to scrape</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* CSS Selectors */}
      <div>
        <h3 className="text-lg font-medium mb-2">CSS Selectors</h3>
        
        <Card>
          <CardContent className="p-5">
            <Label htmlFor="selectors" className="block text-sm font-medium mb-1">
              Selectors (JSON)
            </Label>
            <Textarea 
              id="selectors"
              rows={8}
              placeholder={`{\n  "title": "h1",\n  "description": "meta[name=\\"description\\"]",\n  "content": ".main-content",\n  "links": "a.product-link"\n}`}
              value={config.selectors ? JSON.stringify(config.selectors, null, 2) : ''}
              onChange={handleSelectorsChange}
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              CSS selectors for extracting specific elements. 
              Provide as a JSON object with named keys and CSS selector values.
              If not provided, default selectors for common elements will be used.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
