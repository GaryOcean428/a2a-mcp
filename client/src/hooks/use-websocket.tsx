/**
 * MCP Integration Platform - WebSocket Hook
 * 
 * This hook provides a React interface to the WebSocket client,
 * with proper lifecycle management and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { mcpWebSocketClient } from '@/utils/mcp-websocket-client';
import { useErrorHandler } from './use-error-handler';
import { logger } from '@/utils/logger';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
type MessageHandler = (data: any) => void;

interface UseWebSocketOptions {
  // Whether to connect automatically when the component mounts
  autoConnect?: boolean;
  // Whether to handle errors automatically
  handleErrors?: boolean;
  // Event handlers for different connection states
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  // Whether to reconnect automatically on errors or disconnects
  autoReconnect?: boolean;
}

interface WebSocketHook {
  // Current connection status
  status: ConnectionStatus;
  // Last error that occurred
  error: Error | null;
  // Whether the WebSocket is currently connected
  isConnected: boolean;
  // Connect to the WebSocket server
  connect: () => void;
  // Disconnect from the WebSocket server
  disconnect: () => void;
  // Send a message to the server
  send: (message: any) => boolean;
  // Listen for messages of a specific type
  on: (event: string, handler: MessageHandler) => void;
  // Remove a message handler
  off: (event: string, handler: MessageHandler) => void;
}

/**
 * React hook for WebSocket communication
 */
export function useWebSocket(options: UseWebSocketOptions = {}): WebSocketHook {
  // Destructure options with defaults
  const {
    autoConnect = true,
    handleErrors = true,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true
  } = options;
  
  // Connection status state
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  
  // Use our error handler
  const errorHandler = useErrorHandler({
    module: 'WebSocket',
    tags: ['websocket', 'hook'],
    showToast: handleErrors,
    defaultMessages: {
      network: 'Lost connection to server. Attempting to reconnect...',
      server: 'Server communication error. Please try again later.',
      unknown: 'WebSocket error occurred. Please refresh the page.'
    }
  });
  
  // Handle status changes from the WebSocket client
  const handleStatus = useCallback((data: any) => {
    if (data.status === 'connected') {
      setStatus('connected');
      setError(null);
      if (onConnect) onConnect();
    } else if (data.status === 'disconnected') {
      setStatus('disconnected');
      if (onDisconnect) onDisconnect();
    } else if (data.status === 'error') {
      setStatus('error');
      if (data.error) {
        const wsError = new Error(data.error.message || 'WebSocket error');
        setError(wsError);
        
        if (handleErrors) {
          errorHandler.handleError(wsError);
        }
        
        if (onError) onError(data.error);
      }
    }
  }, [onConnect, onDisconnect, onError, handleErrors, errorHandler]);
  
  // Connect to the WebSocket
  const connect = useCallback(() => {
    setStatus('connecting');
    logger.info('Connecting to WebSocket server', { tags: ['websocket', 'connect'] });
    mcpWebSocketClient.initialize();
  }, []);
  
  // Disconnect from the WebSocket
  const disconnect = useCallback(() => {
    logger.info('Disconnecting from WebSocket server', { tags: ['websocket', 'disconnect'] });
    mcpWebSocketClient.disconnect();
    setStatus('disconnected');
  }, []);
  
  // Helper to check if connected
  const isConnected = status === 'connected';
  
  // Send a message to the server
  const send = useCallback((message: any): boolean => {
    if (!isConnected) {
      logger.warn('Cannot send message: WebSocket not connected', {
        tags: ['websocket', 'send-error']
      });
      return false;
    }
    
    return mcpWebSocketClient.send(message);
  }, [isConnected]);
  
  // Register event handler
  const on = useCallback((event: string, handler: MessageHandler) => {
    mcpWebSocketClient.on(event, handler);
  }, []);
  
  // Remove event handler
  const off = useCallback((event: string, handler: MessageHandler) => {
    mcpWebSocketClient.off(event, handler);
  }, []);
  
  // Setup connection and event listeners when the component mounts
  useEffect(() => {
    // Always register the status handler
    mcpWebSocketClient.on('status', handleStatus);
    
    // Connect if autoConnect is enabled
    if (autoConnect) {
      connect();
    }
    
    // Cleanup when the component unmounts
    return () => {
      mcpWebSocketClient.off('status', handleStatus);
      
      // Only disconnect when we initiated the connection
      // This way, if multiple components use the hook,
      // they won't disconnect each other's connections
      if (autoConnect) {
        // Don't actually disconnect, just remove our listeners
        // This allows the WebSocket connection to be shared
        // between components
      }
    };
  }, [autoConnect, connect, handleStatus]);
  
  // Setup reconnection if autoReconnect is enabled
  useEffect(() => {
    if (!autoReconnect) return;
    
    // If we're disconnected or in error state, try to reconnect
    let reconnectTimeout: number | null = null;
    if ((status === 'disconnected' || status === 'error') && !error?.message?.includes('authenticated')) {
      reconnectTimeout = window.setTimeout(() => {
        logger.info('Auto-reconnecting WebSocket', { tags: ['websocket', 'reconnect'] });
        connect();
      }, 5000) as unknown as number; // 5 second delay
    }
    
    return () => {
      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [status, error, autoReconnect, connect]);
  
  return {
    status,
    error,
    isConnected,
    connect,
    disconnect,
    send,
    on,
    off
  };
}
