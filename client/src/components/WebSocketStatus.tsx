/**
 * MCP Integration Platform - WebSocket Status Component
 * 
 * This component displays the current WebSocket connection status
 * to the user and allows for reconnection attempts.
 */

import { useWebSocket } from '../hooks/use-websocket';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CircleAlert, RefreshCw, Signal, SignalLow, SignalOff, Wifi } from 'lucide-react';
import { useState } from 'react';

interface WebSocketStatusProps {
  showReconnect?: boolean;
  tooltip?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function WebSocketStatus({
  showReconnect = false,
  tooltip = true,
  showLabel = false,
  className = '',
}: WebSocketStatusProps) {
  const { status, reconnect } = useWebSocket();
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Handle reconnection with feedback
  const handleReconnect = () => {
    setIsReconnecting(true);
    reconnect();
    
    // Reset reconnecting state after a reasonable timeout
    setTimeout(() => {
      setIsReconnecting(false);
    }, 3000);
  };
  
  // Define status-based UI variations
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Signal className="h-4 w-4" />,
          label: 'Connected',
          variant: 'outline' as const,
          color: 'text-green-500',
          tooltip: 'WebSocket connection established'
        };
      case 'connecting':
        return {
          icon: <SignalLow className="h-4 w-4 animate-pulse" />,
          label: 'Connecting',
          variant: 'outline' as const,
          color: 'text-amber-500',
          tooltip: 'Establishing WebSocket connection...'
        };
      case 'disconnected':
        return {
          icon: <SignalOff className="h-4 w-4" />,
          label: 'Disconnected',
          variant: 'outline' as const,
          color: 'text-gray-500',
          tooltip: 'WebSocket disconnected. Click to reconnect.'
        };
      case 'error':
        return {
          icon: <CircleAlert className="h-4 w-4" />,
          label: 'Connection Error',
          variant: 'destructive' as const,
          color: 'text-red-500',
          tooltip: 'WebSocket connection error. Click to retry.'
        };
      default:
        return {
          icon: <Wifi className="h-4 w-4" />,
          label: 'Unknown',
          variant: 'outline' as const,
          color: 'text-gray-500',
          tooltip: 'WebSocket status unknown'
        };
    }
  };
  
  const statusConfig = getStatusConfig();
  
  const statusContent = (
    <Badge 
      variant={statusConfig.variant} 
      className={`flex items-center gap-1.5 ${statusConfig.color} ${className}`}
    >
      {statusConfig.icon}
      {showLabel && (
        <span className="text-xs">{statusConfig.label}</span>
      )}
    </Badge>
  );
  
  return (
    <div className="flex items-center gap-2">
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {statusContent}
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusConfig.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        statusContent
      )}
      
      {showReconnect && (status === 'disconnected' || status === 'error') && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={handleReconnect}
          disabled={isReconnecting}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
          <span className="sr-only">Reconnect</span>
        </Button>
      )}
    </div>
  );
}