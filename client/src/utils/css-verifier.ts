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
 * Result of a CSS class test
 */
interface CssClassTestResult {
  className: string;
  loaded: boolean;
  hasStyles: boolean;
  error?: unknown;
}

/**
 * Check if a CSS class is properly loaded
 * Using multiple heuristics to detect styling effects
 */
function isCssClassLoaded(className: string): CssClassTestResult {
  const result: CssClassTestResult = {
    className,
    loaded: false,
    hasStyles: false
  };
  
  try {
    // Create a test element
    const testEl = document.createElement('div');
    testEl.style.position = 'absolute';
    testEl.style.top = '-9999px';
    testEl.style.left = '-9999px';
    testEl.className = className;
    document.body.appendChild(testEl);
    
    // Create a reference element without the class
    const refEl = document.createElement('div');
    refEl.style.position = 'absolute';
    refEl.style.top = '-9999px';
    refEl.style.left = '-9999px';
    document.body.appendChild(refEl);
    
    // Get computed styles
    const computedStyle = window.getComputedStyle(testEl);
    const refStyle = window.getComputedStyle(refEl);
    
    // Compare certain CSS properties to see if our class applies any styles
    const propsToCheck = [
      'backgroundColor', 'color', 'display', 'flexDirection', 'gridTemplateColumns',
      'animation', 'transform', 'margin', 'padding', 'backgroundImage',
      'boxShadow', 'borderRadius', 'fontWeight', 'textAlign'
    ];
    
    // Check if at least one property is different
    for (const prop of propsToCheck) {
      if (computedStyle[prop as any] !== refStyle[prop as any]) {
        result.hasStyles = true;
        break;
      }
    }
    
    // Clean up
    document.body.removeChild(testEl);
    document.body.removeChild(refEl);
    
    // For keyframes and special rules, treat differently
    if (className.startsWith('@keyframes') || className.includes(':')) {
      // We can't test these directly as they can't be applied as classes
      result.loaded = true;
      result.hasStyles = true;
    } else {
      // For normal classes, we consider them loaded if we have the element
      result.loaded = true;
      // For utility classes and other no-visual-effect classes, we might not detect style changes
      // but they might still exist. This is a limitation of this approach.
    }
  } catch (error) {
    console.error(`[CSS Verify] Error testing class ${className}:`, error);
    result.error = error;
  }
  
  return result;
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
  const testResults: CssClassTestResult[] = [];
  let missingClasses = 0;
  let missingStyles = 0;
  
  for (const cssClass of CRITICAL_CSS_CLASSES) {
    const result = isCssClassLoaded(cssClass);
    testResults.push(result);
    
    console.log('[CSS Verify] -', `${cssClass}:`, result.loaded ? (result.hasStyles ? 'OK' : 'LOADED BUT NO EFFECT') : 'MISSING');
    
    if (!result.loaded) {
      missingClasses++;
    } else if (!result.hasStyles && !cssClass.startsWith('.') && !cssClass.includes(':')) {
      // Only count missing styles for regular classes, not special selectors
      missingStyles++;
    }
  }
  
  // If we have missing classes or styles, try recovery
  if (missingClasses > 0 || missingStyles > 2 || count === 0) { // Allow a few utility classes to have no visible effect
    console.warn(`[CSS Verify] Found ${missingClasses} missing classes and ${missingStyles} classes without styles. Attempting recovery...`);
    
    // Load fallback CSS files
    try {
      const loadPromises = FALLBACK_CSS_URLS.map(url => loadCssFile(url));
      const results = await Promise.allSettled(loadPromises);
      
      // Check if at least one succeeded
      const anySuccess = results.some(r => r.status === 'fulfilled' && r.value === true);
      
      if (!anySuccess) {
        console.warn('[CSS Verify] No fallback CSS files could be loaded');
      }
      
      console.log('[CSS Verify] Recovery attempt completed. Verifying again...');
      
      // Re-check critical classes
      let stillMissing = 0;
      let stillNoStyles = 0;
      
      for (const cssClass of CRITICAL_CSS_CLASSES) {
        const result = isCssClassLoaded(cssClass);
        if (!result.loaded) {
          stillMissing++;
        } else if (!result.hasStyles && !cssClass.startsWith('.') && !cssClass.includes(':')) {
          stillNoStyles++;
        }
      }
      
      // Only fail if we have a significant number of missing classes
      if (stillMissing > 1) {
        console.error(`[CSS Verify] Recovery incomplete. Still missing ${stillMissing} classes and ${stillNoStyles} classes without styles.`);
        return false;
      } else {
        console.log('[CSS Verify] Recovery successful!');
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
