/**
 * MCP Integration Platform - Environment Detection Utility
 * 
 * This utility provides environment detection and browser capability detection
 * to ensure consistent behavior across different environments.
 */

import { VERSION, ENV } from '../version';
import { logger } from './logger';

/**
 * Browser capabilities information
 */
export interface BrowserCapabilities {
  webSocketSupport: boolean;
  localStorageSupport: boolean;
  sessionStorageSupport: boolean;
  webWorkersSupport: boolean;
  serviceWorkersSupport: boolean;
  indexedDBSupport: boolean;
  webGLSupport: boolean;
  cookiesEnabled: boolean;
  userAgent: string;
  language: string;
  platform: string;
  isMobile: boolean;
  isBot: boolean;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return ENV.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return ENV.NODE_ENV === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return ENV.NODE_ENV === 'test';
}

/**
 * Check if running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if running in a node.js environment
 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

/**
 * Check if running in a service worker environment
 */
export function isServiceWorker(): boolean {
  return typeof self === 'object' && 
         self.constructor && 
         self.constructor.name === 'ServiceWorkerGlobalScope';
}

/**
 * Check if the current browser is mobile
 */
export function isMobileDevice(): boolean {
  if (!isBrowser()) return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if the current user agent likely belongs to a bot
 */
export function isBot(): boolean {
  if (!isBrowser()) return false;
  
  const botPatterns = [
    'bot', 'spider', 'crawler', 'scraper', 'archiver',
    'validator', 'monitor', 'prerender', 'indexer', 'googlebot',
    'baiduspider', 'bingbot', 'yandex', 'ahrefsbot', 'msnbot',
    'semrushbot', 'slurp', 'duckduckbot', 'facebookexternalhit'
  ];
  
  const userAgent = navigator.userAgent.toLowerCase();
  return botPatterns.some(pattern => userAgent.includes(pattern));
}

/**
 * Get API base URL depending on environment
 */
export function getApiBaseUrl(): string {
  if (isDevelopment()) {
    return '';
  } else {
    // For production, use relative URL to ensure same-origin API calls
    return '';
  }
}

/**
 * Detect browser capabilities
 */
export function detectBrowserCapabilities(): BrowserCapabilities {
  if (!isBrowser()) {
    // Return null values for non-browser environments
    return {
      webSocketSupport: false,
      localStorageSupport: false,
      sessionStorageSupport: false,
      webWorkersSupport: false,
      serviceWorkersSupport: false,
      indexedDBSupport: false,
      webGLSupport: false,
      cookiesEnabled: false,
      userAgent: '',
      language: '',
      platform: 'node',
      isMobile: false,
      isBot: false
    };
  }
  
  // Check WebSocket support
  const webSocketSupport = 'WebSocket' in window;
  
  // Check localStorage support
  let localStorageSupport = false;
  try {
    localStorageSupport = 'localStorage' in window && window.localStorage !== null;
    // Verify we can actually use it (private browsing can throw errors)
    if (localStorageSupport) {
      window.localStorage.setItem('feature_test', '1');
      window.localStorage.removeItem('feature_test');
    }
  } catch (e) {
    localStorageSupport = false;
  }
  
  // Check sessionStorage support
  let sessionStorageSupport = false;
  try {
    sessionStorageSupport = 'sessionStorage' in window && window.sessionStorage !== null;
    // Verify we can actually use it
    if (sessionStorageSupport) {
      window.sessionStorage.setItem('feature_test', '1');
      window.sessionStorage.removeItem('feature_test');
    }
  } catch (e) {
    sessionStorageSupport = false;
  }
  
  // Check Web Workers support
  const webWorkersSupport = 'Worker' in window;
  
  // Check Service Workers support
  const serviceWorkersSupport = 'serviceWorker' in navigator;
  
  // Check IndexedDB support
  const indexedDBSupport = 'indexedDB' in window;
  
  // Check WebGL support
  let webGLSupport = false;
  try {
    const canvas = document.createElement('canvas');
    webGLSupport = !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    webGLSupport = false;
  }
  
  // Check if cookies are enabled
  let cookiesEnabled = navigator.cookieEnabled;
  if (!cookiesEnabled) {
    document.cookie = 'testcookie=1';
    cookiesEnabled = document.cookie.indexOf('testcookie=') !== -1;
    document.cookie = 'testcookie=1; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  
  // Get user agent information
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const platform = navigator.platform;
  
  // Mobile detection
  const isMobile = isMobileDevice();
  
  // Bot detection
  const isDetectedBot = isBot();
  
  logger.debug('Browser capabilities detected', {
    tags: ['environment', 'capabilities'],
    data: {
      version: VERSION,
      env: ENV.NODE_ENV,
      webSocketSupport,
      localStorageSupport,
      serviceWorkersSupport
    }
  });
  
  return {
    webSocketSupport,
    localStorageSupport,
    sessionStorageSupport,
    webWorkersSupport,
    serviceWorkersSupport,
    indexedDBSupport,
    webGLSupport,
    cookiesEnabled,
    userAgent,
    language,
    platform,
    isMobile,
    isBot: isDetectedBot
  };
}

/**
 * Get browser name from user agent
 */
export function getBrowserName(): string {
  if (!isBrowser()) return 'unknown';
  
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera';
  } else if (userAgent.indexOf('Trident') > -1) {
    return 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari';
  } else {
    return 'unknown';
  }
}

/**
 * Check if the current browser is supported
 */
export function isBrowserSupported(): boolean {
  const capabilities = detectBrowserCapabilities();
  
  // Minimum requirements for MCP platform
  return (
    capabilities.webSocketSupport &&
    capabilities.localStorageSupport &&
    !capabilities.isBot
  );
}

/**
 * Log environment information
 */
export function logEnvironmentInfo(): void {
  const capabilities = detectBrowserCapabilities();
  const browserName = getBrowserName();
  
  logger.info('Environment information', {
    tags: ['environment', 'startup'],
    data: {
      version: VERSION,
      environment: ENV.NODE_ENV,
      browser: browserName,
      mobile: capabilities.isMobile,
      language: capabilities.language,
      supported: isBrowserSupported()
    }
  });
}
