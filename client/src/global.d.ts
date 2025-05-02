/**
 * MCP Integration Platform - Global Type Declarations
 */

// Extend the Window interface
interface Window {
  // Recovery mechanisms for CSS
  recoverMissingStyles?: () => boolean;
  mcpWebSocketFixes?: {
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
  WEBSOCKET_DEBUG?: boolean;
  
  // Environment information
  MCP_ENV_INFO?: {
    version: string;
    environment: string;
    buildTimestamp: number;
    commitHash?: string;
  };
}