/**
 * MCP Integration Platform - Vite HMR WebSocket Fix
 * 
 * This file fixes WebSocket connection issues in the Vite HMR system
 * by suppressing invalid WebSocket URL errors and providing a fallback.
 */

// Log that we're installing the fix
console.log('[Vite HMR Fix] Installed error handlers to suppress invalid WebSocket URL errors');

// Fix for the 'wss://localhost:undefined/' WebSocket error
if (typeof window !== 'undefined') {
  const originalWebSocket = window.WebSocket;
  
  // Override the WebSocket constructor to catch and handle invalid URLs
  // @ts-ignore - We're intentionally overriding the WebSocket constructor
  window.WebSocket = function(url, protocols) {
    // Check if this is a Vite HMR WebSocket with an invalid URL
    if (url && typeof url === 'string' && url.includes('localhost:undefined')) {
      // Log the suppressed invalid URL error
      console.warn(`[Vite HMR Fix] Suppressed invalid WebSocket URL: ${url}`);
      
      // Use the current hostname with a fallback port
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const fallbackUrl = `${protocol}//${window.location.hostname}:3001`;
      
      // Create a WebSocket with the fallback URL
      return new originalWebSocket(fallbackUrl, protocols);
    }
    
    // For all other WebSocket connections, use the original WebSocket constructor
    return new originalWebSocket(url, protocols);
  };
  
  // Copy over all properties from the original WebSocket constructor
  for (const prop in originalWebSocket) {
    if (Object.prototype.hasOwnProperty.call(originalWebSocket, prop)) {
      // @ts-ignore - We're copying properties
      window.WebSocket[prop] = originalWebSocket[prop];
    }
  }
  
  // Ensure the prototype chain is maintained
  window.WebSocket.prototype = originalWebSocket.prototype;
}

// Export a dummy object to ensure this file is treated as a module
export {};
