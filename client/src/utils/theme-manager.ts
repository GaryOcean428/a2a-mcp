/**
 * Theme Manager
 * 
 * Utility for managing theme preferences (light/dark)
 * with local storage persistence.
 */

type ThemeMode = 'light' | 'dark' | 'system';

// Local storage key
const THEME_STORAGE_KEY = 'mcp-theme-preference';

/**
 * Check if we're running in the browser
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Get the preferred color scheme from the system
 */
function getSystemPreference(): 'light' | 'dark' {
  if (!isBrowser) return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Get the theme from local storage
 */
function getStoredTheme(): ThemeMode | null {
  if (!isBrowser) return null;
  
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  } catch (e) {
    console.error('Failed to access localStorage:', e);
    return null;
  }
}

/**
 * Store the theme in local storage
 */
function storeTheme(theme: ThemeMode): void {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme to localStorage:', e);
  }
}

/**
 * Apply a theme to the document
 */
function applyTheme(theme: ThemeMode): void {
  if (!isBrowser) return;
  
  // If using system preference, determine which theme to apply
  const effectiveTheme = theme === 'system'
    ? getSystemPreference()
    : theme;
  
  // Apply/remove dark theme class on document
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  } else {
    document.documentElement.classList.remove('dark-theme');
  }
  
  // Set a data attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', effectiveTheme);
}

/**
 * Initialize the theme system
 */
function initializeTheme(): ThemeMode {
  // Check stored preference first
  const storedTheme = getStoredTheme();
  
  // If no stored preference, use system default
  const initialTheme = storedTheme || 'system';
  
  // Apply the initial theme
  applyTheme(initialTheme);
  
  // Set up listener for system preference changes if using 'system'
  if (initialTheme === 'system' && isBrowser) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    try {
      // Modern browsers support addEventListener
      mediaQuery.addEventListener('change', () => {
        applyTheme('system');
      });
    } catch (e) {
      // Older browsers use deprecated addListener method
      try {
        // @ts-ignore - For older browsers
        mediaQuery.addListener(() => {
          applyTheme('system');
        });
      } catch (e2) {
        console.error('Failed to add media query listener:', e2);
      }
    }
  }
  
  return initialTheme;
}

/**
 * Change the current theme
 */
function setTheme(theme: ThemeMode): void {
  storeTheme(theme);
  applyTheme(theme);
}

/**
 * Get the effective theme (resolves 'system' to actual theme)
 */
function getEffectiveTheme(): 'light' | 'dark' {
  const currentTheme = getStoredTheme() || 'system';
  return currentTheme === 'system' ? getSystemPreference() : currentTheme;
}

/**
 * Get the current theme preference (including 'system')
 */
function getCurrentTheme(): ThemeMode {
  return getStoredTheme() || 'system';
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme(): ThemeMode {
  const currentTheme = getCurrentTheme();
  const newTheme = getEffectiveTheme() === 'light' ? 'dark' : 'light';
  
  setTheme(newTheme);
  return newTheme;
}

// Export the theme management API
export const themeManager = {
  initialize: initializeTheme,
  setTheme,
  getTheme: getCurrentTheme,
  getEffectiveTheme,
  toggle: toggleTheme,
  modes: {
    LIGHT: 'light' as const,
    DARK: 'dark' as const,
    SYSTEM: 'system' as const
  }
};

// Also export React hook for the theme
import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    // Initialize on mount
    const initialTheme = themeManager.initialize();
    setThemeState(initialTheme);
    setEffectiveTheme(themeManager.getEffectiveTheme());
    
    // Optional: Set up listener for external theme changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        setThemeState(e.newValue as ThemeMode);
        setEffectiveTheme(themeManager.getEffectiveTheme());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const setTheme = (newTheme: ThemeMode) => {
    themeManager.setTheme(newTheme);
    setThemeState(newTheme);
    setEffectiveTheme(themeManager.getEffectiveTheme());
  };
  
  const toggleTheme = () => {
    const newTheme = themeManager.toggle();
    setThemeState(newTheme);
    setEffectiveTheme(themeManager.getEffectiveTheme());
    return newTheme;
  };
  
  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light'
  };
}