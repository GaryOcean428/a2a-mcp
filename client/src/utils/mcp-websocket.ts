/**
 * MCP Integration Platform - MCP WebSocket Integration
 * 
 * This module provides the integration layer between the WebSocket client
 * and the MCP API, handling schema loading and request/response management.
 */

import { webSocketClient } from './websocket-client';

export interface MCPSchema {
  name: string;
  description: string;
  inputSchema: any;
  annotations: {
    title: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
}

export interface MCPRequest {
  id?: string;
  name: string;
  input: any;
}

export interface MCPResponse {
  id?: string;
  output?: any;
  error?: {
    message: string;
    code: string;
  };
}

export type SchemaLoadedCallback = (schemas: MCPSchema[]) => void;
export type ResponseCallback = (response: MCPResponse) => void;

class MCPWebSocketManager {
  private schemas: MCPSchema[] = [];
  private responseHandlers: Map<string, ResponseCallback> = new Map();
  private schemaLoadedHandlers: SchemaLoadedCallback[] = [];
  private connected = false;
  private connecting = false;
  
  constructor() {
    console.log('[MCP WebSocket] Initializing');
    
    // Register message handlers
    webSocketClient.onMessage('schemas', (data) => this.handleSchemas(data));
    webSocketClient.onMessage('response', (data) => this.handleResponse(data));
    webSocketClient.onMessage('error', (data) => this.handleError(data));
    
    // Register connection handlers
    webSocketClient.onConnect(() => {
      this.connected = true;
      this.connecting = false;
      console.log('[MCP WebSocket] Connected');
    });
    
    webSocketClient.onDisconnect(() => {
      this.connected = false;
      this.connecting = false;
      console.log('[MCP WebSocket] Disconnected');
    });
  }
  
  /**
   * Connect to the MCP WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.connected || this.connecting) {
      return;
    }
    
    this.connecting = true;
    
    try {
      await webSocketClient.connect();
      
      // Send a ping to verify connection
      this.ping();
    } catch (error) {
      console.error('[MCP WebSocket] Connection error:', error);
      this.connecting = false;
      throw error;
    }
  }
  
  /**
   * Send a ping message to the server
   */
  public ping(): void {
    webSocketClient.send({
      type: 'ping',
      data: {
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Send an MCP request via WebSocket
   */
  public sendRequest(request: MCPRequest, callback: ResponseCallback): void {
    // Generate an ID if not provided
    if (!request.id) {
      request.id = `mcp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    
    // Store the callback
    this.responseHandlers.set(request.id, callback);
    
    // Send the request
    webSocketClient.send({
      type: 'mcp_request',
      request
    });
  }
  
  /**
   * Register a callback for when schemas are loaded
   */
  public onSchemasLoaded(callback: SchemaLoadedCallback): void {
    this.schemaLoadedHandlers.push(callback);
    
    // If schemas are already loaded, call the callback immediately
    if (this.schemas.length > 0) {
      callback(this.schemas);
    }
  }
  
  /**
   * Get all loaded MCP tool schemas
   */
  public getSchemas(): MCPSchema[] {
    return [...this.schemas];
  }
  
  /**
   * Get a specific MCP tool schema by name
   */
  public getSchema(name: string): MCPSchema | undefined {
    return this.schemas.find(schema => schema.name === name);
  }
  
  /**
   * Handle schemas sent from the server
   */
  private handleSchemas(data: MCPSchema[]): void {
    console.log(`[MCP WebSocket] Received ${data.length} tool schemas`);
    this.schemas = data;
    
    // Notify all handlers
    this.schemaLoadedHandlers.forEach(handler => {
      try {
        handler(this.schemas);
      } catch (error) {
        console.error('[MCP WebSocket] Error in schema loaded handler:', error);
      }
    });
  }
  
  /**
   * Handle a response from the server
   */
  private handleResponse(data: MCPResponse): void {
    if (!data.id) {
      console.error('[MCP WebSocket] Received response without ID:', data);
      return;
    }
    
    // Find the callback for this response
    const callback = this.responseHandlers.get(data.id);
    if (callback) {
      // Call the callback and remove it from the map
      callback(data);
      this.responseHandlers.delete(data.id);
    } else {
      console.warn(`[MCP WebSocket] No handler found for response ID: ${data.id}`);
    }
  }
  
  /**
   * Handle an error from the server
   */
  private handleError(data: any): void {
    console.error('[MCP WebSocket] Error from server:', data);
    
    // If the error has a request ID, handle it as a response
    if (data.requestId) {
      const callback = this.responseHandlers.get(data.requestId);
      if (callback) {
        callback({
          id: data.requestId,
          error: {
            message: data.message || 'Unknown error',
            code: data.code || 'SERVER_ERROR'
          }
        });
        this.responseHandlers.delete(data.requestId);
      }
    }
  }
  
  /**
   * Check if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }
}

// Create and export a singleton instance
export const mcpWebSocketManager = new MCPWebSocketManager();