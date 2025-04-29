import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { WebSocketHandler } from './ws-handler';

/**
 * WebSocket server manager for handling MCP WebSocket connections
 */
export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketHandler> = new Map();
  private path: string;
  
  /**
   * Create a new WebSocket manager
   */
  constructor(path: string = '/mcp-ws') {
    this.path = path;
  }
  
  /**
   * Initialize the WebSocket server
   */
  initialize(server: Server): void {
    // Use a specific path for the WebSocket server to avoid conflicts with Vite's HMR WebSocket
    this.wss = new WebSocketServer({ 
      server,
      path: this.path
    });
    
    console.log(`WebSocket server initialized at path: ${this.path}`);
    
    // Handle WebSocket server errors
    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
    
    this.wss.on('connection', this.handleConnection.bind(this));
  }
  
  /**
   * Handle a new WebSocket connection
   */
  private handleConnection(ws: WebSocket, req: any): void {
    // Create a new handler for this connection
    const handler = new WebSocketHandler(ws, req);
    const clientId = handler.getClientId();
    
    // Store the handler
    this.clients.set(clientId, handler);
    
    // Handle client disconnection
    ws.on('close', () => {
      this.clients.delete(clientId);
    });
  }
  
  /**
   * Get the number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }
  
  /**
   * Broadcast a message to all connected clients
   */
  broadcast(event: string, data: any): void {
    const message = JSON.stringify({ event, data });
    
    // Convert to array to avoid iterator issues with Map entries()
    Array.from(this.clients.entries()).forEach(([clientId, handler]) => {
      const ws = handler.getWebSocket();
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
  
  /**
   * Close the WebSocket server and all connections
   */
  close(): void {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
      this.clients.clear();
    }
  }
}