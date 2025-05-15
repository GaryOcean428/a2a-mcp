import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { 
  Search, 
  FileText, 
  Database, 
  Code, 
  ArrowRight, 
  Activity, 
  Sparkles, 
  Layers, 
  Zap, 
  LogIn 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureCard } from '@/components/ui/feature-card';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white py-20 mb-12 rounded-xl shadow-lg border border-purple-100/50 relative overflow-hidden">
        {/* Enhanced grid background with animations */}
        <div className="absolute inset-0 bg-grid-gray-100 opacity-50 pointer-events-none" />
        
        {/* Animated decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl">
            {/* New badge element */}
            <div className="inline-block mb-4 animate-fade-in-down">
              <span className="px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full border border-indigo-200 shadow-sm">
                New in v2.5
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                MCP Integration Platform 
              </span>
              <span className="inline-block ml-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xl shadow-sm">v2.5</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              A secure, high-performance Model Context Protocol (MCP) integration platform that provides standardized interfaces for AI-powered applications.
            </p>
            
            {/* Featured labels */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                Secure API
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
                Multiple Providers
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                Vector Database
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/auth">
                  <span className="flex items-center">Sign In / Register <LogIn className="ml-2 h-5 w-5" /></span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm hover:shadow transition-all">
                <Link href="/documentation">
                  <span className="flex items-center">Documentation <FileText className="ml-2 h-5 w-5" /></span>
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="bg-gray-100 hover:bg-gray-200 shadow-sm hover:shadow transition-all">
                <Link href="/settings">
                  <span className="flex items-center">Get Started <ArrowRight className="ml-2 h-5 w-5" /></span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-6 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text inline-block mb-4">
            Key Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our MCP Integration Platform provides multiple tools to enhance your AI applications with powerful capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 group">
          <FeatureCard
            title="Standardized Protocols"
            description="Implement a consistent interface for AI interactions with external tools through the MCP protocol."
            icon={<Zap className="h-6 w-6 text-white" />}
            gradient="from-purple-500 to-indigo-500"
          />
          
          <FeatureCard
            title="Multiple Providers"
            description="Configure each tool to use your preferred provider with customizable options for optimal results."
            icon={<Layers className="h-6 w-6 text-white" />}
            gradient="from-indigo-500 to-blue-500"
          />
          
          <FeatureCard
            title="Seamless Integration"
            description="Easily integrate with Cline's VS Code extension or make direct API calls from any application."
            icon={<Sparkles className="h-6 w-6 text-white" />}
            gradient="from-violet-500 to-purple-500"
          />
        </div>
      </div>

      <div className="container mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Platform Status Card */}
          <Card className="shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-purple-200 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-indigo-500" />
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-xl">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                Platform Status
              </CardTitle>
              <CardDescription>
                Current system status and active tools
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">API Status</span>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">WebSocket</span>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Database</span>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Vector Search</span>
                  <span className="px-2 py-1 text-xs font-medium text-amber-800 bg-amber-100 rounded-full">Partial</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation Card */}
          <Card className="shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-purple-200 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-blue-500" />
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-xl">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Quick Documentation
              </CardTitle>
              <CardDescription>
                Get started with common API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md font-mono text-sm overflow-x-auto">
                  <p className="text-indigo-600">GET /api/status</p>
                  <p className="text-gray-500 text-xs mt-1">Get current system status and available tools</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md font-mono text-sm overflow-x-auto">
                  <p className="text-indigo-600">POST /api/tools/web-search</p>
                  <p className="text-gray-500 text-xs mt-1">Perform a web search with specified parameters</p>
                </div>
                <Button size="sm" variant="outline" className="mt-2 w-full">
                  <Link href="/documentation">
                    <span className="flex items-center justify-center">View Full Documentation <ArrowRight className="ml-1 h-4 w-4" /></span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}