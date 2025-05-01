/**
 * MCP WebSocket Client
 * 
 * This singleton class handles connection to the server's WebSocket endpoint.
 * It implements reconnection logic, authentication, and event handling.
 */

import { getWebSocketUrl, isWebSocketReady, setupWebSocketKeepalive, handleWebSocketError } from './websocket-utils';

type EventHandler = (data: any) => void;
type EventType = 'status' | 'schemas' | 'error' | 'message' | 'response';

interface WebSocketMessage {
  id: string;
  [key: string]: any;
}

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  error?: Error;
}

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
      
      console.log(`[WebSocket] Connecting to ${wsUrl}...`);
      
      // Create the WebSocket with proper error handling
      try {
        this.socket = new WebSocket(wsUrl);
        
        // Set up event handlers
        this.socket.onopen = this.handleOpen.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
        this.socket.onerror = this.handleError.bind(this);
        this.socket.onmessage = this.handleMessage.bind(this);
      } catch (socketError) {
        // Handle WebSocket construction errors specifically
        console.error('[WebSocket] Failed to construct WebSocket:', socketError);
        throw socketError;
      }
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
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
    console.log('[WebSocket] Connection established');
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
    
    console.log(`[WebSocket] Connection closed: ${event.code} ${event.reason || ''}`);
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
    
    this.emitEvent('error', { message: errorMessage, originalEvent: event });
    this.emitEvent('status', { status: 'error', error: { message: errorMessage } });
    
    // Socket will close after error, so we'll reconnect in the onclose handler
    console.error('[WebSocket] Error occurred:', errorMessage);
  }
  
  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    let data: WebSocketMessage;
    
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
      return;
    }
    
    // Handle authentication response
    if (data.id === 'auth') {
      this.pendingAuthentication = false;
      this.authenticated = data.success === true;
      
      if (this.authenticated) {
        console.log('[WebSocket] Authentication successful');
      } else {
        console.error('[WebSocket] Authentication failed:', data.error);
      }
      return;
    }
    
    // Handle schemas message
    if (data.id === 'schemas') {
      this.emitEvent('schemas', data.schemas || []);
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
      return;
    }
    
    this.pendingAuthentication = true;
    
    // Get authentication token from localStorage or cookies
    const authToken = localStorage.getItem('mcp-auth-token');
    
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
      console.warn(`[WebSocket] Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    this.reconnectAttempts++;
    
    // Use exponential backoff
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
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
    
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error(`[WebSocket] Error in event handler for ${event}:`, error);
      }
    }
  }
  
  /**
   * Send a message to the server
   */
  public send(message: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send message: socket is not open');
      return false;
    }
    
    try {
      const messageStr = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);
        
      this.socket.send(messageStr);
      return true;
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
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