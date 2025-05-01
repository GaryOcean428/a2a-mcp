/**
 * MCP Integration Platform - Vite HMR WebSocket Fix
 * 
 * This module patches Vite HMR WebSocket errors to prevent them from
 * polluting the console and causing confusion with our application WebSocket.
 */

import { handleWebSocketError } from './websocket-utils';

// Store original WebSocket constructor
const OriginalWebSocket = window.WebSocket;

// A list of Vite HMR URLs to identify and handle specially
const VITE_HMR_URLS = [
  '/__vite-hmr',
  'localhost',
  '/_hmr',
  '/vite-hmr'
];

// Check if a URL is a Vite HMR URL
function isViteHmrUrl(url: string): boolean {
  return VITE_HMR_URLS.some(pattern => url.includes(pattern));
}

// Create a wrapped WebSocket constructor that handles Vite HMR errors properly
class WrappedWebSocket extends WebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    try {
      super(url, protocols);
      
      // Handle connection errors specifically for non-Vite WebSockets
      if (!isViteHmrUrl(url.toString())) {
        const originalOnError = this.onerror;
        
        this.onerror = (event: Event) => {
          // Let our error handler process it first
          handleWebSocketError(event);
          
          // Then call the original handler if it exists
          if (originalOnError) {
            originalOnError.call(this, event);
          }
        };
      }
    } catch (error) {
      // Handle WebSocket construction errors
      if (!isViteHmrUrl(url.toString())) {
        console.error('[WebSocket] Error creating WebSocket:', error);
      } else {
        console.debug('[Vite HMR] Suppressed HMR WebSocket error:', error);
      }
      
      // Re-throw for the caller to handle
      throw error;
    }
  }
}

// Replace the global WebSocket constructor with our wrapped version
window.WebSocket = WrappedWebSocket as any;

// Install global error handlers for unhandled WebSocket errors
function installErrorHandlers() {
  window.addEventListener('error', (event) => {
    if (event.message && (
      event.message.includes('WebSocket') || 
      event.message.includes('ws://') || 
      event.message.includes('wss://')
    )) {
      if (event.message.includes('Vite') || event.message.includes('hmr')) {
        console.debug('[Vite HMR] Suppressed HMR error:', event.message);
        event.preventDefault();
        return false;
      }
    }
    return true;
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && (
      event.reason.message.includes('WebSocket') || 
      event.reason.message.includes('ws://') || 
      event.reason.message.includes('wss://')
    )) {
      if (event.reason.message.includes('Vite') || event.reason.message.includes('hmr')) {
        console.debug('[Vite HMR] Suppressed unhandled promise rejection:', event.reason.message);
        event.preventDefault();
        return false;
      }
    }
    return true;
  });
  
  console.log('[Vite HMR Fix] Installed error handlers to suppress invalid WebSocket URL errors');
}

// Install the error handlers
installErrorHandlers();

// Export original WebSocket for reference
export { OriginalWebSocket };
