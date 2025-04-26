// Import CSS recovery and verification systems first 
import './css-recovery';
import './verification';

import { createRoot } from "react-dom/client";
import App from "./App";
import './index.css';
import './production.css'; // Critical CSS for production
import { VERSION } from './version';
import CssVerification from './components/CssVerification';

// CSS Verification will check critical styles are applied correctly
// and apply fallbacks as needed - must run before any other components
function AppWithVerification() {
  return (
    <>
      <CssVerification />
      <App />
    </>
  );
}

// Log version on startup to verify the correct version is deployed
console.log(`MCP Integration Platform v${VERSION}`);

// Workaround for Vite WebSocket connection errors
// This prevents the WebSocket errors from being shown to users
window.addEventListener('error', (event) => {
  const errorText = event.error?.toString() || event.message;
  
  // Only suppress WebSocket URL errors
  if (errorText.includes('WebSocket') && 
      (errorText.includes('Failed to construct') || 
       errorText.includes('invalid'))) {
    console.warn('Suppressed WebSocket connection error:', errorText);
    // Prevent the error from propagating
    event.preventDefault();
    event.stopPropagation();
  }
});

// Suppress unhandled promise rejections related to WebSocket
window.addEventListener('unhandledrejection', (event) => {
  const errorText = event.reason?.toString() || '';
  
  if (errorText.includes('WebSocket') && 
      (errorText.includes('Failed to construct') || 
       errorText.includes('invalid'))) {
    console.warn('Suppressed WebSocket promise rejection:', errorText);
    // Prevent the error from propagating
    event.preventDefault();
    event.stopPropagation();
  }
});

// Set a global variable for the app version
(window as any).MCP_VERSION = VERSION;

// Add version to document for debugging
document.documentElement.dataset.mcpVersion = VERSION;

// Hide static landing page when app mounts
const staticLanding = document.querySelector('.static-landing');
if (staticLanding) {
  createRoot(document.getElementById("root")!).render(<AppWithVerification />);
  setTimeout(() => {
    staticLanding.classList.add('hidden');
  }, 500);
} else {
  createRoot(document.getElementById("root")!).render(<AppWithVerification />);
}
