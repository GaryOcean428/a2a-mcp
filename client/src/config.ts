/**
 * Configuration settings for the MCP platform client
 */

// Determine the base URL for API requests
export const getApiBaseUrl = (): string => {
  // In production, use the current hostname
  // In development, could be explicitly set or default to current hostname
  return window.location.origin;
};

// Websocket configuration
export const websocketConfig = {
  // Always use secure protocol (wss) in production
  getProtocol: (): 'ws' | 'wss' => 
    window.location.protocol === 'https:' ? 'wss' : 'ws',
  
  // Get the websocket url with proper host and path
  getWebsocketUrl: (path: string = '/mcp-ws'): string => {
    const protocol = websocketConfig.getProtocol();
    
    // Get the host from the window location or fallback to the current origin
    let host = window.location.host;
    
    // Handle Replit specific URL patterns
    if (window.location.hostname.includes('replit.dev') || 
        window.location.hostname.includes('repl.co') || 
        window.location.hostname.endsWith('replit.app')) {
      // Use the same host as the current page
      console.log('Using Replit-compatible WebSocket host:', host);
    } else if (!host || host.includes('undefined')) {
      // Fallback for local development or undefined hosts
      host = window.location.hostname || 'localhost';
      const port = window.location.port || '5000';
      host = `${host}:${port}`;
      console.log('Using fallback WebSocket host:', host);
    }
    
    // Construct and return the WebSocket URL
    return `${protocol}://${host}${path}`;
  },
  
  // Default connection options
  connectionOptions: {
    // Reconnect automatically
    reconnect: true,
    // Max reconnection attempts
    maxReconnectAttempts: 5,
    // Time between reconnection attempts in ms
    reconnectInterval: 2000
  }
};

// Authentication configuration
export const authConfig = {
  // API endpoints for authentication
  endpoints: {
    login: '/api/login',
    register: '/api/register',
    logout: '/api/logout',
    user: '/api/user'
  },
  
  // Cookie settings
  cookies: {
    // Name of the session cookie
    sessionName: 'mcp.sid',
    // Cookie options
    options: {
      // Current path
      path: '/',
      // Only send over HTTPS in production
      secure: window.location.protocol === 'https:',
      // Allow reading by JavaScript
      httpOnly: false
    }
  }
};

// Application environment info
export const environment = {
  isDevelopment: import.meta.env.DEV === true,
  isProduction: import.meta.env.PROD === true,
  // Version from package.json or environment var
  version: import.meta.env.VITE_APP_VERSION || '0.1.0'
};

// Default application settings
export const defaultSettings = {
  // Default theme
  theme: 'light',
  // Default language
  language: 'en',
  // Default page size for lists
  pageSize: 10
};