import { createRoot } from "react-dom/client";
import { VERSION } from "./version";
import App from "./App";
// Import the Vite HMR fix to patch WebSocket
import "./vite-hmr-fix";
// Import UI pre-renderer
import { initUiPrerenderer, waitForUiReady } from "./ui-prerenderer";

// Log startup information
console.log(`MCP Integration Platform v${VERSION} starting`);

// Handle any errors proactively
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('WebSocket')) {
    console.warn('Suppressed WebSocket error:', event.message);
    event.preventDefault();
  }
});

// Initialize the UI pre-renderer
initUiPrerenderer().then(() => {
  // Mount the application when UI is ready
  mountApp();
}).catch(error => {
  console.error("Error initializing UI pre-renderer:", error);
  // Still mount the app even if pre-renderer fails
  mountApp();
});

// Function to mount the React application
async function mountApp() {
  try {
    // Wait for UI to be ready
    await waitForUiReady();
    
    // Get the root element and create root
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    // Create React root and render
    const root = createRoot(rootElement);
    root.render(<App />);
    
    // Remove loading spinner after app is mounted
    const loadingElement = document.querySelector('.loading') as HTMLElement | null;
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 500);
    }
    
    console.log("[MCP] Application mounted successfully");
  } catch (error) {
    console.error("Error mounting application:", error);
  }
}
