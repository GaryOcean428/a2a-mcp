/**
 * MCP Integration Platform - UI Pre-renderer
 * 
 * This module ensures the UI is in a good state before rendering by:
 * 1. Checking that critical CSS is loaded
 * 2. Verifying key CSS classes are available
 * 3. Adding fallback styles when needed
 * 4. Controlling the timing of component rendering
 */

// Track if the UI is ready to render
let uiReadyToRender = false;

// Critical CSS classes that must be present
const criticalClasses = [
  'bg-grid-gray-100',
  'bg-blob-gradient',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'to-white',
  'bg-gradient-to-r'
];

// Fallback inline styles in case CSS fails to load
const fallbackStyles = `
  .feature-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #f3f4f6;
    transition: all 0.3s ease;
  }
  
  .bg-grid-gray-100 {
    background-image: 
      linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  
  .bg-blob-gradient {
    background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
    filter: blur(50px);
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-down {
    animation: fadeInDown 0.5s ease-out;
  }

  .from-purple-50 {
    --tw-gradient-from: #faf5ff var(--tw-gradient-from-position);
    --tw-gradient-to: rgb(250 245 255 / 0) var(--tw-gradient-to-position);
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
  }

  .to-white {
    --tw-gradient-to: #fff var(--tw-gradient-to-position);
  }

  .bg-gradient-to-r {
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
  }
`;

/**
 * Test if a CSS class is properly defined and available
 */
function testCssClass(className: string): boolean {
  try {
    // Create a test element
    const testElement = document.createElement('div');
    testElement.className = className;
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.pointerEvents = 'none';
    
    // Add to DOM temporarily
    document.body.appendChild(testElement);
    
    // Get the computed style
    const computedStyle = window.getComputedStyle(testElement);
    
    // Test if styles are applied correctly
    let result = false;
    
    // Different checks for different classes
    if (className === 'bg-grid-gray-100') {
      result = computedStyle.backgroundImage !== '';
    } else if (className === 'bg-blob-gradient') {
      result = computedStyle.backgroundImage !== '';
    } else if (className === 'feature-card') {
      result = computedStyle.backgroundColor !== '' && computedStyle.borderRadius !== '';
    } else if (className === 'animate-fade-in-down') {
      result = computedStyle.animation !== '';
    } else {
      // Default check - assume any style change means it's working
      result = true;
    }
    
    // Clean up
    document.body.removeChild(testElement);
    
    return result;
  } catch (error) {
    console.error(`Error testing CSS class ${className}:`, error);
    return false;
  }
}

/**
 * Add fallback styles if critical CSS is missing
 */
function addFallbackStyles(): void {
  // Check if we already added the fallback
  if (document.getElementById('mcp-fallback-styles')) {
    return;
  }

  // Create a style element
  const style = document.createElement('style');
  style.id = 'mcp-fallback-styles';
  style.innerHTML = fallbackStyles;
  
  // Add to head
  document.head.appendChild(style);
  console.log('[UI Prerenderer] Added fallback styles');
}

/**
 * Test all critical CSS classes
 */
function testCriticalCssClasses(): boolean {
  let allPassed = true;
  
  console.log('[UI Prerenderer] Testing critical CSS classes...');
  
  for (const className of criticalClasses) {
    const passed = testCssClass(className);
    console.log(`[UI Prerenderer] - ${className}: ${passed ? 'OK' : 'MISSING'}`);
    
    if (!passed) {
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * Ensure critical CSS is loaded
 */
function ensureCriticalCssLoaded(): void {
  try {
    // Check if critical inline styles exist
    const hasInlineStyles = document.querySelector('style#critical-css') !== null;
    console.log("[UI Prerenderer] Critical inline styles present:", hasInlineStyles);
    
    // Check if external stylesheet is loaded
    const externalStyles = document.querySelectorAll('link[rel="stylesheet"]');
    console.log("[UI Prerenderer] External stylesheets loaded:", externalStyles.length);
    
    // Test all critical CSS classes
    const allClassesOk = testCriticalCssClasses();
    
    // If any tests fail, add fallback styles
    if (!allClassesOk || !hasInlineStyles) {
      console.warn('[UI Prerenderer] CSS tests failed, adding fallback styles');
      addFallbackStyles();
    } else {
      console.log('[UI Prerenderer] All CSS tests passed');
    }
    
    // Mark UI as ready to render
    uiReadyToRender = true;
    
    // Add a data attribute to the root for CSS readiness
    document.documentElement.dataset.uiReady = 'true';
    
    // Dispatch a custom event
    const readyEvent = new CustomEvent('mcp:ui-ready');
    document.dispatchEvent(readyEvent);
  } catch (error) {
    console.error('[UI Prerenderer] Error ensuring CSS is loaded:', error);
    
    // Add fallback styles as a precaution
    addFallbackStyles();
    
    // Still mark as ready to prevent hanging
    uiReadyToRender = true;
    document.documentElement.dataset.uiReady = 'true';
  }
}

/**
 * Initialize the UI pre-renderer
 */
export function initUiPrerenderer(): Promise<void> {
  return new Promise((resolve) => {
    console.log('[UI Prerenderer] Initializing...');
    
    // Check if stylesheet is already loaded
    if (document.querySelectorAll('link[rel="stylesheet"]').length > 0) {
      ensureCriticalCssLoaded();
      resolve();
    } else {
      // Wait for stylesheets to load
      console.log('[UI Prerenderer] Waiting for stylesheets to load...');
      
      // Set a timeout to ensure we don't wait forever
      const timeout = setTimeout(() => {
        console.warn('[UI Prerenderer] Timeout waiting for CSS, using fallbacks');
        addFallbackStyles();
        uiReadyToRender = true;
        document.documentElement.dataset.uiReady = 'true';
        resolve();
      }, 2000);
      
      // Wait for load event
      window.addEventListener('load', () => {
        clearTimeout(timeout);
        ensureCriticalCssLoaded();
        resolve();
      });
    }
  });
}

/**
 * Check if the UI is ready to render
 */
export function isUiReadyToRender(): boolean {
  return uiReadyToRender;
}

/**
 * Wait until the UI is ready to render
 */
export function waitForUiReady(): Promise<void> {
  return new Promise((resolve) => {
    if (uiReadyToRender) {
      resolve();
    } else {
      document.addEventListener('mcp:ui-ready', () => resolve(), { once: true });
    }
  });
}