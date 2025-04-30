/**
 * MCP Integration Platform - Application Configuration
 * 
 * This file contains application-wide configuration settings.
 * These values are used throughout the application to maintain
 * consistent behavior across components.
 */

// Application metadata
export const APP_NAME = 'MCP Integration Platform';
export const APP_VERSION = '0.1.0-alpha';
export const COPYRIGHT_YEAR = new Date().getFullYear();

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second
  AUTH_HEADER: 'Authorization',
  CONTENT_TYPE: 'application/json',
  ENDPOINTS: {
    STATUS: '/api/status',
    AUTH: '/api/auth',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    REGISTER: '/api/register',
    USER: '/api/user',
    SCHEMAS: '/api/schemas',
    // Tool endpoints
    WEB_SEARCH: '/api/tools/web-search',
    FORM_AUTOMATION: '/api/tools/form-automation',
    VECTOR_STORAGE: '/api/tools/vector-storage',
    DATA_SCRAPER: '/api/tools/data-scraper',
    SANDBOX: '/api/tools/sandbox',
  }
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'mcp-auth-token',
  REFRESH_TOKEN_KEY: 'mcp-refresh-token',
  USER_KEY: 'mcp-user',
  REMEMBER_ME_KEY: 'mcp-remember-me',
  SESSION_EXPIRY: 60 * 60 * 1000, // 1 hour in milliseconds
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  LOGOUT_REDIRECT_URL: '/auth',
  LOGIN_REDIRECT_URL: '/',
};

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  WEBSOCKET: true,
  DEBUG_MODE: import.meta.env.DEV || false,
  ANALYTICS: import.meta.env.PROD || false,
  SANDBOX: true,
  VECTOR_STORAGE: true,
  WEB_SEARCH: true,
  FORM_AUTOMATION: true,
  DATA_SCRAPING: true,
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300, // ms
  TOAST_DURATION: 5000, // 5 seconds
  MODAL_TRANSITION: 150, // ms
  DEFAULT_THEME: 'system' as 'light' | 'dark' | 'system',
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 768,
    DESKTOP: 1024,
    LARGE: 1280,
  },
  SIDEBAR_WIDTH: 256, // pixels
  HEADER_HEIGHT: 64, // pixels
  FOOTER_HEIGHT: 48, // pixels
};

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  PATH: '/mcp-ws',
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 3000, // ms
  PING_INTERVAL: 30000, // ms
  CONNECTION_TIMEOUT: 10000, // ms
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

// Environment Information
export const ENV = {
  IS_PRODUCTION: import.meta.env.PROD || false,
  IS_DEVELOPMENT: import.meta.env.DEV || false,
  MODE: import.meta.env.MODE || 'development',
  API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
};