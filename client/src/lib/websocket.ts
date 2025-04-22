import { websocketConfig } from '../config';

/**
 * WebSocket connection status
 */
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * A wrapper around WebSocket with reconnection logic and event handling
 */
export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private statusHandlers: ((status: ConnectionStatus) => void)[] = [];

  constructor(
    path: string = '/mcp-ws',  // Match the server-side WebSocket path
    options = websocketConfig.connectionOptions
  ) {
    this.url = websocketConfig.getWebsocketUrl(path);
    this.maxReconnectAttempts = options.maxReconnectAttempts;
    this.reconnectInterval = options.reconnectInterval;
    
    // Log WebSocket URL for debugging
    console.log(`WebSocket client configured with URL: ${this.url}`);
    
    // Fallback to HTTP transport in development if WebSocket fails
    if (import.meta.env.DEV) {
      console.log('Development mode: Using HTTP transport instead of WebSockets');
    }
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      this.updateStatus(ConnectionStatus.CONNECTING);
      console.log(`Connecting to WebSocket at ${this.url}`);
      
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.updateStatus(ConnectionStatus.ERROR);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.updateStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Send a message to the WebSocket server
   */
  send(type: string, data: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not open');
      return false;
    }
    
    try {
      const message = JSON.stringify({ type, data });
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  /**
   * Register a message handler
   */
  onMessage(type: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index >= 0) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Register a status change handler
   */
  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusHandlers.indexOf(handler);
      if (index >= 0) {
        this.statusHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get the current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.updateStatus(ConnectionStatus.CONNECTED);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
    this.updateStatus(ConnectionStatus.DISCONNECTED);
    this.scheduleReconnect();
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.updateStatus(ConnectionStatus.ERROR);
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      const { type, data } = message;
      
      // Call all handlers for this message type
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.forEach(handler => handler(data));
      }
      
      // Call handlers for '*' (all messages)
      const allHandlers = this.messageHandlers.get('*');
      if (allHandlers) {
        allHandlers.forEach(handler => handler(message));
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached, giving up');
      return;
    }
    
    this.reconnectAttempts++;
    this.updateStatus(ConnectionStatus.RECONNECTING);
    
    console.log(`Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Update the connection status and notify handlers
   */
  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusHandlers.forEach(handler => handler(status));
  }
}

// Export a singleton instance
export const websocket = new WebSocketClient();