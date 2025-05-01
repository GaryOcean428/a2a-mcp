/**
 * MCP Integration Platform - WebSocket Utilities
 * 
 * This module provides helper functions for working with WebSockets
 * and handling common WebSocket-related tasks.
 */

import { WebSocketMessage } from '../hooks/use-websocket';

/**
 * Generate a WebSocket URL from the current window location
 * @param path The path to connect to (e.g., '/mcp-ws')
 */
export function getWebSocketUrl(path: string = '/mcp-ws'): string {
  try {
    // Use the same host as the current page
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Construct and validate the URL
    const url = `${protocol}//${host}${normalizedPath}`;
    
    if (!url || url.includes('undefined')) {
      throw new Error(`Invalid WebSocket URL generated: ${url}`);
    }
    
    return url;
  } catch (error) {
    console.error('[WebSocket] Error generating WebSocket URL:', error);
    throw error;
  }
}

/**
 * Create a ping message for keepalive
 */
export function createPingMessage(): WebSocketMessage {
  return {
    type: 'ping',
    data: {
      timestamp: Date.now()
    }
  };
}

/**
 * Check if a WebSocket is in a given ready state
 */
export function isWebSocketInState(socket: WebSocket | null, state: number): boolean {
  if (!socket) return false;
  return socket.readyState === state;
}

/**
 * Check if a WebSocket is ready to receive messages
 */
export function isWebSocketReady(socket: WebSocket | null): boolean {
  return isWebSocketInState(socket, WebSocket.OPEN);
}

/**
 * Setup a keepalive ping for a WebSocket connection
 */
export function setupWebSocketKeepalive(
  socket: WebSocket,
  sendFn: (msg: WebSocketMessage) => boolean,
  interval: number = 30000 // 30 seconds default
): () => void {
  if (!socket) return () => {};
  
  // Create the interval
  const intervalId = setInterval(() => {
    if (isWebSocketReady(socket)) {
      sendFn(createPingMessage());
    }
  }, interval);
  
  // Return a cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Handle common WebSocket errors
 */
export function handleWebSocketError(error: any): string {
  let errorMessage = 'Unknown WebSocket error';
  
  if (error instanceof Event) {
    errorMessage = 'WebSocket connection error';
  } else if (error instanceof DOMException) {
    errorMessage = `WebSocket error: ${error.message}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  console.error(`[WebSocket] ${errorMessage}`);
  return errorMessage;
}
