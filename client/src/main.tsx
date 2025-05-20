import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import { version } from "./version";
import App from "./App";

// Import the Vite HMR fix to patch WebSocket - this must be loaded first
import "./utils/vite-hmr-fix";

// Import CSS recovery utilities
import "./utils/css-recovery";

// Import enhanced utilities
import { initializeTheme } from "./utils/theme-loader";
import { logger } from "./utils/logger";
import { isDevelopment, getBrowserInfo, getDeviceInfo } from "./utils/environment";

// Import critical CSS fixes (important: keep these direct imports)
import "./styles/fix-sidebar.css";
import "./styles/fix-critical.css";
import "./styles/critical-fix.css"; // Added new CSS with gradient and feature-card fixes

// Apply essential CSS and initialize theme immediately
initializeTheme();

// Log startup information
logger.info(`MCP Integration Platform v${version} starting`, {
  tags: ['startup']
});

// Log environment information
const browserInfo = getBrowserInfo();
const deviceInfo = getDeviceInfo();
logger.debug('Browser capabilities detected', {
  data: { browser: browserInfo, device: deviceInfo }
});

// Create global error handler
window.addEventListener('error', (event) => {
  // Special handling for WebSocket errors which can be safely ignored in some cases
  if (event.message && event.message.includes('WebSocket')) {
    logger.warn('Suppressed WebSocket error', {
      tags: ['error-handler'],
      data: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
    event.preventDefault();
    return;
  }
  
  // Log all other errors
  logger.error('Uncaught error', {
    tags: ['error-handler', 'unhandled-exception'],
    error: event.error || event
  });
});

// Handle promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    tags: ['error-handler', 'unhandled-rejection'],
    error: event.reason
  });
});

// Import and call verifyCriticalCss during application initialization
import { verifyCriticalCss } from "./utils/css-verifier";

// -------------------------------------------------------------
// START CONTROLLED MOUNTING PROCESS
// -------------------------------------------------------------

// Initialize the UI loading process
document.addEventListener('DOMContentLoaded', () => {
  logger.info('Document loaded, initializing UI', { tags: ['startup'] });
  
  // CSS system is already initialized through initializeTheme()
  
  // Create a simple loading overlay
  const createLoadingOverlay = () => {
    const existingOverlay = document.querySelector('.loading-overlay');
    if (!existingOverlay) {
      const overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background-color: white;
        z-index: 9999;
      `;
      
      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      spinner.style.cssText = `
        width: 40px;
        height: 40px;
        border: 3px solid rgba(124, 58, 237, 0.2);
        border-radius: 50%;
        border-top-color: rgba(124, 58, 237, 1);
        animation: spin 1s ease-in-out infinite;
      `;
      
      // Add keyframes for spinner
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      
      const text = document.createElement('p');
      text.style.cssText = 'margin-top: 1rem; color: #4b5563; font-family: sans-serif;';
      text.textContent = 'Loading MCP Integration Platform...';
      
      overlay.appendChild(spinner);
      overlay.appendChild(text);
      document.body.appendChild(overlay);
      
      return overlay;
    }
    return existingOverlay;
  };
  
  // Show loading overlay
  const loadingOverlay = createLoadingOverlay();
  
  // Mount the app after a short delay to ensure CSS is loaded
  setTimeout(() => {
    logger.info('CSS initialization completed', { tags: ['startup', 'css'] });
    mountApp();
    
    // Remove the loading overlay with a fade effect
    if (loadingOverlay) {
      (loadingOverlay as HTMLElement).style.transition = 'opacity 0.5s ease-in-out';
      (loadingOverlay as HTMLElement).style.opacity = '0';
      setTimeout(() => {
        if (loadingOverlay.parentNode) {
          loadingOverlay.parentNode.removeChild(loadingOverlay);
          logger.debug('Removed loading overlay', { tags: ['ui'] });
        }
      }, 500);
    }
  }, 300);
});

// Function to mount the React application
function mountApp() {
  try {
    logger.info('Mounting application', { tags: ['startup', 'render'] });
    
    // Get the root element
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    // Verify critical CSS classes
    const cssVerificationResult = verifyCriticalCss();
    if (!cssVerificationResult.success) {
      logger.warn('Critical CSS verification failed', {
        tags: ['css', 'verification'],
        data: { missing: cssVerificationResult.missing }
      });
      // Attempt to recover missing styles
      window.recoverMissingStyles();
    }
    
    // Create and render React root with providers
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            logger.error('React error boundary caught error', {
              tags: ['react', 'error-boundary'],
              error,
              data: { componentStack: errorInfo.componentStack }
            });
          }}
        >
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <Toaster />
              <App />
            </ThemeProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </StrictMode>
    );
    
    // Remove any existing loading elements
    const loadingElement = document.querySelector('.loading') as HTMLElement | null;
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 500);
    }
    
    logger.info("Application mounted successfully", {
      tags: ['startup', 'complete']
    });
  } catch (error) {
    logger.error("Error mounting application", {
      tags: ['startup', 'fatal-error'],
      error
    });
    
    // Display error message on page
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          padding: 2rem;
          color: #d00;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <h2>Error Loading Application</h2>
          <p>${error instanceof Error ? error.message : String(error)}</p>
          <button onclick="window.location.reload()" style="
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #6b46c1;
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
          ">
            Reload Page
          </button>
        </div>
      `;
    }
  }
}
