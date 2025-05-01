/**
 * MCP Integration Platform - WebSocket Utilities
 * 
 * This utility provides helper functions for WebSocket connections,
 * including error handling and cleanup.
 */

import { logger } from './logger';

// Message structure for WebSocket communication
export interface WebSocketMessage {
  id?: string;
  type?: string;
  action?: string;
  payload?: any;
  success?: boolean;
  error?: string | { message: string };
  schemas?: any[];
}

// Connection status structure
export interface ConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  error?: Error | { message: string };
}

// WebSocket error structure
export interface WebSocketError {
  message: string;
  code?: number;
  event?: Event;
}

/**
 * Get a normalized WebSocket URL from the current page
 */
export function getWebSocketUrl(path: string): string {
  // Determine the WebSocket protocol (wss for HTTPS, ws for HTTP)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${protocol}//${host}${normalizedPath}`;
}

/**
 * Check if a WebSocket is in the OPEN state
 */
export function isWebSocketReady(socket: WebSocket | null): boolean {
  return socket !== null && socket.readyState === WebSocket.OPEN;
}

/**
 * Handle WebSocket errors consistently
 */
export function handleWebSocketError(event: Event): string {
  // Extract information from the error event
  let errorMessage = 'Unknown WebSocket error';
  
  if (event instanceof ErrorEvent) {
    errorMessage = event.message || 'WebSocket error event';
  } else if (event instanceof CloseEvent) {
    const reason = event.reason || getWebSocketCloseReason(event.code);
    errorMessage = `WebSocket closed: ${event.code} ${reason}`;
  }
  
  logger.error('WebSocket error occurred', {
    tags: ['websocket', 'error'],
    error: event,
    data: { errorMessage }
  });
  
  return errorMessage;
}

/**
 * Get a human-readable explanation for a WebSocket close code
 */
export function getWebSocketCloseReason(code: number): string {
  switch (code) {
    case 1000:
      return 'Normal closure';
    case 1001:
      return 'Going away';
    case 1002:
      return 'Protocol error';
    case 1003:
      return 'Unsupported data';
    case 1005:
      return 'No status received';
    case 1006:
      return 'Abnormal closure';
    case 1007:
      return 'Invalid frame payload data';
    case 1008:
      return 'Policy violation';
    case 1009:
      return 'Message too big';
    case 1010:
      return 'Extension required';
    case 1011:
      return 'Internal server error';
    case 1012:
      return 'Service restart';
    case 1013:
      return 'Try again later';
    case 1014:
      return 'Bad gateway';
    case 1015:
      return 'TLS handshake error';
    default:
      return 'Unknown close reason';
  }
}

/**
 * Create a standard WebSocket error
 */
export function createWebSocketError(message: string, code?: number, event?: Event): WebSocketError {
  return {
    message,
    code,
    event
  };
}

/**
 * Setup a keepalive ping for a WebSocket connection
 * Returns a cleanup function to cancel the keepalive
 */
export function setupWebSocketKeepalive(
  socket: WebSocket,
  sendFn: (msg: any) => boolean,
  interval: number = 30000 // 30 seconds by default
): () => void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    logger.warn('Cannot setup keepalive on closed WebSocket', {
      tags: ['websocket', 'keepalive']
    });
    return () => {};
  }
  
  logger.debug('Setting up WebSocket keepalive', {
    tags: ['websocket', 'keepalive'],
    data: { intervalMs: interval }
  });
  
  // Create the ping message with timestamp
  const createPingMessage = () => ({
    type: 'ping',
    data: { timestamp: Date.now() }
  });
  
  // Send an initial ping right away
  sendFn(createPingMessage());
  
  // Set up the interval for regular pings
  const intervalId = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      sendFn(createPingMessage());
    } else {
      // If the socket is no longer open, clear the interval
      clearInterval(intervalId);
    }
  }, interval);
  
  // Return a cleanup function
  return () => {
    clearInterval(intervalId);
    logger.debug('WebSocket keepalive cleanup', {
      tags: ['websocket', 'keepalive']
    });
  };
}
