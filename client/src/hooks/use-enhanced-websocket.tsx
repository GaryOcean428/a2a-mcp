/**
 * MCP Integration Platform - Enhanced WebSocket Hook
 * 
 * This hook provides a React interface to the enhanced WebSocket client with
 * automatic reconnection, error handling, and integration with React state.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { EnhancedWebSocketClient, getWebSocketClient } from '../utils/websocket-enhanced-client';

interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  protocols?: string | string[];
  debug?: boolean;
}

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  reconnectAttempts: number;
}

interface UseWebSocketReturn {
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => boolean;
  sendJson: (data: any) => boolean;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  subscribe: (eventName: string, handler: (data: any) => void) => () => void;
  state: WebSocketState;
}

/**
 * React hook for using the enhanced WebSocket client
 */
export function useEnhancedWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    autoConnect = true,
    reconnect = true,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    protocols,
    debug = false,
  } = options;

  // Store client reference to prevent recreation on each render
  const clientRef = useRef<EnhancedWebSocketClient | null>(null);
  
  // Track WebSocket state in React state
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0,
  });
  
  // Initialize client reference if not already set
  if (!clientRef.current) {
    clientRef.current = getWebSocketClient({
      reconnect,
      maxReconnectAttempts,
      debug,
    });
  }
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!clientRef.current) return;
    
    setState(prev => ({ ...prev, connecting: true }));
    clientRef.current.connect(url, protocols);
  }, [url, protocols]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (!clientRef.current) return;
    
    clientRef.current.close();
    setState(prev => ({ ...prev, connected: false, connecting: false }));
  }, []);
  
  // Reconnect to WebSocket
  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);
  
  // Send a message
  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean => {
    if (!clientRef.current) return false;
    return clientRef.current.send(data);
  }, []);
  
  // Send a JSON message
  const sendJson = useCallback((data: any): boolean => {
    if (!clientRef.current) return false;
    return clientRef.current.sendJson(data);
  }, []);
  
  // Subscribe to an event
  const subscribe = useCallback((eventName: string, handler: (data: any) => void) => {
    if (!clientRef.current) return () => {};
    return clientRef.current.on(eventName, handler);
  }, []);
  
  // Set up event handlers
  useEffect(() => {
    if (!clientRef.current) return;
    
    const client = clientRef.current;
    
    // Message handler
    const messageHandler = (data: any) => {
      if (onMessage) onMessage(data);
    };
    
    // Connection handler
    const connectionHandler = () => {
      setState(prev => ({ 
        ...prev, 
        connected: true, 
        connecting: false,
        error: null,
      }));
      
      if (onConnect) onConnect();
    };
    
    // Disconnection handler
    const disconnectionHandler = () => {
      setState(prev => ({ 
        ...prev, 
        connected: false, 
        connecting: false,
      }));
      
      if (onDisconnect) onDisconnect();
    };
    
    // Error handler
    const errorHandler = (error: Error) => {
      setState(prev => ({ 
        ...prev, 
        error,
        connecting: false,
      }));
      
      if (onError) onError(error);
    };
    
    // Register handlers
    const unsubscribeMessage = client.onMessage(messageHandler);
    const unsubscribeConnect = client.onConnect(connectionHandler);
    const unsubscribeDisconnect = client.onDisconnect(disconnectionHandler);
    const unsubscribeError = client.onError(errorHandler);
    
    // Connect if autoConnect is true
    if (autoConnect) {
      connect();
    }
    
    // Cleanup
    return () => {
      unsubscribeMessage();
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, [autoConnect, connect, onConnect, onDisconnect, onError, onMessage]);
  
  // Sync client state with React state
  useEffect(() => {
    if (!clientRef.current) return;
    
    const interval = setInterval(() => {
      const clientState = clientRef.current?.getState();
      if (clientState) {
        setState(prev => ({
          ...prev,
          connected: clientState.connected,
          connecting: clientState.connecting,
          reconnectAttempts: clientState.reconnectAttempts,
          error: clientState.lastError || null,
        }));
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    send,
    sendJson,
    connect,
    disconnect,
    reconnect,
    subscribe,
    state,
  };
}
