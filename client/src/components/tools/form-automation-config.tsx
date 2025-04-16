import React from 'react';
import { FormAutomationParams } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormAutomationConfigProps {
  config: Partial<FormAutomationParams>;
  onChange: (config: Partial<FormAutomationParams>) => void;
}

export function FormAutomationConfig({ config, onChange }: FormAutomationConfigProps) {
  const handleChange = (key: keyof FormAutomationParams, value: any) => {
    onChange({ ...config, [key]: value });
  };
  
  const handleFormDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const formData = JSON.parse(e.target.value);
      handleChange('formData', formData);
    } catch (error) {
      // Invalid JSON, don't update
      console.error('Invalid JSON for form data:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div>
        <h3 className="text-lg font-medium mb-2">Form Automation Settings</h3>
        <p className="text-gray-500 text-sm mb-4">Configure settings for filling and submitting web forms.</p>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="form-url" className="block text-sm font-medium mb-1">Form URL</Label>
            <Input 
              type="url" 
              id="form-url"
              placeholder="https://example.com/form"
              value={config.url || ''}
              onChange={(e) => handleChange('url', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">URL of the form to automate</p>
          </div>
          
          <div>
            <Label htmlFor="form-timeout" className="block text-sm font-medium mb-1">Timeout (ms)</Label>
            <Input 
              type="number" 
              id="form-timeout"
              value={config.timeout || 5000}
              onChange={(e) => handleChange('timeout', parseInt(e.target.value))}
              min={1000}
              max={30000}
              step={500}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum time to wait for operation completion (1000-30000ms)</p>
          </div>
        </div>
      </div>
      
      {/* Form Options */}
      <div>
        <h3 className="text-lg font-medium mb-2">Form Options</h3>
        
        <Card>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="submit-form" className="font-medium">Submit Form</Label>
                  <p className="text-xs text-gray-500">Whether to submit the form after filling</p>
                </div>
                <Switch 
                  id="submit-form"
                  checked={config.submitForm !== false}
                  onCheckedChange={(checked) => handleChange('submitForm', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="wait-navigation" className="font-medium">Wait for Navigation</Label>
                  <p className="text-xs text-gray-500">Whether to wait for page navigation after submission</p>
                </div>
                <Switch 
                  id="wait-navigation"
                  checked={config.waitForNavigation !== false}
                  onCheckedChange={(checked) => handleChange('waitForNavigation', checked)}
                  disabled={config.submitForm === false}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Form Data */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Form Data</h3>
          <Button variant="link" size="sm" className="text-primary">
            <Info className="h-4 w-4 mr-1" />
            Form Data Guide
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-5">
            <Label htmlFor="form-data" className="block text-sm font-medium mb-1">
              Form Data (JSON)
            </Label>
            <Textarea 
              id="form-data"
              rows={8}
              placeholder={`{\n  "username": "example",\n  "password": "password123",\n  "remember": true\n}`}
              value={config.formData ? JSON.stringify(config.formData, null, 2) : ''}
              onChange={handleFormDataChange}
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Provide the form fields and values as a JSON object. For checkboxes, use boolean values. 
              For select menus with multiple selection, use arrays of values.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
