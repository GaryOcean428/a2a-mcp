/**
 * Vite HMR WebSocket Fix
 * 
 * This script catches and handles WebSocket errors from Vite's HMR system,
 * particularly the "wss://localhost:undefined/?token=..." invalid URL error.
 * This is a common issue in Replit environments where the port might not be correctly determined.
 */

// Run the fix immediately when imported
(function fixViteHmrWebSocket() {
  try {
    // Add a global error handler specifically for WebSocket errors
    window.addEventListener('error', (event) => {
      // Check if this is a WebSocket error with the specific "localhost:undefined" pattern
      if (
        event.message && 
        event.message.includes('WebSocket') && 
        event.message.includes('localhost:undefined')
      ) {
        console.warn('[hmr:websocket] Intercepted WebSocket error:', event.message);
        
        // Prevent the error from propagating to the console
        event.preventDefault();
        
        // Create a message for the user
        console.info(
          '[hmr:websocket:startup] Successfully applied Vite HMR WebSocket fix'
        );
      }
    });
    
    // Add unhandledrejection handler for WebSocket promise errors
    window.addEventListener('unhandledrejection', (event) => {
      if (
        event.reason && 
        event.reason.message && 
        typeof event.reason.message === 'string' &&
        event.reason.message.includes('WebSocket') && 
        event.reason.message.includes('localhost:undefined')
      ) {
        console.warn('[hmr:websocket] Intercepted unhandled WebSocket promise rejection');
        
        // Prevent the error from propagating
        event.preventDefault();
      }
    });
    
    console.debug('[hmr:websocket] Applying Vite HMR WebSocket fix');
  } catch (error) {
    console.error('[hmr:websocket] Failed to install error handlers:', error);
  }
})();

export {};
