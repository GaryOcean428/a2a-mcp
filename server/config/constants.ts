/**
 * MCP Integration Platform - Server Constants
 * 
 * Centralized configuration constants for the server
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

// Database connection settings
export const DB_SETTINGS = {
  CONNECTION_TIMEOUT: 10000,
  MAX_POOL_SIZE: 20,
  IDLE_TIMEOUT: 60000,
  STATEMENT_TIMEOUT: 30000
};

// WebSocket settings
export const WS_SETTINGS = {
  PING_INTERVAL: 30000,
  TERMINATION_GRACE_PERIOD: 5000
};

// Rate limiting
export const RATE_LIMITS = {
  GLOBAL_MAX: 100,
  GLOBAL_WINDOW_MS: 60 * 1000, // 1 minute
  TOOL_MAX: 50,
  TOOL_WINDOW_MS: 60 * 1000 // 1 minute
};

// STDIO transport
export const STDIO_RESPONSE_DELAY = 50; // Small delay to simulate IO

// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';