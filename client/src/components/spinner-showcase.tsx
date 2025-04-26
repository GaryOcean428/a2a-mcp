/**
 * Spinner Showcase Component
 * 
 * Displays all variations of the AI Spinner component for demonstration
 * and testing purposes.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AISpinner, type AIServiceType, type SpinnerSize, type SpinnerType } from "@/components/ui/ai-spinner";

export function SpinnerShowcase() {
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
  
  const sizes: SpinnerSize[] = ["xs", "sm", "md", "lg", "xl"];
  const types: SpinnerType[] = ["ring", "dots", "pulse", "wave"];

  return (
    <div className="space-y-8">
      {/* Types of spinners */}
      <Card>
        <CardHeader>
          <CardTitle>Spinner Types</CardTitle>
          <CardDescription>
            Different animation types available for loading indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {types.map(type => (
              <div key={type} className="flex flex-col items-center p-4 border rounded-lg">
                <h3 className="mb-4 font-medium capitalize">{type}</h3>
                <AISpinner service="generic" type={type} size="md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Spinner Sizes</CardTitle>
          <CardDescription>
            Different size options for the spinners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-around items-end gap-4">
            {sizes.map(size => (
              <div key={size} className="flex flex-col items-center">
                <span className="mb-2 text-sm text-muted-foreground">{size}</span>
                <AISpinner service="generic" size={size} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service-themed spinners */}
      <Card>
        <CardHeader>
          <CardTitle>AI Service Spinners</CardTitle>
          <CardDescription>
            Spinners themed for different AI services and tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ring">
            <TabsList className="grid grid-cols-4 mb-4">
              {types.map(type => (
                <TabsTrigger key={type} value={type} className="capitalize">
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {types.map(type => (
              <TabsContent key={type} value={type}>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {services.map(service => (
                    <div 
                      key={service} 
                      className="flex flex-col items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <AISpinner 
                        service={service} 
                        type={type} 
                        size="md"
                        label={service.charAt(0).toUpperCase() + service.slice(1)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Label examples */}
      <Card>
        <CardHeader>
          <CardTitle>Labeled Spinners</CardTitle>
          <CardDescription>
            Examples with different loading messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg flex justify-center items-center">
              <AISpinner 
                service="openai" 
                label="Generating response..." 
                size="md"
              />
            </div>
            <div className="p-6 border rounded-lg flex justify-center items-center">
              <AISpinner 
                service="anthropic" 
                label="Thinking..." 
                size="md"
                type="dots"
              />
            </div>
            <div className="p-6 border rounded-lg flex justify-center items-center">
              <AISpinner 
                service="google" 
                label="Searching..." 
                size="md"
                type="wave"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use case demos */}
      <Card>
        <CardHeader>
          <CardTitle>Common Use Cases</CardTitle>
          <CardDescription>
            Real-world examples of spinner usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-lg flex flex-col">
              <div className="text-lg font-medium mb-2">Vector Search</div>
              <div className="h-[200px] flex items-center justify-center">
                <AISpinner 
                  service="pinecone" 
                  label="Searching vector database..." 
                  size="lg"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-lg flex flex-col">
              <div className="text-lg font-medium mb-2">Web Search</div>
              <div className="h-[200px] flex items-center justify-center">
                <AISpinner 
                  service="websearch" 
                  label="Querying search engines..." 
                  size="lg"
                  type="pulse"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}