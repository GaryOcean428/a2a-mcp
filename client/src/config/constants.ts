/**
 * MCP Integration Platform - Global Constants
 * 
 * Centralized configuration constants for the application
 */

// API endpoints
export const API_ENDPOINTS = {
  USER: '/api/user',
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  LOGOUT: '/api/logout',
  STATUS: '/api/status',
  SCHEMA: '/api/schema',
  MCP: '/api/mcp'
};

// WebSocket paths
export const WS_PATHS = {
  MCP: '/mcp-ws'
};

// Application version
export const APP_VERSION = process.env.APP_VERSION || '0.1.0';

// Environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production' || import.meta.env?.PROD === true;
export const IS_DEVELOPMENT = !IS_PRODUCTION;

// Connection settings
export const CONNECTION_CONFIG = {
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 2000,
  CONNECTION_TIMEOUT: 10000,
  PING_INTERVAL: 30000
};

// CSS related constants
export const CRITICAL_CSS_CLASSES = [
  'bg-grid-gray-100',
  'bg-blob-gradient',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'to-white',
  'bg-gradient-to-r'
];