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
import { useEffect, useState } from 'react';
import { useWebSocket as useNewWebSocket } from '../hooks/use-websocket';

// Export types that match the old interface
export type WebSocketEventHandler = (event: MessageEvent) => void;
export type WebSocketErrorHandler = (error: Event) => void;
export type WebSocketStatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

// Define the interface for the WebSocket handlers
interface WebSocketHandlers {
  onMessage?: WebSocketEventHandler;
  onError?: WebSocketErrorHandler;
  onStatusChange?: WebSocketStatusHandler;
}

/**
 * Creates a MessageEvent-like object that's safe to use with TypeScript
 */
function createMessageEventLike(data: any): MessageEvent {
  // Create a real MessageEvent by using MessageChannel
  const channel = new MessageChannel();
  const msg = typeof data === 'string' ? data : JSON.stringify(data);
  
  // We have to post a message to create a real event
  // This is the safest way to create a MessageEvent that TypeScript accepts
  channel.port1.onmessage = null; // to make TypeScript happy
  channel.port2.postMessage(msg);
  
  // Create the event using the MessageEvent constructor
  return new MessageEvent('message', {
    data: msg,
    origin: window.location.origin,
    lastEventId: '',
    source: null,
    ports: []
  });
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
    // Create a proper MessageEvent for handlers
    const event = createMessageEventLike(data);
    
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
    // Create a real Error Event
    const event = new ErrorEvent('error', { error });
    
    // Notify all handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (err) {
        console.error('[WebSocketService] Error in error handler:', err);
      }
    });
  }
}

// Export the singleton instance
export const webSocketService = WebSocketServiceCompat.getInstance();

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
    // Connect to the WebSocket service
    webSocketService.connect(handlers);
    
    // No need for cleanup as the new hook handles it
  }, [handlers]);
  
  return {
    status,
    send: webSocket.sendMessage,
    disconnect: webSocket.disconnect
  };
}