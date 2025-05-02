/**
 * MCP Integration Platform - WebSocket Connection Fixes
 * 
 * This module provides workarounds for WebSocket connectivity issues
 * in various environments, particularly Replit.
 */

// Track WebSocket state for diagnostic purposes
let wsFixApplied = false;
let wsConnectionAttempts = 0;
let wsSuccessfulConnections = 0;
let wsFailedConnections = 0;
let wsLastError: Error | undefined;

/**
 * Initialize WebSocket fixes for the current environment
 * 
 * - Addresses Replit proxy issues with WebSockets
 * - Provides connection diagnostics
 * - Handles URL translations
 */
export function initWebSocketFixes(): boolean {
  // Skip if already applied
  if (wsFixApplied) return true;

  // Skip if not in browser
  if (typeof window === 'undefined') return false;
  
  // Setup runtime diagnostics
  window.mcpWebSocketState = {
    fixApplied: false,
    connectionAttempts: 0,
    successfulConnections: 0,
    failedConnections: 0,
    isReplitEnv: isReplitEnvironment(),
  };

  try {
    // Create enhanced WebSocket constructor
    createEnhancedWebSocket();
    
    // Mark as applied
    wsFixApplied = true;
    window.mcpWebSocketState.fixApplied = true;
    
    // Add diagnostic logging
    console.debug('[websocket:fix] WebSocket connection fix applied');
    
    return true;
  } catch (error) {
    console.error('[websocket:fix] Failed to apply WebSocket fix:', error);
    wsLastError = error instanceof Error ? error : new Error('Unknown error applying WebSocket fix');
    window.mcpWebSocketState.lastError = wsLastError;
    return false;
  }
}

/**
 * Detect if running in Replit environment
 */
function isReplitEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.location.hostname.includes('replit') ||
    window.location.hostname.includes('repl.co')
  );
}

/**
 * Create enhanced WebSocket constructor function
 * 
 * This overrides the standard WebSocket constructor with one that works in Replit
 */
function createEnhancedWebSocket() {
  window.mcpWebSocketCreateEnhanced = (url: string, protocols?: string | string[]): WebSocket => {
    wsConnectionAttempts++;
    window.mcpWebSocketState!.connectionAttempts++;
    
    try {
      // Adjust URL for Replit environment
      const isReplitEnv = isReplitEnvironment();
      
      if (isReplitEnv && url.includes('localhost')) {
        // Convert localhost URLs to use the current hostname but keep the path
        const originalUrl = url;
        const originalPath = new URL(url).pathname;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        url = `${protocol}//${window.location.host}${originalPath}`;
        
        console.debug(
          '[websocket:fix] URL adjusted for Replit environment',
          { originalUrl, adjustedUrl: url }
        );
      }
      
      // Create WebSocket with adjusted URL
      const socket = new WebSocket(url, protocols);
      
      // Track successful connections
      socket.addEventListener('open', () => {
        wsSuccessfulConnections++;
        window.mcpWebSocketState!.successfulConnections++;
        console.debug('[websocket:fix] WebSocket connection established');
      });
      
      // Track failed connections
      socket.addEventListener('error', (error) => {
        wsFailedConnections++;
        window.mcpWebSocketState!.failedConnections++;
        console.error('[websocket:fix] WebSocket connection error', error);
      });
      
      return socket;
    } catch (error) {
      wsFailedConnections++;
      window.mcpWebSocketState!.failedConnections++;
      wsLastError = error instanceof Error ? error : new Error('WebSocket creation failed');
      window.mcpWebSocketState!.lastError = wsLastError;
      
      console.error('[websocket:fix] WebSocket creation error:', error);
      throw error;
    }
  };
}