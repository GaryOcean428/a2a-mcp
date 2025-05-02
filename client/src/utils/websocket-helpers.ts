/**
 * WebSocket Helper Functions
 * 
 * This module provides helper functions for working with WebSockets,
 * including connection management, error handling, and reconnection.
 */

import { version } from '../version';

// Types for WebSocket events
type WebSocketMessageHandler = (event: MessageEvent) => void;
type WebSocketErrorHandler = (error: Event) => void;
type WebSocketStatusChangeHandler = (status: WebSocketStatus) => void;

// WebSocket connection status
export enum WebSocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

/**
 * Create a managed WebSocket connection with proper error handling
 * and reconnection capabilities.
 */
export function createManagedWebSocket(url: string, options: {
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onMessage?: WebSocketMessageHandler;
  onError?: WebSocketErrorHandler;
  onClose?: (event: CloseEvent) => void;
  onStatusChange?: WebSocketStatusChangeHandler;
  autoReconnect?: boolean;
}) {
  const {
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    protocols,
    onOpen,
    onMessage,
    onError,
    onClose,
    onStatusChange,
    autoReconnect = true
  } = options;
  
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let forceClose = false;
  
  // Add version info to URL for cache busting
  const versionedUrl = url.includes('?') ? 
    `${url}&v=${version}` : 
    `${url}?v=${version}`;
  
  function connect() {
    if (ws !== null) {
      // Close existing connection if any
      try { ws.close(); } catch (e) {}
    }
    
    if (onStatusChange) {
      onStatusChange(WebSocketStatus.CONNECTING);
    }
    
    try {
      ws = new WebSocket(versionedUrl, protocols);
      
      ws.onopen = (event) => {
        reconnectAttempts = 0;
        if (onStatusChange) {
          onStatusChange(WebSocketStatus.CONNECTED);
        }
        if (onOpen) {
          onOpen(event);
        }
      };
      
      ws.onmessage = (event) => {
        if (onMessage) {
          onMessage(event);
        }
      };
      
      ws.onerror = (event) => {
        if (onStatusChange) {
          onStatusChange(WebSocketStatus.ERROR);
        }
        if (onError) {
          onError(event);
        }
      };
      
      ws.onclose = (event) => {
        if (onStatusChange) {
          onStatusChange(WebSocketStatus.DISCONNECTED);
        }
        if (onClose) {
          onClose(event);
        }
        
        ws = null;
        
        // Attempt reconnection if not force closed
        if (autoReconnect && !forceClose && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = reconnectInterval * Math.pow(1.5, reconnectAttempts - 1);
          console.log(`WebSocket reconnect attempt ${reconnectAttempts} in ${delay}ms...`);
          
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
          }
          
          reconnectTimeout = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      if (onStatusChange) {
        onStatusChange(WebSocketStatus.ERROR);
      }
      if (onError) {
        onError(new Event('error'));
      }
      
      // Attempt reconnection
      if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = reconnectInterval * Math.pow(1.5, reconnectAttempts - 1);
        console.log(`WebSocket reconnect attempt ${reconnectAttempts} in ${delay}ms...`);
        
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        
        reconnectTimeout = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }
  
  function sendMessage(data: any) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }
  
  function sendPing() {
    return sendMessage({ type: 'ping', data: { timestamp: Date.now() } });
  }
  
  function close() {
    forceClose = true;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    if (ws) {
      try {
        ws.close();
      } catch (e) {
        console.error('Error closing WebSocket:', e);
      }
      ws = null;
    }
  }
  
  // Connect immediately
  connect();
  
  return {
    connect,
    sendMessage,
    sendPing,
    close,
    getStatus: () => {
      if (!ws) return WebSocketStatus.DISCONNECTED;
      
      switch (ws.readyState) {
        case WebSocket.CONNECTING:
          return WebSocketStatus.CONNECTING;
        case WebSocket.OPEN:
          return WebSocketStatus.CONNECTED;
        default:
          return WebSocketStatus.DISCONNECTED;
      }
    }
  };
}

/**
 * Simple utility to test WebSocket connection
 */
export function testWebSocketConnection(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(url);
      const timeoutId = setTimeout(() => {
        resolve(false);
        try { ws.close(); } catch (e) {}
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeoutId);
        ws.close();
        resolve(true);
      };
      
      ws.onerror = () => {
        clearTimeout(timeoutId);
        try { ws.close(); } catch (e) {}
        resolve(false);
      };
    } catch (err) {
      console.error('Error in WebSocket test:', err);
      resolve(false);
    }
  });
}

/**
 * Utility to get the appropriate WebSocket URL
 */
export function getWebSocketUrl(path: string = "/mcp-ws"): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}${path}`;
}
