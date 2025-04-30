/**
 * MCP Integration Platform - Direct CSS Injection
 * 
 * This module directly injects essential CSS styles into the HTML document head
 * before any other rendering occurs, ensuring reliable UI presentation regardless
 * of external stylesheet loading status.
 */

// Core CSS that will be applied directly to ensure minimal styling
export const ESSENTIAL_CSS = `
/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Root layout */
:root {
  --primary: #6b46c1;
  --primary-light: #9f7aea;
  --primary-dark: #4a288c;
  --background: #ffffff;
  --foreground: #0f172a;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --border: #e2e8f0;
  --radius: 0.5rem;
}

html, body {
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
  color: var(--foreground);
  background-color: var(--background);
}

#root {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Essential layout containers */
.mcp-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.mcp-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.mcp-layout-header {
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 1rem;
}

.mcp-layout-main {
  flex: 1;
  padding: 1rem;
}

.mcp-layout-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid var(--border);
}

/* Critical navigation styles */
.mcp-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.mcp-logo {
  font-weight: bold;
  font-size: 1.25rem;
  color: var(--primary);
  text-decoration: none;
}

.mcp-nav-items {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.mcp-nav-link {
  color: var(--foreground);
  text-decoration: none;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: background-color 0.2s;
}

.mcp-nav-link:hover {
  background-color: var(--muted);
}

.mcp-nav-link.active {
  color: var(--primary);
  font-weight: 500;
}

/* Buttons */
.mcp-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  font-weight: 500;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-decoration: none;
}

.mcp-button-primary {
  background-color: var(--primary);
  color: white;
  border: 1px solid var(--primary);
}

.mcp-button-primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

.mcp-button-secondary {
  background-color: white;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.mcp-button-secondary:hover {
  background-color: var(--muted);
}

/* Auth form */
.mcp-auth-container {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

@media (min-width: 768px) {
  .mcp-auth-container {
    flex-direction: row;
  }
}

.mcp-auth-form-section {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mcp-auth-hero-section {
  flex: 1;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
}

.mcp-form-group {
  margin-bottom: 1rem;
  width: 100%;
}

.mcp-form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--foreground);
}

.mcp-form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.mcp-form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(107, 70, 193, 0.2);
}

/* Cards and features */
.mcp-card {
  background-color: white;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mcp-feature-card {
  background-color: white;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}

.mcp-feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Backgrounds and decorations */
.mcp-bg-grid {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}

.mcp-bg-blob {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
  z-index: -1;
  opacity: 0.8;
  filter: blur(50px);
}

.mcp-bg-gradient {
  background-image: linear-gradient(to right, #faf5ff, white);
}

/* Animations */
@keyframes mcp-fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mcp-animate-fadeInDown {
  animation: mcp-fadeInDown 0.5s ease-out;
}

/* Loading spinner and overlay */
.mcp-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.mcp-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(107, 70, 193, 0.1);
  border-radius: 50%;
  border-left-color: var(--primary);
  animation: mcp-spin 1s ease infinite;
}

@keyframes mcp-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Typography */
.mcp-h1 {
  font-size: 2.25rem;
  line-height: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.mcp-h2 {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.mcp-h3 {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.mcp-text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.mcp-text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

/* Utility classes */
.mcp-center {
  text-align: center;
}

.mcp-mt-2 {
  margin-top: 0.5rem;
}

.mcp-mt-4 {
  margin-top: 1rem;
}

.mcp-mt-8 {
  margin-top: 2rem;
}

.mcp-mb-2 {
  margin-bottom: 0.5rem;
}

.mcp-mb-4 {
  margin-bottom: 1rem;
}

.mcp-mb-8 {
  margin-bottom: 2rem;
}

.mcp-p-4 {
  padding: 1rem;
}

.mcp-p-8 {
  padding: 2rem;
}

.mcp-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .mcp-grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .mcp-grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.mcp-flex {
  display: flex;
}

.mcp-flex-col {
  flex-direction: column;
}

.mcp-items-center {
  align-items: center;
}

.mcp-justify-center {
  justify-content: center;
}

.mcp-justify-between {
  justify-content: space-between;
}

.mcp-gap-2 {
  gap: 0.5rem;
}

.mcp-gap-4 {
  gap: 1rem;
}

/* Shadcn compatibility classes */
.feature-card {
  background-color: white;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.bg-grid-gray-100 {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}

.bg-blob-gradient {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
  z-index: -1;
  opacity: 0.8;
  filter: blur(50px);
}

.from-purple-50 {
  --tw-gradient-from: #faf5ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0));
}

.to-white {
  --tw-gradient-to: #ffffff;
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.5s ease-out;
}
`;

/**
 * Inject essential CSS directly into the document head
 */
export function injectEssentialCSS(): void {
  try {
    // Check if the essential CSS has already been injected
    if (document.getElementById('mcp-essential-css')) {
      return;
    }
    
    // Create the style element
    const style = document.createElement('style');
    style.id = 'mcp-essential-css';
    style.innerHTML = ESSENTIAL_CSS;
    
    // Insert at the beginning of the head for highest priority
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
    
    console.log('[Direct CSS] Essential CSS successfully injected');
  } catch (error) {
    console.error('[Direct CSS] Error injecting essential CSS:', error);
  }
}

/**
 * Create a loading overlay that blocks the UI until it's ready
 */
export function createLoadingOverlay(): HTMLElement {
  // Check if an overlay already exists
  let overlay = document.getElementById('mcp-loading-overlay') as HTMLElement | null;
  
  if (overlay) {
    return overlay;
  }
  
  // Create the loading overlay
  overlay = document.createElement('div');
  overlay.id = 'mcp-loading-overlay';
  overlay.className = 'mcp-loading-overlay';
  
  // Create the spinner
  const spinner = document.createElement('div');
  spinner.className = 'mcp-spinner';
  overlay.appendChild(spinner);
  
  // Add loading text
  const text = document.createElement('p');
  text.textContent = 'Loading MCP Integration Platform...';
  text.style.marginTop = '1rem';
  overlay.appendChild(text);
  
  // Add to the body
  document.body.appendChild(overlay);
  
  return overlay;
}

/**
 * Remove the loading overlay
 */
export function removeLoadingOverlay(): void {
  const overlay = document.getElementById('mcp-loading-overlay');
  
  if (overlay) {
    // Fade out the overlay
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';
    
    // Remove after animation completes
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }
}

/**
 * Apply the MCP-specific class prefixes to all elements
 * This ensures our styles take precedence over any others
 */
export function applyMCPClassPrefixes(): void {
  // List of element selectors to apply MCP prefixes to
  const elementSelectors = [
    '.container', '.layout', '.card', '.btn', '.nav', '.form', 
    '.input', '.header', '.footer', '.main', '.feature', '.hero',
    '.bg-blob', '.bg-grid', '.bg-gradient'
  ];
  
  try {
    // Wait for DOM to be ready
    const applyPrefixes = () => {
      elementSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const currentClasses = element.className.split(' ');
          
          // Add mcp- prefix to non-prefixed classes
          currentClasses.forEach(className => {
            if (!className.startsWith('mcp-')) {
              element.classList.add(`mcp-${className}`);
            }
          });
        });
      });
      
      console.log('[Direct CSS] Applied MCP class prefixes to elements');
    };
    
    // Apply immediately if document is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      applyPrefixes();
    } else {
      // Otherwise wait for DOMContentLoaded
      document.addEventListener('DOMContentLoaded', applyPrefixes);
    }
  } catch (error) {
    console.error('[Direct CSS] Error applying MCP class prefixes:', error);
  }
}

/**
 * Initialize all direct CSS functionality
 */
export function initializeDirectCSS(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Inject essential CSS
      injectEssentialCSS();
      
      // Create the loading overlay
      createLoadingOverlay();
      
      // Apply MCP class prefixes when DOM is loaded
      applyMCPClassPrefixes();
      
      // Set a timeout to resolve the promise (and remove overlay) after a maximum time
      setTimeout(() => {
        removeLoadingOverlay();
        resolve();
      }, 3000);
      
      console.log('[Direct CSS] Initialization complete');
    } catch (error) {
      console.error('[Direct CSS] Initialization failed:', error);
      removeLoadingOverlay();
      reject(error);
    }
  });
}