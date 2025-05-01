/**
 * MCP Integration Platform - WebSocket utilities
 * 
 * This file provides utilities to work with WebSocket connections
 * and handle errors gracefully.
 */

/**
 * Creates a WebSocket connection with proper error handling
 * @param url The WebSocket server URL
 * @param options Additional options for the WebSocket
 * @returns The WebSocket instance
 */
export function createSafeWebSocket(url: string, options?: { 
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}) {
  // Validate URL format to avoid errors
  if (!url || url.includes('undefined')) {
    console.error(`[WebSocket] Invalid WebSocket URL: ${url}`);
    throw new Error(`Invalid WebSocket URL: ${url}`);
  }
  
  try {
    // Create the WebSocket
    const socket = new WebSocket(url);
    
    // Set up event handlers with error protection
    if (options?.onOpen) {
      socket.addEventListener('open', (event) => {
        try {
          options.onOpen?.(event);
        } catch (error) {
          console.error('[WebSocket] Error in onOpen handler:', error);
        }
      });
    }
    
    if (options?.onMessage) {
      socket.addEventListener('message', (event) => {
        try {
          options.onMessage?.(event);
        } catch (error) {
          console.error('[WebSocket] Error in onMessage handler:', error);
        }
      });
    }
    
    if (options?.onClose) {
      socket.addEventListener('close', (event) => {
        try {
          options.onClose?.(event);
        } catch (error) {
          console.error('[WebSocket] Error in onClose handler:', error);
        }
      });
    }
    
    // Always set up an error handler
    socket.addEventListener('error', (event) => {
      console.error('[WebSocket] Error:', event);
      if (options?.onError) {
        try {
          options.onError(event);
        } catch (error) {
          console.error('[WebSocket] Error in onError handler:', error);
        }
      }
    });
    
    return socket;
  } catch (error) {
    console.error('[WebSocket] Failed to create WebSocket:', error);
    throw error;
  }
}

/**
 * Safely sends a message through a WebSocket
 * @param socket The WebSocket instance
 * @param data The data to send
 * @returns True if the message was sent successfully
 */
export function safeSend(socket: WebSocket | null, data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean {
  if (!socket) {
    console.warn('[WebSocket] Cannot send message: No socket provided');
    return false;
  }
  
  if (socket.readyState !== WebSocket.OPEN) {
    console.warn(`[WebSocket] Cannot send message: Socket not open (state: ${socket.readyState})`);
    return false;
  }
  
  try {
    socket.send(data);
    return true;
  } catch (error) {
    console.error('[WebSocket] Error sending message:', error);
    return false;
  }
}

/**
 * Safely closes a WebSocket connection
 * @param socket The WebSocket instance
 * @param code The close code
 * @param reason The close reason
 */
export function safeClose(socket: WebSocket | null, code?: number, reason?: string): void {
  if (!socket) {
    return;
  }
  
  try {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close(code, reason);
    }
  } catch (error) {
    console.error('[WebSocket] Error closing WebSocket:', error);
  }
}

/**
 * Returns a human-readable status for a WebSocket
 * @param socket The WebSocket instance
 * @returns A string describing the connection status
 */
export function getConnectionStatus(socket: WebSocket | null): string {
  if (!socket) return 'Not initialized';
  
  switch (socket.readyState) {
    case WebSocket.CONNECTING:
      return 'Connecting';
    case WebSocket.OPEN:
      return 'Connected';
    case WebSocket.CLOSING:
      return 'Closing';
    case WebSocket.CLOSED:
      return 'Disconnected';
    default:
      return 'Unknown';
  }
}
