import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getPreferredTheme, 
  applyTheme, 
  initializeThemeListener 
} from '../utils/css-injector';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

// Create a context for theme management
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// ThemeProvider component that manages theme state
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get the initial theme preference
  const [theme, setThemeState] = useState<Theme>(getPreferredTheme());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Set the theme and update state
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  // Initialize theme on first render
  useEffect(() => {
    // Apply the initial theme
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);
    
    // Determine if dark mode is active
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(
      initialTheme === 'dark' || 
      (initialTheme === 'system' && systemIsDark)
    );
    
    // Set up a listener for system theme changes
    const cleanup = initializeThemeListener((newTheme) => {
      setIsDarkMode(newTheme === 'dark');
    });
    
    return cleanup;
  }, []);
  
  // Update isDarkMode when theme changes
  useEffect(() => {
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effectiveDark = 
      theme === 'dark' || 
      (theme === 'system' && systemIsDark);
      
    setIsDarkMode(effectiveDark);
    
    // Also update the data-theme attribute
    const root = document.documentElement;
    root.dataset.theme = effectiveDark ? 'dark' : 'light';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for consuming theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme toggle button component
export function ThemeToggle() {
  const { theme, setTheme, isDarkMode } = useTheme();
  
  const toggleTheme = () => {
    // Cycle through themes: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };
  
  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${
        theme === 'light' ? 'dark' : 
        theme === 'dark' ? 'system' : 'light'
      } theme`}
    >
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
}