/**
 * MCP Integration Platform - Critical CSS Reset
 * 
 * This file provides core CSS reset and critical styling that is applied
 * immediately before any other styling to ensure consistent baseline rendering.
 */

// Critical CSS reset to be applied immediately
export const criticalCssReset = `
/* CSS Reset - Applied before all other styles */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  height: 100%;
  isolation: isolate;
}

/* Basic layout styles - these are minimal and won't conflict */
.layout-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Core UI Components - Minimal styling that won't be affected by theme changes */
.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-logo {
  font-weight: bold;
  font-size: 1.25rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: #6b46c1;
  color: white;
  border-color: #6b46c1;
}

.btn-secondary {
  background-color: transparent;
  color: #6b46c1;
  border-color: #6b46c1;
}

.card {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Feature card guaranteed styling */
.feature-card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Background patterns guaranteed styling */
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

/* Gradient backgrounds guaranteed styling */
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

/* Animation guaranteed styling */
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

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.3s ease;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(124, 58, 237, 0.1);
  border-radius: 50%;
  border-top-color: #6b46c1;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Auth form styling */
.auth-container {
  display: flex;
  min-height: 100%;
}

.auth-form-section {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.auth-hero-section {
  flex: 1;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1rem;
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.25rem;
  font-size: 1rem;
}

/* Typography guaranteed styling */
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.text-center {
  text-align: center;
}

/* Spacing utilities guaranteed styling */
.mt-4 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
`;

/**
 * Immediately apply critical CSS
 */
export function applyImmediateCriticalCss(): void {
  try {
    // Check if critical CSS already exists
    if (document.getElementById('critical-css-reset')) {
      return;
    }

    // Create style element for critical CSS
    const styleElement = document.createElement('style');
    styleElement.id = 'critical-css-reset';
    styleElement.innerHTML = criticalCssReset;
    
    // Add to head with highest priority (at the beginning)
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head.firstChild) {
      head.insertBefore(styleElement, head.firstChild);
    } else {
      head.appendChild(styleElement);
    }
    
    console.log('[Critical CSS] Reset styles applied immediately');
  } catch (error) {
    console.error('[Critical CSS] Error applying reset styles:', error);
  }
}

/**
 * Create a loading overlay that blocks UI until ready
 */
export function createLoadingOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'mcp-loading-overlay';
  
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  
  const text = document.createElement('p');
  text.textContent = 'Loading MCP Integration Platform...';
  text.style.marginTop = '1rem';
  
  overlay.appendChild(spinner);
  overlay.appendChild(text);
  
  document.body.appendChild(overlay);
  
  return overlay;
}

/**
 * Remove the loading overlay
 */
export function removeLoadingOverlay(): void {
  const overlay = document.getElementById('mcp-loading-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }
}