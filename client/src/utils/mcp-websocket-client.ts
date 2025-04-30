/**
 * MCP WebSocket Client
 * 
 * A specialized client for the MCP WebSocket service that handles
 * MCP-specific message formats and schema management.
 */

import { webSocketService, useWebSocket, WebSocketStatusHandler } from './websocket-service';
import { IS_DEVELOPMENT } from '../config/constants';

// Event dispatcher for MCP events
type EventHandler = (data: any) => void;
type EventHandlers = Record<string, EventHandler[]>;

// MCP request and response types
export interface MCPSchema {
  name: string;
  description: string;
  parameters: any;
}

export interface MCPRequest {
  id?: string;
  name: string;
  parameters: Record<string, any>;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    message: string;
    code: string;
  };
}

class MCPWebSocketClient {
  private static instance: MCPWebSocketClient;
  private eventHandlers: EventHandlers = {};
  private schemaMap = new Map<string, MCPSchema>();
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeout: number;
  }>();
  private requestTimeout = 30000; // 30 seconds timeout for requests
  private isConnected = false;

  private constructor() {
    console.log('[MCP WebSocket] Initializing');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): MCPWebSocketClient {
    if (!MCPWebSocketClient.instance) {
      MCPWebSocketClient.instance = new MCPWebSocketClient();
    }
    return MCPWebSocketClient.instance;
  }

  /**
   * Initialize the client and set up handlers
   */
  public initialize(): void {
    webSocketService.connect({
      onMessage: this.handleMessage.bind(this),
      onStatusChange: this.handleStatusChange.bind(this)
    });
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Send an MCP request and return a promise for the response
   */
  public async sendRequest(name: string, parameters: Record<string, any> = {}): Promise<any> {
    if (!this.isConnected) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    const id = this.generateRequestId();
    const request: MCPRequest = { id, name, parameters };

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = window.setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout after ${this.requestTimeout}ms`));
      }, this.requestTimeout);

      // Store the pending request
      this.pendingRequests.set(id, { resolve, reject, timeout });

      // Send the request
      const success = webSocketService.send({
        type: 'mcp_request',
        request
      });

      if (!success) {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(new Error("Failed to send request"));
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      // Handle MCP schemas
      if (message.event === 'schemas' && Array.isArray(message.data)) {
        this.handleSchemas(message.data);
        return;
      }
      
      // Handle MCP responses
      if (message.event === 'response' && message.data) {
        this.handleResponse(message.data);
        return;
      }
      
      // Handle MCP errors
      if (message.event === 'error') {
        this.handleError(message.data);
        return;
      }
      
      // Handle connection acknowledgement
      if (message.event === 'connection') {
        this.dispatchEvent('connection', message.data);
        return;
      }
      
      // Dispatch other events
      if (message.event) {
        this.dispatchEvent(message.event, message.data);
      }
    } catch (error) {
      console.error('[MCP WebSocket] Error parsing message:', error);
    }
  }

  /**
   * Handle connection status changes
   */
  private handleStatusChange(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    this.isConnected = status === 'connected';
    
    if (status === 'connected') {
      console.log('[MCP WebSocket] Connected');
    } else if (status === 'disconnected') {
      console.log('[MCP WebSocket] Disconnected');
      this.clearPendingRequests('WebSocket disconnected');
    } else if (status === 'error') {
      console.error('[MCP WebSocket] Connection error');
      this.clearPendingRequests('WebSocket connection error');
    }
    
    this.dispatchEvent('status', { status });
  }

  /**
   * Handle schema definitions
   */
  private handleSchemas(schemas: MCPSchema[]): void {
    console.log(`[MCP WebSocket] Received ${schemas.length} tool schemas`);
    
    // Clear existing schemas
    this.schemaMap.clear();
    
    // Store new schemas
    schemas.forEach(schema => {
      this.schemaMap.set(schema.name, schema);
    });
    
    // Notify listeners
    this.dispatchEvent('schemas', schemas);
  }

  /**
   * Handle response messages
   */
  private handleResponse(response: MCPResponse): void {
    const pending = this.pendingRequests.get(response.id);
    
    if (pending) {
      // Clear timeout
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(response.id);
      
      // Resolve or reject based on response
      if (response.error) {
        pending.reject(new Error(response.error.message));
      } else {
        pending.resolve(response.result);
      }
    }
    
    // Also dispatch as an event
    this.dispatchEvent('response', response);
  }

  /**
   * Handle error messages
   */
  private handleError(error: any): void {
    console.error('[MCP WebSocket] Error from server:', error);
    
    // If there's a request ID, reject that specific request
    if (error.requestId) {
      const pending = this.pendingRequests.get(error.requestId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(error.requestId);
        pending.reject(new Error(error.message || 'Unknown error'));
      }
    }
    
    // Dispatch error event
    this.dispatchEvent('error', error);
  }

  /**
   * Clear all pending requests with an error
   */
  private clearPendingRequests(reason: string): void {
    this.pendingRequests.forEach(({ resolve, reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error(reason));
    });
    this.pendingRequests.clear();
  }

  /**
   * Register an event handler
   */
  public on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  /**
   * Unregister an event handler
   */
  public off(event: string, handler: EventHandler): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
      if (this.eventHandlers[event].length === 0) {
        delete this.eventHandlers[event];
      }
    }
  }

  /**
   * Dispatch an event to all registered handlers
   */
  private dispatchEvent(event: string, data: any): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[MCP WebSocket] Error in handler for event '${event}':`, error);
        }
      });
    }
  }

  /**
   * Get all available schemas
   */
  public getSchemas(): MCPSchema[] {
    return Array.from(this.schemaMap.values());
  }

  /**
   * Get a specific schema by name
   */
  public getSchema(name: string): MCPSchema | undefined {
    return this.schemaMap.get(name);
  }

  /**
   * Check if the client is connected
   */
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect the WebSocket
   */
  public disconnect(): void {
    webSocketService.disconnect();
  }
}

// Export singleton instance
export const mcpWebSocketClient = MCPWebSocketClient.getInstance();

// React hook for the MCP WebSocket client
import { useEffect, useState, useCallback } from 'react';

interface UseMCPWebSocketOptions {
  autoConnect?: boolean;
  onStatusChange?: WebSocketStatusHandler;
  onSchemas?: (schemas: MCPSchema[]) => void;
}

export function useMCPWebSocket(options: UseMCPWebSocketOptions = {}) {
  const { autoConnect = true, onStatusChange, onSchemas } = options;
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>(
    mcpWebSocketClient.isWebSocketConnected() ? 'connected' : 'disconnected'
  );
  const [schemas, setSchemas] = useState<MCPSchema[]>(mcpWebSocketClient.getSchemas());

  // Initialize on mount
  useEffect(() => {
    if (autoConnect) {
      mcpWebSocketClient.initialize();
    }

    // Handler for status changes
    const handleStatus = (data: any) => {
      setStatus(data.status);
      onStatusChange?.(data.status);
    };

    // Handler for schemas
    const handleSchemas = (newSchemas: MCPSchema[]) => {
      setSchemas(newSchemas);
      onSchemas?.(newSchemas);
    };

    // Register event listeners
    mcpWebSocketClient.on('status', handleStatus);
    mcpWebSocketClient.on('schemas', handleSchemas);

    // Clean up on unmount
    return () => {
      mcpWebSocketClient.off('status', handleStatus);
      mcpWebSocketClient.off('schemas', handleSchemas);
    };
  }, [autoConnect, onStatusChange, onSchemas]);

  // Callback to send a request
  const sendRequest = useCallback(async (name: string, parameters: Record<string, any> = {}) => {
    return mcpWebSocketClient.sendRequest(name, parameters);
  }, []);

  return {
    status,
    schemas,
    sendRequest,
    isConnected: status === 'connected',
    disconnect: mcpWebSocketClient.disconnect.bind(mcpWebSocketClient)
  };
}