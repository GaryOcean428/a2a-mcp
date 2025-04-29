import { createRoot } from "react-dom/client";
import App from "./App";
// Import verification but skip index.css which has PostCSS errors
import './verification';

// Log startup information
console.log('MCP Integration Platform starting up');

// Suppress WebSocket connection errors
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('WebSocket')) {
    console.warn('Suppressed WebSocket error');
    event.preventDefault();
  }
});

// Add basic styles directly (skip index.css with PostCSS errors)
const style = document.createElement('style');
style.textContent = `
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 263 70% 50%;
  }
  
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    margin: 0;
    padding: 0;
  }
  
  .feature-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #f3f4f6;
    transition: all 0.3s;
  }
`;
document.head.appendChild(style);

// Mount the application
createRoot(document.getElementById("root")!).render(<App />);
