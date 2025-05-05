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
  
  // Ensure the recovery-critical.css file exists
  const cssDir = path.join(__dirname, 'public/assets/css');
  const cssPath = path.join(cssDir, 'recovery-critical.css');
  
  try {
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
    }
    
    // Provide a basic recovery CSS file if it doesn't exist
    if (!fs.existsSync(cssPath)) {
      const criticalCss = `/* MCP Integration Platform Critical CSS Recovery */

/* Ensure gradients work */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

/* Feature card styles */
.feature-card {
  border-radius: 0.5rem;
  border: 1px solid rgba(var(--card-border-rgb), 0.25);
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.feature-card:hover {
  border-color: rgba(var(--card-border-rgb), 0.5);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
`;
      
      fs.writeFileSync(cssPath, criticalCss, 'utf8');
      console.log('Created critical CSS recovery file');
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
