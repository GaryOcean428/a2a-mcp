/**
 * MCP Integration Platform - CSS Injector Utility
 * 
 * This utility provides functions to inject critical CSS classes directly
 * into the HTML document to ensure consistent rendering between development
 * and production environments.
 */

import { ANIMATION_DURATIONS } from '../config/constants';

// Class categories to be protected from purging in production
const CRITICAL_CLASS_CATEGORIES = [
  'animate-', // Animation classes
  'transition-', // Transition classes
  'bg-gradient', // Gradient backgrounds
  'dark:', // Dark mode
  'hover:', // Hover states
  'focus:', // Focus states
  'group-hover:', // Group hover states
  'grid-cols-', // Grid columns
  'grid-rows-', // Grid rows
  'gap-', // Grid and flex gaps
  'rounded-', // Border radius
  'shadow-', // Shadows
  'opacity-', // Opacity
  'text-', // Text styling
  'font-', // Font styling
  'h-', // Height
  'w-', // Width
  'p-', // Padding
  'm-', // Margin
  'z-', // Z-index
];

// The basic CSS framework that should always be available
const CRITICAL_CSS = `
  /* MCP Integration Platform - Critical CSS - Injected by css-injector.ts */
  
  /* Basic animations that are required even before main CSS loads */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  /* Critical animation classes */
  .animate-fade-in {
    animation: fadeIn ${ANIMATION_DURATIONS.MEDIUM}ms ease-in-out forwards;
  }
  
  .animate-fade-in-down {
    animation: fadeInDown ${ANIMATION_DURATIONS.MEDIUM}ms ease-in-out forwards;
  }
  
  .animate-fade-in-up {
    animation: fadeInUp ${ANIMATION_DURATIONS.MEDIUM}ms ease-in-out forwards;
  }
  
  .animate-fade-out {
    animation: fadeOut ${ANIMATION_DURATIONS.MEDIUM}ms ease-in-out forwards;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  /* Critical utility classes */
  .invisible {
    visibility: hidden;
  }
  
  .visible {
    visibility: visible;
  }
  
  .hidden {
    display: none;
  }
  
  .block {
    display: block;
  }
  
  .inline-block {
    display: inline-block;
  }
  
  .flex {
    display: flex;
  }
  
  .grid {
    display: grid;
  }
  
  .opacity-0 {
    opacity: 0;
  }
  
  .opacity-100 {
    opacity: 1;
  }
`;

/**
 * Inject critical CSS into the document head
 */
export function injectCriticalCSS(): void {
  // Check if it's already injected
  if (document.getElementById('mcp-critical-css')) {
    return;
  }
  
  // Create style element
  const styleEl = document.createElement('style');
  styleEl.id = 'mcp-critical-css';
  styleEl.innerHTML = CRITICAL_CSS;
  
  // Add to document head
  document.head.appendChild(styleEl);
  
  // Log success
  console.log('[CSS Injector] Critical CSS injected');
}

/**
 * Create a safelist of critical CSS classes for Tailwind
 */
export function createCssSafelist(): string[] {
  // Base classes that should never be purged
  const safelist: string[] = [
    'animate-fade-in',
    'animate-fade-in-down',
    'animate-fade-in-up',
    'animate-fade-out',
    'animate-spin',
    'animate-pulse',
    'invisible',
    'visible',
    'hidden',
    'block',
    'inline-block',
    'flex',
    'grid',
    'opacity-0',
    'opacity-100',
  ];
  
  // Add critical class categories
  return safelist;
}

/**
 * Verify that critical CSS is loaded and functioning
 */
export function verifyCssLoaded(): boolean {
  // Create a test element
  const testEl = document.createElement('div');
  testEl.className = 'animate-fade-in hidden';
  testEl.id = 'mcp-css-test';
  testEl.style.position = 'absolute';
  testEl.style.top = '-9999px';
  testEl.style.left = '-9999px';
  
  // Add to document
  document.body.appendChild(testEl);
  
  // Get the computed style
  const style = window.getComputedStyle(testEl);
  
  // Check if the animation property is set
  const animationName = style.getPropertyValue('animation-name');
  const display = style.getPropertyValue('display');
  
  // Remove test element
  document.body.removeChild(testEl);
  
  // If the animation name is fadeIn and display is none, CSS is loaded
  return animationName.includes('fadeIn') && display === 'none';
}

/**
 * Load a CSS file dynamically
 */
export function loadCssFile(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
      resolve();
      return;
    }
    
    // Create link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    
    // Set up event handlers
    link.onload = () => resolve();
    link.onerror = () => {
      console.error(`[CSS Injector] Failed to load CSS: ${url}`);
      reject(new Error(`Failed to load CSS: ${url}`));
    };
    
    // Add to document head
    document.head.appendChild(link);
  });
}

/**
 * Initialize CSS protection system
 */
export function initCssProtection(): void {
  // Inject critical CSS first
  injectCriticalCSS();
  
  // Check if CSS is properly loaded, if not attempt recovery
  const cssLoaded = verifyCssLoaded();
  if (!cssLoaded) {
    console.warn('[CSS Injector] Critical CSS not functioning, attempting recovery');
    
    // Try loading the theme CSS file
    loadCssFile('/src/styles/theme.css')
      .then(() => {
        console.log('[CSS Injector] Theme CSS loaded successfully');
      })
      .catch(() => {
        console.error('[CSS Injector] Failed to load theme CSS, UI may be inconsistent');
      });
  }
}