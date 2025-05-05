# WebSocket Integration Guide

## Overview

This guide explains how to establish reliable WebSocket connections with the MCP Integration Platform, handle authentication, and properly implement message exchange with error recovery.

## Establishing a Connection

### Connection URL

To connect to the MCP WebSocket server, use the following URL format:

```
ws://{hostname}/mcp-ws
```

For secure connections (recommended for production):

```
wss://{hostname}/mcp-ws
```

Where `{hostname}` is your server's hostname.

### Connection Code Example

```javascript
// Determine protocol based on current connection
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const hostname = window.location.host; // Includes port if applicable
const wsUrl = `${protocol}//${hostname}/mcp-ws`;

// Create WebSocket connection
const socket = new WebSocket(wsUrl);

// Connection opened
socket.addEventListener('open', (event) => {
  console.log('Connected to MCP WebSocket server');
  // Authenticate immediately after connection
  authenticate('your-api-key-or-anonymous');
});

// Listen for messages
socket.addEventListener('message', (event) => {
  try {
    const data = JSON.parse(event.data);
    handleMessage(data);
  } catch (error) {
    console.error('Error parsing WebSocket message:', error);
  }
});

// Connection closed
socket.addEventListener('close', (event) => {
  console.log('Disconnected from MCP WebSocket server:', event.code, event.reason);
  // Implement reconnection logic here
});

// Connection error
socket.addEventListener('error', (event) => {
  console.error('WebSocket connection error:', event);
});
```

## Authentication

After establishing a connection, you must authenticate with the server to use the MCP tools.

### Authentication Process

1. Send an authentication message with your API key or "anonymous" for limited access
2. Receive a confirmation response from the server
3. Once authenticated, you can start using MCP tools

### Authentication Example

```javascript
function authenticate(token) {
  if (socket.readyState === WebSocket.OPEN) {
    // Send authentication message
    socket.send(JSON.stringify({
      id: 'auth',
      token: token // Your API key or "anonymous"
    }));
  }
}

// Handle authentication response
function handleMessage(data) {
  if (data.id === 'auth') {
    if (data.success === true) {
      console.log('Authentication successful');
      // Start using MCP tools
    } else {
      console.error('Authentication failed:', data.error);
    }
  } else {
    // Handle other message types
  }
}
```

## Implementing Heartbeat

To keep the WebSocket connection alive, implement a heartbeat mechanism:

```javascript
let heartbeatInterval;
let heartbeatTimeout;

function startHeartbeat() {
  // Clear any existing intervals
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  
  // Send heartbeat every 15 seconds
  heartbeatInterval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      // Send ping message
      socket.send(JSON.stringify({
        messageType: 'ping',
        timestamp: Date.now()
      }));
      
      // Set timeout for response
      if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
      heartbeatTimeout = setTimeout(() => {
        console.warn('Heartbeat timeout, reconnecting...');
        reconnect();
      }, 10000); // 10 second timeout
    }
  }, 15000); // 15 second interval
}

// Handle pong response
function handleMessage(data) {
  // Check for pong response
  if (data.messageType === 'pong') {
    if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
    return;
  }
  
  // Handle other message types
  // ...
}
```

## Implementing Reconnection Logic

Implement a reliable reconnection strategy with exponential backoff:

```javascript
let reconnectAttempt = 0;
let reconnectTimer;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

function reconnect() {
  // Clear existing timers
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
  if (reconnectTimer) clearTimeout(reconnectTimer);
  
  // Close existing socket if needed
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    socket.close();
  }
  
  // Check if max attempts reached
  if (reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Maximum reconnection attempts reached');
    return;
  }
  
  // Calculate delay with exponential backoff
  const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(1.5, reconnectAttempt), MAX_RECONNECT_DELAY);
  // Add jitter (±20%)
  const jitteredDelay = delay * (0.8 + Math.random() * 0.4);
  
  console.log(`Reconnecting in ${Math.round(jitteredDelay / 1000)} seconds... (attempt ${reconnectAttempt + 1}/${MAX_RECONNECT_ATTEMPTS})`);
  
  // Schedule reconnection
  reconnectTimer = setTimeout(() => {
    reconnectAttempt++;
    connect();
  }, jitteredDelay);
}

function connect() {
  // Create new WebSocket connection
  socket = new WebSocket(wsUrl);
  
  // Set up event handlers
  socket.addEventListener('open', () => {
    console.log('Connected to MCP WebSocket server');
    reconnectAttempt = 0; // Reset counter on successful connection
    authenticate(apiKey);
    startHeartbeat();
  });
  
  // ... other event handlers
}
```

## Using MCP Tools

Once authenticated, you can use the MCP tools by sending messages with the following format:

```javascript
function sendToolRequest(toolName, parameters) {
  if (socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not connected');
    return null;
  }
  
  // Generate unique request ID
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create request object
  const request = {
    id: requestId,
    name: toolName,
    parameters: parameters
  };
  
  // Send request
  socket.send(JSON.stringify(request));
  
  // Return request ID for tracking
  return requestId;
}

// Example usage
const requestId = sendToolRequest('web_search', {
  query: 'latest news about AI',
  numResults: 5,
  includeLinks: true
});

// Handle tool response
function handleMessage(data) {
  // Check for tool response
  if (data.id && data.id.startsWith('req_')) {
    if (data.error) {
      console.error(`Tool error (${data.id}):`, data.error);
    } else {
      console.log(`Tool response (${data.id}):`, data.results);
      // Process results
    }
    return;
  }
  
  // Handle other message types
  // ...
}
```

## Error Handling

Implement proper error handling for various WebSocket states:

```javascript
// WebSocket error states
const WS_ERROR_CODES = {
  1000: 'Normal closure',
  1001: 'Going away',
  1002: 'Protocol error',
  1003: 'Unsupported data',
  1004: 'Reserved',
  1005: 'No status received',
  1006: 'Abnormal closure',
  1007: 'Invalid frame payload data',
  1008: 'Policy violation',
  1009: 'Message too big',
  1010: 'Missing extension',
  1011: 'Internal error',
  1012: 'Service restart',
  1013: 'Try again later',
  1014: 'Bad gateway',
  1015: 'TLS handshake'
};

// Handle WebSocket close event with proper error reporting
socket.addEventListener('close', (event) => {
  const reason = event.reason || 'Unknown reason';
  const codeExplanation = WS_ERROR_CODES[event.code] || 'Unknown code';
  
  console.log(`WebSocket closed: ${event.code} (${codeExplanation}) - ${reason}`);
  
  // Different reconnection strategy based on close code
  if (event.code === 1000) {
    // Normal closure, don't reconnect
    console.log('WebSocket closed normally');
  } else if (event.code === 1008 || event.code === 1011) {
    // Authentication or server error, wait longer before reconnecting
    setTimeout(() => reconnect(), 5000);
  } else {
    // Other errors, attempt immediate reconnection
    reconnect();
  }
});

// Handle WebSocket errors
socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
  
  // Socket will close after an error, triggering the close event handler
  // No need to call reconnect() here
});
```

## Complete Integration Example

The following React Hook demonstrates a complete implementation of a reliable WebSocket connection:

```javascript
import { useState, useEffect, useRef, useCallback } from 'react';

// WebSocket connection hook
export function useMCPWebSocket({
  apiKey = 'anonymous',
  autoConnect = true,
  onMessage = null
}) {
  // State
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const socketRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const heartbeatTimeoutRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const messageHandlersRef = useRef(new Map());
  
  // Constants
  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_RECONNECT_DELAY = 1000;
  const MAX_RECONNECT_DELAY = 30000;
  const HEARTBEAT_INTERVAL = 15000;
  const HEARTBEAT_TIMEOUT = 10000;
  
  // Clear all timers
  const clearTimers = useCallback(() => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    
    heartbeatIntervalRef.current = null;
    heartbeatTimeoutRef.current = null;
    reconnectTimerRef.current = null;
  }, []);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    // Clear existing connection and timers
    if (socketRef.current) {
      socketRef.current.close();
    }
    clearTimers();
    
    // Create WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/mcp-ws`;
    
    // Create new WebSocket
    try {
      socketRef.current = new WebSocket(wsUrl);
      
      // Connection opened
      socketRef.current.addEventListener('open', () => {
        console.log('Connected to MCP WebSocket server');
        setConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
        
        // Authenticate
        sendMessage({
          id: 'auth',
          token: apiKey
        });
        
        // Start heartbeat
        startHeartbeat();
      });
      
      // Connection closed
      socketRef.current.addEventListener('close', (event) => {
        console.log(`WebSocket closed: ${event.code} - ${event.reason || 'Unknown reason'}`);
        setConnected(false);
        setAuthenticated(false);
        clearTimers();
        
        // Attempt reconnection
        scheduleReconnect();
      });
      
      // Connection error
      socketRef.current.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
      });
      
      // Message received
      socketRef.current.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle authentication response
          if (data.id === 'auth') {
            setAuthenticated(data.success === true);
            if (!data.success) {
              setError(new Error(data.error?.message || 'Authentication failed'));
            }
          }
          // Handle heartbeat response
          else if (data.messageType === 'pong') {
            if (heartbeatTimeoutRef.current) {
              clearTimeout(heartbeatTimeoutRef.current);
              heartbeatTimeoutRef.current = null;
            }
          }
          // Handle tool responses
          else if (data.id && messageHandlersRef.current.has(data.id)) {
            const handler = messageHandlersRef.current.get(data.id);
            messageHandlersRef.current.delete(data.id);
            handler(data);
          }
          
          // Call general message handler if provided
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError(error);
      scheduleReconnect();
    }
  }, [apiKey, clearTimers, onMessage]);
  
  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log('Sending heartbeat');
        
        // Send heartbeat
        socketRef.current.send(JSON.stringify({
          messageType: 'ping',
          timestamp: Date.now()
        }));
        
        // Set timeout for response
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }
        
        heartbeatTimeoutRef.current = setTimeout(() => {
          console.warn('Heartbeat timeout, reconnecting...');
          reconnect();
        }, HEARTBEAT_TIMEOUT);
      }
    }, HEARTBEAT_INTERVAL);
  }, []);
  
  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Maximum reconnection attempts reached');
      return;
    }
    
    const attemptNumber = reconnectAttemptRef.current + 1;
    const delay = Math.min(
      BASE_RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptRef.current),
      MAX_RECONNECT_DELAY
    );
    // Add jitter
    const jitteredDelay = delay * (0.8 + Math.random() * 0.4);
    
    console.log(`Reconnecting in ${Math.round(jitteredDelay / 1000)}s (attempt ${attemptNumber}/${MAX_RECONNECT_ATTEMPTS})`);
    
    reconnectTimerRef.current = setTimeout(() => {
      reconnectAttemptRef.current = attemptNumber;
      connect();
    }, jitteredDelay);
  }, [connect]);
  
  // Force reconnection
  const reconnect = useCallback(() => {
    console.log('Forcing reconnection');
    
    // Close existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    clearTimers();
    reconnectAttemptRef.current = 0;
    connect();
  }, [clearTimers, connect]);
  
  // Send message
  const sendMessage = useCallback((message) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }
    
    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      socketRef.current.send(messageStr);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }, []);
  
  // Use a tool with Promise-based response
  const useTool = useCallback((toolName, parameters) => {
    return new Promise((resolve, reject) => {
      if (!connected || !authenticated) {
        reject(new Error('WebSocket not connected or not authenticated'));
        return;
      }
      
      // Generate unique request ID
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Register response handler
      messageHandlersRef.current.set(requestId, (response) => {
        if (response.error) {
          reject(new Error(response.error.message || 'Tool execution failed'));
        } else {
          resolve(response.results);
        }
      });
      
      // Send request
      const success = sendMessage({
        id: requestId,
        name: toolName,
        parameters: parameters
      });
      
      if (!success) {
        messageHandlersRef.current.delete(requestId);
        reject(new Error('Failed to send request'));
      }
      
      // Set timeout for response
      setTimeout(() => {
        if (messageHandlersRef.current.has(requestId)) {
          messageHandlersRef.current.delete(requestId);
          reject(new Error('Tool request timed out'));
        }
      }, 30000); // 30 second timeout
    });
  }, [connected, authenticated, sendMessage]);
  
  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      // Clean up on unmount
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimers();
    };
  }, [autoConnect, connect, clearTimers]);
  
  return {
    connected,
    authenticated,
    error,
    connect,
    reconnect,
    sendMessage,
    useTool
  };
}
```

## Usage in a React Component

```jsx
import { useMCPWebSocket } from './hooks/useMCPWebSocket';

function WebSearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { connected, authenticated, error, useTool } = useMCPWebSocket({
    apiKey: 'your-api-key', // or 'anonymous'
    autoConnect: true
  });
  
  const handleSearch = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      const searchResults = await useTool('web_search', {
        query,
        numResults: 5,
        includeLinks: true,
        provider: 'tavily',
        tavilyOptions: {
          includeAnswer: true
        }
      });
      
      setResults(searchResults.items || []);
    } catch (error) {
      console.error('Search error:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Web Search</h1>
      
      {!connected && (
        <div className="error">Not connected to WebSocket server</div>
      )}
      
      {error && (
        <div className="error">Error: {error.message}</div>
      )}
      
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query"
          disabled={!connected || !authenticated}
        />
        <button
          onClick={handleSearch}
          disabled={!connected || !authenticated || loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div className="results">
        {results.map((result, index) => (
          <div key={index} className="result">
            <h3>
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                {result.title}
              </a>
            </h3>
            <p>{result.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Best Practices

1. **Always use exponential backoff** for reconnection attempts to avoid overwhelming the server.

2. **Implement heartbeat mechanism** to detect zombie connections.

3. **Handle authentication properly** by sending credentials immediately after connection.

4. **Use unique request IDs** for each tool request to properly track responses.

5. **Implement proper error handling** for different WebSocket close codes.

6. **Set reasonable timeouts** for tool requests to prevent hanging promises.

7. **Clean up all timers and connections** when your component unmounts to prevent memory leaks.

8. **Provide visual feedback** to users about the WebSocket connection state.

9. **Use proper retry logic** with jitter to prevent thundering herd problems.

10. **Log connection events** to help with debugging.