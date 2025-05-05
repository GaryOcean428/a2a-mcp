import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { EnhancedWebSocketClient, WebSocketState, createWebSocketUrl } from '@/lib/websocket-system';

/**
 * WebSocket Context Interface
 */
interface WebSocketContextType {
  /**
   * Whether the WebSocket is connected
   */
  isConnected: boolean;
  
  /**
   * Current WebSocket connection status
   */
  status: WebSocketState;
  
  /**
   * Last error encountered
   */
  error: Error | null;
  
  /**
   * Send a message through the WebSocket
   */
  send: (message: any) => boolean;
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  reconnect: () => void;
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect: () => void;
}

/**
 * WebSocket Provider Props
 */
interface WebSocketProviderProps {
  /**
   * WebSocket endpoint path
   * @default '/mcp-ws'
   */
  path?: string;
  
  /**
   * Whether to automatically connect on mount
   * @default true
   */
  autoConnect?: boolean;
  
  /**
   * Children components
   */
  children: React.ReactNode;
}

// Create WebSocket context
const WebSocketContext = createContext<WebSocketContextType | null>(null);

/**
 * Enhanced WebSocket Provider
 * 
 * Provides WebSocket functionality to the entire application with
 * automatic reconnection and error handling.
 */
export const WebSocketProviderNew: React.FC<WebSocketProviderProps> = ({
  path = '/mcp-ws',
  autoConnect = true,
  children
}) => {
  // State
  const [client, setClient] = useState<EnhancedWebSocketClient | null>(null);
  const [status, setStatus] = useState<WebSocketState>(WebSocketState.DISCONNECTED);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize client
  useEffect(() => {
    const wsUrl = createWebSocketUrl(path);
    
    const wsClient = new EnhancedWebSocketClient({
      url: wsUrl,
      autoReconnect: true,
      onOpen: () => {
        setStatus(WebSocketState.CONNECTED);
        setError(null);
      },
      onClose: () => {
        setStatus(WebSocketState.DISCONNECTED);
      },
      onError: (err) => {
        setStatus(WebSocketState.ERROR);
        setError(err instanceof Error ? err : new Error(String(err)));
      },
      onMessage: (message) => {
        // Messages are handled through event listeners
      }
    });
    
    setClient(wsClient);
    
    // Auto-connect if enabled
    if (autoConnect) {
      wsClient.connect();
    }
    
    // Clean up on unmount
    return () => {
      wsClient.disconnect();
    };
  }, [path, autoConnect]);
  
  // Update status when client changes
  useEffect(() => {
    if (!client) return;
    
    const updateState = () => {
      setStatus(client.getState());
    };
    
    // Listen for state changes
    client.on('open', updateState);
    client.on('close', updateState);
    client.on('error', updateState);
    
    return () => {
      // Remove listeners
      client.off('open', updateState);
      client.off('close', updateState);
      client.off('error', updateState);
    };
  }, [client]);
  
  // Create context value
  const contextValue = useMemo<WebSocketContextType>(() => ({
    isConnected: status === WebSocketState.CONNECTED,
    status,
    error,
    send: (message: any) => {
      if (!client) return false;
      return client.send(message);
    },
    reconnect: () => {
      if (!client) return;
      client.reconnect();
    },
    disconnect: () => {
      if (!client) return;
      client.disconnect();
    }
  }), [client, status, error]);
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook to use WebSocket context
 * @throws Error if used outside of WebSocketProvider
 */
export function useWebSocketContext(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  
  return context;
}

export default WebSocketProviderNew;