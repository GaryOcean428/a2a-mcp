/**
 * MCP Integration Platform - CSS Recovery Manager
 * 
 * This utility has been DEPRECATED - see css-system.ts instead.
 * This file remains only for backwards compatibility and will be removed in a future update.
 */

import { CssRecoveryManager as NewCssRecoveryManager, initializeCssSystem } from './css-system';

export class CssRecoveryManager extends NewCssRecoveryManager {}

// Create and export singleton instance
export const cssRecoveryManager = NewCssRecoveryManager.getInstance();

// Auto-initialize when imported using the new system
initializeCssSystem();

export default cssRecoveryManager;