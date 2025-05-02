/**
 * MCP Integration Platform - Environment Helpers
 * 
 * Utility functions for detecting and handling different environments.
 */

// Check if running in production
export const IS_PRODUCTION = process.env.NODE_ENV === 'production' || import.meta.env.PROD;

// Check if running in development
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development' || import.meta.env.DEV;

// Check if running in a Replit environment
export const IS_REPLIT_ENV = typeof window !== 'undefined' && (
  window.location.hostname.includes('replit') || 
  window.location.hostname.includes('repl.co')
);

// Get base URL for API calls
export function getApiBaseUrl(): string {
  // Use the same origin in both development and production
  return window.location.origin;
}

// Get base URL for WebSocket connections
export function getWebSocketBaseUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}

// Format a WebSocket URL
export function formatWebSocketUrl(path: string): string {
  // Make sure path starts with slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getWebSocketBaseUrl()}${normalizedPath}`;
}

// Check if the application is embedded in an iframe
export function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If accessing window.top throws an error, we're in a cross-origin iframe
    return true;
  }
}

// Get environment information
export function getEnvironmentInfo() {
  return {
    isProduction: IS_PRODUCTION,
    isDevelopment: IS_DEVELOPMENT,
    isReplit: IS_REPLIT_ENV,
    isEmbedded: isEmbedded(),
    hostname: window.location.hostname,
    origin: window.location.origin,
  };
}