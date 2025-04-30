/**
 * WebSocket Service - DEPRECATED
 * 
 * This service is deprecated and has been replaced by mcp-websocket-client.ts.
 * Use mcpWebSocketClient or WebSocketProvider in new code.
 * 
 * This file is kept for backward compatibility and will be removed in a future release.
 */

import { WS_PATH } from '../config/constants';
import { mcpWebSocketClient } from './mcp-websocket-client';

// Re-export types that match the old interface
export type WebSocketEventHandler = (event: MessageEvent) => void;
export type WebSocketErrorHandler = (error: Event) => void;
export type WebSocketStatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

// Define the interface for the WebSocket handlers
interface WebSocketHandlers {
  onMessage?: WebSocketEventHandler;
  onError?: WebSocketErrorHandler;
  onStatusChange?: WebSocketStatusHandler;
}

// Create a compatibility layer that uses the new mcpWebSocketClient
class WebSocketServiceCompat {
  private static instance: WebSocketServiceCompat;
  private messageHandlers: Set<WebSocketEventHandler> = new Set();
  private errorHandlers: Set<WebSocketErrorHandler> = new Set();
  private statusHandlers: Set<WebSocketStatusHandler> = new Set();
  
  private constructor() {
    // Initialize event listeners for the new client
    mcpWebSocketClient.on('message', this.handleMessage.bind(this));
    mcpWebSocketClient.on('status', this.handleStatus.bind(this));
    mcpWebSocketClient.on('error', this.handleError.bind(this));
  }
  
  public static getInstance(): WebSocketServiceCompat {
    if (!WebSocketServiceCompat.instance) {
      WebSocketServiceCompat.instance = new WebSocketServiceCompat();
    }
    return WebSocketServiceCompat.instance;
  }
  
  /**
   * Connect to the WebSocket server
   */
  public connect(handlers: WebSocketHandlers = {}): void {
    console.warn('[WebSocketService] This service is deprecated. Please use mcpWebSocketClient instead.');
    
    // Register handlers
    if (handlers.onMessage) {
      this.messageHandlers.add(handlers.onMessage);
    }
    
    if (handlers.onError) {
      this.errorHandlers.add(handlers.onError);
    }
    
    if (handlers.onStatusChange) {
      this.statusHandlers.add(handlers.onStatusChange);
    }
    
    // Initialize the new client
    mcpWebSocketClient.initialize();
  }
  
  /**
   * Send a message through the WebSocket
   */
  public send(data: any): boolean {
    return mcpWebSocketClient.send(data);
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    // Clear handlers
    this.messageHandlers.clear();
    this.errorHandlers.clear();
    this.statusHandlers.clear();
    
    // Disconnect the new client
    mcpWebSocketClient.disconnect();
  }
  
  /**
   * Handle messages from the new client
   */
  private handleMessage(data: any): void {
    // Create a message event-like object for backwards compatibility
    const eventData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Notify all handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('[WebSocketService] Error in message handler:', error);
      }
    });
  }
  
  /**
   * Handle status changes from the new client
   */
  private handleStatus(data: { status: 'connected' | 'disconnected' | 'connecting' | 'error' }): void {
    // Notify all handlers
    this.statusHandlers.forEach(handler => {
      try {
        handler(data.status);
      } catch (error) {
        console.error('[WebSocketService] Error in status handler:', error);
      }
    });
  }
  
  /**
   * Handle errors from the new client
   */
  private handleError(error: any): void {
    // Create a synthetic Event for backwards compatibility
    const event = new Event('error');
    
    // Notify all handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('[WebSocketService] Error in error handler:', error);
      }
    });
  }
}

// Export the singleton instance
export const webSocketService = WebSocketServiceCompat.getInstance();

// Export a React hook for the WebSocket service
import { useEffect, useState } from 'react';
import { useWebSocket as useNewWebSocket } from '../hooks/use-websocket';

// Compatibility hook that uses the new implementation
export function useWebSocket(handlers: WebSocketHandlers = {}) {
  console.warn('[useWebSocket] This hook is deprecated. Please use useWebSocket from hooks/use-websocket instead.');
  
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  // Use the new hook
  const webSocket = useNewWebSocket();
  
  // Map the new status to the old format
  useEffect(() => {
    setStatus(webSocket.status);
  }, [webSocket.status]);
  
  // Register handlers on mount
  useEffect(() => {
    if (handlers.onMessage) {
      // Create a wrapper to convert the data format
      const handleMessage = (data: any) => {
        const event = {
          data: typeof data === 'string' ? data : JSON.stringify(data),
          origin: window.location.origin,
          lastEventId: '',
          source: null,
          ports: []
        } as MessageEvent;
        
        handlers.onMessage!(event);
      };
      
      // No need to register this as the new hook handles it
    }
    
    if (handlers.onStatusChange) {
      // Will be handled by the status effect above
    }
    
    // We don't need to do cleanup as the new hook handles it
  }, [handlers]);
  
  return {
    status,
    send: webSocket.sendMessage,
    disconnect: webSocket.disconnect
  };
}