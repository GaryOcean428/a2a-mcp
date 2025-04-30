import { createRoot } from "react-dom/client";
import { VERSION } from "./version";
import App from "./App";
// Import the Vite HMR fix to patch WebSocket
import "./vite-hmr-fix";
// Import the new UI loading controller
import { initializeUILoading } from "./ui-loading-controller";
// Apply critical CSS immediately 
import { applyImmediateCriticalCss } from "./critical-css-reset";

// Apply critical CSS immediately, before anything else
applyImmediateCriticalCss();

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
  
  // Initialize UI loading
  initializeUILoading()
    .then(() => {
      console.log('[MCP] UI loading process completed successfully');
      mountApp();
    })
    .catch(error => {
      console.error('[MCP] Error in UI loading process:', error);
      // Still try to mount the app after a delay
      setTimeout(() => mountApp(), 1000);
    });
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
