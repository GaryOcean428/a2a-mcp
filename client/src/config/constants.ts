/**
 * MCP Integration Platform - Client Configuration Constants
 * 
 * This file contains centralized constants used throughout the client application.
 * Using a central configuration file makes the application easier to maintain
 * and ensures consistency across components.
 */

// Application information
export const APP_NAME = 'MCP Integration Platform';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0-alpha';
export const COPYRIGHT_YEAR = new Date().getFullYear();

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_STATUS_ENDPOINT = `${API_BASE_URL}/api/status`;
export const API_SCHEMAS_ENDPOINT = `${API_BASE_URL}/api/schemas`;
export const API_AUTH_ENDPOINT = `${API_BASE_URL}/api/auth`;

// WebSocket configuration
export const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
export const WS_HOST = window.location.host;
export const WS_PATH = '/mcp-ws';
export const WS_URL = `${WS_PROTOCOL}//${WS_HOST}${WS_PATH}`;
export const WS_RECONNECT_ATTEMPTS = 5;
export const WS_RECONNECT_DELAY = 3000; // ms

// Authentication
export const AUTH_TOKEN_KEY = 'mcp-auth-token';
export const AUTH_USER_KEY = 'mcp-user';
export const AUTH_REMEMBER_KEY = 'mcp-remember';
export const AUTH_EXPIRY_KEY = 'mcp-token-expiry';
export const AUTH_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in ms

// Theme
export const THEME_STORAGE_KEY = 'mcp-theme';
export const AVAILABLE_THEMES = ['light', 'dark', 'system', 'high-contrast'] as const;

// Feature flags
export const FEATURES = {
  WEBSOCKET_ENABLED: true,
  DARK_MODE_ENABLED: true,
  SANDBOX_ENABLED: true,
  VECTOR_STORAGE_ENABLED: true,
  WEB_SEARCH_ENABLED: true,
  FORM_AUTOMATION_ENABLED: true,
  DATA_SCRAPING_ENABLED: true,
  DEV_TOOLS_ENABLED: import.meta.env.DEV || false,
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'mcp-theme',
  AUTH_TOKEN: 'mcp-auth-token',
  USER: 'mcp-user',
  SETTINGS: 'mcp-settings',
  LAST_ROUTE: 'mcp-last-route',
};

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  WEBSOCKET_CONNECT: 10000, // 10 seconds
  ANIMATION: 300, // ms
  DEBOUNCE: 300, // ms
  TOAST: 5000, // 5 seconds
};

// UI constants
export const UI = {
  SIDEBAR_WIDTH: 250, // px
  HEADER_HEIGHT: 64, // px
  MOBILE_BREAKPOINT: 768, // px
  ANIMATIONS_ENABLED: true,
};

// Tool IDs
export const TOOL_IDS = {
  WEB_SEARCH: 'web_search',
  FORM_AUTOMATION: 'form_automation',
  VECTOR_STORAGE: 'vector_storage',
  DATA_SCRAPER: 'data_scraper',
  STATUS: 'status',
  SANDBOX: 'sandbox',
};

// Error messages
export const ERROR_MESSAGES = {
  GENERAL: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUTHENTICATION: 'Authentication failed. Please log in again.',
  WEBSOCKET: 'WebSocket connection failed. Some features may be unavailable.',
  API_TIMEOUT: 'Request timed out. Please try again.',
  NOT_FOUND: 'Resource not found.',
  PERMISSION: 'You do not have permission to access this resource.',
  VALIDATION: 'Please check the form for errors.',
};