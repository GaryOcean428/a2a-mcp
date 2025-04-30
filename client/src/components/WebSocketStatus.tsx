import React, { useEffect, useState } from 'react';
import { mcpWebSocketClient } from '../utils/mcp-websocket-client';

interface WebSocketStatusProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function WebSocketStatus({ 
  showLabel = true, 
  size = 'small',
  className = ''
}: WebSocketStatusProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>(
    mcpWebSocketClient.getStatus().status
  );
  
  // Subscribe to WebSocket status changes
  useEffect(() => {
    const handleStatusChange = (data: { status: 'connected' | 'disconnected' | 'connecting' | 'error' }) => {
      setStatus(data.status);
    };
    
    // Add event listener
    mcpWebSocketClient.on('status', handleStatusChange);
    
    // Initial status check
    setStatus(mcpWebSocketClient.getStatus().status);
    
    // Clean up on unmount
    return () => {
      mcpWebSocketClient.off('status', handleStatusChange);
    };
  }, []);
  
  // Define size styles
  const sizeStyles = {
    small: {
      indicator: 'w-2 h-2',
      container: 'text-xs',
    },
    medium: {
      indicator: 'w-3 h-3',
      container: 'text-sm',
    },
    large: {
      indicator: 'w-4 h-4',
      container: 'text-base',
    },
  };
  
  // Define status styles
  const statusStyles = {
    connected: {
      color: 'bg-green-500',
      label: 'Connected',
    },
    disconnected: {
      color: 'bg-gray-500',
      label: 'Disconnected',
    },
    connecting: {
      color: 'bg-yellow-500 animate-pulse',
      label: 'Connecting...',
    },
    error: {
      color: 'bg-red-500',
      label: 'Error',
    },
  };
  
  const currentStyle = statusStyles[status];
  const currentSize = sizeStyles[size];
  
  return (
    <div className={`mcp-websocket-status flex items-center ${currentSize.container} ${className}`}>
      <span 
        className={`inline-block rounded-full ${currentStyle.color} ${currentSize.indicator} mr-2`} 
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-gray-600 dark:text-gray-300">
          {currentStyle.label}
        </span>
      )}
    </div>
  );
}

export default WebSocketStatus;