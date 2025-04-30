/**
 * CSS Injector Utility
 * 
 * This utility ensures critical CSS is loaded correctly in both development and production.
 * It handles theme injection, animation classes, and ensures consistent styling across environments.
 */

// Critical CSS that's needed for immediate rendering before the full CSS loads
const CRITICAL_CSS = `
  :root {
    --color-primary: #7c3aed;
    --color-primary-rgb: 124, 58, 237;
    --color-text: #111827;
    --color-text-muted: #6b7280;
    --color-background: #ffffff;
  }
  
  [data-theme="dark"] {
    --color-background: #121212;
    --color-text: #f3f4f6;
    --color-text-muted: #9ca3af;
  }
  
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: var(--color-background);
    z-index: 9999;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(var(--color-primary-rgb), 0.2);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .animate-fade-in-down {
    animation: fadeInDown 250ms cubic-bezier(0, 0, 0.2, 1) forwards;
  }
  
  @keyframes fadeInDown {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

/**
 * Injects critical CSS into the document head
 * This should be called as early as possible before rendering
 */
export function injectCriticalCss(): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Check if critical CSS is already injected
  if (!document.getElementById('critical-css')) {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.innerHTML = CRITICAL_CSS;
    
    // Insert at the beginning of head to ensure it loads first
    if (document.head.firstChild) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      document.head.appendChild(style);
    }
  }
}

/**
 * Initializes the full CSS system
 * This loads the theme CSS file dynamically
 */
export function initializeCss(): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  // Load theme CSS file
  return new Promise((resolve, reject) => {
    // Don't load if it's already loaded
    if (document.getElementById('theme-css-link')) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.id = 'theme-css-link';
    link.rel = 'stylesheet';
    link.href = '/src/styles/theme.css';
    
    link.onload = () => {
      console.log('[CSS Injector] Theme CSS loaded successfully');
      resolve();
    };
    
    link.onerror = (error) => {
      console.error('[CSS Injector] Failed to load theme CSS:', error);
      // Create a recovery style element with essential styles
      recoverCriticalStyles();
      reject(new Error('Failed to load theme CSS'));
    };
    
    document.head.appendChild(link);
  });
}

/**
 * If loading the theme CSS fails, this function recovers essential styles
 */
function recoverCriticalStyles(): void {
  if (document.getElementById('recovery-css')) {
    return;
  }
  
  console.warn('[CSS Injector] Recovering critical styles');
  
  const style = document.createElement('style');
  style.id = 'recovery-css';
  style.innerHTML = `
    /* Recovery CSS with animation classes that might be missing */
    .animate-fade-in-down {
      animation: fadeInDown 250ms ease-out forwards;
    }
    
    .animate-fade-in {
      animation: fadeIn 250ms ease-out forwards;
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 250ms ease-out forwards;
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes fadeInDown {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Get the user's preferred theme (light, dark, or system)
 */
export function getPreferredTheme(): 'light' | 'dark' | 'system' {
  if (typeof localStorage === 'undefined' || typeof window === 'undefined') {
    return 'system';
  }
  
  const savedTheme = localStorage.getItem('mcp-theme') as 'light' | 'dark' | 'system' | null;
  return savedTheme || 'system';
}

/**
 * Update the theme on the root element
 */
export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }
  
  const root = document.documentElement;
  const realTheme = theme === 'system' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : theme;
  
  root.dataset.theme = realTheme;
  localStorage.setItem('mcp-theme', theme);
}

/**
 * Listen for system theme changes
 */
export function initializeThemeListener(callback?: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = () => {
    const savedTheme = localStorage.getItem('mcp-theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme === 'system') {
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = newTheme;
      if (callback) callback(newTheme);
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}