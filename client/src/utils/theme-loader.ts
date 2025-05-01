/**
 * MCP Integration Platform - Theme Loader Utility
 * 
 * This utility helps ensure proper theme loading across development and production
 * environments by injecting critical CSS and providing recovery mechanisms.
 */

import { injectCriticalCSS, loadCssFile, verifyCssLoaded } from './css-injector';

// We'll inject these critical CSS classes immediately on load
const criticalClasses = [
  // Layout classes
  '.flex', '.flex-col', '.flex-1', '.grid', '.min-h-screen',
  '.relative', '.absolute', '.fixed', '.z-10', '.z-20',
  '.overflow-hidden', '.overflow-auto',
  
  // Sizing
  '.w-full', '.h-full', '.min-w-0',
  
  // Spacing
  '.p-4', '.px-4', '.py-4', '.m-4', '.mt-4',
  
  // Colors
  '.bg-white', '.bg-gray-50', '.text-primary',
  
  // Animations
  '.animate-fade-in', '.animate-fade-in-down', '.animate-spin',
  
  // Components
  '.sidebar-container', '.main-content', '.content-container'
];

/**
 * Generate CSS string from critical classes
 */
function generateCriticalCSS(): string {
  return criticalClasses.join(' {} ') + ' {}';
}

/**
 * Initialize theme with critical styles
 */
export function initializeTheme(): void {
  // First inject our built-in critical CSS
  injectCriticalCSS();
  
  // Then inject critical classes for layout
  const styleEl = document.createElement('style');
  styleEl.id = 'mcp-critical-classes';
  styleEl.innerHTML = generateCriticalCSS();
  document.head.appendChild(styleEl);
  
  // After a brief delay, verify CSS is working
  setTimeout(() => {
    const cssLoaded = verifyCssLoaded();
    if (!cssLoaded) {
      console.warn('[Theme] Critical CSS not functioning, attempting recovery');
      
      // Try loading theme files directly
      Promise.all([
        loadCssFile('/src/styles/theme.css'),
        loadCssFile('/src/styles/fix-sidebar.css')
      ])
      .then(() => {
        console.log('[Theme] Loaded CSS files successfully');
      })
      .catch(error => {
        console.error('[Theme] Failed to load CSS files:', error);
      });
    }
  }, 500);
}

/**
 * Apply the current theme to the document
 */
export function applyThemeToDom(theme: 'light' | 'dark' | 'system'): void {
  // Calculate actual theme (in case of 'system')
  const actualTheme = theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    : theme;
  
  // Apply theme class to document element
  if (actualTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.dataset.theme = 'dark';
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.dataset.theme = 'light';
  }
  
  // Add metadata to help debugging
  document.documentElement.dataset.themeSource = theme;
  document.documentElement.dataset.themeMode = actualTheme;
}
