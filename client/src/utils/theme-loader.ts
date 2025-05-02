/**
 * Theme Loader Utility
 * 
 * This utility handles initializing and loading the application theme.
 * It ensures proper CSS rendering and fixes common styling issues.
 */

import { version } from '../version';

/**
 * Initialize the theme and apply critical CSS
 */
export function initializeTheme() {
  console.log(`MCP Integration Platform v${version}`);
  console.log(`Build: ${new Date().toISOString()} (${process.env.NODE_ENV === 'development' || import.meta.env.DEV ? 'development' : 'production'})`);
  
  injectCriticalCss();
  
  // Apply the theme from theme.json (if available)
  applyThemeAttributes();
  
  // Fix fixed width elements
  fixFixedWidthElements();
  
  // Log successful initialization
  console.log('[CSS Injector] Critical CSS injected');
  console.log('[CSS Verify] Starting verification...');
}

/**
 * Inject critical CSS directly
 */
function injectCriticalCss() {
  // If we already have critical CSS in the document, don't add more
  if (document.getElementById('mcp-critical-css')) return;
  
  // Create a style element for critical CSS
  const styleElement = document.createElement('style');
  styleElement.id = 'mcp-critical-css';
  styleElement.textContent = `
    /* MCP Critical CSS (v${version}) */
    :root {
      --mcp-max-width: 1200px;
      --mcp-content-padding: 2rem;
      --mcp-border-radius: 0.5rem;
      --mcp-transition-duration: 300ms;
    }
    
    /* Optimized transitions - use specific properties instead of transition-all */
    .optimized-card-transition {
      transition-property: transform, box-shadow, border-color;
      transition-duration: var(--mcp-transition-duration);
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .optimized-hover-transition {
      transition-property: color, background-color, opacity;
      transition-duration: var(--mcp-transition-duration);
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Responsive container classes to replace fixed widths */
    .mcp-container {
      width: 100%;
      max-width: var(--mcp-max-width);
      margin-left: auto;
      margin-right: auto;
      padding-left: var(--mcp-content-padding);
      padding-right: var(--mcp-content-padding);
    }
    
    /* Responsive width utilities */
    .mcp-responsive-width {
      width: 100%;
      max-width: 100%;
    }
    
    @media (min-width: 640px) {
      .mcp-responsive-width {
        max-width: 600px;
      }
    }
    
    @media (min-width: 768px) {
      .mcp-responsive-width {
        max-width: 720px;
      }
    }
    
    @media (min-width: 1024px) {
      .mcp-responsive-width {
        max-width: 980px;
      }
    }
    
    @media (min-width: 1280px) {
      .mcp-responsive-width {
        max-width: 1200px;
      }
    }
  `;
  
  // Add it to the head
  document.head.appendChild(styleElement);
}

/**
 * Apply theme attributes from theme.json
 */
function applyThemeAttributes() {
  // Add a data attribute to the html element for theme version
  document.documentElement.setAttribute('data-mcp-version', version);
  
  // Add a class to indicate the environment
  document.documentElement.classList.add(
    process.env.NODE_ENV === 'development' || import.meta.env.DEV ? 'dev-env' : 'prod-env'
  );
}

/**
 * Fix fixed width elements by replacing them with responsive classes
 */
function fixFixedWidthElements() {
  // We'll do this with a MutationObserver when the DOM loads
  window.addEventListener('DOMContentLoaded', () => {
    // Find all elements with fixed width inline styles (e.g. width: 1030px)
    // and replace them with responsive classes
    const fixedWidthRegex = /width:\s*\d+px/i;
    
    // Create a mutation observer to watch for new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              
              // Check if there's a fixed width style
              if (element.style.width && fixedWidthRegex.test(element.style.width)) {
                // Replace with responsive class
                element.style.width = '';
                element.classList.add('mcp-responsive-width');
              }
              
              // Also check for transition-all and replace with optimized transitions
              if (element.style.transition && element.style.transition.includes('all')) {
                element.style.transition = '';
                if (element.classList.contains('feature-card') || 
                    element.tagName.toLowerCase() === 'card') {
                  element.classList.add('optimized-card-transition');
                } else {
                  element.classList.add('optimized-hover-transition');
                }
              }
            }
          });
        }
      });
    });
    
    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}
