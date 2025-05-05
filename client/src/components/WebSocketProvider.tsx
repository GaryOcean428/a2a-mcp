/**
 * MCP Integration Platform - WebSocket Provider
 * 
 * DEPRECATED: This component has been replaced by WebSocketProviderNew.
 * This file remains only for backwards compatibility and will be removed in a future update.
 * 
 * Use WebSocketProviderNew from './WebSocketProviderNew' instead.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import WebSocketProviderNew, { useWebSocketContext as useNewWebSocketContext } from './WebSocketProviderNew';
import { logger } from '@/utils/logger';

// Re-export types from old implementation for API compatibility
interface WebSocketContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  schemas: any[];
  error: Error | null;
  reconnect: () => void;
  sendMessage: (message: any) => boolean;
}

// Create a context for compatibility
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
 * 
 * Legacy wrapper around the new WebSocketProviderNew component.
 */
export function WebSocketProvider({ children, autoConnect = true }: WebSocketProviderProps) {
  logger.warn('Using deprecated WebSocketProvider - please update to WebSocketProviderNew');
  
  return (
    <WebSocketProviderNew path="/mcp-ws" autoConnect={autoConnect}>
      {children}
    </WebSocketProviderNew>
  );
}

/**
 * Hook to use the WebSocket context
 * 
 * Legacy wrapper around the new useWebSocketContext hook.
 */
export function useWebSocketContext() {
  logger.warn('Using deprecated useWebSocketContext - please update to useWebSocketContext from WebSocketProviderNew');
  return useNewWebSocketContext();
}
