/**
 * MCP Integration Platform - Enhanced WebSocket Client
 * 
 * This module provides a robust WebSocket implementation with automatic reconnection,
 * error handling, and adapters for both standard and Replit environments.
 */

import { IS_PRODUCTION } from './environment-helpers';

// Debug flags
const WEBSOCKET_DEBUG = process.env.NODE_ENV === 'development';
const IS_REPLIT_ENV = typeof window !== 'undefined' && window.location.hostname.includes('replit');

// Default configuration
const DEFAULT_CONFIG = {
  reconnect: true,
  maxReconnectAttempts: 10,
  reconnectDelay: 1500,
  reconnectBackoffMultiplier: 1.5,
  heartbeatInterval: 15000,
  heartbeatTimeout: 5000,
  debug: WEBSOCKET_DEBUG,
};

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Error) => void;

interface WebSocketClientConfig {
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  reconnectBackoffMultiplier?: number;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  debug?: boolean;
}

interface EventHandlers {
  [eventName: string]: Array<MessageHandler>;
}

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  reconnectAttempts: number;
  lastError?: Error;
  lastHeartbeat?: number;
  url: string;
}

/**
 * Enhanced WebSocket client with reconnection and error handling
 */
export class EnhancedWebSocketClient {
  private socket: WebSocket | null = null;
  private config: Required<WebSocketClientConfig>;
  private messageHandlers: MessageHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private disconnectionHandlers: ConnectionHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private eventHandlers: EventHandlers = {};
  private reconnectTimeout: number | null = null;
  private heartbeatInterval: number | null = null;
  private heartbeatTimeout: number | null = null;
  private state: ConnectionState = {
    connected: false,
    connecting: false,
    reconnectAttempts: 0,
    url: '',
  };

  /**
   * Create a new enhanced WebSocket client
   */
  constructor(config?: WebSocketClientConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(url: string, protocols?: string | string[]): void {
    if (this.state.connecting) {
      this.log('Already connecting to WebSocket server');
      return;
    }

    // Store the URL for potential reconnections
    this.state.url = url;
    
    // Update state
    this.state.connecting = true;
    
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout !== null) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Adjust URL for Replit environment if needed
    if (IS_REPLIT_ENV && url.includes('localhost')) {
      const originalPath = new URL(url).pathname;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      url = `${protocol}//${window.location.host}${originalPath}`;
      this.log('Replit environment detected - adjusted WebSocket URL', { original: this.state.url, corrected: url });
      this.state.url = url; // Update with corrected URL
    }

    this.log('Connecting to WebSocket server', { url, attempt: this.state.reconnectAttempts + 1 });

    try {
      // Use the enhanced WebSocket constructor if available via our global monkey patch
      if (window.mcpWebSocketCreateEnhanced) {
        this.log('Using enhanced WebSocket constructor');
        this.socket = window.mcpWebSocketCreateEnhanced(url, protocols);
      } else {
        this.socket = new WebSocket(url, protocols);
      }

      // Setup event listeners
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      this.log('Error creating WebSocket', error);
      this.state.connecting = false;
      this.state.lastError = error instanceof Error ? error : new Error('Unknown WebSocket error');
      this.notifyErrorHandlers(this.state.lastError);
      this.scheduleReconnect();
    }
  }

  /**
   * Close the WebSocket connection
   */
  public close(code?: number, reason?: string): void {
    this.log('Closing WebSocket connection', { code, reason });
    
    // Clear any pending timeouts/intervals
    this.clearTimers();
    
    // Close the socket if it exists
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      try {
        this.socket.close(code, reason);
      } catch (error) {
        this.log('Error closing WebSocket', error);
      }
    }
    
    this.state.connected = false;
    this.state.connecting = false;
  }

  /**
   * Send a message to the WebSocket server
   */
  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.log('Cannot send message, socket not open');
      return false;
    }

    try {
      this.socket.send(data);
      return true;
    } catch (error) {
      this.log('Error sending message', error);
      const wsError = error instanceof Error ? error : new Error('Failed to send message');
      this.notifyErrorHandlers(wsError);
      return false;
    }
  }

  /**
   * Send a JSON message to the WebSocket server
   */
  public sendJson(data: any): boolean {
    try {
      const json = JSON.stringify(data);
      return this.send(json);
    } catch (error) {
      this.log('Error serializing JSON message', error);
      const wsError = error instanceof Error ? error : new Error('Failed to serialize message');
      this.notifyErrorHandlers(wsError);
      return false;
    }
  }

  /**
   * Add a message handler
   */
  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Add a connection handler
   */
  public onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Add a disconnection handler
   */
  public onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.push(handler);
    return () => {
      this.disconnectionHandlers = this.disconnectionHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Add an error handler
   */
  public onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Add an event handler
   */
  public on(eventName: string, handler: MessageHandler): () => void {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    
    this.eventHandlers[eventName].push(handler);
    
    return () => {
      if (this.eventHandlers[eventName]) {
        this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(h => h !== handler);
      }
    };
  }

  /**
   * Emit an event to all registered handlers
   */
  public emit(eventName: string, data: any): void {
    if (this.eventHandlers[eventName]) {
      this.log('Emitting WebSocket event', { event: eventName, handlerCount: this.eventHandlers[eventName].length, hasData: !!data });
      this.eventHandlers[eventName].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          this.log(`Error in ${eventName} event handler`, error);
        }
      });
    }
  }

  /**
   * Get the current connection state
   */
  public getState(): ConnectionState {
    return { ...this.state };
  }

  /**
   * Check if the socket is connected
   */
  public isConnected(): boolean {
    return this.state.connected && !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Start the heartbeat to keep the connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing heartbeat
    
    if (!this.config.heartbeatInterval) return;
    
    this.log('Setting up WebSocket keepalive', { intervalMs: this.config.heartbeatInterval });
    
    this.heartbeatInterval = window.setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
    
    this.log('WebSocket keepalive setup');
  }

  /**
   * Send a heartbeat ping and set up timeout for response
   */
  private sendHeartbeat(): void {
    if (!this.isConnected()) {
      this.log('WebSocket not connected, skipping heartbeat');
      return;
    }
    
    this.log('Sending WebSocket heartbeat');
    this.sendJson({ messageType: 'ping' });
    this.state.lastHeartbeat = Date.now();
    
    // Set timeout for heartbeat response
    if (this.heartbeatTimeout !== null) {
      window.clearTimeout(this.heartbeatTimeout);
    }
    
    this.heartbeatTimeout = window.setTimeout(() => {
      this.log('WebSocket heartbeat timeout, reconnecting...');
      this.close(4000, 'Heartbeat timeout');
      this.connect(this.state.url);
    }, this.config.heartbeatTimeout);
  }

  /**
   * Stop the heartbeat
   */
  private stopHeartbeat(): void {
    this.log('WebSocket keepalive cleanup');
    
    if (this.heartbeatInterval !== null) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout !== null) {
      window.clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Clear all timers (reconnect, heartbeat)
   */
  private clearTimers(): void {
    if (this.reconnectTimeout !== null) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopHeartbeat();
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (!this.config.reconnect || this.state.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Not reconnecting: max attempts reached or reconnection disabled', { 
        attempt: this.state.reconnectAttempts, 
        maxAttempts: this.config.maxReconnectAttempts, 
        reconnectEnabled: this.config.reconnect 
      });
      return;
    }
    
    const delay = this.calculateBackoff();
    this.log('Scheduling WebSocket reconnection attempt', { 
      attempt: this.state.reconnectAttempts + 1, 
      maxAttempts: this.config.maxReconnectAttempts, 
      delayMs: delay 
    });
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect(this.state.url);
    }, delay);
  }

  /**
   * Calculate backoff delay for reconnection with exponential backoff
   */
  private calculateBackoff(): number {
    return this.config.reconnectDelay * Math.pow(
      this.config.reconnectBackoffMultiplier,
      Math.min(this.state.reconnectAttempts, 8) // Cap the exponent to prevent excessive delays
    );
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    this.log('WebSocket connection established');
    
    this.state.connected = true;
    this.state.connecting = false;
    this.state.reconnectAttempts = 0; // Reset reconnection attempts on successful connection
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Notify connection handlers
    this.notifyConnectionHandlers();
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.log('WebSocket connection closed', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    });
    
    this.state.connected = false;
    this.state.connecting = false;
    
    // Stop heartbeat
    this.stopHeartbeat();
    
    // Notify disconnection handlers
    this.notifyDisconnectionHandlers();
    
    // Attempt to reconnect if closure was unexpected
    if (this.config.reconnect && (event.code !== 1000 && event.code !== 1001)) {
      this.state.reconnectAttempts++;
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    // Create a standardized error object
    const error = new Error('Unknown WebSocket error');
    
    this.log('WebSocket error occurred', error);
    
    this.state.lastError = error;
    
    // Notify error handlers
    this.notifyErrorHandlers(error);
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      let data;
      
      // Parse JSON if the data is a string
      if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
          
          // Check if this is a heartbeat response
          if (data && data.messageType === 'pong') {
            this.log('Received WebSocket heartbeat response');
            if (this.heartbeatTimeout !== null) {
              window.clearTimeout(this.heartbeatTimeout);
              this.heartbeatTimeout = null;
            }
            return;
          }
          
          // Handle message event type if present
          if (data && data.event) {
            this.emit(data.event, data.data);
          }
        } catch (e) {
          this.log('Failed to parse message as JSON, treating as raw data', e);
          data = event.data;
        }
      } else {
        data = event.data;
      }
      
      this.log('WebSocket message received', data);
      
      // Notify message handlers
      this.notifyMessageHandlers(data);
    } catch (error) {
      this.log('Error handling WebSocket message', error);
      const wsError = error instanceof Error ? error : new Error('Failed to handle message');
      this.notifyErrorHandlers(wsError);
    }
  }

  /**
   * Notify all message handlers
   */
  private notifyMessageHandlers(data: any): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        this.log('Error in message handler', error);
      }
    });
  }

  /**
   * Notify all connection handlers
   */
  private notifyConnectionHandlers(): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        this.log('Error in connection handler', error);
      }
    });
  }

  /**
   * Notify all disconnection handlers
   */
  private notifyDisconnectionHandlers(): void {
    this.disconnectionHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        this.log('Error in disconnection handler', error);
      }
    });
  }

  /**
   * Notify all error handlers
   */
  private notifyErrorHandlers(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        this.log('Error in error handler', handlerError);
      }
    });
  }

  /**
   * Log a message if debugging is enabled
   */
  private log(message: string, data?: any): void {
    if (!this.config.debug) return;
    
    if (data) {
      console.debug(`[websocket:${message.toLowerCase().replace(/\s+/g, ':')}]`, message, data ? 'Data:' : '', data || '');
    } else {
      console.debug(`[websocket:${message.toLowerCase().replace(/\s+/g, ':')}]`, message);
    }
  }
}

// Create a singleton instance for shared use
let globalInstance: EnhancedWebSocketClient | null = null;

/**
 * Get or create the global WebSocket client instance
 */
export function getWebSocketClient(config?: WebSocketClientConfig): EnhancedWebSocketClient {
  if (!globalInstance) {
    globalInstance = new EnhancedWebSocketClient(config);
  }
  return globalInstance;
}

/**
 * Create a new WebSocket client instance (not shared)
 */
export function createWebSocketClient(config?: WebSocketClientConfig): EnhancedWebSocketClient {
  return new EnhancedWebSocketClient(config);
}
