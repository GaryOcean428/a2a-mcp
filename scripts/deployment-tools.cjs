/**
 * MCP Integration Platform - Unified Deployment Tools
 * 
 * This module contains consolidated deployment tools to replace the numerous
 * separate deployment scripts that were previously scattered throughout the codebase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Update version timestamp for cache busting
 * @returns {string} The current timestamp
 */
function updateVersionTimestamp() {
  const timestamp = Date.now();
  const versionData = `export const VERSION = '${timestamp}';
`;
  const versionPath = path.join(process.cwd(), 'client', 'src', 'utils', 'version.ts');
  
  try {
    fs.writeFileSync(versionPath, versionData);
    console.log(`✅ Updated version timestamp to ${timestamp}`);
    return timestamp;
  } catch (error) {
    console.error('❌ Failed to update version timestamp:', error.message);
    return null;
  }
}

/**
 * Fix module compatibility issues between ESM and CommonJS
 */
function fixModuleCompatibility() {
  // Ensure scripts have the correct extension
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const files = fs.readdirSync(scriptsDir);
  
  let fixed = 0;
  
  // Find JS files that should be CommonJS and rename them
  files.forEach(file => {
    if (file.endsWith('.js') && !file.endsWith('.cjs')) {
      const filePath = path.join(scriptsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check if this is a CommonJS module
      if (content.includes('require(') && !content.includes('import ')) {
        const newPath = path.join(scriptsDir, file.replace('.js', '.cjs'));
        fs.renameSync(filePath, newPath);
        fixed++;
      }
    }
  });
  
  console.log(`✅ Fixed module compatibility issues (${fixed} files updated)`);
}

/**
 * Fix CSS recovery mechanisms
 */
function fixCssRecovery() {
  // Ensure the public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Ensure the assets/css directory exists
  const cssDir = path.join(publicDir, 'assets', 'css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  // Create critical CSS file
  const criticalCssPath = path.join(cssDir, 'recovery-critical.css');
  const criticalCss = `
/* Critical CSS for MCP Integration Platform */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.feature-card {
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.loading-spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #3498db;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
}
`;
  
  try {
    fs.writeFileSync(criticalCssPath, criticalCss);
    console.log('✅ Created critical CSS recovery file');
  } catch (error) {
    console.error('❌ Failed to create critical CSS recovery file:', error.message);
  }
  
  // Create CSS verification script
  const verificationScriptPath = path.join(publicDir, 'css-verification.js');
  const verificationScript = `
/**
 * MCP Integration Platform - CSS Verification and Recovery System
 * 
 * This unified script ensures proper CSS rendering in both development and production environments.
 * It detects missing styles and automatically applies fixes when needed, making the UI resilient
 * against CSS issues.
 * 
 * Version: 1.0.0-${Date.now()}
 */
(function() {
  // Initialize immediately
  document.addEventListener('DOMContentLoaded', initializeVerification);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initializeVerification();
  }

  /**
   * Initialize verification process
   */
  function initializeVerification() {
    console.debug('[CSS Recovery] Verifying styles...');
    // Check if critical inline styles are present
    const hasInlineStyles = checkInlineStyles();
    console.debug('[CSS Recovery] Critical inline styles present:', hasInlineStyles);

    // Run verification
    runVerification();

    // Set up a MutationObserver to run verification when the DOM changes
    const observer = new MutationObserver(function() {
      runVerification();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    // Test WebSocket connection
    testWebSocketConnection();
  }

  /**
   * Run the CSS verification process
   */
  function runVerification() {
    // Verify critical classes
    const missingClasses = verifyCriticalClasses();
    if (missingClasses.length > 0) {
      console.warn('[CSS Recovery] Missing critical styles:', missingClasses.join(', '));
      applyRecoveryStyles(true);
    } else {
      applyRecoveryStyles(false);
    }

    // Inject critical styles if not already present
    if (!checkInlineStyles()) {
      const criticalCss = '@import "/assets/css/recovery-critical.css";';
      const style = document.createElement('style');
      style.textContent = criticalCss;
      style.id = 'mcp-critical-css';
      document.head.appendChild(style);
    } else {
      console.info('[CSS Recovery] Critical styles injected ✓');
    }
  }

  /**
   * Verify if critical CSS classes are properly applied
   * @returns {string[]} Array of missing class names
   */
  function verifyCriticalClasses() {
    const criticalClasses = ['bg-gradient-to-r', 'feature-card'];
    const missing = [];

    // For this check, we'll only validate that the styles would apply if these classes were used
    // by checking if they exist in any stylesheet
    let foundClasses = [];

    // Check all stylesheets
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const styleSheet = document.styleSheets[i];
        for (let j = 0; j < styleSheet.cssRules.length; j++) {
          const rule = styleSheet.cssRules[j];
          if (rule.selectorText) {
            criticalClasses.forEach(cls => {
              if (rule.selectorText.includes('.' + cls)) {
                foundClasses.push(cls);
              }
            });
          }
        }
      } catch (e) {
        // CORS issues with external stylesheets, ignore
      }
    }

    // Find missing classes
    return criticalClasses.filter(cls => !foundClasses.includes(cls));
  }

  /**
   * Check if critical inline styles are present
   * @returns {boolean}
   */
  function checkInlineStyles() {
    // Check for inline style tag with critical CSS
    return !!document.getElementById('mcp-critical-css') ||
           !!document.querySelector('style[data-critical="true"]');
  }

  /**
   * Apply recovery CSS styles
   * @param {boolean} force - Force reapplication even if already present
   */
  function applyRecoveryStyles(force = false) {
    // Check if recovery styles already exist
    const existingLink = document.getElementById('mcp-recovery-css');
    
    if (existingLink && !force) {
      return; // Already applied and no force reload
    }

    if (existingLink) {
      existingLink.remove(); // Remove existing if forcing reload
    }

    // Create link element for recovery CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/recovery-critical.css?v=' + Date.now(); // Cache busting
    link.id = 'mcp-recovery-css';

    // Add to document head
    document.head.appendChild(link);
  }

  /**
   * Test WebSocket connection to ensure real-time functionality works
   */
  function testWebSocketConnection() {
    try {
      // Determine correct protocol and build WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/mcp-ws`;
      
      // Create a test WebSocket connection
      const testSocket = new WebSocket(wsUrl);
      
      // Set up event handlers
      testSocket.onopen = function() {
        logMessage('WebSocket connection successful', 'success');
        testSocket.send(JSON.stringify({ type: 'ping' }));
        setTimeout(() => testSocket.close(), 2000);
      };
      
      testSocket.onerror = function() {
        logMessage('WebSocket connection failed, using fallback mechanisms', 'warn');
      };
    } catch (error) {
      logMessage('Error setting up WebSocket test: ' + error.message, 'error');
    }
  }

  /**
   * Log a message with consistent formatting
   * @param {string} message - The message to log
   * @param {string} level - Log level (info, warn, error, success)
   */
  function logMessage(message, level = 'info') {
    const styles = {
      info: 'color: #3498db',
      warn: 'color: #f39c12',
      error: 'color: #e74c3c',
      success: 'color: #2ecc71'
    };
    
    console.log(`%c[CSS Recovery] ${message}`, styles[level] || styles.info);
  }
})();
`;
  
  try {
    fs.writeFileSync(verificationScriptPath, verificationScript);
    console.log('✅ Created CSS verification script');
  } catch (error) {
    console.error('❌ Failed to create CSS verification script:', error.message);
  }
}

/**
 * Fix WebSocket configuration
 */
function fixWebSocketConfig() {
  // Create WebSocket manager script
  const publicDir = path.join(process.cwd(), 'public');
  const wsManagerPath = path.join(publicDir, 'websocket-manager.js');
  
  const wsManagerScript = `
/**
 * MCP Integration Platform - WebSocket Manager
 * 
 * This module provides a reliable WebSocket connection manager with
 * automatic reconnection and fallback mechanisms.
 */
(function() {
  // Initialize on DOM content loaded
  document.addEventListener('DOMContentLoaded', initWebSocketManager);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initWebSocketManager();
  }

  // WebSocket connection
  let socket = null;
  let reconnectAttempts = 0;
  let maxReconnectAttempts = 5;
  let reconnectDelay = 1000;
  let pingInterval = null;
  let reconnectTimeout = null;

  /**
   * Initialize the WebSocket manager
   */
  function initWebSocketManager() {
    connectWebSocket();
    createFallbackMechanism();
  }

  /**
   * Connect to the WebSocket server
   */
  function connectWebSocket() {
    try {
      // Clear any existing connections
      if (socket) {
        console.debug('[websocket:enhanced] Closing WebSocket connection');
        socket.close();
      }

      // Determine correct protocol and build WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/mcp-ws`;
      
      console.debug('[websocket:enhanced] Connecting to WebSocket: ' + wsUrl);
      console.debug('[websocket:enhanced] Using enhanced WebSocket constructor');
      
      // Create a new WebSocket connection
      socket = new WebSocket(wsUrl);
      
      // Set up event handlers
      socket.onopen = handleOpen;
      socket.onclose = handleClose;
      socket.onerror = handleError;
      socket.onmessage = handleMessage;
    } catch (error) {
      console.error('[websocket:enhanced] Failed to connect to WebSocket:', error);
      handleConnectionFailure();
    }
  }

  /**
   * Handle WebSocket open event
   * @param {Event} event - The open event
   */
  function handleOpen(event) {
    console.log('[websocket:enhanced] Connection established');
    reconnectAttempts = 0;
    reconnectDelay = 1000;
    updateConnectionStatus(true);
    
    // Start ping interval to keep connection alive
    clearInterval(pingInterval);
    pingInterval = setInterval(sendPing, 30000);
    
    // Dispatch connection event
    dispatchEvent('websocket:connected');
  }

  /**
   * Handle WebSocket close event
   * @param {CloseEvent} event - The close event
   */
  function handleClose(event) {
    console.log('[websocket:enhanced] Connection closed:', event.code, event.reason);
    clearTimers();
    updateConnectionStatus(false);
    
    // Attempt to reconnect if not a normal closure
    if (event.code !== 1000 && event.code !== 1001) {
      handleConnectionFailure();
    }
    
    // Dispatch disconnection event
    dispatchEvent('websocket:disconnected', { code: event.code, reason: event.reason });
  }

  /**
   * Handle WebSocket error event
   * @param {Event} error - The error event
   */
  function handleError(error) {
    console.error('[websocket:fix] WebSocket connection error', error);
    updateConnectionStatus(false);
    
    // Dispatch error event
    dispatchEvent('websocket:error', { error });
  }

  /**
   * Handle connection failure with exponential backoff
   */
  function handleConnectionFailure() {
    clearTimers();
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`[websocket:enhanced] Reconnecting (${reconnectAttempts}/${maxReconnectAttempts}) in ${reconnectDelay}ms...`);
      
      // Set up reconnect with exponential backoff
      reconnectTimeout = setTimeout(() => {
        connectWebSocket();
      }, reconnectDelay);
      
      // Increase delay for next attempt (exponential backoff with max of 30s)
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      
      // Dispatch reconnecting event
      dispatchEvent('websocket:reconnecting', { attempt: reconnectAttempts, maxAttempts: maxReconnectAttempts, delay: reconnectDelay });
    } else {
      console.error('[websocket:enhanced] Maximum reconnection attempts reached');
      
      // Dispatch max attempts reached event
      dispatchEvent('websocket:max_attempts', { attempts: reconnectAttempts });
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @param {MessageEvent} event - The message event
   */
  function handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      // Dispatch message received event
      dispatchEvent('websocket:message', { data });
      
      // Handle specific message types
      if (data.type) {
        dispatchEvent(`websocket:message:${data.type}`, { data });
      }
    } catch (error) {
      console.error('[websocket:enhanced] Error parsing message:', error);
    }
  }

  /**
   * Send a ping message to keep the connection alive
   */
  function sendPing() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    }
  }

  /**
   * Send a message through the WebSocket
   * @param {object} data - The data to send
   */
  function sendMessage(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  /**
   * Clear all timers to prevent memory leaks
   */
  function clearTimers() {
    clearTimeout(reconnectTimeout);
    clearInterval(pingInterval);
  }

  /**
   * Update the connection status in the DOM
   * @param {boolean} isConnected - Connection status
   */
  function updateConnectionStatus(isConnected) {
    // Add a data attribute to the root element for styling
    document.documentElement.dataset.wsConnected = isConnected.toString();
    
    // Find and update any status indicators
    const indicators = document.querySelectorAll('[data-ws-status]');
    indicators.forEach(el => {
      el.setAttribute('data-ws-status', isConnected ? 'connected' : 'disconnected');
      if (el.tagName === 'SPAN' || el.tagName === 'DIV') {
        el.textContent = isConnected ? 'Connected' : 'Disconnected';
      }
    });
  }

  /**
   * Create fallback mechanism for browsers with WebSocket issues
   */
  function createFallbackMechanism() {
    // Add a method to the window object for components to use
    window.MCP_WS = {
      send: sendMessage,
      reconnect: connectWebSocket,
      isConnected: () => socket && socket.readyState === WebSocket.OPEN,
      addEventListener: (type, callback) => {
        document.addEventListener(`websocket:${type}`, e => callback(e.detail));
      },
      removeEventListener: (type, callback) => {
        document.removeEventListener(`websocket:${type}`, callback);
      }
    };
  }

  /**
   * Dispatch a custom event for the WebSocket
   * @param {string} name - Event name
   * @param {object} data - Event data
   */
  function dispatchEvent(name, data = {}) {
    const event = new CustomEvent(name, { detail: data });
    document.dispatchEvent(event);
  }
})();
`;
  
  try {
    fs.writeFileSync(wsManagerPath, wsManagerScript);
    console.log('✅ Created WebSocket manager script');
  } catch (error) {
    console.error('❌ Failed to create WebSocket manager script:', error.message);
  }
}

/**
 * Update HTML with timestamp and critical inline styles
 * @param {string} timestamp - The timestamp to use for cache busting
 */
function updateHtml(timestamp) {
  const indexHtmlPath = path.join(process.cwd(), 'client', 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ Could not find index.html');
    return;
  }
  
  try {
    let htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
    
    // Add timestamp for cache busting
    htmlContent = htmlContent.replace(
      /<meta name="version" content="[^"]*">/,
      `<meta name="version" content="${timestamp || Date.now()}">`
    );
    
    // Add critical CSS inline
    if (!htmlContent.includes('data-critical="true"')) {
      htmlContent = htmlContent.replace(
        '</head>',
        `  <style data-critical="true">
    /* Critical inline styles for immediate rendering */
    .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
    .feature-card { border-radius: 0.5rem; background-color: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); }
    .loading-spinner { border: 3px solid rgba(0, 0, 0, 0.1); border-radius: 50%; border-top: 3px solid #3498db; width: 30px; height: 30px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: rgba(255, 255, 255, 0.8); z-index: 9999; }
  </style>
</head>`
      );
    }
    
    // Add CSS verification script
    if (!htmlContent.includes('css-verification.js')) {
      htmlContent = htmlContent.replace(
        '</head>',
        `  <script src="/css-verification.js?v=${timestamp || Date.now()}"></script>
</head>`
      );
    }
    
    // Add WebSocket manager script
    if (!htmlContent.includes('websocket-manager.js')) {
      htmlContent = htmlContent.replace(
        '</head>',
        `  <script src="/websocket-manager.js?v=${timestamp || Date.now()}"></script>
</head>`
      );
    }
    
    fs.writeFileSync(indexHtmlPath, htmlContent);
    console.log('✅ Updated HTML with critical CSS and scripts');
  } catch (error) {
    console.error('❌ Failed to update HTML:', error.message);
  }
}

/**
 * Build the application
 */
function buildApp() {
  try {
    console.log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Application built successfully');
  } catch (error) {
    console.error('❌ Failed to build application:', error.message);
    return false;
  }
  return true;
}

/**
 * Clean up redundant files
 */
function cleanupRedundantFiles() {
  // List of files that are now redundant after consolidation
  const redundantFiles = [
    'fix-deployment.js',
    'fix-deployment.cjs',
    'fix-hmr-websocket.cjs',
    'fix-production-css.cjs',
    'fix-production-ui.cjs',
    'deploy-rebuild.cjs',
    'deploy-ui-rebuild.js',
    'deploy-final-fix.cjs',
    'complete-deployment-fix.cjs',
    'deployment-fix.js',
    'deployment-fix.cjs'
  ];
  
  let removed = 0;
  
  for (const file of redundantFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      removed++;
    }
  }
  
  console.log(`✅ Cleaned up ${removed} redundant files`);
}

/**
 * Verify deployment readiness
 * @returns {boolean} Whether the deployment is ready
 */
function verifyDeploymentReadiness() {
  let isReady = true;
  
  // Check for critical files
  const criticalFiles = [
    path.join(process.cwd(), 'client', 'src', 'utils', 'css-system.ts'),
    path.join(process.cwd(), 'client', 'src', 'lib', 'websocket-system.ts'),
    path.join(process.cwd(), 'client', 'src', 'components', 'StyleFixerNew.tsx'),
    path.join(process.cwd(), 'client', 'src', 'components', 'WebSocketProviderNew.tsx'),
    path.join(process.cwd(), 'client', 'src', 'components', 'WebSocketReconnectManagerNew.tsx')
  ];
  
  for (const file of criticalFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Missing critical file: ${file}`);
      isReady = false;
    }
  }
  
  // Check for package.json and required scripts
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const requiredScripts = ['dev', 'build', 'start'];
      
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          console.error(`❌ Missing required script in package.json: ${script}`);
          isReady = false;
        }
      }
    } catch (error) {
      console.error('❌ Error parsing package.json:', error.message);
      isReady = false;
    }
  } else {
    console.error('❌ Missing package.json file');
    isReady = false;
  }
  
  return isReady;
}

module.exports = {
  updateVersionTimestamp,
  fixModuleCompatibility,
  fixCssRecovery,
  fixWebSocketConfig,
  updateHtml,
  buildApp,
  cleanupRedundantFiles,
  verifyDeploymentReadiness
};
