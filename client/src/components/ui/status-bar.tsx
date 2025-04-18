import React, { useEffect, useState } from 'react';
import { Circle, Info, Activity, Server, Globe, Clock } from 'lucide-react';
import { mcpClient } from '@/lib/mcp-client';
import { SystemStatus } from '@shared/schema';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StatusBar() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [lastRequest, setLastRequest] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch initial status
    fetchStatus();
    
    // Update status every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchStatus = async () => {
    try {
      // Use direct fetch instead of mcpClient to avoid potential issues
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/status`);
      
      if (!response.ok) {
        // Silently fail without logging error to console to keep UI clean
        return;
      }
      
      const systemStatus = await response.json();
      setStatus(systemStatus);
      
      if (systemStatus.lastRequest) {
        const lastRequestTime = new Date(systemStatus.lastRequest);
        const now = new Date();
        const diffSeconds = Math.floor((now.getTime() - lastRequestTime.getTime()) / 1000);
        
        if (diffSeconds < 60) {
          setLastRequest(`${diffSeconds} seconds ago`);
        } else if (diffSeconds < 3600) {
          setLastRequest(`${Math.floor(diffSeconds / 60)} minutes ago`);
        } else {
          setLastRequest(`${Math.floor(diffSeconds / 3600)} hours ago`);
        }
      }
    } catch (error) {
      // Suppress error logging to keep console clean
      // Status state remains unchanged on error to maintain last successful state
    }
  };
  
  return (
    <TooltipProvider>
      <footer className="bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Status Indicators - Left Side */}
            <div className="flex items-center flex-wrap gap-3 md:gap-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1 rounded-full mr-2">
                      <Server className="w-3 h-3 text-white" />
                    </div>
                    <span className="hidden sm:inline">MCP Server:</span>
                    <span className="ml-1 font-medium">Running</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>MCP Server operational</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1 rounded-full mr-2">
                      <Globe className="w-3 h-3 text-white" />
                    </div>
                    <span className="hidden sm:inline">Transport:</span>
                    <span className="ml-1 font-medium">{status?.transport || 'STDIO'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Transport protocol type</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm">
                    <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-1 rounded-full mr-2">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                    <span className="hidden sm:inline">Tools:</span>
                    <span className="ml-1 font-medium">{status?.activeTools?.length || 0} active</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of active tools</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span className="hidden sm:inline">Last request:</span>
                    <span className="ml-1">{lastRequest || 'Never'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Time since last API request</p>
                </TooltipContent>
              </Tooltip>

              <button 
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center bg-white px-2 py-1 rounded-md shadow-sm"
                onClick={() => {
                  window.open('/metrics', '_blank');
                }}
              >
                <Info className="h-3.5 w-3.5 mr-1.5" />
                <span>Metrics</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
}
