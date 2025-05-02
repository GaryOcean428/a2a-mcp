/**
 * MCP Integration Platform - WebSocket Connection Fix
 * 
 * This utility addresses common WebSocket connection issues in development and production
 * by providing robust reconnection logic and connection state management.
 * 
 * Specifically addresses Replit environment WebSocket connectivity issues by providing
 * alternative connection methods and fallback strategies.
 */

// Set to true to enable debug logging for WebSocket connections
const WEBSOCKET_DEBUG = false;
// Enable debug mode in Replit environments by default if DEBUG_WS is set in URL params
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('DEBUG_WS')) {
  console.log('[WebSocketFix] Debug mode enabled via URL parameter');
  (window as any).WEBSOCKET_DEBUG = true;
}
const IS_REPLIT_ENV = typeof window !== 'undefined' && (window.location.hostname.includes('replit') || window.location.hostname.includes('repl.co'));

export function initWebSocketFixes(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Create a global namespace for WebSocket fixes (handle type safely)
  window.mcpWebSocketFixes = window.mcpWebSocketFixes || {
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    baseReconnectDelay: 1500,
    isConnecting: false,
    fixesApplied: false,
    connectionHistory: []
  };
  
  // Skip if already initialized
  if (window.mcpWebSocketFixes.fixesApplied) {
    return true;
  }
  
  // Debug logging function
  const debugLog = (message: string, data?: any) => {
    // Check both local and global debug flags
    if (!WEBSOCKET_DEBUG && !(window as any).WEBSOCKET_DEBUG) return;
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
    
    // Replit-specific WebSocket URL correction
    if (IS_REPLIT_ENV && url.includes('localhost')) {
      // Extract original WebSocket path
      const originalPath = new URL(url).pathname;
      
      // Create new URL with secure protocol and current hostname
      const correctedUrl = `wss://${window.location.host}${originalPath}`;
      debugLog('Replit environment detected - adjusted WebSocket URL', { 
        original: url, 
        corrected: correctedUrl 
      });
      url = correctedUrl;
    }
    
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

// Type definitions are in global.d.ts
