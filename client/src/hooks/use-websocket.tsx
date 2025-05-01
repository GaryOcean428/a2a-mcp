/**
 * MCP Integration Platform - WebSocket Hook
 * 
 * This hook provides a React context for WebSocket functionality across 
 * the application with automatic connection management.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mcpWebSocketClient } from '../utils/mcp-websocket-client';
import { WebSocketMessage, ConnectionStatus } from '../utils/websocket-utils';

// Define types specific to the hook
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export type WebSocketSchemaType = {
  name: string;
  description: string;
  annotations: {
    title: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
};

// Define the context props
interface WebSocketContextProps {
  status: WebSocketStatus;
  schemas: WebSocketSchemaType[];
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => boolean;
  reconnect: () => void;
  disconnect: () => void;
}

// Create the context
const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

// Define WebSocketProvider props
interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

// Context provider component
export function WebSocketProvider({ children, autoConnect = false }: WebSocketProviderProps) {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [schemas, setSchemas] = useState<WebSocketSchemaType[]>([]);
  
  // Handle incoming messages
  const handleMessage = (data: any) => {
    try {
      // If data is a string, parse it
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Set as last message
      setLastMessage(message);
      
      // Check for schemas message
      if (message && message.id === 'schemas' && Array.isArray(message.schemas)) {
        setSchemas(message.schemas);
        console.log(`Loaded ${message.schemas.length} tool schemas from WebSocket server`);
      }
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
    }
  };
  
  // Handle status changes from the ConnectionStatus type
  const handleStatus = (statusData: ConnectionStatus) => {
    // Map ConnectionStatus to WebSocketStatus
    const newStatus: WebSocketStatus = statusData.status;
    setStatus(newStatus);
    
    // Log status changes
    console.log(`[MCP WebSocket] ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
    
    // Additional error logging if available
    if (newStatus === 'error' && 'error' in statusData) {
      console.error('[WebSocket] Error details:', statusData.error);
    }
  };
  
  // Handle WebSocket errors
  const handleWsError = (error: unknown) => {
    setStatus('error');
    console.error('[WebSocket] Error:', error);
  };
  
  // Function to safely send messages via WebSocket
  const sendMessage = (message: WebSocketMessage): boolean => {
    if (mcpWebSocketClient) {
      return mcpWebSocketClient.send(message);
    }
    return false;
  };
  
  // Function to safely reconnect WebSocket
  const reconnect = () => {
    if (mcpWebSocketClient) {
      mcpWebSocketClient.reconnect();
    }
  };
  
  // Function to safely disconnect WebSocket
  const disconnect = () => {
    if (mcpWebSocketClient) {
      mcpWebSocketClient.disconnect();
    }
  };
  
  // Initialize the WebSocket connection when component mounts
  useEffect(() => {
    // Create stable event handlers to avoid reference issues with off() method
    const messageHandler = (data: unknown) => handleMessage(data);
    const statusHandler = (data: ConnectionStatus) => handleStatus(data);
    const errorHandler = (data: unknown) => handleWsError(data);
    
    // Set up handlers
    mcpWebSocketClient.on('message', messageHandler);
    mcpWebSocketClient.on('status', statusHandler);
    mcpWebSocketClient.on('error', errorHandler);
    
    // Initialize connection if autoConnect is true
    if (autoConnect) {
      mcpWebSocketClient.initialize();
    }
    
    // Cleanup on unmount
    return () => {
      mcpWebSocketClient.off('message', messageHandler);
      mcpWebSocketClient.off('status', statusHandler);
      mcpWebSocketClient.off('error', errorHandler);
      mcpWebSocketClient.disconnect();
    };
  }, [autoConnect]);
  
  // Define context value with safe function references
  const contextValue: WebSocketContextProps = {
    status,
    schemas,
    lastMessage,
    sendMessage,
    reconnect,
    disconnect
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook for using the WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
}