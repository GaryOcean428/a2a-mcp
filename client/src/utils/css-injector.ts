/**
 * MCP Integration Platform - CSS Injector Utility
 * 
 * This utility helps inject CSS into the page to ensure correct styling
 * is always available, especially for the critical path render.
 */

// List of critical CSS rules to always inject
const CRITICAL_CSS = [
  // Base styles that must be immediately available
  'html, body { margin: 0; padding: 0; }',
  '.mcp-app { min-height: 100vh; }',
  
  // Fixes for layout and grid issues
  '.sidebar-container { display: flex; }',
  '.content-container { flex: 1; overflow-x: hidden; }',
  
  // Animation classes
  '@keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }',
  '.animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }',
  
  // Grid and background styles
  '.bg-grid-gray-100 { background-size: 2rem 2rem; background-image: linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px); }',
  '.bg-blob-gradient { background-image: radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, rgba(255, 255, 255, 0) 70%); background-position: center; background-repeat: no-repeat; }',
  
  // Feature card hover effect
  '.feature-card { transition: transform 0.2s, box-shadow 0.2s; }',
  '.feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }',
  
  // Gradient backgrounds
  '.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }',
  '.from-purple-50 { --tw-gradient-from: #faf5ff; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0)); }',
  '.to-white { --tw-gradient-to: #ffffff; }'
];

/**
 * Inject critical CSS into the page
 */
export function injectCriticalCSS(): void {
  try {
    // Check if critical CSS is already injected
    if (document.getElementById('mcp-critical-css')) {
      return;
    }
    
    const styleEl = document.createElement('style');
    styleEl.id = 'mcp-critical-css';
    styleEl.innerHTML = CRITICAL_CSS.join('\n');
    document.head.appendChild(styleEl);
    
    console.log('[CSS Injector] Critical CSS injected');
  } catch (error) {
    console.error('[CSS Injector] Failed to inject critical CSS:', error);
  }
}

/**
 * Load a CSS file dynamically
 */
export function loadCssFile(url: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      // Check if the stylesheet is already loaded
      const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
      for (let i = 0; i < existingLinks.length; i++) {
        const link = existingLinks[i] as HTMLLinkElement;
        if (link.href.includes(url)) {
          resolve(true);
          return;
        }
      }
      
      // Create a new link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => {
        console.log(`[CSS Injector] Loaded CSS: ${url}`);
        resolve(true);
      };
      link.onerror = (error) => {
        console.error(`[CSS Injector] Failed to load CSS: ${url}`, error);
        reject(error);
      };
      
      document.head.appendChild(link);
    } catch (error) {
      console.error(`[CSS Injector] Error loading CSS: ${url}`, error);
      reject(error);
    }
  });
}

/**
 * Test if key style elements are present to verify CSS is working
 */
export function verifyCssLoaded(): boolean {
  try {
    // Create a test element with key classes
    const testEl = document.createElement('div');
    testEl.style.position = 'absolute';
    testEl.style.top = '-9999px';
    testEl.style.left = '-9999px';
    testEl.className = 'bg-gradient-to-r from-purple-50 to-white animate-fade-in-down';
    document.body.appendChild(testEl);
    
    // Get computed style
    const computedStyle = window.getComputedStyle(testEl);
    
    // Check if at least gradient background is applied
    const hasBackgroundImage = computedStyle.backgroundImage !== 'none';
    
    // Remove test element
    document.body.removeChild(testEl);
    
    return hasBackgroundImage;
  } catch (error) {
    console.error('[CSS Injector] Error verifying CSS:', error);
    return false;
  }
}
