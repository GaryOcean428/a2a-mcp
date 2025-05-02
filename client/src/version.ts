/**
 * MCP Integration Platform Version
 * Used for cache busting and debugging
 */

// Current version with timestamp for cache busting
export const version = "1.0.0-1746151780876";

// Export a helper function for cache busting URLs
export function addVersionToUrl(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}`;
}
