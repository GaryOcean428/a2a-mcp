/**
 * MCP Integration Platform - Environment Utilities
 * 
 * This module provides utilities for detecting the current environment
 * and runtime context of the application.
 */

// Possible environments
export type Environment = 'development' | 'production' | 'test' | 'unknown';

// Browser capabilities
export interface BrowserCapabilities {
  webSockets: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  fetch: boolean;
  serviceWorker: boolean;
  webWorker: boolean;
  webAssembly: boolean;
  webGL: boolean;
  mediaRecorder: boolean;
  isSecureContext: boolean;
}

/**
 * Detect the current environment
 */
export function getEnvironment(): Environment {
  // First check for explicitly set environment variables
  if (import.meta.env?.MODE) {
    if (['development', 'production', 'test'].includes(import.meta.env.MODE)) {
      return import.meta.env.MODE as Environment;
    }
  }
  
  // Check for environment variables or global objects that indicate the environment
  const isDevelopment = 
    import.meta.env?.DEV === true ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
  
  const isProduction = 
    import.meta.env?.PROD === true ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');
  
  const isTest = 
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') ||
    (typeof global !== 'undefined' && (global as any)['__TEST__']);
  
  // Return the detected environment
  if (isDevelopment) return 'development';
  if (isProduction) return 'production';
  if (isTest) return 'test';
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check for common development indicators in the URL or host
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('dev.') ||
      hostname.includes('staging.') ||
      hostname.includes('test.') ||
      url.includes('?dev') ||
      url.includes('&dev')
    ) {
      return 'development';
    }
    
    // If none of the above, assume production
    return 'production';
  }
  
  // Fall back to unknown
  return 'unknown';
}

/**
 * Detect browser capabilities
 */
export function detectBrowserCapabilities(): BrowserCapabilities {
  if (typeof window === 'undefined') {
    // Sensible defaults for non-browser environments
    return {
      webSockets: false,
      localStorage: false,
      sessionStorage: false,
      fetch: false,
      serviceWorker: false,
      webWorker: false,
      webAssembly: false,
      webGL: false,
      mediaRecorder: false,
      isSecureContext: false,
    };
  }
  
  return {
    webSockets: typeof WebSocket !== 'undefined',
    localStorage: (() => {
      try {
        return typeof localStorage !== 'undefined';
      } catch (e) {
        return false;
      }
    })(),
    sessionStorage: (() => {
      try {
        return typeof sessionStorage !== 'undefined';
      } catch (e) {
        return false;
      }
    })(),
    fetch: typeof fetch !== 'undefined',
    serviceWorker: !!('serviceWorker' in navigator),
    webWorker: typeof Worker !== 'undefined',
    webAssembly: typeof WebAssembly !== 'undefined',
    webGL: (() => {
      try {
        return !!window.document.createElement('canvas').getContext('webgl');
      } catch (e) {
        return false;
      }
    })(),
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    isSecureContext: !!window.isSecureContext,
  };
}

/**
 * Check if we're running in a development environment
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if we're running in a production environment
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Check if we're running in a test environment
 */
export function isTest(): boolean {
  return getEnvironment() === 'test';
}

/**
 * Get URL based on environment
 */
export function getApiBaseUrl(): string {
  // Get from the environment if available
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise use current location (for same-origin APIs)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for SSR or other environments
  return '';
}

/**
 * Get WebSocket URL based on environment
 */
export function getWebSocketBaseUrl(): string {
  // Get from the environment if available
  if (import.meta.env?.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  
  // Otherwise construct from current location
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  
  // Fallback for SSR or other environments
  return '';
}
