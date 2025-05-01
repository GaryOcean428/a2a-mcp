/**
 * MCP Integration Platform - WebSocket Provider
 * 
 * This component provides a WebSocket context for the entire application,
 * managing the connection and authentication state.
 */

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { logger } from '@/utils/logger';

interface WebSocketContextType {
  // Connection state
  isConnected: boolean;
  isAuthenticated: boolean;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  // Available schemas from the server
  schemas: any[];
  // Error state
  error: Error | null;
  // Methods
  reconnect: () => void;
  sendMessage: (message: any) => boolean;
}

// Create the context with a default value
const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  isAuthenticated: false,
  status: 'disconnected',
  schemas: [],
  error: null,
  reconnect: () => {},
  sendMessage: () => false
});

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

/**
 * WebSocket Provider Component
 */
export function WebSocketProvider({ children, autoConnect = true }: WebSocketProviderProps) {
  // State for schemas and authentication
  const [schemas, setSchemas] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Use our custom WebSocket hook
  const ws = useWebSocket({
    autoConnect,
    handleErrors: true,
    autoReconnect: true,
    onConnect: () => {
      logger.info('WebSocket connected', { tags: ['websocket', 'provider'] });
    },
    onDisconnect: () => {
      logger.info('WebSocket disconnected', { tags: ['websocket', 'provider'] });
      setIsAuthenticated(false);
    },
    onError: (error) => {
      logger.error('WebSocket error in provider', { 
        tags: ['websocket', 'provider', 'error'],
        error 
      });
      setIsAuthenticated(false);
    }
  });
  
  // Handler for schema updates
  const handleSchemas = (data: any) => {
    if (Array.isArray(data)) {
      logger.debug('Received schemas from server', { 
        tags: ['websocket', 'schemas'],
        data: { count: data.length } 
      });
      setSchemas(data);
    }
  };
  
  // Handler for auth responses
  const handleAuth = (data: any) => {
    setIsAuthenticated(data.success === true);
    if (data.success) {
      logger.info('WebSocket authenticated', { tags: ['websocket', 'auth'] });
    } else {
      logger.warn('WebSocket authentication failed', { 
        tags: ['websocket', 'auth', 'error'],
        data: { error: data.error }
      });
    }
  };
  
  // Register event handlers
  useEffect(() => {
    ws.on('schemas', handleSchemas);
    ws.on('auth', handleAuth);
    
    return () => {
      ws.off('schemas', handleSchemas);
      ws.off('auth', handleAuth);
    };
  }, [ws]);
  
  // Provide the WebSocket context
  const contextValue: WebSocketContextType = {
    isConnected: ws.isConnected,
    isAuthenticated,
    status: ws.status,
    schemas,
    error: ws.error,
    reconnect: ws.connect,
    sendMessage: ws.send
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to use the WebSocket context
 */
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
