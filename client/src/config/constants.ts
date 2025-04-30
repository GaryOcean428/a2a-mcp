/**
 * MCP Integration Platform - Global Constants
 * 
 * This file contains application-wide constants that don't fit
 * in the app-config.ts file and are used across multiple components.
 */

// WebSocket paths
export const WS_PATH = '/mcp-ws';

// Error messages for user-facing errors
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK: 'Unable to connect to the server. Please check your internet connection.',
  OFFLINE: 'You appear to be offline. Please check your connection and try again.',
  
  // Authentication errors
  AUTHENTICATION: 'Authentication failed. Please log in again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  
  // API errors
  API_TIMEOUT: 'The server is taking too long to respond. Please try again later.',
  API_ERROR: 'An error occurred while communicating with the server.',
  
  // Validation errors
  VALIDATION: 'Please check your input and try again.',
  REQUIRED_FIELDS: 'Please fill in all required fields.',
  
  // WebSocket errors
  WEBSOCKET: 'Lost connection to the real-time server. Attempting to reconnect...',
  WEBSOCKET_FAILED: 'Failed to establish a real-time connection. Some features may be unavailable.',
  
  // General errors
  GENERAL: 'An unexpected error occurred. Please try again.',
  UNSUPPORTED_BROWSER: 'Your browser is not fully supported. Some features may not work correctly.',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'mcp-auth-token',
  USER: 'mcp-user',
  THEME: 'mcp-theme',
  SETTINGS: 'mcp-settings',
};

// Animation durations in milliseconds
export const ANIMATION_DURATIONS = {
  FAST: 150,
  MEDIUM: 300,
  SLOW: 500,
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
};

// Tool IDs for API calls
export const TOOL_IDS = {
  WEB_SEARCH: 'web_search',
  FORM_AUTOMATION: 'form_automation',
  VECTOR_STORAGE: 'vector_storage',
  DATA_SCRAPER: 'data_scraper',
  STATUS: 'status',
  SANDBOX: 'sandbox',
};