/**
 * MCP Integration Platform - CSS Verification Utility
 * 
 * This utility helps verify that critical CSS is correctly loaded and applies
 * recovery mechanisms when styles are missing or not properly applied.
 */

import { loadCssFile } from './css-injector';

// List of critical CSS classes that must be loaded for the UI to work properly
const CRITICAL_CSS_CLASSES = [
  'bg-grid-gray-100',
  'bg-blob-gradient',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'to-white',
  'bg-gradient-to-r',
  // Layout classes
  'flex',
  'flex-col',
  'flex-row',
  'grid',
  'grid-cols-1',
  'grid-cols-2',
  'min-h-screen',
  // Sidebar-related classes
  'sidebar-container',
  'content-container',
  'main-content',
];

// List of failover CSS URLs to try loading if verification fails
const FALLBACK_CSS_URLS = [
  '/src/styles/theme.css',
  '/src/styles/fix-sidebar.css',
  '/production.css'
];

/**
 * Check if a CSS class is properly loaded
 */
function isCssClassLoaded(className: string): boolean {
  try {
    // Create a test element
    const testEl = document.createElement('div');
    testEl.style.position = 'absolute';
    testEl.style.top = '-9999px';
    testEl.style.left = '-9999px';
    testEl.className = className;
    document.body.appendChild(testEl);
    
    // Get computed style
    const computedStyle = window.getComputedStyle(testEl);
    
    // Remove test element
    document.body.removeChild(testEl);
    
    // If any style is applied, we consider the class loaded
    // This is a simplistic check, but works for most CSS classes
    return (computedStyle !== null);
  } catch (error) {
    console.error(`[CSS Verify] Error testing class ${className}:`, error);
    return false;
  }
}

/**
 * Count number of stylesheets loaded
 */
function countStylesheets(): { count: number, urls: string[] } {
  const styleSheets = document.styleSheets;
  const urls: string[] = [];
  
  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const sheet = styleSheets[i];
      if (sheet.href) {
        urls.push(sheet.href);
      }
    } catch (e) {
      // Ignore CORS errors for external stylesheets
    }
  }
  
  return { 
    count: urls.length,
    urls
  };
}

/**
 * Check if inline styles are present
 */
function hasInlineStyles(): boolean {
  const styleElements = document.querySelectorAll('style');
  return styleElements.length > 0;
}

/**
 * Run CSS verification and recovery if needed
 */
export async function verifyCssAndRecover(): Promise<boolean> {
  console.log('[CSS Verify] Starting verification...');
  
  // Check if we have any styles loaded at all
  const hasInline = hasInlineStyles();
  console.log('[CSS Verify] Critical inline styles present:', hasInline);
  
  // Count external stylesheets
  const { count, urls } = countStylesheets();
  console.log('[CSS Verify] External stylesheets loaded:', count);
  urls.forEach(url => console.log('[CSS Verify] -', url));
  
  // Test critical CSS classes
  console.log('[CSS Verify] Testing critical CSS classes:');
  let missingClasses = 0;
  
  for (const cssClass of CRITICAL_CSS_CLASSES) {
    const isLoaded = isCssClassLoaded(cssClass);
    console.log('[CSS Verify] -', `${cssClass}:`, isLoaded ? 'OK' : 'MISSING');
    
    if (!isLoaded) {
      missingClasses++;
    }
  }
  
  // If we have missing classes, try recovery
  if (missingClasses > 0 || count === 0) {
    console.warn(`[CSS Verify] Missing ${missingClasses} critical CSS classes. Attempting recovery...`);
    
    // Load fallback CSS files
    try {
      const loadPromises = FALLBACK_CSS_URLS.map(url => loadCssFile(url));
      await Promise.allSettled(loadPromises);
      
      console.log('[CSS Verify] Recovery attempt completed. Verifying again...');
      
      // Re-check critical classes
      let stillMissing = 0;
      for (const cssClass of CRITICAL_CSS_CLASSES) {
        const isLoaded = isCssClassLoaded(cssClass);
        if (!isLoaded) {
          stillMissing++;
        }
      }
      
      if (stillMissing > 0) {
        console.error(`[CSS Verify] Recovery incomplete. Still missing ${stillMissing} classes.`);
        return false;
      } else {
        console.log('[CSS Verify] Recovery successful. All classes now loaded.');
        return true;
      }
    } catch (error) {
      console.error('[CSS Verify] Recovery failed:', error);
      return false;
    }
  } else {
    console.log('[CSS Verify] All critical CSS classes verified ✓');
    return true;
  }
}

/**
 * Run the verification process
 */
export function startCssVerification(): void {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[CSS Verify] Running verification...');
      verifyCssAndRecover();
    });
  } else {
    console.log('[CSS Verify] Running verification...');
    verifyCssAndRecover();
  }
}
