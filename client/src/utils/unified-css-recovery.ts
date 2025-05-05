/**
 * MCP Integration Platform - Unified CSS Recovery System
 * 
 * This utility has been DEPRECATED - see css-system.ts instead.
 * This file remains only for backwards compatibility and will be removed in a future update.
 */

import { CssRecoveryManager, StyleFixer, initializeCssSystem } from './css-system';

export class UnifiedCssRecovery extends CssRecoveryManager {}

// Create and export singleton instance
export const unifiedCssRecovery = CssRecoveryManager.getInstance();

// Auto-initialize when imported using the new system
initializeCssSystem();

export default unifiedCssRecovery;
