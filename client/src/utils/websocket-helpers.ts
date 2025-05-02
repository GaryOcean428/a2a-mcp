/**
 * MCP Integration Platform - WebSocket Helpers
 * 
 * Utility functions to work with WebSockets and handle reconnections and errors.
 */

/**
 * Create a WebSocket connection with enhanced error handling and reconnection
 */
export function createWebSocketWithReconnect(url: string, options?: {
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
}): WebSocket {
  const {
    protocols,
    onOpen,
    onMessage,
    onError,
    onClose,
    maxReconnectAttempts = 5,
    reconnectDelayMs = 3000,
  } = options || {};
  
  // Use enhanced WebSocket if available (from websocket-fix.ts), otherwise use standard WebSocket
  const ws = window.mcpWebSocketCreateEnhanced
    ? window.mcpWebSocketCreateEnhanced(url, protocols)
    : new WebSocket(url, protocols);
  
  // Track reconnection state
  let reconnectAttempt = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Internal logging
  const logWebSocketEvent = (type: string, data?: any) => {
    console.debug(`[WebSocket] ${type}`, data || '');
  };
  
  // Helper to attempt reconnection
  const attemptReconnect = () => {
    if (reconnectAttempt >= maxReconnectAttempts) {
      logWebSocketEvent('Max reconnect attempts reached');
      return;
    }
    
    reconnectAttempt++;
    const delay = reconnectDelayMs * Math.pow(1.5, reconnectAttempt - 1); // Exponential backoff
    
    logWebSocketEvent('Scheduling reconnect', { attempt: reconnectAttempt, delay });
    
    reconnectTimeout = setTimeout(() => {
      logWebSocketEvent('Attempting reconnect', { attempt: reconnectAttempt });
      
      // Create new connection
      const newWs = createWebSocketWithReconnect(url, options);
      
      // Replace the current WebSocket instance with the new one
      Object.defineProperties(ws, {
        readyState: { value: newWs.readyState },
        send: { value: newWs.send.bind(newWs) },
        close: { value: newWs.close.bind(newWs) },
      });
    }, delay);
  };
  
  // Set up event handlers
  ws.onopen = (event) => {
    logWebSocketEvent('Connected');
    reconnectAttempt = 0;
    if (onOpen) onOpen(event);
  };
  
  ws.onmessage = (event) => {
    if (onMessage) onMessage(event);
  };
  
  ws.onerror = (event) => {
    logWebSocketEvent('Error', event);
    if (onError) onError(event);
  };
  
  ws.onclose = (event) => {
    logWebSocketEvent('Closed', { code: event.code, reason: event.reason, wasClean: event.wasClean });
    
    // Don't reconnect on clean close
    if (!event.wasClean) {
      attemptReconnect();
    }
    
    if (onClose) onClose(event);
  };
  
  // Add helper methods
  const wsWithHelpers = ws as WebSocket & {
    cancelReconnect: () => void;
    forceReconnect: () => void;
  };
  
  wsWithHelpers.cancelReconnect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    reconnectAttempt = maxReconnectAttempts; // Prevent further reconnections
  };
  
  wsWithHelpers.forceReconnect = () => {
    wsWithHelpers.cancelReconnect();
    reconnectAttempt = 0; // Reset counter
    attemptReconnect();
  };
  
  return wsWithHelpers;
}

/**
 * Send a ping to the WebSocket server
 */
export function sendWebSocketPing(ws: WebSocket, data = { timestamp: Date.now() }): boolean {
  if (ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify({
        type: 'ping',
        data
      }));
      return true;
    } catch (error) {
      console.error('Failed to send ping:', error);
      return false;
    }
  }
  return false;
}

/**
 * Create a keep-alive mechanism for a WebSocket connection
 */
export function setupWebSocketKeepAlive(ws: WebSocket, intervalMs = 30000): () => void {
  // Create a ping interval
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      sendWebSocketPing(ws);
    } else if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
      clearInterval(pingInterval);
    }
  }, intervalMs);
  
  // Return function to cancel the keep-alive
  return () => clearInterval(pingInterval);
}
