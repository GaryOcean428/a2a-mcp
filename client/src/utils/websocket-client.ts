/**
 * MCP Integration Platform - WebSocket Client
 * 
 * This module provides a reliable WebSocket client that works in both development
 * and production environments, handling reconnection and message queueing.
 */

export interface WebSocketMessage {
  type: string;
  data?: any;
  id?: string;
  request?: any;
}

export enum WebSocketReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

export type MessageHandler = (message: any) => void;
export type ConnectionHandler = () => void;

export class MCPWebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000;
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private onConnectHandlers: ConnectionHandler[] = [];
  private onDisconnectHandlers: ConnectionHandler[] = [];
  private reconnecting = false;
  
  constructor(serverPath: string = '/mcp-ws') {
    // Determine the WebSocket URL based on the current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}${serverPath}`;
    
    console.log(`[WebSocket] Client initialized with URL: ${this.url}`);
  }
  
  /**
   * Connect to the WebSocket server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // If already connected, resolve immediately
        if (this.socket && this.socket.readyState === WebSocketReadyState.OPEN) {
          resolve();
          return;
        }
        
        // If connecting, wait for it
        if (this.socket && this.socket.readyState === WebSocketReadyState.CONNECTING) {
          this.onConnect(() => resolve());
          return;
        }
        
        // Create new WebSocket connection
        console.log(`[WebSocket] Connecting to ${this.url}...`);
        this.socket = new WebSocket(this.url);
        
        // Handle connection opening
        this.socket.onopen = () => {
          console.log('[WebSocket] Connection established');
          this.reconnectAttempts = 0;
          this.processPendingMessages();
          this.notifyConnectHandlers();
          resolve();
        };
        
        // Handle errors
        this.socket.onerror = (error) => {
          console.error('[WebSocket] Connection error:', error);
          if (!this.reconnecting) {
            reject(error);
          }
        };
        
        // Handle messages
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };
        
        // Handle connection closing
        this.socket.onclose = (event) => {
          console.log(`[WebSocket] Connection closed: ${event.code} ${event.reason}`);
          this.notifyDisconnectHandlers();
          
          // Attempt to reconnect if the connection was previously established
          if (!this.reconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnecting = true;
            this.reconnectAttempts += 1;
            console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
              this.reconnecting = false;
              this.connect().catch(() => {
                console.error('[WebSocket] Failed to reconnect');
              });
            }, this.reconnectInterval);
          }
        };
      } catch (error) {
        console.error('[WebSocket] Error creating connection:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Close the WebSocket connection
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  /**
   * Send a message to the server
   */
  public send(message: WebSocketMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocketReadyState.OPEN) {
      console.warn('[WebSocket] Cannot send message, connection not open. Queueing message.');
      this.messageQueue.push(message);
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
      this.messageQueue.push(message);
      return false;
    }
  }
  
  /**
   * Process any pending messages in the queue
   */
  private processPendingMessages(): void {
    if (this.messageQueue.length === 0) {
      return;
    }
    
    console.log(`[WebSocket] Processing ${this.messageQueue.length} queued messages`);
    
    // Create a copy of the queue and clear it
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    
    // Send each message
    messages.forEach(message => {
      this.send(message);
    });
  }
  
  /**
   * Handle an incoming message
   */
  private handleMessage(message: any): void {
    // Check if message has an event type
    if (message.event) {
      // Notify all handlers for this event type
      const handlers = this.messageHandlers.get(message.event);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.data || message);
          } catch (error) {
            console.error(`[WebSocket] Error in handler for event "${message.event}":`, error);
          }
        });
      }
    }
  }
  
  /**
   * Register a handler for a specific message type
   */
  public onMessage(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(handler);
  }
  
  /**
   * Register a handler for connection events
   */
  public onConnect(handler: ConnectionHandler): void {
    this.onConnectHandlers.push(handler);
  }
  
  /**
   * Register a handler for disconnection events
   */
  public onDisconnect(handler: ConnectionHandler): void {
    this.onDisconnectHandlers.push(handler);
  }
  
  /**
   * Notify all connection handlers
   */
  private notifyConnectHandlers(): void {
    this.onConnectHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('[WebSocket] Error in connect handler:', error);
      }
    });
  }
  
  /**
   * Notify all disconnection handlers
   */
  private notifyDisconnectHandlers(): void {
    this.onDisconnectHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('[WebSocket] Error in disconnect handler:', error);
      }
    });
  }
  
  /**
   * Get the current state of the WebSocket connection
   */
  public getState(): WebSocketReadyState {
    if (!this.socket) {
      return WebSocketReadyState.CLOSED;
    }
    
    return this.socket.readyState;
  }
  
  /**
   * Check if the connection is open
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocketReadyState.OPEN;
  }
}

// Create and export a singleton instance
export const webSocketClient = new MCPWebSocketClient();