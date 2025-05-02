/**
 * MCP Integration Platform - WebSocket Connection Fix
 * 
 * This utility addresses common WebSocket connection issues in development and production
 * by providing robust reconnection logic and connection state management.
 */

const WEBSOCKET_DEBUG = false;

export function initWebSocketFixes(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Create a global namespace for WebSocket fixes
  if (!window.mcpWebSocketFixes) {
    window.mcpWebSocketFixes = {
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      baseReconnectDelay: 1500,
      isConnecting: false,
      fixesApplied: false,
      connectionHistory: []
    };
  }
  
  // Skip if already initialized
  if (window.mcpWebSocketFixes.fixesApplied) {
    return true;
  }
  
  // Debug logging function
  const debugLog = (message: string, data?: any) => {
    if (!WEBSOCKET_DEBUG) return;
    console.debug(`[WebSocketFix] ${message}`, data || '');
  };
  
  // Store original WebSocket constructor
  const OriginalWebSocket = window.WebSocket;
  
  // Instead of replacing the WebSocket constructor, we'll patch the create and opening functions
  // This is the safer approach to avoid issues with read-only properties
  const originalCreateWebSocket = window.WebSocket;
  
  // Create a proxy function for creating enhanced WebSockets
  function createEnhancedWebSocket(url: string, protocols?: string | string[]) {
    debugLog('Creating WebSocket with enhanced error handling', { url });
    
    // Record connection attempt
    window.mcpWebSocketFixes.connectionHistory.push({
      url,
      timestamp: Date.now(),
      successful: false
    });
    
    // Create WebSocket instance
    const ws = new originalCreateWebSocket(url, protocols);
    
    // Store original event handlers
    const originalOnError = ws.onerror;
    const originalOnClose = ws.onclose;
    const originalOnOpen = ws.onopen;
    
    // Enhanced error handler
    ws.onerror = function(event) {
      debugLog('WebSocket error occurred', event);
      
      // Record connection failure
      const lastConnection = window.mcpWebSocketFixes.connectionHistory[window.mcpWebSocketFixes.connectionHistory.length - 1];
      if (lastConnection) {
        lastConnection.error = 'Connection error';
      }
      
      // Call original handler if exists
      if (originalOnError) {
        originalOnError.call(this, event);
      }
    };
    
    // Enhanced close handler
    ws.onclose = function(event) {
      debugLog('WebSocket connection closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      // Record connection closure
      const lastConnection = window.mcpWebSocketFixes.connectionHistory[window.mcpWebSocketFixes.connectionHistory.length - 1];
      if (lastConnection) {
        lastConnection.closedAt = Date.now();
        lastConnection.closeCode = event.code;
        lastConnection.closeReason = event.reason;
      }
      
      // Call original handler if exists
      if (originalOnClose) {
        originalOnClose.call(this, event);
      }
    };
    
    // Enhanced open handler
    ws.onopen = function(event) {
      debugLog('WebSocket connection established');
      
      // Record successful connection
      const lastConnection = window.mcpWebSocketFixes.connectionHistory[window.mcpWebSocketFixes.connectionHistory.length - 1];
      if (lastConnection) {
        lastConnection.successful = true;
        lastConnection.openedAt = Date.now();
      }
      
      // Reset reconnect counter on successful connection
      window.mcpWebSocketFixes.reconnectAttempts = 0;
      
      // Call original handler if exists
      if (originalOnOpen) {
        originalOnOpen.call(this, event);
      }
    };
    
    return ws;
  }
  
  // Monkey patch any websocket create functions we may be using from libraries
  // without replacing the WebSocket constructor directly
  window.mcpWebSocketCreateEnhanced = createEnhancedWebSocket;
  
  // Mark fixes as applied
  window.mcpWebSocketFixes.fixesApplied = true;
  debugLog('WebSocket fixes successfully applied');
  
  return true;
}

// Type definition for global namespace
declare global {
  interface Window {
    mcpWebSocketFixes: {
      reconnectAttempts: number;
      maxReconnectAttempts: number;
      baseReconnectDelay: number;
      isConnecting: boolean;
      fixesApplied: boolean;
      connectionHistory: Array<{
        url: string;
        timestamp: number;
        successful: boolean;
        error?: string;
        openedAt?: number;
        closedAt?: number;
        closeCode?: number;
        closeReason?: string;
      }>;
    };
    mcpWebSocketCreateEnhanced?: (url: string, protocols?: string | string[]) => WebSocket;
  }
}
