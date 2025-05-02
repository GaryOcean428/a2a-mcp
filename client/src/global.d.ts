/**
 * Global Type Declarations
 * 
 * This file defines global types for the MCP Integration Platform.
 */

// Extend the Window interface to include our custom properties
interface Window {
  /**
   * Enhanced WebSocket constructor function to handle Replit environment specifics
   */
  mcpWebSocketCreateEnhanced?: (url: string, protocols?: string | string[]) => WebSocket;
  
  /**
   * MCP WebSocket connection details used for runtime diagnostics
   */
  mcpWebSocketState?: {
    /**
     * Whether the enhanced WebSocket fix has been applied
     */
    fixApplied: boolean;
    /**
     * The number of connection attempts made
     */
    connectionAttempts: number;
    /**
     * The number of successful connections
     */
    successfulConnections: number;
    /**
     * The number of failed connections
     */
    failedConnections: number;
    /**
     * The last error that occurred during connection
     */
    lastError?: Error;
    /**
     * Whether the connection is in the Replit environment
     */
    isReplitEnv: boolean;
  };
}
