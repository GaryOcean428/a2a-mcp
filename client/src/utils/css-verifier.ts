/**
 * MCP Integration Platform - CSS Verification Utility
 * 
 * This utility verifies that critical CSS classes are loaded correctly,
 * helping detect issues with CSS loading and purging in production builds.
 */

import { logger } from './logger';

// Critical CSS classes that must be available
const CRITICAL_CSS_CLASSES = [
  'bg-grid-gray-100',
  'bg-blob-gradient',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'to-white',
  'bg-gradient-to-r',
];

/**
 * Verify that critical CSS classes are available in the DOM
 */
export function verifyCriticalCss(): {
  success: boolean;
  missing: string[];
  present: string[];
} {
  logger.debug('Starting CSS verification', { tags: ['css', 'verification'] });
  
  // Check if we have inline critical CSS
  const hasCriticalCss = document.querySelector('style[data-critical="true"]') !== null;
  logger.debug(`Critical inline styles present: ${hasCriticalCss}`, {
    tags: ['css', 'verification']
  });
  
  // Count external stylesheets
  const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');
  logger.debug(`External stylesheets loaded: ${styleSheets.length}`, {
    tags: ['css', 'verification']
  });
  
  // Log stylesheet URLs
  Array.from(styleSheets).forEach(sheet => {
    logger.debug(`- ${(sheet as HTMLLinkElement).href}`, {
      tags: ['css', 'verification']
    });
  });
  
  // Create a test element to check CSS class availability
  const testElement = document.createElement('div');
  testElement.style.position = 'absolute';
  testElement.style.visibility = 'hidden';
  testElement.style.pointerEvents = 'none';
  document.body.appendChild(testElement);
  
  // Check each critical class
  const missing: string[] = [];
  const present: string[] = [];
  
  logger.debug('Testing critical CSS classes:', {
    tags: ['css', 'verification']
  });
  
  CRITICAL_CSS_CLASSES.forEach(className => {
    testElement.className = className;
    const computedStyle = window.getComputedStyle(testElement);
    
    // A class is considered present if it causes at least one style difference
    // from the default
    const isPresent = hasStyleEffect(testElement, className);
    
    if (isPresent) {
      present.push(className);
      logger.debug(`- ${className}: OK`, { tags: ['css', 'verification'] });
    } else {
      missing.push(className);
      logger.warn(`- ${className}: MISSING`, { tags: ['css', 'verification'] });
    }
  });
  
  // Clean up
  document.body.removeChild(testElement);
  
  // Log final result
  if (missing.length === 0) {
    logger.debug('All critical CSS classes verified ✓', {
      tags: ['css', 'verification']
    });
  } else {
    logger.warn(`Missing ${missing.length} critical CSS classes!`, {
      tags: ['css', 'verification'],
      data: { missing }
    });
  }
  
  return {
    success: missing.length === 0,
    missing,
    present,
  };
}

/**
 * Check if a CSS class has any visible effect on an element
 */
function hasStyleEffect(element: HTMLElement, className: string): boolean {
  // Get baseline style
  element.className = '';
  const baselineStyle = window.getComputedStyle(element);
  const baselineProperties: Record<string, string> = {};
  
  // Sample important properties that are likely to be affected by our classes
  const propertiesToCheck = [
    'backgroundColor',
    'color', 
    'borderColor',
    'boxShadow',
    'transform',
    'opacity',
    'display',
    'position',
    'backgroundImage',
    'animation',
    'transition'
  ];
  
  // Collect baseline values
  propertiesToCheck.forEach(prop => {
    baselineProperties[prop] = baselineStyle.getPropertyValue(prop);
  });
  
  // Apply the class and check for differences
  element.className = className;
  const newStyle = window.getComputedStyle(element);
  
  // Check if any property changed
  for (const prop of propertiesToCheck) {
    if (newStyle.getPropertyValue(prop) !== baselineProperties[prop]) {
      return true;
    }
  }
  
  return false;
}

/**
 * Create a DOM observer to detect if CSS classes are dynamically inserted or removed
 */
export function createCssObserver(callback?: (additions: string[], removals: string[]) => void): () => void {
  // Keep track of loaded stylesheets
  const loadedSheets = new Set<string>();
  Array.from(document.querySelectorAll('link[rel="stylesheet"]')).forEach(sheet => {
    loadedSheets.add((sheet as HTMLLinkElement).href);
  });
  
  // Watch for style and link changes
  const observer = new MutationObserver(mutations => {
    const cssAdditions: string[] = [];
    const cssRemovals: string[] = [];
    
    mutations.forEach(mutation => {
      // Check for added nodes
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check if it's a stylesheet
          if (
            element.tagName === 'LINK' && 
            element.getAttribute('rel') === 'stylesheet'
          ) {
            const href = (element as HTMLLinkElement).href;
            if (!loadedSheets.has(href)) {
              loadedSheets.add(href);
              cssAdditions.push(href);
            }
          }
          
          // Check if it's an inline style
          if (element.tagName === 'STYLE') {
            cssAdditions.push(`[inline style] ${element.textContent?.slice(0, 20)}...`);
          }
        }
      });
      
      // Check for removed nodes
      mutation.removedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check if it's a stylesheet
          if (
            element.tagName === 'LINK' && 
            element.getAttribute('rel') === 'stylesheet'
          ) {
            const href = (element as HTMLLinkElement).href;
            if (loadedSheets.has(href)) {
              loadedSheets.delete(href);
              cssRemovals.push(href);
            }
          }
          
          // Check if it's an inline style
          if (element.tagName === 'STYLE') {
            cssRemovals.push(`[inline style] ${element.textContent?.slice(0, 20)}...`);
          }
        }
      });
    });
    
    // If we had any changes, log them and run the callback
    if (cssAdditions.length > 0 || cssRemovals.length > 0) {
      logger.debug('CSS changes detected', {
        tags: ['css', 'observer'],
        data: { additions: cssAdditions, removals: cssRemovals }
      });
      
      if (callback) {
        callback(cssAdditions, cssRemovals);
      }
    }
  });
  
  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  
  // Return a function to stop observing
  return () => {
    observer.disconnect();
  };
}

/**
 * Verify that WebSocket connections work
 */
export function verifyWebSocketConnection(wsPath: string = '/mcp-ws'): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      // Get the full WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}${wsPath}`;
      
      logger.debug(`Testing connection to ${wsUrl}`, {
        tags: ['websocket', 'verification']
      });
      
      // Create a test WebSocket
      const socket = new WebSocket(wsUrl);
      let timeoutId: number | null = null;
      
      // Set a timeout for the connection
      timeoutId = window.setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          logger.error('WebSocket connection test timed out', {
            tags: ['websocket', 'verification']
          });
          socket.close();
          resolve(false);
        }
      }, 5000) as unknown as number;
      
      // Handle successful connection
      socket.onopen = () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        
        logger.debug('WebSocket connection test successful', {
          tags: ['websocket', 'verification']
        });
        
        // Close the socket since we don't need it anymore
        socket.close();
        resolve(true);
      };
      
      // Handle connection errors
      socket.onerror = (error) => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        
        logger.error('WebSocket connection test failed', {
          tags: ['websocket', 'verification'],
          error
        });
        
        socket.close();
        resolve(false);
      };
    } catch (error) {
      logger.error('Error setting up WebSocket connection test', {
        tags: ['websocket', 'verification'],
        error
      });
      
      resolve(false);
    }
  });
}
