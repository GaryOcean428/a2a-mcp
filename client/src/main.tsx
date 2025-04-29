import { createRoot } from "react-dom/client";
import { VERSION } from "./version";
import App from "./App";

// Log startup information
console.log(`MCP Integration Platform v${VERSION} starting`);

// Handle any errors proactively
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('WebSocket')) {
    console.warn('Suppressed WebSocket error:', event.message);
    event.preventDefault();
  }
});

// Remove loading spinner when app is mounted
const loadingElement = document.querySelector('.loading');
if (loadingElement) {
  setTimeout(() => {
    loadingElement.style.display = 'none';
  }, 500);
}

// Mount the application
createRoot(document.getElementById("root")!).render(<App />);
