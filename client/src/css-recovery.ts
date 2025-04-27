/**
 * CSS Recovery System
 * 
 * This module provides a runtime recovery mechanism for CSS styles
 * that might be missing in production due to Tailwind's purge process.
 * 
 * It's imported first in main.tsx to ensure it's available before any
 * components are rendered.
 */
import { VERSION } from './version';

// Execute on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set development mode flag for API URLs
  if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
    console.log('Development mode: Using default API key');
  }
  
  // Set a global function to verify and recover critical CSS
  (window as any).recoverMCPStyles = function() {
    console.log('Manually triggering MCP style recovery...');
    
    // Verify if critical styles are loaded
    const criticalStylesExist = Array.from(document.querySelectorAll('style')).some(
      style => style.textContent && style.textContent.includes('Critical UI styles')
    );
    
    // If no critical styles, inject them
    if (!criticalStylesExist) {
      // Load production.css
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/production.css?v=${VERSION}`;
      document.head.appendChild(link);
      
      console.log('Injected production.css for CSS recovery');
      return 'CSS recovery initiated';
    }
    
    return 'Critical styles already present';
  };
  
  // Add a utility function for theme verification
  (window as any).verifyCSSClasses = function(classes: string[]) {
    const results: Record<string, boolean> = {};
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    document.body.appendChild(testDiv);
    
    for (const className of classes) {
      testDiv.className = className;
      const styles = window.getComputedStyle(testDiv);
      
      // Check if class has styling effect
      const hasEffect = (
        styles.backgroundImage !== 'none' ||
        styles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
        styles.borderRadius !== '0px' ||
        styles.padding !== '0px' ||
        styles.boxShadow !== 'none' ||
        styles.animation !== 'none none 0s ease 0s 1 normal none running' ||
        styles.transform !== 'none'
      );
      
      results[className] = hasEffect;
    }
    
    document.body.removeChild(testDiv);
    return results;
  };
  
  // Initialize the MCP client with proper base URL
  const apiBaseUrl = window.location.origin;
  console.log(`MCP client initialized with baseUrl: ${apiBaseUrl}`);
});