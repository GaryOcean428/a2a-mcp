import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { VERSION } from './version';

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

createRoot(document.getElementById("root")!).render(<App />);
