import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mcpWebSocketClient } from '../utils/mcp-websocket-client';

type WebSocketStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

interface WebSocketContextValue {
  status: WebSocketStatus;
  isConnected: boolean;
  schemas: any[];
  sendMessage: (message: any) => boolean;
  connect: () => void;
  disconnect: () => void;
}

// Create context with default values
const WebSocketContext = createContext<WebSocketContextValue>({
  status: 'disconnected',
  isConnected: false,
  schemas: [],
  sendMessage: () => false,
  connect: () => {},
  disconnect: () => {},
});

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

/**
 * WebSocket Provider Component
 * 
 * This component provides a React context for WebSocket functionality.
 * It manages the connection state and exposes methods for interacting with
 * the WebSocket client.
 */
export function WebSocketProvider({ 
  children, 
  autoConnect = true 
}: WebSocketProviderProps) {
  const [status, setStatus] = useState<WebSocketStatus>(
    mcpWebSocketClient.getStatus().status
  );
  const [schemas, setSchemas] = useState<any[]>([]);

  // Initialize WebSocket client
  useEffect(() => {
    if (autoConnect) {
      mcpWebSocketClient.initialize();
    }
    
    // Update status when it changes
    const handleStatusChange = (data: { status: WebSocketStatus }) => {
      setStatus(data.status);
    };
    
    // Update schemas when they are received
    const handleSchemas = (receivedSchemas: any[]) => {
      setSchemas(receivedSchemas);
    };
    
    // Add event listeners
    mcpWebSocketClient.on('status', handleStatusChange);
    mcpWebSocketClient.on('schemas', handleSchemas);
    
    // Initial status
    setStatus(mcpWebSocketClient.getStatus().status);
    
    // Clean up on unmount
    return () => {
      mcpWebSocketClient.off('status', handleStatusChange);
      mcpWebSocketClient.off('schemas', handleSchemas);
      
      if (!autoConnect) {
        mcpWebSocketClient.disconnect();
      }
    };
  }, [autoConnect]);

  // Send a message through the WebSocket
  const sendMessage = (message: any): boolean => {
    return mcpWebSocketClient.send(message);
  };

  // Connect the WebSocket
  const connect = () => {
    mcpWebSocketClient.initialize();
  };

  // Disconnect the WebSocket
  const disconnect = () => {
    mcpWebSocketClient.disconnect();
  };

  // Calculate derived state
  const isConnected = status === 'connected';

  // The context value
  const contextValue: WebSocketContextValue = {
    status,
    isConnected,
    schemas,
    sendMessage,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook for consuming the WebSocket context
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}