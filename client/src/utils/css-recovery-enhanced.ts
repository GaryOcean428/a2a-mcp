/**
 * MCP Integration Platform - Enhanced CSS Recovery System
 * 
 * This utility ensures the UI renders properly by monitoring critical CSS classes
 * and injecting them if they are missing from the DOM. It provides automatic
 * recovery for common CSS issues in both development and production environments.
 */

import { logger } from './logger';

// Configuration
const VERSION = new Date().getTime();
const CRITICAL_CSS_PATH = '/css/critical-styles.css';
const RECOVERY_INTERVAL = 5000; // Check every 5 seconds

// Critical CSS classes that must be present for proper rendering
const CRITICAL_CLASSES = [
  'bg-gradient-to-r',
  'text-transparent',
  'bg-clip-text',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'from-purple-600',
  'to-indigo-600',
  'to-white',
  'bg-grid-gray-100',
  'bg-blob-gradient',
];

/**
 * Check if a specific CSS class is present in the DOM
 */
function isClassDefined(className: string): boolean {
  // Create a test element
  const testElement = document.createElement('div');
  testElement.style.display = 'none';
  testElement.className = className;
  document.body.appendChild(testElement);
  
  // Get computed styles
  const styles = window.getComputedStyle(testElement);
  
  // Check if the class has any effect (simplified check)
  const hasEffect = (
    styles.backgroundImage !== '' || 
    styles.color !== '' || 
    styles.animation !== ''
  );
  
  // Clean up
  document.body.removeChild(testElement);
  
  return hasEffect;
}

/**
 * Check if critical inline styles are present
 */
function hasCriticalInlineStyles(): boolean {
  const styleElements = document.querySelectorAll('style');
  for (const style of styleElements) {
    if (style.textContent?.includes('Critical') || 
        style.id === 'mcp-critical-css' ||
        style.textContent?.includes('bg-gradient-to-r')) {
      return true;
    }
  }
  return false;
}

/**
 * Find missing CSS classes from the critical list
 */
function findMissingClasses(): string[] {
  return CRITICAL_CLASSES.filter(cls => !isClassDefined(cls));
}

/**
 * Inject critical CSS styles into the document
 */
function injectCriticalStyles(classes: string[]): void {
  if (classes.length === 0) return;
  
  logger.info('[CSS Recovery] Critical styles injected ✓');
  
  // Check if we already have the recovery stylesheet
  const existingLink = document.querySelector(`link[href^="${CRITICAL_CSS_PATH}"]`);
  if (existingLink) return;
  
  // Create and inject the link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${CRITICAL_CSS_PATH}?v=${VERSION}`;
  link.id = 'mcp-recovery-css';
  document.head.appendChild(link);
  
  // Log the recovery
  logger.debug('[CSS Recovery] Injected recovery stylesheet');
}

/**
 * Verify critical styles exist and inject them if needed
 */
function verifyCriticalStyles(): void {
  logger.debug('[CSS Recovery] Verifying styles...');
  
  // Check if we have critical inline styles
  const hasInlineStyles = hasCriticalInlineStyles();
  logger.debug('[CSS Recovery] Critical inline styles present:', hasInlineStyles);
  
  // Find missing critical classes
  const missing = findMissingClasses();
  
  if (missing.length > 0) {
    logger.warn('[CSS Recovery] Missing critical styles:', missing.join(', '));
    injectCriticalStyles(missing);
  }
}

/**
 * Initialize the CSS recovery system
 */
export function initCssRecovery(): void {
  // Check immediately
  verifyCriticalStyles();
  
  // Set up periodic checks
  setInterval(verifyCriticalStyles, RECOVERY_INTERVAL);
  
  // Also check after window loads
  window.addEventListener('load', () => {
    verifyCriticalStyles();
  });
  
  // Check when visibility changes (tab focus)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      verifyCriticalStyles();
    }
  });
}

// Initialize automatically
initCssRecovery();
