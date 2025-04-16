import { MCPRequest, MCPResponse } from '@shared/schema';

/**
 * MCP client for making requests to the MCP server
 */
export class MCPClient {
  private baseUrl: string;
  private apiKey: string | null;
  private websocket: WebSocket | null = null;
  private responseHandlers: Map<string, (response: MCPResponse) => void> = new Map();
  private connected = false;
  private connectionPromise: Promise<void> | null = null;
  
  /**
   * Create a new MCP client
   * @param options Client options
   */
  constructor(options: { 
    baseUrl?: string;
    apiKey?: string;
    useWebSocket?: boolean;
  } = {}) {
    // Set base URL with fallback to current origin
    this.baseUrl = options.baseUrl || window.location.origin;
    this.apiKey = options.apiKey || null;
    
    // Log client initialization for debugging
    console.log(`MCP client initialized with baseUrl: ${this.baseUrl}`);
    
    // Don't use WebSockets in development to avoid connection issues
    // In development, always use HTTP transport
    if (options.useWebSocket && process.env.NODE_ENV !== 'development') {
      this.initWebSocket();
    } else {
      console.log('Development mode: Using HTTP transport instead of WebSockets');
    }
  }
  
  /**
   * Initialize WebSocket connection
   */
  private initWebSocket() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    
    console.log(`Attempting to connect to WebSocket at: ${wsUrl}`);
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Don't initiate WebSocket connections in development environment
        // Fall back to HTTP transport to avoid connection issues
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Using HTTP transport instead of WebSockets');
          this.connected = false;
          resolve();
          return;
        }
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.addEventListener('open', () => {
          console.log('WebSocket connection established');
          this.connected = true;
          resolve();
        });
        
        this.websocket.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.event === 'response' && data.data.id) {
              const handler = this.responseHandlers.get(data.data.id);
              if (handler) {
                handler(data.data);
                this.responseHandlers.delete(data.data.id);
              }
            } else if (data.event === 'error') {
              console.error('WebSocket error:', data.data.message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
        
        this.websocket.addEventListener('close', (event) => {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          this.connected = false;
          
          // Don't automatically reconnect if closed cleanly
          if (event.code !== 1000 && event.code !== 1001) {
            console.log('WebSocket connection closed unexpectedly, reconnecting in 3s...');
            setTimeout(() => this.initWebSocket(), 3000);
          }
        });
        
        this.websocket.addEventListener('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Send a request to the MCP server via HTTP
   */
  async sendRequest(request: Omit<MCPRequest, 'id'>): Promise<MCPResponse> {
    // Generate a unique ID for the request
    const id = this.generateRequestId();
    const fullRequest: MCPRequest = {
      ...request,
      id
    };
    
    // If WebSocket is connected, use it
    if (this.websocket && this.connected) {
      return this.sendWebSocketRequest(fullRequest);
    }
    
    // Otherwise, use HTTP
    return this.sendHttpRequest(fullRequest);
  }
  
  /**
   * Send a request via HTTP
   */
  private async sendHttpRequest(request: MCPRequest): Promise<MCPResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    
    // Use window.location.origin as the base URL if none provided
    const baseUrl = this.baseUrl || window.location.origin;
    
    const response = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MCP request failed: ${response.status} ${errorText}`);
    }
    
    return response.json();
  }
  
  /**
   * Send a request via WebSocket
   */
  private async sendWebSocketRequest(request: MCPRequest): Promise<MCPResponse> {
    // Ensure WebSocket is connected
    if (!this.websocket || !this.connected) {
      if (this.connectionPromise) {
        await this.connectionPromise;
      } else {
        throw new Error('WebSocket not connected');
      }
    }
    
    return new Promise((resolve, reject) => {
      // Set timeout to prevent hanging requests
      const timeout = setTimeout(() => {
        this.responseHandlers.delete(request.id);
        reject(new Error('MCP request timed out'));
      }, 30000);
      
      // Register response handler
      this.responseHandlers.set(request.id, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });
      
      // Send the request
      this.websocket!.send(JSON.stringify({
        type: 'mcp_request',
        request
      }));
    });
  }
  
  /**
   * Generate a unique ID for requests
   */
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  /**
   * Get the status of the MCP server
   */
  async getStatus(): Promise<any> {
    // Use window.location.origin as the base URL if none provided
    const baseUrl = this.baseUrl || window.location.origin;
    const response = await fetch(`${baseUrl}/api/status`);
    
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Get the status of a specific tool
   */
  async getToolStatus(toolName: string): Promise<any> {
    // Use window.location.origin as the base URL if none provided
    const baseUrl = this.baseUrl || window.location.origin;
    const response = await fetch(`${baseUrl}/api/status/${toolName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get tool status: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Get all tool schemas
   */
  async getSchemas(): Promise<any[]> {
    // Use window.location.origin as the base URL if none provided
    const baseUrl = this.baseUrl || window.location.origin;
    const response = await fetch(`${baseUrl}/api/schema`);
    
    if (!response.ok) {
      throw new Error(`Failed to get schemas: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Get the schema for a specific tool
   */
  async getToolSchema(toolName: string): Promise<any> {
    // Use window.location.origin as the base URL if none provided
    const baseUrl = this.baseUrl || window.location.origin;
    const response = await fetch(`${baseUrl}/api/schema/${toolName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get tool schema: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Close WebSocket connection
   */
  close() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.connected = false;
    }
  }
}

// Create a default client instance
export const mcpClient = new MCPClient();
