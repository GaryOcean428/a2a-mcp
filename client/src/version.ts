/**
 * MCP Integration Platform - Version Information
 * 
 * This module provides version tracking and update notification.
 */

/**
 * Current version of the application
 */
export const VERSION = '0.2.0';

/**
 * Build timestamp - replaced at build time
 */
export const BUILD_TIMESTAMP = Date.now();

/**
 * Environment values
 */
export const ENV = {
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  PUBLIC_URL: import.meta.env.BASE_URL || '',
  VITE_VERSION: import.meta.env.VITE_VERSION || VERSION,
  VITE_COMMIT_HASH: import.meta.env.VITE_COMMIT_HASH || 'dev',
};

/**
 * Get the full version string including build info
 */
export function getFullVersion(): string {
  return `${VERSION} (${ENV.VITE_COMMIT_HASH})`;
}

/**
 * Get the version build date
 */
export function getBuildDate(): Date {
  return new Date(BUILD_TIMESTAMP);
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return ENV.NODE_ENV === 'development';
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return ENV.NODE_ENV === 'production';
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return ENV.NODE_ENV === 'test';
}

/**
 * Compare two version strings (semver format)
 * Returns: -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 !== p2) {
      return p1 > p2 ? 1 : -1;
    }
  }
  
  return 0;
}

/**
 * Object containing version information for debugging
 */
export const VERSION_INFO = {
  version: VERSION,
  buildDate: getBuildDate().toISOString(),
  environment: ENV.NODE_ENV,
  commitHash: ENV.VITE_COMMIT_HASH,
};
