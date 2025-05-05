/**
 * WebSocket Connection Configuration
 */

export const WebSocketConfig = {
  // Path for WebSocket endpoint
  path: '/mcp-ws',
  
  // Whether to attempt fallback to standard ports (80/443) if connection fails
  fallbackToStandardPorts: true,
  
  // Maximum number of reconnection attempts
  maxReconnectAttempts: 5,
  
  // Delay between reconnection attempts (ms)
  reconnectDelay: 2000,
  
  // Ping interval to keep connection alive (ms)
  pingInterval: 30000
};
