/**
 * Spinner Showcase Component
 * 
 * Displays all variations of the AI Spinner component for demonstration
 * and testing purposes.
 */

import { 
  AISpinner, 
  type AIServiceType, 
  type SpinnerType, 
  type SpinnerSize 
} from "@/components/ui/ai-spinner";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const services: AIServiceType[] = [
  "openai",
  "anthropic",
  "google",
  "azure",
  "huggingface",
  "pinecone",
  "weaviate",
  "websearch",
  "generic"
];

const spinnerTypes: SpinnerType[] = ["ring", "dots", "pulse", "wave"];
const spinnerSizes: SpinnerSize[] = ["xs", "sm", "md", "lg", "xl"];

export function SpinnerShowcase() {
  const [activeService, setActiveService] = useState<AIServiceType>("openai");
  const [activeType, setActiveType] = useState<SpinnerType>("ring");
  const [activeSize, setActiveSize] = useState<SpinnerSize>("md");
  const [showIcon, setShowIcon] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  
  return (
    <div className="w-full space-y-6 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Service Loading Spinners</CardTitle>
          <CardDescription>
            Customizable loading spinners themed for various AI services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="showcase" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="showcase">Showcase</TabsTrigger>
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="showcase" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">All Services</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {services.map((service) => (
                    <div key={service} className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <AISpinner 
                        service={service} 
                        type="ring" 
                        size="md" 
                        showIcon={true}
                        label={service.charAt(0).toUpperCase() + service.slice(1)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">All Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {spinnerTypes.map((type) => (
                    <div key={type} className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <AISpinner 
                        service={activeService} 
                        type={type} 
                        size="md" 
                        showIcon={type === "ring"}
                        label={type.charAt(0).toUpperCase() + type.slice(1)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">All Sizes</h3>
                <div className="flex flex-wrap items-end justify-center gap-4">
                  {spinnerSizes.map((size) => (
                    <div key={size} className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <AISpinner 
                        service={activeService} 
                        type="ring" 
                        size={size} 
                        showIcon={true}
                        label={size.toUpperCase()}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customize" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-select">Service</Label>
                    <Select 
                      value={activeService} 
                      onValueChange={(value) => setActiveService(value as AIServiceType)}
                    >
                      <SelectTrigger id="service-select" className="w-full">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service.charAt(0).toUpperCase() + service.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type-select">Type</Label>
                    <Select 
                      value={activeType} 
                      onValueChange={(value) => setActiveType(value as SpinnerType)}
                    >
                      <SelectTrigger id="type-select" className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {spinnerTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="size-select">Size</Label>
                    <Select 
                      value={activeSize} 
                      onValueChange={(value) => setActiveSize(value as SpinnerSize)}
                    >
                      <SelectTrigger id="size-select" className="w-full">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {spinnerSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 pt-2">
                    <Label htmlFor="show-icon">Show Icon</Label>
                    <Switch 
                      id="show-icon" 
                      checked={showIcon} 
                      onCheckedChange={setShowIcon} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="show-label">Show Label</Label>
                    <Switch 
                      id="show-label" 
                      checked={showLabel} 
                      onCheckedChange={setShowLabel} 
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-10">
                  <AISpinner 
                    service={activeService} 
                    type={activeType} 
                    size={activeSize} 
                    showIcon={showIcon}
                    label={showLabel ? `${activeService.charAt(0).toUpperCase() + activeService.slice(1)} Loading` : undefined}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Import the AISpinner component to show loading states for your AI service integrations:
              </p>
              
              <pre className="p-4 rounded-lg bg-gray-900 text-gray-100 overflow-x-auto text-sm">
                {`import { AISpinner } from "@/components/ui/ai-spinner";

// Basic usage
<AISpinner service="openai" />

// Full customization
<AISpinner 
  service="anthropic" 
  type="wave" 
  size="lg" 
  showIcon={true}
  label="Processing with Claude"
/>

// Conditional rendering
<AISpinner 
  service="google" 
  active={isLoading} 
  label="Searching..." 
/>`}
              </pre>
              
              <div className="flex justify-center pt-4">
                <Button 
                  variant="default" 
                  onClick={() => {
                    navigator.clipboard.writeText(`import { AISpinner } from "@/components/ui/ai-spinner";

// Basic usage
<AISpinner service="openai" />

// Full customization
<AISpinner 
  service="anthropic" 
  type="wave" 
  size="lg" 
  showIcon={true}
  label="Processing with Claude"
/>

// Conditional rendering
<AISpinner 
  service="google" 
  active={isLoading} 
  label="Searching..." 
/>`)
                  }}
                >
                  Copy Example Code
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}