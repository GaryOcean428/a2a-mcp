/**
 * MCP Integration Platform - UI Loading Controller
 * 
 * This module orchestrates the UI loading process to ensure
 * a consistent, reliable rendering flow for the application.
 */

import { applyImmediateCriticalCss, createLoadingOverlay, removeLoadingOverlay } from './critical-css-reset';

// UI loading states
export enum UILoadingState {
  INITIALIZING = 'initializing',
  LOADING_RESOURCES = 'loading_resources',
  VERIFYING_STYLES = 'verifying_styles',
  READY = 'ready',
  ERROR = 'error'
}

// Resource loading status
interface ResourceStatus {
  type: 'stylesheet' | 'script' | 'component';
  id: string;
  loaded: boolean;
  verified: boolean;
  error: string | null;
}

// Track loading state
let currentState: UILoadingState = UILoadingState.INITIALIZING;
let resourceStatus: ResourceStatus[] = [];
let loadingOverlay: HTMLElement | null = null;

// Critical CSS classes that must be verified
const criticalCssClasses = [
  'bg-grid-gray-100',
  'bg-blob-gradient',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'to-white',
  'bg-gradient-to-r'
];

/**
 * Initialize the UI loading controller
 */
export function initializeUILoading(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log('[UI Controller] Initializing UI loading process');
      
      // Apply critical CSS immediately
      applyImmediateCriticalCss();
      
      // Create loading overlay
      loadingOverlay = createLoadingOverlay();
      
      // Update state
      updateLoadingState(UILoadingState.LOADING_RESOURCES);
      
      // Create MCP ready event listener
      const readyEventName = 'mcp:ui-ready';
      let readyEventFired = false;
      
      // Set up event listeners
      document.addEventListener(readyEventName, () => {
        readyEventFired = true;
        finalizeUILoading();
        resolve();
      }, { once: true });
      
      // Hook into window load event
      window.addEventListener('load', () => {
        console.log('[UI Controller] Window load event fired');
        verifyResources();
      });
      
      // Set a timeout to resolve anyway if ready event never fires
      setTimeout(() => {
        if (!readyEventFired) {
          console.warn('[UI Controller] Timeout waiting for UI ready event, proceeding anyway');
          finalizeUILoading();
          resolve();
        }
      }, 5000);
      
      // Start checking for stylesheet loads
      trackStylesheetLoading();
      
    } catch (error) {
      console.error('[UI Controller] Error initializing UI loading:', error);
      updateLoadingState(UILoadingState.ERROR);
      removeLoadingOverlay();
      reject(error);
    }
  });
}

/**
 * Track the loading of all stylesheets
 */
function trackStylesheetLoading(): void {
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  console.log(`[UI Controller] Tracking ${stylesheets.length} stylesheets`);
  
  // Update resource status for each stylesheet
  stylesheets.forEach((stylesheet, index) => {
    const href = stylesheet.getAttribute('href') || `unknown-${index}`;
    
    // Check if stylesheet is loaded by trying to access its sheet property
    let isLoaded = false;
    try {
      // Cast to HTMLLinkElement to access the sheet property
      const linkEl = stylesheet as HTMLLinkElement;
      isLoaded = linkEl.sheet !== null;
    } catch (e) {
      console.warn(`Failed to check if stylesheet ${href} is loaded:`, e);
    }
    
    resourceStatus.push({
      type: 'stylesheet',
      id: href,
      loaded: isLoaded, // Already loaded
      verified: false,
      error: null
    });
    
    // Set up load and error handlers
    stylesheet.addEventListener('load', () => {
      updateResourceStatus(href, 'stylesheet', true, null);
    });
    
    stylesheet.addEventListener('error', (event) => {
      updateResourceStatus(href, 'stylesheet', false, 'Failed to load');
    });
  });
  
  // Start periodic checking to catch any already loaded stylesheets
  const interval = setInterval(() => {
    let allLoaded = true;
    
    // Check each stylesheet
    resourceStatus.forEach(status => {
      if (status.type === 'stylesheet' && !status.loaded) {
        const element = [...document.querySelectorAll('link[rel="stylesheet"]')]
          .find(link => link.getAttribute('href') === status.id);
          
        if (element && element.sheet !== null) {
          updateResourceStatus(status.id, 'stylesheet', true, null);
        } else {
          allLoaded = false;
        }
      }
    });
    
    // If all stylesheets are loaded, clear interval and verify CSS
    if (allLoaded) {
      clearInterval(interval);
      verifyResources();
    }
  }, 100);
  
  // Clear interval after a maximum time to prevent infinite checking
  setTimeout(() => {
    clearInterval(interval);
    verifyResources();
  }, 3000);
}

/**
 * Update the status of a resource
 */
function updateResourceStatus(
  id: string,
  type: 'stylesheet' | 'script' | 'component',
  loaded: boolean,
  error: string | null
): void {
  
  const statusIndex = resourceStatus.findIndex(
    status => status.id === id && status.type === type
  );
  
  if (statusIndex >= 0) {
    resourceStatus[statusIndex].loaded = loaded;
    resourceStatus[statusIndex].error = error;
    
    console.log(`[UI Controller] Resource status updated: ${type} ${id} - loaded: ${loaded}`);
  } else {
    resourceStatus.push({ type, id, loaded, verified: false, error });
  }
  
  // Check if all resources are loaded
  const allLoaded = resourceStatus.every(status => status.loaded || status.error !== null);
  
  if (allLoaded) {
    verifyResources();
  }
}

/**
 * Verify that all critical CSS classes are available
 */
function verifyResources(): void {
  try {
    console.log('[UI Controller] Verifying resources');
    updateLoadingState(UILoadingState.VERIFYING_STYLES);
    
    // Verify critical CSS classes
    const cssVerificationResults = verifyCriticalCssClasses();
    
    // Update resource statuses
    criticalCssClasses.forEach((className, index) => {
      const statusIndex = resourceStatus.findIndex(
        status => status.id === className && status.type === 'component'
      );
      
      const isVerified = cssVerificationResults[index];
      
      if (statusIndex >= 0) {
        resourceStatus[statusIndex].verified = isVerified;
      } else {
        resourceStatus.push({
          type: 'component',
          id: className,
          loaded: true,
          verified: isVerified,
          error: isVerified ? null : 'CSS class not properly loaded'
        });
      }
    });
    
    // Check if all resources are verified
    const allVerified = resourceStatus
      .filter(status => status.type === 'component')
      .every(status => status.verified);
    
    if (allVerified) {
      // All verified, UI is ready
      console.log('[UI Controller] All resources verified');
      finalizeUILoading();
    } else {
      // Some resources failed verification
      console.warn('[UI Controller] Some resources failed verification');
      
      // List failed resources
      resourceStatus
        .filter(status => !status.verified && status.type === 'component')
        .forEach(status => {
          console.warn(`[UI Controller] - Failed: ${status.id} - ${status.error}`);
        });
      
      // Still proceed with loading
      finalizeUILoading();
    }
  } catch (error) {
    console.error('[UI Controller] Error verifying resources:', error);
    finalizeUILoading();
  }
}

/**
 * Verify critical CSS classes
 */
function verifyCriticalCssClasses(): boolean[] {
  return criticalCssClasses.map(className => {
    try {
      // Create a test element
      const testElement = document.createElement('div');
      testElement.className = className;
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      testElement.style.pointerEvents = 'none';
      
      // Add to DOM temporarily
      document.body.appendChild(testElement);
      
      // Get the computed style
      const computedStyle = window.getComputedStyle(testElement);
      
      // Test if styles are applied correctly
      let result = false;
      
      // Different checks for different classes
      if (className === 'bg-grid-gray-100') {
        result = computedStyle.backgroundImage !== '';
      } else if (className === 'bg-blob-gradient') {
        result = computedStyle.backgroundImage !== '';
      } else if (className === 'feature-card') {
        result = computedStyle.backgroundColor !== '' && computedStyle.borderRadius !== '';
      } else if (className === 'animate-fade-in-down') {
        result = computedStyle.animation !== '';
      } else {
        // Default check - assume any style change means it's working
        result = true;
      }
      
      // Clean up
      document.body.removeChild(testElement);
      
      console.log(`[UI Controller] CSS class ${className}: ${result ? 'OK' : 'FAILED'}`);
      
      return result;
    } catch (error) {
      console.error(`[UI Controller] Error testing CSS class ${className}:`, error);
      return false;
    }
  });
}

/**
 * Update the current loading state
 */
function updateLoadingState(state: UILoadingState): void {
  currentState = state;
  console.log(`[UI Controller] State updated: ${state}`);
  
  // Update loading overlay text if available
  if (loadingOverlay) {
    const textElement = loadingOverlay.querySelector('p');
    if (textElement) {
      switch (state) {
        case UILoadingState.INITIALIZING:
          textElement.textContent = 'Initializing MCP Integration Platform...';
          break;
        case UILoadingState.LOADING_RESOURCES:
          textElement.textContent = 'Loading MCP resources...';
          break;
        case UILoadingState.VERIFYING_STYLES:
          textElement.textContent = 'Verifying MCP styles...';
          break;
        case UILoadingState.READY:
          textElement.textContent = 'MCP Integration Platform ready!';
          break;
        case UILoadingState.ERROR:
          textElement.textContent = 'Error loading MCP Integration Platform';
          break;
      }
    }
  }
}

/**
 * Finalize the UI loading process
 */
function finalizeUILoading(): void {
  try {
    // Dispatch ready event if still in loading states
    if (currentState !== UILoadingState.READY && currentState !== UILoadingState.ERROR) {
      updateLoadingState(UILoadingState.READY);
      
      // Dispatch ready event
      const readyEvent = new CustomEvent('mcp:ui-ready', {
        bubbles: true,
        cancelable: false,
        detail: { resourceStatus }
      });
      
      document.dispatchEvent(readyEvent);
      
      // Remove loading overlay
      setTimeout(() => {
        removeLoadingOverlay();
      }, 500);
    }
  } catch (error) {
    console.error('[UI Controller] Error finalizing UI loading:', error);
    
    // Still try to remove loading overlay
    removeLoadingOverlay();
  }
}

/**
 * Get the current UI loading state
 */
export function getUILoadingState(): UILoadingState {
  return currentState;
}

/**
 * Get the status of all tracked resources
 */
export function getResourceStatus(): ResourceStatus[] {
  return [...resourceStatus];
}