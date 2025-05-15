/**
 * MCP Integration Platform Complete Deployment Fix Script
 * 
 * This script handles all aspects of preparing the codebase for deployment,
 * including module format compatibility, CSS recovery, and WebSocket configuration.
 */

const fs = require('fs');
const path = require('path');

// Fix module format compatibility issues
function fixModuleFormatIssues() {
  console.log('Fixing module format compatibility issues...');
  
  // Run the dedicated fix-deployment script
  try {
    require('./fix-deployment.cjs');
    return true;
  } catch (err) {
    console.error('Error running fix-deployment.cjs:', err);
    return false;
  }
}

// Fix WebSocket connection issues in production
function fixWebSocketConfig() {
  console.log('Applying WebSocket configuration fixes...');
  
  const wsConfigPath = path.join(__dirname, 'client/src/config/websocket-config.ts');
  
  if (fs.existsSync(wsConfigPath)) {
    try {
      let wsConfig = fs.readFileSync(wsConfigPath, 'utf8');
      
      // Ensure fallback to standard HTTP/HTTPS ports if needed
      if (!wsConfig.includes('fallbackToStandardPorts')) {
        const improved = wsConfig.replace(
          /export const WebSocketConfig = {/,
          `export const WebSocketConfig = {
  // Whether to attempt fallback to standard ports (80/443) if connection fails
  fallbackToStandardPorts: true,`
        );
        
        fs.writeFileSync(wsConfigPath, improved, 'utf8');
        console.log('Enhanced WebSocket configuration with fallback option');
      }
      
      return true;
    } catch (err) {
      console.error('Error updating WebSocket configuration:', err);
      return false;
    }
  } else {
    // Create a basic configuration if it doesn't exist
    try {
      const wsDir = path.join(__dirname, 'client/src/config');
      if (!fs.existsSync(wsDir)) {
        fs.mkdirSync(wsDir, { recursive: true });
      }
      
      const basicConfig = `/**
 * WebSocket Connection Configuration
 */

export const WebSocketConfig = {
  // Path for WebSocket endpoint
  path: '/mcp-ws',
  
  // Whether to attempt fallback to standard ports (80/443) if connection fails
  fallbackToStandardPorts: true,
  
  // Maximum number of reconnection attempts
  maxReconnectAttempts: 5,
  
  // Delay between reconnection attempts (ms)
  reconnectDelay: 2000,
  
  // Ping interval to keep connection alive (ms)
  pingInterval: 30000
};
`;
      
      fs.writeFileSync(wsConfigPath, basicConfig, 'utf8');
      console.log('Created WebSocket configuration file');
      return true;
    } catch (err) {
      console.error('Error creating WebSocket configuration:', err);
      return false;
    }
  }
}

// Fix CSS Recovery issues in production
function fixCssRecovery() {
  console.log('Enhancing CSS recovery system...');
  
  // 1. Ensure the recovery-critical.css file exists and is complete
  const cssDir = path.join(__dirname, 'public/assets/css');
  const cssPath = path.join(cssDir, 'recovery-critical.css');
  
  try {
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
    }
    
    // Provide a comprehensive critical CSS file
    const criticalCss = `/**
 * MCP Integration Platform - Critical CSS Recovery
 * 
 * This file contains critical CSS classes that must be preserved and loaded even when
 * TailwindCSS purging might remove them in production builds.
 */

/* Background Gradients */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
  --tw-gradient-from: rgb(124 58 237) !important;
  --tw-gradient-stops: var(--tw-gradient-from), rgb(79 70 229) !important;
  --tw-gradient-to: rgb(79 70 229) !important;
}

.from-purple-600 {
  --tw-gradient-from: rgb(147 51 234) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(147 51 234 / 0)) !important;
}

.to-indigo-600 {
  --tw-gradient-to: rgb(79 70 229) !important;
}

.from-purple-50 {
  --tw-gradient-from: rgb(250 245 255) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(250 245 255 / 0)) !important;
}

.to-white {
  --tw-gradient-to: rgb(255 255 255) !important;
}

/* Text Transparency */
.text-transparent {
  color: transparent !important;
}

.bg-clip-text {
  -webkit-background-clip: text !important;
  background-clip: text !important;
}

/* Combined Text Gradient */
.bg-gradient-to-r.text-transparent.bg-clip-text {
  background-image: linear-gradient(to right, rgb(124 58 237), rgb(79 70 229)) !important;
  color: transparent !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
}

/* Animation Classes */
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-in-out !important;
}

@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation-name: animate-in !important;
  animation-duration: 300ms !important;
  animation-timing-function: ease-in-out !important;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.duration-300 {
  transition-duration: 300ms !important;
}

/* Card Styles */
.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
  display: flex !important;
  flex-direction: column !important;
  background-color: white !important;
  border-radius: 0.5rem !important;
  overflow: hidden !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

.feature-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  border-color: rgba(124, 58, 237, 0.2) !important;
}

/* Group Hover */
.group:hover .group-hover\\:scale-110 {
  transform: scale(1.1) !important;
}

/* Background Patterns */
.bg-grid-gray-100 {
  background-image: linear-gradient(to right, rgb(243 244 246 / 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(243 244 246 / 0.1) 1px, transparent 1px) !important;
  background-size: 24px 24px !important;
}

.bg-blob-gradient {
  background-image: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0) 70%) !important;
}

/* Make sure Tailwind CSS classes for UI components work */
.bg-primary {
  background-color: hsl(var(--primary)) !important;
}

.text-primary {
  color: hsl(var(--primary)) !important;
}

.border-primary {
  border-color: hsl(var(--primary)) !important;
}
`;
      
    // Always write the file to ensure it's up to date
    fs.writeFileSync(cssPath, criticalCss, 'utf8');
    console.log('Updated critical CSS recovery file');
    
    // 2. Create/update the CSS injector script
    const jsDir = path.join(__dirname, 'public/js');
    const jsInjectorPath = path.join(jsDir, 'css-injector.js');
    
    if (!fs.existsSync(jsDir)) {
      fs.mkdirSync(jsDir, { recursive: true });
    }
    
    // Check if injector script exists, create if needed
    if (!fs.existsSync(jsInjectorPath)) {
      console.log('CSS injector script not found, creating it...');
      
      // Create a basic version
      const basicInjector = `/**
 * MCP Integration Platform - CSS Injector (Production)
 */
(function() {
  // Configuration
  const CONFIG = {
    criticalCssPath: '/assets/css/recovery-critical.css',
    version: new Date().getTime(),
    autoRetry: true,
    retryDelay: 1000,
    retryMax: 3
  };

  // Critical CSS classes that must always be available
  const CRITICAL_CLASSES = [
    'bg-gradient-to-r',
    'text-transparent',
    'bg-clip-text',
    'feature-card',
    'animate-fade-in-down',
    'from-purple-50',
    'to-white',
    'bg-grid-gray-100',
    'bg-blob-gradient'
  ];

  // Direct CSS injection - this will be used if the stylesheets fail
  const DIRECT_CSS = \`
    /* Direct critical styles - no external dependencies */
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    
    .text-transparent {
      color: transparent !important;
    }
    
    .bg-clip-text {
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    
    .feature-card {
      display: flex !important;
      flex-direction: column !important;
      background-color: white !important;
      border-radius: 0.5rem !important;
      overflow: hidden !important;
      border: 1px solid rgba(0, 0, 0, 0.05) !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      transition: transform 0.3s ease, box-shadow 0.3s ease !important;
    }
    
    .animate-fade-in-down {
      animation: cssInjector_fadeIn 0.5s ease-in-out !important;
    }
    
    @keyframes cssInjector_fadeIn {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  \`;

  // Load critical CSS
  function loadCriticalStylesheet() {
    if (document.querySelector('link[href*="recovery-critical.css"]')) {
      console.log('Critical CSS already loaded');
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CONFIG.criticalCssPath + '?v=' + CONFIG.version;
    link.id = 'mcp-critical-css-link';
    document.head.appendChild(link);
    
    console.log('Critical CSS stylesheet loaded');
  }

  // Inject direct styles
  function injectDirectStyles() {
    if (document.getElementById('mcp-direct-css')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'mcp-direct-css';
    style.textContent = DIRECT_CSS;
    document.head.appendChild(style);
    
    console.log('Direct CSS styles injected');
  }

  // Initialize immediately
  loadCriticalStylesheet();
  injectDirectStyles();
})();`;
        
      fs.writeFileSync(jsInjectorPath, basicInjector, 'utf8');
      console.log('Created CSS injector script');
    }
    
    // 3. Ensure the CSS injector is included in the HTML
    const indexHtmlPath = path.join(__dirname, 'client/index.html');
    if (fs.existsSync(indexHtmlPath)) {
      let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
      
      // Check if CSS injector script is included
      if (!htmlContent.includes('/js/css-injector.js')) {
        console.log('Adding CSS injector script to HTML...');
        
        // Add after the icon
        htmlContent = htmlContent.replace(
          /<link rel="icon".*?>/,
          '$&\n    \n    <!-- Preload critical CSS -->\n    <link rel="preload" href="/assets/css/recovery-critical.css" as="style" />\n    \n    <!-- Critical CSS loader -->\n    <script src="/js/css-injector.js"></script>'
        );
        
        fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
        console.log('Added CSS injector script to HTML');
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error updating CSS recovery:', err);
    return false;
  }
}

// Set version timestamp for cache busting
function updateVersionTimestamp() {
  console.log('Updating version timestamp for cache busting...');
  
  const versionFile = path.join(__dirname, 'client/src/config/version.ts');
  const versionDir = path.dirname(versionFile);
  
  try {
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const content = `/**
 * MCP Integration Platform Version
 * Auto-generated timestamp for cache busting
 */

export const VERSION = '${timestamp}';
`;
    
    fs.writeFileSync(versionFile, content, 'utf8');
    console.log(`Updated version timestamp: ${timestamp}`);
    return true;
  } catch (err) {
    console.error('Error updating version timestamp:', err);
    return false;
  }
}

// Apply all deployment fixes
function applyAllFixes() {
  console.log('============================================');
  console.log('MCP Integration Platform - Deployment Preparation');
  console.log('============================================');
  
  const fixes = [
    fixModuleFormatIssues,
    fixWebSocketConfig,
    fixCssRecovery,
    updateVersionTimestamp
  ];
  
  let successCount = 0;
  
  fixes.forEach(fix => {
    try {
      const result = fix();
      if (result) successCount++;
    } catch (err) {
      console.error(`Error applying fix ${fix.name}:`, err);
    }
  });
  
  console.log('============================================');
  console.log(`Applied ${successCount}/${fixes.length} deployment fixes successfully.`);
  console.log('============================================');
}

// Run the fixes
applyAllFixes();
