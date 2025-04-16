import React, { useEffect, useState } from 'react';
import { Circle, Info } from 'lucide-react';
import { mcpClient } from '@/lib/mcp-client';
import { SystemStatus } from '@shared/schema';

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
      const systemStatus = await mcpClient.getStatus();
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
      console.error('Failed to fetch system status:', error);
    }
  };
  
  return (
    <footer className="bg-white border-t border-gray-200 py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm">
            <Circle className="w-2 h-2 mr-2 fill-green-600 text-green-600" />
            <span>MCP Server: Running</span>
          </div>
          <div className="flex items-center text-sm">
            <Circle className="w-2 h-2 mr-2 fill-green-600 text-green-600" />
            <span>Transport: {status?.transport || 'STDIO'}</span>
          </div>
          <div className="flex items-center text-sm">
            <Circle className="w-2 h-2 mr-2 fill-green-600 text-green-600" />
            <span>Tools: {status?.activeTools?.length || 0} active</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last request: {lastRequest || 'Never'}
          </span>
          <button className="text-sm text-primary hover:text-opacity-80 flex items-center">
            <Info className="h-4 w-4 mr-1" />
            View Metrics
          </button>
        </div>
      </div>
    </footer>
  );
}
