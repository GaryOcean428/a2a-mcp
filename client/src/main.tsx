import { createRoot } from "react-dom/client";
import { VERSION } from "./version";
import App from "./App";
// Import the Vite HMR fix to patch WebSocket
import "./vite-hmr-fix";
// Import direct CSS injection
import { initializeCss, injectCriticalCss } from "./utils/css-injector";

// Apply essential CSS immediately, before anything else
injectCriticalCss();

// Log startup information
console.log(`MCP Integration Platform v${VERSION} starting`);

// Handle any errors proactively
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('WebSocket')) {
    console.warn('Suppressed WebSocket error:', event.message);
    event.preventDefault();
  }
});

// -------------------------------------------------------------
// START CONTROLLED MOUNTING PROCESS
// -------------------------------------------------------------

// Initialize the UI loading process
document.addEventListener('DOMContentLoaded', () => {
  console.log('[MCP] Document loaded, initializing UI loading process');
  
  // Initialize our CSS system
  initializeCss();
  
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
    console.log('[MCP] Direct CSS initialization completed successfully');
    mountApp();
    
    // Remove the loading overlay with a fade effect
    if (loadingOverlay) {
      (loadingOverlay as HTMLElement).style.transition = 'opacity 0.5s ease-in-out';
      (loadingOverlay as HTMLElement).style.opacity = '0';
      setTimeout(() => {
        if (loadingOverlay.parentNode) {
          loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
      }, 500);
    }
  }, 300);
});

// Function to mount the React application
function mountApp() {
  try {
    console.log('[MCP] Mounting application');
    
    // Get the root element
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    // Create and render React root
    createRoot(rootElement).render(<App />);
    
    // Remove any existing loading elements
    const loadingElement = document.querySelector('.loading') as HTMLElement | null;
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 500);
    }
    
    console.log("[MCP] Application mounted successfully");
  } catch (error) {
    console.error("[MCP] Error mounting application:", error);
    
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
