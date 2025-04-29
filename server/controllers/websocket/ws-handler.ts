import { WebSocket } from 'ws';
import { nanoid } from 'nanoid';
import { MCPRequest } from '@shared/schema';
import { mcpService } from '../../services/mcp-service';

/**
 * Handler for WebSocket client connections
 */
export class WebSocketHandler {
  private clientId: string;
  private ws: WebSocket;
  private pingInterval: NodeJS.Timeout | null = null;
  
  /**
   * Create a new WebSocket handler for a client connection
   */
  constructor(ws: WebSocket, req: any) {
    this.clientId = nanoid();
    this.ws = ws;
    
    // Log client connection with IP and URL
    const ip = req.socket.remoteAddress || 'unknown';
    const url = req.url || 'unknown';
    console.log(`New WebSocket client connected: ${this.clientId} from ${ip}, url: ${url}`);
    
    this.initializeConnection();
  }
  
  /**
   * Initialize the WebSocket connection and set up event handlers
   */
  private initializeConnection(): void {
    // Check connection health with WebSocket ready state
    if (this.ws.readyState === WebSocket.OPEN) {
      console.log(`Client ${this.clientId} connection is OPEN`);
      
      // Send tool schema list on connection
      try {
        const schemas = mcpService.getToolSchema();
        this.ws.send(JSON.stringify({
          event: 'schemas',
          data: schemas
        }));
        console.log(`Sent schemas to client ${this.clientId}`);
      } catch (error) {
        console.error(`Error sending schemas to client ${this.clientId}:`, error);
      }
    } else {
      console.warn(`Client ${this.clientId} connection not open, state: ${this.ws.readyState}`);
    }
    
    // Setup ping interval to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      } else {
        this.clearPingInterval();
      }
    }, 30000); // Send ping every 30 seconds
    
    // Set up event handlers
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('pong', this.handlePong.bind(this));
    this.ws.on('close', this.handleClose.bind(this));
    this.ws.on('error', this.handleError.bind(this));
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  private async handleMessage(message: WebSocket.Data): Promise<void> {
    try {
      // Log the raw message for debugging
      console.log(`Received WebSocket message from ${this.clientId}: ${message.toString().substring(0, 100)}...`);
      
      const data = JSON.parse(message.toString());
      
      if (data.type === 'mcp_request') {
        await this.handleMcpRequest(data.request);
      } else if (data.type === 'ping') {
        // Respond to ping messages
        this.ws.send(JSON.stringify({
          event: 'pong',
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error(`Error processing WebSocket message from ${this.clientId}:`, error);
      
      // Only send error response if connection is still open
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          event: 'error',
          data: {
            message: error instanceof Error ? error.message : String(error)
          }
        }));
      }
    }
  }
  
  /**
   * Handle MCP request via WebSocket
   */
  private async handleMcpRequest(request: MCPRequest): Promise<void> {
    try {
      // Generate request ID if not provided
      if (!request.id) {
        request.id = mcpService.generateRequestId();
      }
      
      // Process the request
      const response = await mcpService.processRequest(request);
      
      // Send the response
      this.ws.send(JSON.stringify({
        event: 'response',
        data: response
      }));
    } catch (error) {
      console.error('Error handling WebSocket request:', error);
      
      this.ws.send(JSON.stringify({
        event: 'error',
        data: {
          message: error instanceof Error ? error.message : String(error),
          requestId: request.id
        }
      }));
    }
  }
  
  /**
   * Handle WebSocket pong responses
   */
  private handlePong(): void {
    // Handle pong responses to keep track of client latency
    console.log(`Received pong from client ${this.clientId}`);
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose(code: number, reason: string): void {
    console.log(`WebSocket client ${this.clientId} disconnected: code ${code}, reason: ${reason || 'none'}`);
    this.clearPingInterval();
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleError(error: Error): void {
    console.error(`WebSocket error for client ${this.clientId}:`, error);
  }
  
  /**
   * Clear the ping interval timer
   */
  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  /**
   * Get the client ID
   */
  getClientId(): string {
    return this.clientId;
  }
  
  /**
   * Get the WebSocket instance
   */
  getWebSocket(): WebSocket {
    return this.ws;
  }
}