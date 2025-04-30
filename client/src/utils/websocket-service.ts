/**
 * WebSocket Service
 * 
 * A singleton service to manage WebSocket connections with automatic reconnection
 * handling, ping/pong for connection health, and proper cleanup.
 */

import { WS_PATHS, CONNECTION_CONFIG, IS_DEVELOPMENT } from '../config/constants';

export type WebSocketEventHandler = (event: MessageEvent) => void;
export type WebSocketErrorHandler = (error: Event) => void;
export type WebSocketStatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

// Define possible WebSocket ready states for better type checking
const enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

interface WebSocketHandlers {
  onMessage?: WebSocketEventHandler;
  onError?: WebSocketErrorHandler;
  onStatusChange?: WebSocketStatusHandler;
}

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: number | null = null;
  private pingInterval: number | null = null;
  private connectionTimeout: number | null = null;
  private handlers: WebSocketHandlers = {};
  private lastPingTime = 0;
  private closing = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the WebSocketService singleton instance
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(handlers: WebSocketHandlers = {}): void {
    // Save handlers
    this.handlers = handlers;

    // Don't try to connect if already connecting or connected
    if (this.socket && this.socket.readyState !== ReadyState.CLOSED) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    // Reset the closing flag when starting a new connection
    this.closing = false;

    // Get the WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}${WS_PATHS.MCP}`;

    console.log(`[WebSocket] Connecting to ${wsUrl}...`);
    this.notifyStatusChange('connecting');

    try {
      // Create a new WebSocket connection
      this.socket = new WebSocket(wsUrl);

      // Set up connection timeout
      this.connectionTimeout = window.setTimeout(() => {
        console.warn('[WebSocket] Connection timeout');
        this.handleConnectionFailure();
      }, CONNECTION_CONFIG.CONNECTION_TIMEOUT);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.notifyStatusChange('error');
      this.handleConnectionFailure();
    }
  }

  /**
   * Send a message through the WebSocket
   */
  public send(data: any): boolean {
    if (this.socket && this.socket.readyState === ReadyState.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(message);
      return true;
    }
    console.warn('[WebSocket] Cannot send message, socket not open');
    return false;
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.closing = true; // Mark as intentional closing

    // Clear intervals and timeouts
    this.clearTimers();

    // Close the socket if it exists
    if (this.socket) {
      console.log('[WebSocket] Disconnecting...');
      this.socket.close();
      this.socket = null;
    }

    // Reset reconnection attempts
    this.reconnectAttempts = 0;
    this.notifyStatusChange('disconnected');
  }

  /**
   * Handle successful WebSocket connection
   */
  private handleOpen(event: Event): void {
    console.log('[WebSocket] Connection established');
    this.notifyStatusChange('connected');

    // Clear the connection timeout
    if (this.connectionTimeout !== null) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // Reset reconnection attempts on successful connection
    this.reconnectAttempts = 0;

    // Set up ping interval for connection health
    this.pingInterval = window.setInterval(() => {
      this.ping();
    }, CONNECTION_CONFIG.PING_INTERVAL);
  }

  /**
   * Handle WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      // Process pong messages internally
      const data = JSON.parse(event.data);
      if (data.event === 'pong') {
        const latency = Date.now() - this.lastPingTime;
        if (IS_DEVELOPMENT) {
          console.log(`[WebSocket] Received pong, latency: ${latency}ms`);
        }
        return;
      }
    } catch (error) {
      // Not JSON or not a pong message, continue with handler
    }

    // Forward other messages to the handler
    if (this.handlers.onMessage) {
      this.handlers.onMessage(event);
    }
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(event: Event): void {
    console.error('[WebSocket] Error:', event);
    
    if (this.handlers.onError) {
      this.handlers.onError(event);
    }
    
    this.notifyStatusChange('error');
  }

  /**
   * Handle WebSocket closure
   */
  private handleClose(event: CloseEvent): void {
    console.log(`[WebSocket] Connection closed: ${event.code} - ${event.reason || 'No reason provided'}`);
    
    // Clear intervals and timeouts
    this.clearTimers();
    
    // If this wasn't an intentional disconnect, attempt to reconnect
    if (!this.closing && this.reconnectAttempts < CONNECTION_CONFIG.RECONNECT_ATTEMPTS) {
      this.attemptReconnect();
    } else if (!this.closing) {
      console.error('[WebSocket] Maximum reconnection attempts reached');
      this.notifyStatusChange('error');
    }
  }

  /**
   * Handle connection failure
   */
  private handleConnectionFailure(): void {
    // Clear any existing connection timeout
    if (this.connectionTimeout !== null) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    // If socket exists, close it
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    // Attempt to reconnect
    if (this.reconnectAttempts < CONNECTION_CONFIG.RECONNECT_ATTEMPTS) {
      this.attemptReconnect();
    } else {
      console.error('[WebSocket] Maximum reconnection attempts reached');
      this.notifyStatusChange('error');
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectAttempts * CONNECTION_CONFIG.RECONNECT_INTERVAL;
    
    console.log(`[WebSocket] Reconnecting (attempt ${this.reconnectAttempts}/${CONNECTION_CONFIG.RECONNECT_ATTEMPTS}) in ${delay}ms`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect(this.handlers);
    }, delay);
  }

  /**
   * Send a ping message to keep the connection alive
   */
  private ping(): void {
    if (this.socket && this.socket.readyState === ReadyState.OPEN) {
      this.lastPingTime = Date.now();
      this.send({ type: 'ping', data: { timestamp: this.lastPingTime } });
    }
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.connectionTimeout !== null) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  /**
   * Notify status change to handlers
   */
  private notifyStatusChange(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    if (this.handlers.onStatusChange) {
      this.handlers.onStatusChange(status);
    }
  }
}

// Export the singleton instance
export const webSocketService = WebSocketService.getInstance();

// Export a React hook for the WebSocket service
import { useEffect, useState } from 'react';

export function useWebSocket(handlers: WebSocketHandlers = {}) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  useEffect(() => {
    // Enhance the handlers with our status handler
    const enhancedHandlers: WebSocketHandlers = {
      ...handlers,
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        handlers.onStatusChange?.(newStatus);
      }
    };
    
    // Connect to the WebSocket server
    webSocketService.connect(enhancedHandlers);
    
    // Cleanup when the component unmounts
    return () => {
      webSocketService.disconnect();
    };
  }, []); // Empty dependency array to connect only once
  
  return {
    status,
    send: webSocketService.send.bind(webSocketService),
    disconnect: webSocketService.disconnect.bind(webSocketService)
  };
}