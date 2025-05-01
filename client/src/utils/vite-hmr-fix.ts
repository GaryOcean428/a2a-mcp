/**
 * MCP Integration Platform - Vite HMR Fix
 * 
 * This utility patches the Vite Hot Module Replacement system to prevent
 * WebSocket errors when using our own WebSocket connections.
 * 
 * The issue happens because Vite uses undocumented WebSocket internal behavior
 * that can break when there are multiple WebSocket instances.
 */

import { logger } from './logger';

/**
 * Flag to track if the fix has been applied
 */
let hmrFixed = false;

/**
 * Original WebSocket constructor
 */
const OriginalWebSocket = window.WebSocket;

/**
 * Apply the HMR fix
 */
function applyHmrFix() {
  if (hmrFixed || typeof window === 'undefined') {
    return;
  }
  
  logger.debug('Applying Vite HMR WebSocket fix', {
    tags: ['hmr', 'websocket']
  });
  
  // Create a patched WebSocket constructor
  class PatchedWebSocket extends OriginalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      // Fix URL for Vite HMR WebSockets
      let wsUrl = url instanceof URL ? url.toString() : url;
      
      // Check if this is a Vite HMR WebSocket
      const isViteHmr = typeof wsUrl === 'string' && (
        wsUrl.includes('hmr') ||
        wsUrl.includes('__vite') ||
        wsUrl.includes('vite') ||
        wsUrl.includes('[hmr]')
      );
      
      // For Vite HMR, make sure to prefix the WebSocket path with /ws-hmr to avoid
      // conflicts with our application WebSockets
      if (isViteHmr && wsUrl.includes('ws')) {
        // Get the origin from the current window
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        // Create a new URL with /ws-hmr path
        wsUrl = `${protocol}//${host}/ws-hmr`;
        
        logger.debug('Patched Vite HMR WebSocket URL', {
          tags: ['hmr', 'websocket'],
          data: { original: url, patched: wsUrl }
        });
      }
      
      // Call the original constructor with the potentially modified URL
      super(wsUrl, protocols);
    }
  }
  
  // Replace the WebSocket constructor
  try {
    // @ts-ignore - we need to override the constructor
    window.WebSocket = PatchedWebSocket;
    hmrFixed = true;
    
    logger.info('Successfully applied Vite HMR WebSocket fix', {
      tags: ['hmr', 'websocket', 'startup']
    });
  } catch (error) {
    logger.error('Failed to apply Vite HMR WebSocket fix', {
      tags: ['hmr', 'websocket', 'error'],
      error
    });
  }
}

// Apply the HMR fix when this module is imported
applyHmrFix();

// Export a function to check if the fix is applied
export function isHmrFixed(): boolean {
  return hmrFixed;
}

// Export a function to manually apply the fix
export function applyViteHmrFix(): boolean {
  applyHmrFix();
  return hmrFixed;
}

// Export the original WebSocket constructor
export { OriginalWebSocket };
