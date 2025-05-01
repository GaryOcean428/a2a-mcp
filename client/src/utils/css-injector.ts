/**
 * MCP Integration Platform - CSS Injector Utility
 * 
 * This utility helps inject CSS into the page to ensure correct styling
 * is always available, especially for the critical path render.
 */

/**
 * CSS Rule types that can be injected
 */
type CSSRuleCategory = 
  | 'base'           // Basic styles like margins, paddings
  | 'layout'         // Layout-related styles
  | 'animation'      // Animation and transition styles
  | 'background'     // Background styles and patterns
  | 'component'      // Component-specific styles
  | 'utility'        // Utility classes (Tailwind-like)
  | 'gradient';      // Gradient styles

/**
 * CSS Rule with metadata for better management
 */
interface CSSRule {
  selector: string;  // The CSS selector
  styles: string;    // The CSS styles
  category: CSSRuleCategory; // Type of rule for organization
  priority: number;  // Importance (1-10, higher = more critical)
}

// List of critical CSS rules to always inject
const CRITICAL_CSS: CSSRule[] = [
  // Base styles that must be immediately available
  {
    selector: 'html, body',
    styles: 'margin: 0; padding: 0;',
    category: 'base',
    priority: 10
  },
  {
    selector: '.mcp-app',
    styles: 'min-height: 100vh;',
    category: 'layout',
    priority: 9
  },
  
  // Fixes for layout and grid issues
  {
    selector: '.sidebar-container',
    styles: 'display: flex;',
    category: 'layout',
    priority: 9
  },
  {
    selector: '.content-container',
    styles: 'flex: 1; overflow-x: hidden;',
    category: 'layout',
    priority: 9
  },
  
  // Animation classes
  {
    selector: '@keyframes fadeInDown',
    styles: 'from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); }',
    category: 'animation',
    priority: 7
  },
  {
    selector: '.animate-fade-in-down',
    styles: 'animation: fadeInDown 0.3s ease-out forwards;',
    category: 'animation',
    priority: 7
  },
  
  // Grid and background styles
  {
    selector: '.bg-grid-gray-100',
    styles: 'background-size: 2rem 2rem; background-image: linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px);',
    category: 'background',
    priority: 6
  },
  {
    selector: '.bg-blob-gradient',
    styles: 'background-image: radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, rgba(255, 255, 255, 0) 70%); background-position: center; background-repeat: no-repeat;',
    category: 'background',
    priority: 6
  },
  
  // Feature card hover effect
  {
    selector: '.feature-card',
    styles: 'transition: transform 0.2s, box-shadow 0.2s;',
    category: 'component',
    priority: 8
  },
  {
    selector: '.feature-card:hover',
    styles: 'transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);',
    category: 'component',
    priority: 8
  },
  
  // Gradient backgrounds
  {
    selector: '.bg-gradient-to-r',
    styles: 'background-image: linear-gradient(to right, var(--tw-gradient-stops));',
    category: 'gradient',
    priority: 5
  },
  {
    selector: '.from-purple-50',
    styles: '--tw-gradient-from: #faf5ff; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0));',
    category: 'gradient',
    priority: 5
  },
  {
    selector: '.to-white',
    styles: '--tw-gradient-to: #ffffff;',
    category: 'gradient',
    priority: 5
  }
];

/**
 * Convert CSS rules array to a CSS string
 */
function rulesToCSSString(rules: CSSRule[]): string {
  return rules
    .sort((a, b) => b.priority - a.priority) // Sort by priority
    .map(rule => `${rule.selector} { ${rule.styles} }`)
    .join('\n');
}

/**
 * Inject critical CSS into the page
 * @returns Boolean indicating if CSS was successfully injected
 */
export function injectCriticalCSS(): boolean {
  try {
    // Check if critical CSS is already injected
    if (document.getElementById('mcp-critical-css')) {
      return true; // Already injected
    }
    
    const styleEl = document.createElement('style');
    styleEl.id = 'mcp-critical-css';
    styleEl.innerHTML = rulesToCSSString(CRITICAL_CSS);
    document.head.appendChild(styleEl);
    
    console.log('[CSS Injector] Critical CSS injected');
    return true;
  } catch (error) {
    console.error('[CSS Injector] Failed to inject critical CSS:', error);
    return false;
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
