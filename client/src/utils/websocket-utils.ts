/**
 * MCP Integration Platform - WebSocket Utilities
 * 
 * This module provides helper functions for working with WebSockets
 * and handling common WebSocket-related tasks.
 */

/**
 * Standard WebSocket message structure
 */
export interface WebSocketMessage {
  id?: string;
  type?: string;
  action?: string;
  data?: Record<string, any>;
  timestamp?: number;
  success?: boolean;
  error?: string | Error | Record<string, any>;
  [key: string]: any;
}

/**
 * WebSocket connection status
 */
export type ConnectionStatus = 
  | { status: 'connected' }
  | { status: 'connecting' }
  | { status: 'disconnected' }
  | { status: 'error'; error: Error | string | unknown };

/**
 * WebSocket error with metadata
 */
export interface WebSocketError {
  message: string;
  code?: number;
  originalError?: unknown;
  timestamp?: number;
}

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
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

/**
 * Get WebSocket close reason from code
 */
export function getWebSocketCloseReason(code: number): string {
  const closeReasons: Record<number, string> = {
    1000: 'Normal closure',
    1001: 'Going away',
    1002: 'Protocol error',
    1003: 'Unsupported data',
    1004: 'Reserved',
    1005: 'No status received',
    1006: 'Abnormal closure',
    1007: 'Invalid frame payload data',
    1008: 'Policy violation',
    1009: 'Message too big',
    1010: 'Mandatory extension',
    1011: 'Internal server error',
    1012: 'Service restart',
    1013: 'Try again later',
    1014: 'Bad gateway',
    1015: 'TLS handshake',
  };
  
  return closeReasons[code] || `Unknown close code: ${code}`;
}

/**
 * Handle common WebSocket errors
 */
export function handleWebSocketError(error: unknown): string {
  let errorMessage = 'Unknown WebSocket error';
  
  if (error instanceof Event) {
    errorMessage = 'WebSocket connection error';
  } else if (error instanceof DOMException) {
    errorMessage = `WebSocket error: ${error.message}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as {message: unknown}).message);
  }
  
  console.error(`[WebSocket] ${errorMessage}`);
  return errorMessage;
}

/**
 * Create a structured error object from WebSocket error
 */
export function createWebSocketError(error: unknown): WebSocketError {
  const message = handleWebSocketError(error);
  
  return {
    message,
    originalError: error,
    timestamp: Date.now(),
    code: error instanceof CloseEvent ? error.code : undefined
  };
}
