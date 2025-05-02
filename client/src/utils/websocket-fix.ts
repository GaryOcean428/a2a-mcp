/**
 * WebSocket Fix Utility
 * 
 * This utility provides fixes for common WebSocket connection issues,
 * particularly focusing on HMR (Hot Module Replacement) and development
 * environment disconnections.
 */

import { version } from '../version';

/**
 * Configuration for WebSocket fixes
 */
interface WebSocketFixConfig {
  /**
   * Maximum reconnection attempts
   */
  maxReconnectAttempts: number;
  
  /**
   * Base reconnection delay in milliseconds
   */
  reconnectDelay: number;
  
  /**
   * Paths to monitor for WebSocket connections
   */
  watchPaths: string[];
  
  /**
   * Whether to patch all WebSocket connections
   */
  patchAllConnections: boolean;
}

/**
 * Default configuration for WebSocket fixes
 */
const defaultConfig: WebSocketFixConfig = {
  maxReconnectAttempts: 5,
  reconnectDelay: 3000,
  watchPaths: ['/mcp-ws', '/__vite_hmr', '/ws'],
  patchAllConnections: true
};

/**
 * Apply WebSocket connection fixes
 * 
 * This function patches the WebSocket constructor to add automatic
 * reconnection capabilities and version tracking to prevent stale
 * connections.
 */
export function applyWebSocketFixes(customConfig: Partial<WebSocketFixConfig> = {}) {
  const config = { ...defaultConfig, ...customConfig };
  
  // Store the original WebSocket constructor
  const OriginalWebSocket = window.WebSocket;
  
  // Create a patched version
  class PatchedWebSocket extends OriginalWebSocket {
    private reconnectAttempts = 0;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private originalUrl: string;
    private originalProtocols?: string | string[];
    private manualClose = false;
    
    constructor(url: string | URL, protocols?: string | string[]) {
      // Add version parameter to URL for cache busting
      const urlObj = typeof url === 'string' ? new URL(url, window.location.href) : url;
      urlObj.searchParams.set('v', version);
      
      // Store original values for reconnection
      const urlString = urlObj.toString();
      super(urlString, protocols);
      
      this.originalUrl = urlString;
      this.originalProtocols = protocols;
      
      // Handle connection errors
      this.addEventListener('error', this.handleError.bind(this));
      this.addEventListener('close', this.handleClose.bind(this));
    }
    
    private handleError(event: Event) {
      console.log(`[WebSocket Fix] Connection error for ${this.originalUrl}`);
    }
    
    private handleClose(event: CloseEvent) {
      if (this.manualClose) {
        return; // Don't reconnect if manually closed
      }
      
      // Attempt to reconnect
      if (this.reconnectAttempts < config.maxReconnectAttempts) {
        this.reconnectAttempts++;
        
        // Exponential backoff
        const delay = config.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
        console.log(`[WebSocket Fix] Reconnecting to ${this.originalUrl} (attempt ${this.reconnectAttempts}/${config.maxReconnectAttempts}) in ${delay}ms`);
        
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
        }
        
        this.reconnectTimeout = setTimeout(() => {
          try {
            console.log(`[WebSocket Fix] Attempting reconnection to ${this.originalUrl}`);
            new OriginalWebSocket(this.originalUrl, this.originalProtocols);
          } catch (err) {
            console.error(`[WebSocket Fix] Reconnection failed:`, err);
          }
        }, delay);
      } else {
        console.log(`[WebSocket Fix] Max reconnection attempts (${config.maxReconnectAttempts}) reached for ${this.originalUrl}`);
      }
    }
    
    // Override close method to track manual closures
    close(code?: number, reason?: string): void {
      this.manualClose = true;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      super.close(code, reason);
    }
  }
  
  // Patch the global WebSocket constructor
  if (config.patchAllConnections) {
    window.WebSocket = PatchedWebSocket as any;
    console.log('[WebSocket Fix] Applied global WebSocket connection fixes');
  }
  
  return {
    OriginalWebSocket,
    PatchedWebSocket,
    reset: () => {
      window.WebSocket = OriginalWebSocket;
      console.log('[WebSocket Fix] Reset to original WebSocket implementation');
    }
  };
}

/**
 * Initialize the WebSocket fixes when the module is imported
 */
let fixApplied = false;

export function initWebSocketFixes() {
  if (!fixApplied) {
    applyWebSocketFixes();
    fixApplied = true;
    return true;
  }
  return false;
}

// Automatically apply fixes when in development environment
if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
  initWebSocketFixes();
}
