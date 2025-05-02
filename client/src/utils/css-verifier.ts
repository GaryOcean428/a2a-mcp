/**
 * MCP Integration Platform - CSS Verification Tool
 * 
 * This utility verifies whether critical CSS classes are properly loaded,
 * and logs information about CSS loading status.
 */

// List of critical CSS classes to verify
const CRITICAL_CSS_CLASSES = [
  'bg-gradient-to-r',
  'text-transparent', 
  'bg-clip-text',
  'animate-fade-in-down',
  'feature-card',
  'from-purple-50',
  'to-white',
  'bg-grid-gray-100',
  'bg-blob-gradient'
];

/**
 * Print the loaded CSS stylesheet URLs for debugging
 */
export function logLoadedStylesheets(): void {
  console.log('[CSS Verify] Starting verification...');
  const stylesheets = Array.from(document.styleSheets);
  
  try {
    console.log('[CSS Verify] Running verification...');
    
    // Check for inline styles
    const inlineStyles = Array.from(document.head.querySelectorAll('style'));
    console.log(`[CSS Verify] Critical inline styles present: ${inlineStyles.length > 0}`);
    
    // Log external stylesheets
    const externalStylesheets = stylesheets.filter(sheet => sheet.href);
    console.log(`[CSS Verify] External stylesheets loaded: ${externalStylesheets.length}`);
    externalStylesheets.forEach(sheet => {
      console.log(`[CSS Verify] - ${sheet.href}`);
    });
    
    // Test critical CSS classes
    console.log('[CSS Verify] Testing critical CSS classes:');
    verifyCriticalClasses();
  } catch (error) {
    console.error('[CSS Verify] Error during verification:', error);
  }
}

/**
 * Verify critical CSS for external usage
 * @returns Result of CSS verification
 */
export function verifyCriticalCss(): { success: boolean; missing: string[] } {
  const testElement = document.createElement('div');
  testElement.style.position = 'absolute';
  testElement.style.visibility = 'hidden';
  testElement.style.pointerEvents = 'none';
  testElement.style.top = '-9999px';
  testElement.style.left = '-9999px';
  document.body.appendChild(testElement);
  
  let allClassesVerified = true;
  const missingClasses: string[] = [];
  
  try {
    // Test each critical class
    CRITICAL_CSS_CLASSES.forEach(className => {
      testElement.className = className;
      const computedStyle = window.getComputedStyle(testElement);
      
      let isApplied = false;
      
      // Different verification logic depending on class type
      if (className === 'bg-gradient-to-r') {
        isApplied = computedStyle.backgroundImage.includes('linear-gradient');
      } else if (className === 'text-transparent') {
        isApplied = computedStyle.color === 'rgba(0, 0, 0, 0)' || computedStyle.color === 'transparent';
      } else if (className === 'bg-clip-text') {
        isApplied = computedStyle.webkitBackgroundClip === 'text' || computedStyle.backgroundClip === 'text';
      } else if (className === 'animate-fade-in-down') {
        isApplied = computedStyle.animationName?.includes('fade-in-down') || computedStyle.animation?.includes('fade-in-down');
      } else if (className === 'feature-card') {
        isApplied = computedStyle.transition?.includes('transform') || computedStyle.transition?.includes('box-shadow');
      } else {
        // Generic check - compare with default styles
        const defaultElement = document.createElement('div');
        document.body.appendChild(defaultElement);
        const defaultStyle = window.getComputedStyle(defaultElement);
        isApplied = JSON.stringify(computedStyle) !== JSON.stringify(defaultStyle);
        document.body.removeChild(defaultElement);
      }
      
      if (!isApplied) {
        allClassesVerified = false;
        missingClasses.push(className);
      }
    });
  } finally {
    document.body.removeChild(testElement);
  }
  
  return { 
    success: allClassesVerified,
    missing: missingClasses
  };
}

/**
 * Verify if critical CSS classes are available
 */
function verifyCriticalClasses(): void {
  const testElement = document.createElement('div');
  testElement.style.position = 'absolute';
  testElement.style.visibility = 'hidden';
  testElement.style.pointerEvents = 'none';
  testElement.style.top = '-9999px';
  testElement.style.left = '-9999px';
  document.body.appendChild(testElement);
  
  let allClassesVerified = true;
  
  try {
    // Test each critical class
    CRITICAL_CSS_CLASSES.forEach(className => {
      testElement.className = className;
      const computedStyle = window.getComputedStyle(testElement);
      
      let isApplied = false;
      
      // Different verification logic depending on class type
      if (className === 'bg-gradient-to-r') {
        isApplied = computedStyle.backgroundImage.includes('linear-gradient');
      } else if (className === 'text-transparent') {
        isApplied = computedStyle.color === 'rgba(0, 0, 0, 0)' || computedStyle.color === 'transparent';
      } else if (className === 'bg-clip-text') {
        isApplied = computedStyle.webkitBackgroundClip === 'text' || computedStyle.backgroundClip === 'text';
      } else if (className === 'animate-fade-in-down') {
        isApplied = computedStyle.animationName?.includes('fade-in-down') || computedStyle.animation?.includes('fade-in-down');
      } else if (className === 'feature-card') {
        isApplied = computedStyle.transition?.includes('transform') || computedStyle.transition?.includes('box-shadow');
      } else {
        // Generic check - compare with default styles
        const defaultElement = document.createElement('div');
        document.body.appendChild(defaultElement);
        const defaultStyle = window.getComputedStyle(defaultElement);
        isApplied = JSON.stringify(computedStyle) !== JSON.stringify(defaultStyle);
        document.body.removeChild(defaultElement);
      }
      
      console.log(`[CSS Verify] - ${className}: ${isApplied ? 'OK' : 'MISSING'}`);
      
      if (!isApplied) {
        allClassesVerified = false;
      }
    });
  } finally {
    document.body.removeChild(testElement);
  }
  
  if (allClassesVerified) {
    console.log('[CSS Verify] All critical CSS classes verified ✓');
  } else {
    console.warn('[CSS Verify] Some critical CSS classes are missing!');
  }
}

/**
 * Test WebSocket connectivity
 */
export function testWebSocketConnection(): void {
  const wsUrl = `wss://${window.location.host}/mcp-ws`;
  console.log(`[WebSocket Test] Testing connection to ${wsUrl}`);
  
  try {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('[WebSocket Test] Connection test successful');
      ws.close();
    };
    
    ws.onerror = (err) => {
      console.error('[WebSocket Test] Connection failed:', err);
    };
    
    ws.onclose = () => {
      console.log('[WebSocket Test] Connection closed');
    };
  } catch (error) {
    console.error('[WebSocket Test] Error creating connection:', error);
  }
}

/**
 * Run complete verification on load
 */
export function runVerification(): void {
  // Wait for document to be fully loaded
  if (document.readyState === 'complete') {
    setTimeout(() => {
      logLoadedStylesheets();
      testWebSocketConnection();
    }, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        logLoadedStylesheets();
        testWebSocketConnection();
      }, 1000);
    });
  }
}

/**
 * Add style recovery function to window
 */
if (typeof window !== 'undefined') {
  window.recoverMissingStyles = () => {
    console.log('[CSS Recovery] Attempting to recover missing styles...');
    
    // Inject a link to the recovery CSS if it doesn't exist
    const recoveryLink = document.querySelector('link[href*="recovery-critical.css"]');
    if (!recoveryLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/css/recovery-critical.css';
      document.head.appendChild(link);
      console.log('[CSS Recovery] Injected recovery CSS stylesheet');
    }
    
    // Force a reflow
    document.body.offsetHeight;
    
    // Re-verify after recovery
    setTimeout(() => {
      const result = verifyCriticalCss();
      console.log('[CSS Recovery] Recovery result:', result.success ? 'Success' : 'Failed', 
                  result.missing.length > 0 ? `Missing: ${result.missing.join(', ')}` : '');
    }, 500);
    
    return true;
  };
}

// The interface is defined in global.d.ts

// Auto-run verification
runVerification();
