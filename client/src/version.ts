/**
 * MCP Integration Platform Version
 * Used for cache busting and debugging
 */

// Current version with timestamp for cache busting
export const version = "1.0.0-" + Date.now();

// Export a helper for cache busting URLs
export function addVersionToUrl(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}`;
}
