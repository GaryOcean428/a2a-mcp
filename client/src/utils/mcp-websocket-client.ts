/**
 * MCP WebSocket Client
 * 
 * This singleton class handles connection to the server's WebSocket endpoint.
 * It implements reconnection logic, authentication, and event handling.
 */

import { 
  getWebSocketUrl, 
  isWebSocketReady, 
  setupWebSocketKeepalive,
  handleWebSocketError,
  getWebSocketCloseReason,
  createWebSocketError,
  WebSocketMessage,
  ConnectionStatus,
  WebSocketError
} from './websocket-utils';
import { logger } from './logger';
import { OriginalWebSocket } from './vite-hmr-fix';

// Event types that can be listened to
type EventType = 'status' | 'schemas' | 'error' | 'message' | 'response' | 'auth' | string;

// Handler function type for WebSocket events
type EventHandler = (data: any) => void;

class McpWebSocketClient {
  private socket: WebSocket | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // ms
  private events: Map<EventType, Set<EventHandler>> = new Map();
  private authenticated = false;
  private pendingAuthentication = false;
  private keepaliveCleanup: (() => void) | null = null;
  
  /**
   * Initialize the WebSocket connection
   */
  public initialize(): void {
    if (this.socket || this.isConnecting) {
      return;
    }
    
    this.connect();
  }
  
  /**
   * Connect to the WebSocket server
   */
  private connect(): void {
    if (this.isConnecting) {
      return;
    }
    
    this.isConnecting = true;
    
    try {
      // Use the utility function to get a safe WebSocket URL
      const wsUrl = getWebSocketUrl('/mcp-ws');
      
      logger.info(`Connecting to WebSocket server`, {
        tags: ['websocket'],
        data: { url: wsUrl }
      });
      
      // Create the WebSocket with proper error handling
      try {
        // Use OriginalWebSocket to avoid conflicts with our HMR patch
        this.socket = new OriginalWebSocket(wsUrl);
        
        // Set up event handlers
        this.socket.onopen = this.handleOpen.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
        this.socket.onerror = this.handleError.bind(this);
        this.socket.onmessage = this.handleMessage.bind(this);
      } catch (socketError) {
        // Handle WebSocket construction errors specifically
        logger.error('Failed to construct WebSocket', {
          tags: ['websocket', 'fatal-error'],
          error: socketError
        });
        throw socketError;
      }
    } catch (error) {
      logger.error('WebSocket connection error', {
        tags: ['websocket', 'connection-error'],
        error
      });
      
      this.isConnecting = false;
      this.emitEvent('status', { status: 'error', error });
      this.emitEvent('error', error);
      
      // Try to reconnect after delay
      this.scheduleReconnect();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    // Clean up keepalive
    if (this.keepaliveCleanup) {
      this.keepaliveCleanup();
      this.keepaliveCleanup = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.authenticated = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    logger.info('WebSocket connection established', {
      tags: ['websocket', 'connection']
    });
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    // Emit connected status
    this.emitEvent('status', { status: 'connected' });
    
    // Authenticate if needed
    if (!this.authenticated && !this.pendingAuthentication) {
      this.authenticate();
    }
    
    // Set up keepalive ping to help maintain the connection
    if (this.socket) {
      // Clean up any existing keepalive
      if (this.keepaliveCleanup) {
        this.keepaliveCleanup();
        this.keepaliveCleanup = null;
      }
      
      // Setup a new keepalive
      this.keepaliveCleanup = setupWebSocketKeepalive(
        this.socket,
        this.send.bind(this),
        15000 // 15 seconds
      );
      
      logger.debug('WebSocket keepalive setup', {
        tags: ['websocket', 'keepalive'],
        data: { intervalMs: 15000 }
      });
    }
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.isConnecting = false;
    this.socket = null;
    this.authenticated = false;
    
    // Clean up keepalive
    if (this.keepaliveCleanup) {
      this.keepaliveCleanup();
      this.keepaliveCleanup = null;
    }
    
    const reason = getWebSocketCloseReason(event.code);
    
    logger.info('WebSocket connection closed', {
      tags: ['websocket', 'disconnection'],
      data: { 
        code: event.code,
        reason: event.reason || reason,
        wasClean: event.wasClean 
      }
    });
    
    this.emitEvent('status', { status: 'disconnected' });
    
    // Try to reconnect if not a normal closure
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    // Use our utility to handle the error consistently
    const errorMessage = handleWebSocketError(event);
    
    logger.error('WebSocket error occurred', {
      tags: ['websocket', 'error'],
      data: { message: errorMessage },
      error: event instanceof ErrorEvent ? event.error : event
    });
    
    this.emitEvent('error', { message: errorMessage, originalEvent: event });
    this.emitEvent('status', { status: 'error', error: { message: errorMessage } });
    
    // Socket will close after error, so we'll reconnect in the onclose handler
  }
  
  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    let data: WebSocketMessage;
    
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      logger.error('Failed to parse WebSocket message', {
        tags: ['websocket', 'parse-error'],
        error,
        data: { messageData: String(event.data).substring(0, 100) }
      });
      return;
    }
    
    // Log the received message at debug level
    logger.debug('WebSocket message received', {
      tags: ['websocket', 'message'],
      data: { id: data.id, type: data.type, success: data.success }
    });
    
    // Handle authentication response
    if (data.id === 'auth') {
      this.pendingAuthentication = false;
      this.authenticated = data.success === true;
      
      if (this.authenticated) {
        logger.info('WebSocket authentication successful', {
          tags: ['websocket', 'auth']
        });
      } else {
        logger.error('WebSocket authentication failed', {
          tags: ['websocket', 'auth', 'error'],
          data: { error: data.error }
        });
      }
      return;
    }
    
    // Handle schemas message
    if (data.id === 'schemas') {
      this.emitEvent('schemas', data.schemas || []);
      logger.debug('Received schema definitions', {
        tags: ['websocket', 'schemas'],
        data: { schemaCount: data.schemas ? data.schemas.length : 0 }
      });
    }
    
    // Emit the message event for all messages
    this.emitEvent('message', data);
    
    // Emit event based on message ID
    if (data.id) {
      this.emitEvent(data.id as EventType, data);
    }
  }
  
  /**
   * Authenticate with the server
   */
  private authenticate(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      logger.warn('Cannot authenticate: WebSocket not connected', {
        tags: ['websocket', 'auth']
      });
      return;
    }
    
    this.pendingAuthentication = true;
    
    // Get authentication token from localStorage or cookies
    const authToken = localStorage.getItem('mcp-auth-token');
    
    logger.info('Authenticating WebSocket connection', {
      tags: ['websocket', 'auth'],
      data: { hasToken: !!authToken }
    });
    
    const authMessage = {
      id: 'auth',
      token: authToken || 'anonymous',
    };
    
    this.socket.send(JSON.stringify(authMessage));
  }
  
  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn('Maximum WebSocket reconnect attempts reached', {
        tags: ['websocket', 'reconnect'],
        data: { maxAttempts: this.maxReconnectAttempts }
      });
      return;
    }
    
    this.reconnectAttempts++;
    
    // Use exponential backoff
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    logger.info('Scheduling WebSocket reconnection attempt', {
      tags: ['websocket', 'reconnect'],
      data: { 
        attempt: this.reconnectAttempts, 
        maxAttempts: this.maxReconnectAttempts,
        delayMs: delay
      }
    });
    
    setTimeout(() => {
      if (!this.socket && !this.isConnecting) {
        this.connect();
      }
    }, delay);
  }
  
  /**
   * Register an event handler
   */
  public on(event: EventType, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(handler);
  }
  
  /**
   * Remove an event handler
   */
  public off(event: EventType, handler: EventHandler): void {
    if (!this.events.has(event)) {
      return;
    }
    
    this.events.get(event)!.delete(handler);
  }
  
  /**
   * Emit an event to all registered handlers
   */
  private emitEvent(event: EventType, data: any): void {
    if (!this.events.has(event)) {
      return;
    }
    
    // Convert Set to Array to avoid TypeScript iteration issues
    const handlers = Array.from(this.events.get(event)!);
    
    logger.debug('Emitting WebSocket event', {
      tags: ['websocket', 'event'],
      data: { 
        event,
        handlerCount: handlers.length,
        hasData: !!data
      }
    });
    
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        logger.error(`Error in WebSocket event handler`, {
          tags: ['websocket', 'event-handler', 'error'],
          error,
          data: { event }
        });
      }
    }
  }
  
  /**
   * Send a message to the server
   */
  public send(message: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      logger.warn('Cannot send WebSocket message: socket not open', {
        tags: ['websocket', 'send-error'],
        data: { 
          readyState: this.socket ? this.socket.readyState : 'null',
          messageType: typeof message
        }
      });
      return false;
    }
    
    try {
      const messageStr = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);
      
      logger.debug('Sending WebSocket message', {
        tags: ['websocket', 'send'],
        data: { 
          messageId: typeof message === 'object' ? message.id : undefined,
          messageType: typeof message === 'object' ? message.type : undefined
        }
      });
        
      this.socket.send(messageStr);
      return true;
    } catch (error) {
      logger.error('Error sending WebSocket message', {
        tags: ['websocket', 'send-error'],
        error,
        data: { messageType: typeof message }
      });
      return false;
    }
  }
  
  /**
   * Get the current connection status
   */
  public getStatus(): ConnectionStatus {
    if (!this.socket) {
      return { status: 'disconnected' };
    }
    
    if (this.isConnecting) {
      return { status: 'connecting' };
    }
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return { status: 'connecting' };
      case WebSocket.OPEN:
        return { status: 'connected' };
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
      default:
        return { status: 'disconnected' };
    }
  }
  
  /**
   * Check if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
  
  /**
   * Force a reconnection attempt
   */
  public reconnect(): void {
    logger.info('Forcing WebSocket reconnection', {
      tags: ['websocket', 'reconnect']
    });
    
    // Close existing connection if open
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.connect();
  }
}

// Export a singleton instance
export const mcpWebSocketClient = new McpWebSocketClient();