/**
 * MCP Integration Platform - Enhanced WebSocket Hook
 * 
 * This hook provides a reliable WebSocket implementation with:
 * - Automatic reconnection with exponential backoff
 * - Message queue for offline periods
 * - Typed event system
 * - Heartbeat/ping mechanism
 * - Connection state management
 * - Comprehensive error handling
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

// WebSocket connection states
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Message handler type
type MessageHandler = (data: any) => void;

interface WebSocketState {
  status: ConnectionStatus;
  connected: boolean;
  lastConnected: number | null;
  reconnectAttempt: number;
  lastError: Error | null;
  messageQueue: any[];
}

interface WebSocketOptions {
  // WebSocket URL
  url: string;
  
  // Auto-connect when hook is initialized
  autoConnect?: boolean;
  
  // Enable auto-reconnection
  autoReconnect?: boolean;
  
  // Maximum number of reconnection attempts
  maxReconnectAttempts?: number;
  
  // Base delay for reconnection (ms)
  reconnectBaseDelay?: number;
  
  // Maximum delay for reconnection (ms)
  reconnectMaxDelay?: number;
  
  // Enable debug logging
  debug?: boolean;
  
  // Queue messages when offline
  queueOfflineMessages?: boolean;
  
  // Maximum queue size
  maxQueueSize?: number;
  
  // Enable heartbeat/ping
  enableHeartbeat?: boolean;
  
  // Heartbeat interval (ms)
  heartbeatInterval?: number;
  
  // Heartbeat timeout (ms)
  heartbeatTimeout?: number;
  
  // Protocol subprotocols
  protocols?: string | string[];
  
  // Event handlers
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (data: any) => void;
}

// Default options
const DEFAULT_OPTIONS: Partial<WebSocketOptions> = {
  autoConnect: true,
  autoReconnect: true,
  maxReconnectAttempts: 10,
  reconnectBaseDelay: 1000,
  reconnectMaxDelay: 30000,
  debug: false,
  queueOfflineMessages: true,
  maxQueueSize: 50,
  enableHeartbeat: true,
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000,
};

// Helper to generate exponential backoff delay
function getReconnectDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const delay = Math.min(baseDelay * Math.pow(1.5, attempt), maxDelay);
  // Add jitter (±20%)
  return delay * (0.8 + Math.random() * 0.4);
}

/**
 * Enhanced WebSocket Hook
 */
export function useEnhancedWebSocket(options: WebSocketOptions) {
  // Merge default options
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // WebSocket reference
  const socketRef = useRef<WebSocket | null>(null);
  
  // Timers
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Event handlers
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  
  // Track if component is mounted
  const isMountedRef = useRef<boolean>(true);
  
  // State
  const [state, setState] = useState<WebSocketState>({
    status: 'disconnected',
    connected: false,
    lastConnected: null,
    reconnectAttempt: 0,
    lastError: null,
    messageQueue: [],
  });
  
  // Debug logging helper
  const debug = useCallback(
    (message: string, data?: any) => {
      if (config.debug) {
        logger.debug(`[websocket:enhanced] ${message}`, data);
      }
    },
    [config.debug]
  );
  
  // Clear all timers
  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);
  
  // Close socket
  const closeSocket = useCallback(() => {
    if (socketRef.current && 
        (socketRef.current.readyState === WebSocket.OPEN || 
         socketRef.current.readyState === WebSocket.CONNECTING)) {
      debug('Closing WebSocket connection');
      socketRef.current.close();
    }
    
    socketRef.current = null;
  }, [debug]);
  
  // Connect to the WebSocket server
  const connect = useCallback(() => {
    // Skip if already connecting or connected
    if (socketRef.current && 
        (socketRef.current.readyState === WebSocket.CONNECTING || 
         socketRef.current.readyState === WebSocket.OPEN)) {
      debug('WebSocket already connecting or connected');
      return;
    }
    
    // Clear any existing timers
    clearTimers();
    
    // Update state
    setState(prev => ({
      ...prev,
      status: 'connecting',
    }));
    
    // Create new WebSocket
    try {
      debug(`Connecting to WebSocket: ${config.url}`);
      
      // Use enhanced WebSocket if available (from websocket-fix)
      if (window.mcpWebSocketCreateEnhanced) {
        debug('Using enhanced WebSocket constructor');
        socketRef.current = window.mcpWebSocketCreateEnhanced(config.url, config.protocols);
      } else {
        socketRef.current = new WebSocket(config.url, config.protocols);
      }
      
      // Connection established
      socketRef.current.onopen = () => {
        if (!isMountedRef.current) return;
        
        debug('WebSocket connection established');
        
        // Update state
        setState(prev => ({
          ...prev,
          status: 'connected',
          connected: true,
          lastConnected: Date.now(),
          reconnectAttempt: 0,
        }));
        
        // Start heartbeat
        if (config.enableHeartbeat) {
          startHeartbeat();
        }
        
        // Flush message queue
        if (config.queueOfflineMessages && state.messageQueue.length > 0) {
          debug(`Flushing ${state.messageQueue.length} queued messages`);
          
          // Clone and clear queue
          const messagesToSend = [...state.messageQueue];
          setState(prev => ({ ...prev, messageQueue: [] }));
          
          // Send all queued messages
          messagesToSend.forEach(msg => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
            }
          });
        }
        
        // Call user onConnect handler
        if (config.onConnect) {
          config.onConnect();
        }
      };
      
      // Connection closed
      socketRef.current.onclose = (event) => {
        if (!isMountedRef.current) return;
        
        debug('WebSocket connection closed', { code: event.code, reason: event.reason });
        
        // Update state
        setState(prev => ({
          ...prev,
          status: 'disconnected',
          connected: false,
        }));
        
        // Clear timers
        clearTimers();
        
        // Reconnect if enabled
        if (config.autoReconnect) {
          scheduleReconnect();
        }
        
        // Call user onDisconnect handler
        if (config.onDisconnect) {
          config.onDisconnect();
        }
      };
      
      // Connection error
      socketRef.current.onerror = (event) => {
        if (!isMountedRef.current) return;
        
        const error = new Error('WebSocket connection error');
        debug('WebSocket error event', { error });
        
        // Update state
        setState(prev => ({
          ...prev,
          status: 'error',
          lastError: error,
        }));
        
        // Call user onError handler
        if (config.onError) {
          config.onError(error);
        }
      };
      
      // Message received
      socketRef.current.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        try {
          // Parse message data
          const rawData = event.data;
          let parsedData: any;
          
          // Try to parse as JSON
          if (typeof rawData === 'string') {
            try {
              parsedData = JSON.parse(rawData);
            } catch (e) {
              // Not JSON, use raw data
              parsedData = rawData;
            }
          } else {
            // Binary or other data
            parsedData = rawData;
          }
          
          debug('[websocket:message] WebSocket message received', { data: parsedData });
          
          // Check for heartbeat response
          if (parsedData && 
              (parsedData.type === 'pong' || 
               (parsedData.messageType === 'pong'))) {
            handleHeartbeatResponse();
          }
          
          // Process message
          processMessage(parsedData);
          
          // Call user onMessage handler
          if (config.onMessage) {
            config.onMessage(parsedData);
          }
        } catch (error) {
          debug('Error processing WebSocket message', { error });
        }
      };
    } catch (error) {
      debug('Error creating WebSocket', { error });
      
      // Update state
      setState(prev => ({
        ...prev,
        status: 'error',
        lastError: error instanceof Error ? error : new Error('WebSocket creation failed'),
      }));
      
      // Schedule reconnect
      if (config.autoReconnect) {
        scheduleReconnect();
      }
      
      // Call user onError handler
      if (config.onError && error instanceof Error) {
        config.onError(error);
      }
    }
  }, [config, state.messageQueue, clearTimers, debug]);
  
  // Reconnect with backoff
  const scheduleReconnect = useCallback(() => {
    if (!config.autoReconnect || !isMountedRef.current) return;
    
    // Check if max attempts reached
    if (state.reconnectAttempt >= (config.maxReconnectAttempts || 10)) {
      debug('Maximum reconnection attempts reached');
      return;
    }
    
    // Calculate delay with exponential backoff
    const nextAttempt = state.reconnectAttempt + 1;
    const delay = getReconnectDelay(
      nextAttempt,
      config.reconnectBaseDelay || 1000,
      config.reconnectMaxDelay || 30000
    );
    
    debug(`Scheduling reconnect attempt ${nextAttempt} in ${delay}ms`);
    
    // Update state
    setState(prev => ({
      ...prev,
      reconnectAttempt: nextAttempt,
    }));
    
    // Schedule reconnect
    reconnectTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        debug(`Attempting reconnect #${nextAttempt}`);
        connect();
      }
    }, delay);
  }, [config, state.reconnectAttempt, connect, debug]);
  
  // Force reconnect
  const reconnect = useCallback(() => {
    debug('Forcing reconnection');
    
    // Close existing connection
    closeSocket();
    
    // Clear timers
    clearTimers();
    
    // Reset reconnect attempt counter
    setState(prev => ({
      ...prev,
      reconnectAttempt: 0,
    }));
    
    // Connect
    connect();
  }, [closeSocket, clearTimers, connect, debug]);
  
  // Disconnect from the WebSocket server
  const disconnect = useCallback(() => {
    debug('Disconnecting WebSocket');
    
    // Close socket
    closeSocket();
    
    // Clear timers
    clearTimers();
    
    // Update state
    setState(prev => ({
      ...prev,
      status: 'disconnected',
      connected: false,
    }));
  }, [closeSocket, clearTimers, debug]);
  
  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (!config.enableHeartbeat || !isMountedRef.current) return;
    
    debug('Starting heartbeat');
    
    // Clear existing timers
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }
    
    // Start new heartbeat timer
    heartbeatTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      
      // Check if socket is open
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        sendHeartbeat();
      }
    }, config.heartbeatInterval || 30000);
  }, [config, debug]);
  
  // Send heartbeat
  const sendHeartbeat = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    debug('[websocket:send] Sending WebSocket heartbeat');
    
    // Send heartbeat message
    try {
      const pingMessage = { messageType: 'ping', timestamp: Date.now() };
      socketRef.current.send(JSON.stringify(pingMessage));
      
      // Set timeout for heartbeat response
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      
      heartbeatTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        debug('Heartbeat timeout, reconnecting');
        reconnect();
      }, config.heartbeatTimeout || 10000);
    } catch (error) {
      debug('Error sending heartbeat', { error });
    }
  }, [config, reconnect, debug]);
  
  // Handle heartbeat response
  const handleHeartbeatResponse = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);
  
  // Process incoming message
  const processMessage = useCallback((data: any) => {
    // Check for message type
    if (data && typeof data === 'object') {
      let eventType: string | undefined;
      
      // Standard MCP message format: { id: string, ... }
      if (data.id && typeof data.id === 'string') {
        eventType = data.id;
      }
      // Type property: { type: string, ... }
      else if (data.type && typeof data.type === 'string') {
        eventType = data.type;
      }
      // MessageType property: { messageType: string, ... }
      else if (data.messageType && typeof data.messageType === 'string') {
        eventType = data.messageType;
      }
      
      // Dispatch to handlers if event type found
      if (eventType && handlersRef.current.has(eventType)) {
        const handlers = handlersRef.current.get(eventType);
        handlers?.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            debug(`Error in handler for event "${eventType}"`, { error });
          }
        });
      }
    }
  }, [debug]);
  
  // Send a message to the server
  const send = useCallback((data: any): boolean => {
    // Check if socket is open
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        // Convert to string if needed
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        
        // Send message
        socketRef.current.send(message);
        debug('[websocket:send] Sending WebSocket message', { data });
        return true;
      } catch (error) {
        debug('Error sending WebSocket message', { error, data });
        return false;
      }
    } else if (config.queueOfflineMessages) {
      // Queue message for later
      debug('WebSocket not connected, queueing message', { data });
      
      setState(prev => {
        const newQueue = [...prev.messageQueue, data];
        
        // Truncate queue if it exceeds max size
        if (config.maxQueueSize && newQueue.length > config.maxQueueSize) {
          newQueue.splice(0, newQueue.length - config.maxQueueSize);
        }
        
        return {
          ...prev,
          messageQueue: newQueue,
        };
      });
      
      return true;
    }
    
    return false;
  }, [config, debug]);
  
  // Helper for sending JSON
  const sendJson = useCallback((data: any): boolean => {
    return send(typeof data === 'string' ? JSON.parse(data) : data);
  }, [send]);
  
  // Subscribe to a message type
  const subscribe = useCallback((eventType: string, handler: MessageHandler): () => void => {
    // Get or create handler set
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set());
    }
    
    const handlers = handlersRef.current.get(eventType)!;
    handlers.add(handler);
    
    debug(`Subscribed to event "${eventType}"`);
    
    // Return unsubscribe function
    return () => {
      if (handlersRef.current.has(eventType)) {
        const handlers = handlersRef.current.get(eventType)!;
        handlers.delete(handler);
        
        // Remove empty handler sets
        if (handlers.size === 0) {
          handlersRef.current.delete(eventType);
        }
        
        debug(`Unsubscribed from event "${eventType}"`);
      }
    };
  }, [debug]);
  
  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (config.autoConnect) {
      connect();
    }
    
    return () => {
      isMountedRef.current = false;
      closeSocket();
      clearTimers();
    };
  }, [config.autoConnect, connect, closeSocket, clearTimers]);
  
  return {
    // State
    state,
    isConnected: state.connected,
    status: state.status,
    lastError: state.lastError,
    reconnectAttempt: state.reconnectAttempt,
    // Methods
    connect,
    disconnect,
    reconnect,
    send,
    sendJson,
    subscribe,
  };
}

// Declare global types
declare global {
  interface Window {
    mcpWebSocketState?: {
      fixApplied: boolean;
      connectionAttempts: number;
      successfulConnections: number;
      failedConnections: number;
      isReplitEnv: boolean;
      lastError?: Error;
    };
    mcpWebSocketCreateEnhanced?: (url: string, protocols?: string | string[]) => WebSocket;
  }
}
