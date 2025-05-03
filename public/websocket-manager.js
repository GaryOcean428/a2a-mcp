/**
 * MCP Integration Platform - WebSocket Manager
 * 
 * This module provides a reliable WebSocket connection manager with
 * automatic reconnection and fallback mechanisms.
 */

(function() {
  // Constants
  const WS_RECONNECT_DELAY = 2000; // 2 seconds between reconnection attempts
  const WS_PING_INTERVAL = 15000; // Send a ping every 15 seconds to keep connection alive
  const WS_CONNECTION_TIMEOUT = 5000; // Timeout for connection attempts

  // State management
  let socket = null;
  let reconnectTimer = null;
  let pingTimer = null;
  let connectionTimeoutTimer = null;
  let isConnecting = false;
  let connectionAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Main initialization function
  function initWebSocketManager() {
    console.debug('[WebSocketManager] Initializing WebSocket manager');
    // Connect once the DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', connectWebSocket);
    } else {
      connectWebSocket();
    }
  }

  // Connect to WebSocket server
  function connectWebSocket() {
    if (isConnecting || socket?.readyState === WebSocket.CONNECTING) {
      console.debug('[WebSocketManager] Connection already in progress');
      return;
    }

    isConnecting = true;
    connectionAttempts++;

    // Clear any existing timers
    clearTimers();

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/mcp-ws`;

      console.debug(`[WebSocketManager] Connecting to ${wsUrl} (attempt ${connectionAttempts})`);

      // Set connection timeout
      connectionTimeoutTimer = setTimeout(() => {
        console.warn('[WebSocketManager] Connection attempt timed out');
        handleConnectionFailure();
      }, WS_CONNECTION_TIMEOUT);

      // Create new WebSocket
      // Using try-catch to handle any WebSocket creation exceptions
      try {
        socket = new WebSocket(wsUrl);

        // Event handlers
        socket.onopen = handleOpen;
        socket.onclose = handleClose;
        socket.onerror = handleError;
        socket.onmessage = handleMessage;
      } catch (createError) {
        console.error('[WebSocketManager] Error creating WebSocket:', createError);
        handleConnectionFailure();
      }

    } catch (error) {
      console.error('[WebSocketManager] Error creating WebSocket:', error);
      handleConnectionFailure();
    }
  }

  // Handle successful connection
  function handleOpen(event) {
    console.info('[WebSocketManager] WebSocket connection established');
    clearTimeout(connectionTimeoutTimer);
    isConnecting = false;
    connectionAttempts = 0;

    // Set up keep-alive ping
    pingTimer = setInterval(sendPing, WS_PING_INTERVAL);

    // Dispatch connection event
    dispatchEvent('websocket:connected');

    // Set connection status indicator
    updateConnectionStatus(true);
  }

  // Handle connection close
  function handleClose(event) {
    console.debug(`[WebSocketManager] WebSocket closed: ${event.code} - ${event.reason}`);
    clearTimers();
    isConnecting = false;

    if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
      console.info(`[WebSocketManager] Reconnecting in ${WS_RECONNECT_DELAY/1000}s...`);
      reconnectTimer = setTimeout(connectWebSocket, WS_RECONNECT_DELAY);
    } else {
      console.warn('[WebSocketManager] Max reconnection attempts reached, giving up');
      updateConnectionStatus(false);
    }
  }

  // Handle connection error
  function handleError(error) {
    console.error('[WebSocketManager] WebSocket error:', error);
    handleConnectionFailure();
  }

  // Handle failed connection attempt
  function handleConnectionFailure() {
    clearTimeout(connectionTimeoutTimer);
    if (socket) {
      // Remove event listeners to prevent potential memory leaks
      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      
      // Force close the socket if it's still open
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    }

    socket = null;
    isConnecting = false;

    if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
      console.info(`[WebSocketManager] Reconnecting in ${WS_RECONNECT_DELAY/1000}s...`);
      reconnectTimer = setTimeout(connectWebSocket, WS_RECONNECT_DELAY);
    } else {
      console.warn('[WebSocketManager] Max reconnection attempts reached, giving up');
      updateConnectionStatus(false);
      createFallbackMechanism();
    }
  }

  // Handle incoming message
  function handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.debug('[WebSocketManager] Message received:', data);
      dispatchEvent('websocket:message', data);
    } catch (error) {
      console.warn('[WebSocketManager] Error parsing message:', error);
    }
  }

  // Send ping to keep connection alive
  function sendPing() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ messageType: 'ping' }));
        console.debug('[WebSocketManager] Ping sent');
      } catch (error) {
        console.warn('[WebSocketManager] Error sending ping:', error);
      }
    }
  }

  // Send a message
  function sendMessage(data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketManager] Cannot send message, socket not connected');
      return false;
    }

    try {
      socket.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('[WebSocketManager] Error sending message:', error);
      return false;
    }
  }

  // Clear all timers
  function clearTimers() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (pingTimer) clearInterval(pingTimer);
    if (connectionTimeoutTimer) clearTimeout(connectionTimeoutTimer);
    
    reconnectTimer = null;
    pingTimer = null;
    connectionTimeoutTimer = null;
  }

  // Update connection status in DOM
  function updateConnectionStatus(isConnected) {
    // Create status element if it doesn't exist
    let statusElement = document.getElementById('ws-connection-status');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'ws-connection-status';
      statusElement.style.display = 'none';
      document.body.appendChild(statusElement);
    }

    // Update status
    statusElement.setAttribute('data-status', isConnected ? 'connected' : 'disconnected');
  }

  // Create fallback mechanism for when WebSocket fails
  function createFallbackMechanism() {
    console.info('[WebSocketManager] Setting up fallback mechanism for updates');
    
    // Add a fallback indicator to the DOM
    const fallbackIndicator = document.createElement('div');
    fallbackIndicator.id = 'ws-fallback-active';
    fallbackIndicator.style.display = 'none';
    fallbackIndicator.setAttribute('data-fallback-active', 'true');
    document.body.appendChild(fallbackIndicator);
    
    // Show notification to user about using fallback method
    const notification = document.createElement('div');
    notification.className = 'ws-fallback-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '10px';
    notification.style.right = '10px';
    notification.style.padding = '10px 15px';
    notification.style.backgroundColor = 'rgba(253, 224, 71, 0.9)';
    notification.style.color = '#111827';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    notification.style.zIndex = '9999';
    notification.style.fontSize = '14px';
    notification.style.fontWeight = '500';
    notification.style.maxWidth = '300px';
    notification.style.transition = 'opacity 0.3s ease';
    notification.textContent = 'Using offline mode. Real-time updates disabled.';
    document.body.appendChild(notification);
    
    // Fade out notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Set up a polling mechanism as a fallback
    // This would periodically check for updates using HTTP requests
    let pollInterval = 10000; // Start with 10 seconds
    const maxInterval = 30000; // Max interval of 30 seconds
    let failedAttempts = 0;
    
    const pollId = setInterval(() => {
      fetch('/api/status')
        .then(response => response.json())
        .then(data => {
          console.debug('[WebSocketManager] Fallback polling received:', data);
          dispatchEvent('websocket:fallback-update', data);
          failedAttempts = 0; // Reset failed attempts counter on success
        })
        .catch(error => {
          console.warn('[WebSocketManager] Fallback polling error:', error);
          failedAttempts++;
          
          // Increase polling interval after failed attempts to avoid overwhelming server
          if (failedAttempts > 3 && pollInterval < maxInterval) {
            clearInterval(pollId);
            pollInterval = Math.min(pollInterval * 1.5, maxInterval);
            setInterval(() => {
              fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                  console.debug('[WebSocketManager] Fallback polling received:', data);
                  dispatchEvent('websocket:fallback-update', data);
                  failedAttempts = 0;
                })
                .catch(error => {
                  console.warn('[WebSocketManager] Fallback polling error:', error);
                  failedAttempts++;
                });
            }, pollInterval);
          }
        });
    }, pollInterval);
    
    // Attempt reconnect to WebSocket server periodically to restore real-time updates
    const reconnectId = setInterval(() => {
      // Reset connection attempts counter to allow reconnection
      connectionAttempts = 0;
      
      // Try to connect again
      console.info('[WebSocketManager] Attempting to restore WebSocket connection...');
      connectWebSocket();
      
      // Check if successful
      setTimeout(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.info('[WebSocketManager] WebSocket connection restored!');
          // Remove fallback indicator
          if (fallbackIndicator && fallbackIndicator.parentNode) {
            fallbackIndicator.parentNode.removeChild(fallbackIndicator);
          }
          // Clear reconnect interval
          clearInterval(reconnectId);
        }
      }, 2000);
    }, 60000); // Try to reconnect every minute
  }

  // Dispatch custom event
  function dispatchEvent(name, data = {}) {
    const event = new CustomEvent(name, { detail: data });
    document.dispatchEvent(event);
  }

  // Expose API globally
  window.WebSocketManager = {
    connect: connectWebSocket,
    send: sendMessage,
    disconnect: function() {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
      clearTimers();
    }
  };

  // Initialize
  initWebSocketManager();
})();
