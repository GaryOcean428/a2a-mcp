/**
 * MCP Integration Platform - WebSocket Reconnect Manager
 * 
 * This component monitors WebSocket connections and provides automatic recovery
 * mechanisms with visual feedback to the user.
 */

import { useEffect, useState } from 'react';
import { useWebSocketContext } from './WebSocketProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

// Create a simple inline spinner component instead of importing
const Spinner = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-spin rounded-full border-2 border-solid border-primary border-t-transparent h-4 w-4 ${className}`}
  >
    <span className="sr-only">Loading...</span>
  </div>
);

interface WebSocketReconnectManagerProps {
  /**
   * Suppress visual alerts when WebSocket is disconnected
   * @default false
   */
  silent?: boolean;
  
  /**
   * Threshold in seconds for showing a connection warning
   * @default 10
   */
  warningThreshold?: number;
  
  /**
   * Maximum number of automatic reconnection attempts
   * @default 5
   */
  maxReconnectAttempts?: number;
}

/**
 * WebSocket Reconnect Manager Component
 * 
 * Monitors WebSocket connection state and provides automatic reconnection with
 * visual feedback to the user. Displays error messages and reconnection status
 * when connection issues are detected.
 */
export function WebSocketReconnectManager({
  silent = false,
  warningThreshold = 10,
  maxReconnectAttempts = 5,
}: WebSocketReconnectManagerProps) {
  // Access WebSocket context
  const { isConnected, status, error, reconnect } = useWebSocketContext();
  
  // Local state
  const [showAlert, setShowAlert] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [disconnectedTime, setDisconnectedTime] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  // Monitor connection state
  useEffect(() => {
    if (!isConnected && status !== 'connecting') {
      // Start tracking disconnection time
      if (disconnectedTime === null) {
        setDisconnectedTime(Date.now());
      }
      
      // Show alert after threshold
      const checkTimer = setTimeout(() => {
        if (!silent && disconnectedTime !== null) {
          const disconnectedSeconds = Math.floor((Date.now() - disconnectedTime) / 1000);
          
          if (disconnectedSeconds >= warningThreshold) {
            setShowAlert(true);
            
            // Only show toast once
            if (!showAlert) {
              toast({
                title: 'Connection issue detected',
                description: 'The WebSocket connection was lost. Attempting to reconnect...',
                variant: 'destructive',
              });
            }
          }
        }
      }, 1000);
      
      return () => clearTimeout(checkTimer);
    } else if (isConnected) {
      // Reset state when connected
      setShowAlert(false);
      setIsReconnecting(false);
      setReconnectAttempts(0);
      setDisconnectedTime(null);
    }
  }, [isConnected, status, disconnectedTime, showAlert, silent, warningThreshold, toast]);
  
  // Handle reconnection
  const handleReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      logger.warn(`[WebSocketReconnect] Maximum reconnect attempts (${reconnectAttempts}) reached`);
      
      toast({
        title: 'Reconnection failed',
        description: 'Maximum reconnection attempts reached. Please refresh the page.',
        variant: 'destructive',
      });
      
      return;
    }
    
    setIsReconnecting(true);
    setReconnectAttempts(prev => prev + 1);
    
    logger.info(`[WebSocketReconnect] Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
    
    // Attempt reconnection
    reconnect();
    
    // Reset reconnecting state after a delay if still not connected
    setTimeout(() => {
      if (!isConnected) {
        setIsReconnecting(false);
      }
    }, 5000);
  };
  
  if (!showAlert || silent) {
    return null;
  }
  
  return (
    <Alert className="fixed bottom-4 right-4 w-96 z-50 bg-destructive/10 border-destructive/50 shadow-lg">
      <AlertTitle className="flex items-center text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        WebSocket Connection Error
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm mb-3">
          {error ? `Error: ${error.message}` : 'The connection to the server was lost. This may affect real-time updates.'}
        </p>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlert(false)}
            className="text-xs"
          >
            Dismiss
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="text-xs"
          >
            {isReconnecting ? (
              <>
                <Spinner className="mr-2 h-3 w-3" />
                Reconnecting...
              </>
            ) : (
              'Reconnect Now'
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default WebSocketReconnectManager;
