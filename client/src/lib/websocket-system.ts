/**
 * Unified WebSocket System
 * 
 * This module provides a comprehensive WebSocket client implementation with
 * automatic reconnection, error handling, and event management.
 */

// Maximum number of reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 5;

// Delay between reconnection attempts (ms)
const RECONNECT_DELAY = 2000;

// Ping interval to keep connection alive (ms)
const PING_INTERVAL = 30000;

// WebSocket debug mode
const WS_DEBUG = false;

/**
 * WebSocket connection states
 */
export enum WebSocketState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

/**
 * WebSocket message
 */
export interface WebSocketMessage {
  type: string;
  payload?: any;
}

/**
 * WebSocket event listener
 */
export type WebSocketEventListener = (data: any) => void;

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  pingInterval?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
  onMessage?: (message: any) => void;
}

/**
 * Enhanced WebSocket Client
 * 
 * A robust WebSocket client with automatic reconnection, error handling,
 * and event management capabilities.
 */
export class EnhancedWebSocketClient {
  private url: string;
  private protocols?: string | string[];
  private socket: WebSocket | null = null;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private pingTimer: number | null = null;
  private eventListeners: Map<string, WebSocketEventListener[]> = new Map();
  private autoReconnect: boolean;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private pingInterval: number;
  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;
  private onErrorCallback?: (error: any) => void;
  private onMessageCallback?: (message: any) => void;

  /**
   * Create a new WebSocket client
   */
  constructor(config: WebSocketConfig) {
    this.url = config.url;
    this.protocols = config.protocols;
    this.autoReconnect = config.autoReconnect ?? true;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? MAX_RECONNECT_ATTEMPTS;
    this.reconnectDelay = config.reconnectDelay ?? RECONNECT_DELAY;
    this.pingInterval = config.pingInterval ?? PING_INTERVAL;
    this.onOpenCallback = config.onOpen;
    this.onCloseCallback = config.onClose;
    this.onErrorCallback = config.onError;
    this.onMessageCallback = config.onMessage;
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.socket && 
        (this.socket.readyState === WebSocket.CONNECTING || 
         this.socket.readyState === WebSocket.OPEN)) {
      this.log('debug', 'Socket already connected or connecting');
      return;
    }

    this.log('debug', `Connecting to WebSocket: ${this.url}`);
    this.state = WebSocketState.CONNECTING;

    try {
      this.log('debug', 'Using enhanced WebSocket constructor');
      this.socket = new WebSocket(this.url, this.protocols);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      this.log('error', 'Error creating WebSocket', error);
      this.handleError(error);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.log('debug', 'Closing WebSocket connection');
    this.clearTimers();
    this.autoReconnect = false;
    
    if (this.socket) {
      try {
        this.socket.close();
      } catch (error) {
        this.log('error', 'Error closing WebSocket', error);
      }
    }
    
    this.state = WebSocketState.DISCONNECTED;
  }

  /**
   * Reconnect to the WebSocket server
   */
  public reconnect(): void {
    this.log('debug', 'Reconnecting to WebSocket');
    this.clearTimers();
    
    if (this.socket) {
      try {
        this.socket.close();
      } catch (error) {
        // Ignore errors when closing
      }
    }
    
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      this.log('warn', `Maximum reconnect attempts (${this.maxReconnectAttempts}) reached`);
      this.state = WebSocketState.ERROR;
      return;
    }
    
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  /**
   * Send a message to the WebSocket server
   */
  public send(message: string | WebSocketMessage): boolean {
    if (!this.isConnected()) {
      this.log('warn', 'Cannot send message - socket not connected');
      return false;
    }
    
    try {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket!.send(data);
      return true;
    } catch (error) {
      this.log('error', 'Error sending message', error);
      return false;
    }
  }

  /**
   * Add an event listener
   */
  public on(event: string, callback: WebSocketEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove an event listener
   */
  public off(event: string, callback: WebSocketEventListener): void {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Check if the WebSocket is connected
   */
  public isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get the current WebSocket state
   */
  public getState(): WebSocketState {
    return this.state;
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    this.log('debug', 'WebSocket connection opened');
    this.state = WebSocketState.CONNECTED;
    this.reconnectAttempts = 0;
    this.startPingTimer();
    this.dispatchEvent('open', event);
    
    if (this.onOpenCallback) {
      this.onOpenCallback();
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.log('debug', `WebSocket connection closed: code ${event.code}, reason: ${event.reason}`);
    this.state = WebSocketState.DISCONNECTED;
    this.clearTimers();
    this.dispatchEvent('close', event);
    
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
    
    if (this.autoReconnect) {
      this.reconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(error: any): void {
    this.log('error', 'WebSocket connection error', error);
    this.state = WebSocketState.ERROR;
    this.dispatchEvent('error', error);
    
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    let data = event.data;
    
    // Try to parse JSON messages
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
        
        // Dispatch events based on message type
        if (data.type) {
          this.dispatchEvent(data.type, data.payload);
        }
      } catch {
        // Not a JSON message, leave as string
      }
    }
    
    this.dispatchEvent('message', data);
    
    if (this.onMessageCallback) {
      this.onMessageCallback(data);
    }
  }

  /**
   * Start the ping timer to keep the connection alive
   */
  private startPingTimer(): void {
    this.clearTimers();
    
    this.pingTimer = window.setInterval(() => {
      if (this.isConnected()) {
        // Send a ping message
        this.send({ type: 'ping', payload: { timestamp: Date.now() } });
      }
    }, this.pingInterval);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Dispatch an event to listeners
   */
  private dispatchEvent(event: string, data: any): void {
    if (!this.eventListeners.has(event)) return;
    
    for (const listener of this.eventListeners.get(event)!) {
      try {
        listener(data);
      } catch (error) {
        this.log('error', `Error in event listener for '${event}'`, error);
      }
    }
  }

  /**
   * Log a message with appropriate styling
   */
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    if (!WS_DEBUG && level === 'debug') return;
    
    const prefix = '[websocket:enhanced]';
    
    switch (level) {
      case 'info':
        console.info(`${prefix} ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`, data || '');
        break;
      case 'error':
        console.error(`${prefix} ${message}`, data || '');
        break;
      case 'debug':
        console.debug(`${prefix} ${message}`, data || '');
        break;
    }
  }
}

/**
 * Create a WebSocket URL with the correct protocol (ws:// or wss://)
 * based on the current window location
 */
export function createWebSocketUrl(path: string, port?: number): string {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  
  // Determine protocol (ws or wss) based on current page protocol
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  
  // Use specified port or default to current host
  if (port) {
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:${port}${path}`;
  }
  
  return `${protocol}//${host}${path}`;
}

/**
 * WebSocket connection utility to manage connection status and reconnection
 */
export const WebSocketUtils = {
  /**
   * Apply fixes for WebSocket connection issues
   */
  applyConnectionFixes: (): void => {
    // Add global error handler for WebSocket connections
    window.addEventListener('error', (event) => {
      if (event.message && 
          (event.message.includes('WebSocket') || 
           event.message.includes('network error'))) {
        console.error('[websocket:fix] WebSocket connection error', event);
      }
    });
    
    // Polyfill WebSocket.OPEN for older browsers that might not have it
    if (typeof WebSocket !== 'undefined' && typeof WebSocket.OPEN === 'undefined') {
      (WebSocket as any).OPEN = 1;
    }
  },
  
  /**
   * Attempt connection with fallback to standard ports if needed
   */
  tryConnectWithFallback: (url: string, callback: (client: EnhancedWebSocketClient) => void): void => {
    // Try primary connection
    const client = new EnhancedWebSocketClient({
      url,
      autoReconnect: false,
      onError: () => {
        // If primary connection fails, try standard port fallback
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const hostname = window.location.hostname;
        const standardPort = window.location.protocol === 'https:' ? 443 : 80;
        const pathMatch = url.match(/(\/[^:]*$)|(\/.*$)/);
        const path = pathMatch ? pathMatch[0] : '/';
        
        const fallbackUrl = `${protocol}//${hostname}:${standardPort}${path}`;
        console.log(`[websocket:fix] Trying fallback connection to ${fallbackUrl}`);
        
        const fallbackClient = new EnhancedWebSocketClient({
          url: fallbackUrl,
          autoReconnect: true
        });
        
        fallbackClient.connect();
        callback(fallbackClient);
      }
    });
    
    client.connect();
    callback(client);
  }
};

// Apply fixes automatically in browser environment
if (typeof window !== 'undefined') {
  WebSocketUtils.applyConnectionFixes();
}
