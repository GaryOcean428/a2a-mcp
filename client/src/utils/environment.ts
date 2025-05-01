/**
 * MCP Integration Platform - Environment Detection Utility
 * 
 * This utility provides consistent environment detection across the application,
 * including development vs. production, browser capabilities, and version tracking.
 */

// Import the version from the version module
import * as versionModule from '../version';
const { version } = versionModule;

/**
 * Check if the application is running in development mode
 */
export function isDevelopment(): boolean {
  return !isProduction();
}

/**
 * Check if the application is running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || import.meta.env.PROD;
}

/**
 * Check if the application is running in a test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test' || import.meta.env.MODE === 'test';
}

/**
 * Get the application version
 */
export function getVersion(): string {
  return version;
}

/**
 * Get the full application environment information
 */
export function getEnvironmentInfo(): Record<string, any> {
  return {
    version: getVersion(),
    nodeEnv: process.env.NODE_ENV,
    viteMode: import.meta.env.MODE,
    isProd: isProduction(),
    isDev: isDevelopment(),
    isTest: isTest(),
    browser: getBrowserInfo(),
    device: getDeviceInfo(),
    time: new Date().toISOString(),
  };
}

/**
 * Get information about the current browser
 */
export function getBrowserInfo(): Record<string, any> {
  if (typeof window === 'undefined' || !window.navigator) {
    return { type: 'unknown' };
  }
  
  const ua = navigator.userAgent;
  const browserInfo: Record<string, any> = {
    userAgent: ua,
    language: navigator.language,
    online: navigator.onLine,
    doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes',
    cookieEnabled: navigator.cookieEnabled,
    vendor: navigator.vendor,
  };
  
  // Add browser type detection
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browserInfo.type = 'chrome';
  } else if (ua.includes('Firefox')) {
    browserInfo.type = 'firefox';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browserInfo.type = 'safari';
  } else if (ua.includes('Edg')) {
    browserInfo.type = 'edge';
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    browserInfo.type = 'ie';
  } else {
    browserInfo.type = 'unknown';
  }
  
  return browserInfo;
}

/**
 * Get information about the current device
 */
export function getDeviceInfo(): Record<string, any> {
  if (typeof window === 'undefined' || !window.navigator) {
    return { type: 'unknown' };
  }
  
  const deviceInfo: Record<string, any> = {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio,
    touchPoints: navigator.maxTouchPoints || 0,
    orientation: typeof window.screen.orientation !== 'undefined'
      ? window.screen.orientation.type
      : 'unknown',
  };
  
  // Add device type detection
  if (/Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)) {
    deviceInfo.type = 'mobile';
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(navigator.userAgent)) {
      deviceInfo.type = 'tablet';
    }
  } else {
    deviceInfo.type = 'desktop';
  }
  
  return deviceInfo;
}

/**
 * Get the current deployment environment
 */
export function getDeploymentEnvironment(): 'development' | 'production' | 'replit' | 'other' {
  // Check for Replit-specific environment
  if (import.meta.env.REPLIT_DEPLOYMENT || window.location.hostname.includes('replit.dev')) {
    return 'replit';
  }
  
  // Check for production mode
  if (isProduction()) {
    return 'production';
  }
  
  // Check for development mode
  if (isDevelopment()) {
    return 'development';
  }
  
  return 'other';
}

/**
 * Check if the application is running in a Replit environment
 */
export function isReplitEnvironment(): boolean {
  return getDeploymentEnvironment() === 'replit';
}
