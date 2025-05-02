/**
 * MCP Integration Platform - Theme Provider
 * 
 * This component handles theme management for the application, including
 * light/dark mode switching and persistence. It uses CSS variables for
 * easy application-wide theming.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../config/constants';
import { UI_CONFIG } from '../config/app-config';
import { initializeTheme, applyThemeToDom } from '../utils/theme-loader';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system' | 'high-contrast';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: UI_CONFIG.DEFAULT_THEME,
  setTheme: () => {},
  isDark: false
});

// Helper to get system theme preference
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Helper functions moved to theme-loader.ts

// Helper to get stored theme
function getStoredTheme(): ThemeMode {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (storedTheme && ['light', 'dark', 'system', 'high-contrast'].includes(storedTheme)) {
      return storedTheme as ThemeMode;
    }
  } catch (e) {
    console.warn('[Theme] Unable to access localStorage:', e);
  }
  return UI_CONFIG.DEFAULT_THEME;
}

// Helper to store theme
function storeTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.warn('[Theme] Unable to store theme in localStorage:', e);
  }
}

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with stored theme
  const [theme, setThemeState] = useState<ThemeMode>(UI_CONFIG.DEFAULT_THEME);
  const [initialized, setInitialized] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Set theme and apply to DOM
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    storeTheme(newTheme);
    
    // Apply theme immediately using the enhanced apply function
    applyThemeToDom(newTheme);
    
    // Update isDark state based on computed theme
    const computedTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
    setIsDark(computedTheme === 'dark');
  };
  
  // Initialize theme when component mounts
  useEffect(() => {
    // Initialize theme with critical CSS
    initializeTheme();
    
    // Get stored theme from localStorage
    const storedTheme = getStoredTheme();
    setThemeState(storedTheme);
    
    // Apply the theme using the enhanced apply function
    applyThemeToDom(storedTheme);
    
    // Update isDark state based on computed theme
    const computedTheme = storedTheme === 'system' ? getSystemTheme() : storedTheme;
    setIsDark(computedTheme === 'dark');
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newSystemTheme = getSystemTheme();
        applyThemeToDom('system'); // This will handle the system preference internally
        setIsDark(newSystemTheme === 'dark');
      }
    };
    
    // Add listener and handle initial value
    mediaQuery.addEventListener('change', handleChange);
    
    // Mark as initialized
    setInitialized(true);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);
  
  // Provide theme context
  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for using the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
