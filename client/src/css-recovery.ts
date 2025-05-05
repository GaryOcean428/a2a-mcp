/**
 * CSS Recovery System
 * 
 * DEPRECATED: This module has been replaced by the unified css-system.ts.
 * This file remains only for backwards compatibility and will be removed in a future update.
 */
import { VERSION } from './version';
import { initializeCssSystem } from './utils/css-system';

/**
 * Inject critical CSS in production environments
 * (Now redirects to the unified system)
 */
export function injectCriticalCss() {
  console.log(`[CSS Recovery Legacy] Initializing for MCP version ${VERSION}`);
  console.log('[CSS Recovery Legacy] Using unified css-system.ts instead');
  initializeCssSystem();
}

/**
 * Verify critical CSS classes are available and recover if needed
 * (Now redirects to the unified system)
 */
export function verifyCssClasses() {
  console.log('[CSS Recovery Legacy] Using unified css-system.ts instead');
  // Initialize will trigger verification automatically
  initializeCssSystem();
}

// Auto-initialize using the unified system
initializeCssSystem();

export default { injectCriticalCss, verifyCssClasses };