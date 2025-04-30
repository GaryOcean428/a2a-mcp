/**
 * CSS Injector
 * 
 * Utility for managing critical CSS injection to ensure
 * consistent styles in both development and production.
 */

import { CRITICAL_CSS_CLASSES } from '../config/constants';

/**
 * Critical CSS styles that must be loaded early
 */
const CRITICAL_CSS = `
/* Critical styles for immediate rendering */
.feature-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.feature-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #e9d5ff;
  transform: translateY(-2px);
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
  --tw-gradient-from: #faf5ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0));
}

.to-white {
  --tw-gradient-to: #ffffff;
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}
`;

/**
 * Check if a critical CSS style element exists
 */
function hasCriticalCss(): boolean {
  if (typeof document === 'undefined') return false;
  return document.getElementById('mcp-critical-css') !== null;
}

/**
 * Inject critical CSS into the document head
 */
export function injectCriticalCss(): void {
  if (typeof document === 'undefined' || hasCriticalCss()) return;
  
  const styleEl = document.createElement('style');
  styleEl.id = 'mcp-critical-css';
  styleEl.innerHTML = CRITICAL_CSS;
  
  if (document.head) {
    document.head.appendChild(styleEl);
    console.log('[Direct CSS] Essential CSS successfully injected');
  } else {
    console.warn('[Direct CSS] Cannot inject CSS: document.head not available');
    
    // Fallback to appending to document when head is available
    const headCheckInterval = setInterval(() => {
      if (document.head) {
        document.head.appendChild(styleEl);
        console.log('[Direct CSS] Essential CSS successfully injected (delayed)');
        clearInterval(headCheckInterval);
      }
    }, 50);
    
    // Clear the interval after 5 seconds to prevent infinite checking
    setTimeout(() => clearInterval(headCheckInterval), 5000);
  }
}

/**
 * Apply MCP-specific class prefixes to ensure CSS isolation
 */
export function applyMcpClassPrefixes(): void {
  if (typeof document === 'undefined') return;
  
  // Add a class to the body for styling hooks
  if (document.body) {
    document.body.classList.add('mcp-app');
    console.log('[Direct CSS] Applied MCP class prefixes to elements');
  }
}

/**
 * Verify that critical CSS classes are applied correctly
 */
export function verifyCriticalCss(): string[] {
  if (typeof document === 'undefined') return [];
  
  const missingClasses: string[] = [];
  
  // Create a test element
  const testEl = document.createElement('div');
  testEl.style.position = 'absolute';
  testEl.style.visibility = 'hidden';
  testEl.style.pointerEvents = 'none';
  testEl.style.left = '-9999px';
  
  if (!document.body) return CRITICAL_CSS_CLASSES;
  
  document.body.appendChild(testEl);
  
  try {
    // Test each critical class
    CRITICAL_CSS_CLASSES.forEach(className => {
      testEl.className = className;
      const style = window.getComputedStyle(testEl);
      
      // Simple check to see if any styles were applied
      const isStyled = (
        style.backgroundImage !== 'none' || 
        style.animation !== 'none' ||
        style.boxShadow !== 'none' ||
        style.getPropertyValue('--tw-gradient-from') !== ''
      );
      
      if (!isStyled) {
        missingClasses.push(className);
      }
    });
  } catch (e) {
    console.error('[CSS Verification] Error testing CSS classes:', e);
    return CRITICAL_CSS_CLASSES; // Assume all missing on error
  } finally {
    // Clean up
    if (testEl.parentNode) {
      testEl.parentNode.removeChild(testEl);
    }
  }
  
  return missingClasses;
}

/**
 * Load emergency CSS if critical classes are missing
 */
export function loadEmergencyCss(missingClasses: string[] = []): void {
  if (typeof document === 'undefined' || document.getElementById('mcp-emergency-css')) return;
  
  // If no specific classes provided, check all
  if (missingClasses.length === 0) {
    missingClasses = verifyCriticalCss();
  }
  
  if (missingClasses.length === 0) return;
  
  console.warn('[CSS Recovery] Missing critical CSS classes:', missingClasses);
  
  // Apply emergency CSS with !important rules
  const styleEl = document.createElement('style');
  styleEl.id = 'mcp-emergency-css';
  styleEl.textContent = CRITICAL_CSS.split('\n').map(line => {
    // Add !important to all property declarations
    if (line.includes(':') && !line.includes('@')) {
      return line.replace(/;(\s*)$/, ' !important;$1');
    }
    return line;
  }).join('\n');
  
  document.head.appendChild(styleEl);
  console.log('[CSS Recovery] Emergency CSS loaded');
}

/**
 * Initialize the CSS injection system
 */
export function initializeCss(): void {
  if (typeof window === 'undefined') return;
  
  // Inject critical CSS as early as possible
  injectCriticalCss();
  
  // Wait for DOM to be ready for other operations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyMcpClassPrefixes();
      setTimeout(() => {
        loadEmergencyCss();
      }, 1000); // Delay check to allow normal CSS to load
    });
  } else {
    applyMcpClassPrefixes();
    setTimeout(() => {
      loadEmergencyCss();
    }, 1000);
  }
}

// Auto-initialize when imported in the browser
if (typeof window !== 'undefined') {
  initializeCss();
}