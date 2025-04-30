import React, { createContext, useContext, useEffect } from 'react';
import { useTheme } from '../utils/theme-manager';

// Import our theme CSS
import '../styles/theme.css';

// Create a context for theme values
type ThemeContextType = ReturnType<typeof useTheme>;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for theme management
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValue = useTheme();
  
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme
 */
export function useAppTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Theme toggle button component
 */
export function ThemeToggle() {
  const { toggleTheme, isDark } = useAppTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
}

/**
 * CSS Module styles for the toggle button
 */
const styles = `
.theme-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  color: var(--color-gray-600);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  color: var(--color-primary);
  background-color: var(--color-gray-100);
}

.dark-theme .theme-toggle {
  color: var(--color-gray-300);
}

.dark-theme .theme-toggle:hover {
  color: var(--color-primary-light);
  background-color: var(--color-gray-800);
}
`;

/**
 * Add the styles for the toggle button
 */
export function injectThemeToggleStyles() {
  if (typeof document !== 'undefined') {
    const styleTag = document.createElement('style');
    styleTag.setAttribute('id', 'theme-toggle-styles');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

// Auto-inject the styles when this module is imported
injectThemeToggleStyles();