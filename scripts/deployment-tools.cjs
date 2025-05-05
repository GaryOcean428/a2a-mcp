/**
 * MCP Integration Platform - Unified Deployment Tools
 * 
 * This script provides all necessary deployment tools and utilities in a single file,
 * replacing multiple scattered deployment-related scripts.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, execSync } = require('child_process');

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

/**
 * Ensure a directory exists, creating it if needed
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Update version timestamp for cache busting
 */
function updateVersionTimestamp() {
  console.log('Updating version timestamp for cache busting...');
  
  const versionDir = path.join(CLIENT_DIR, 'src/config');
  const versionFile = path.join(versionDir, 'version.ts');
  
  ensureDirectoryExists(versionDir);
  
  const timestamp = Date.now();
  const content = `/**
 * MCP Integration Platform Version
 * Auto-generated timestamp for cache busting
 */

export const VERSION = '${timestamp}';
`;
  
  fs.writeFileSync(versionFile, content, 'utf8');
  console.log(`Updated version timestamp: ${timestamp}`);
  return timestamp;
}

/**
 * Fix module compatibility issues
 * Creates CommonJS versions of ESM files where needed
 */
function fixModuleCompatibility() {
  console.log('Fixing module format compatibility issues...');
  
  // Check if start.cjs exists and create it if not
  const startJsPath = path.join(ROOT_DIR, 'start.js');
  const startCjsPath = path.join(ROOT_DIR, 'start.cjs');
  
  if (!fs.existsSync(startCjsPath) && fs.existsSync(startJsPath)) {
    console.log('Creating CommonJS version of start.js...');
    
    // Read the ESM version
    const esmContent = fs.readFileSync(startJsPath, 'utf8');
    
    // Transform to CommonJS
    const cjsContent = esmContent
      .replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"](.*)['"];?/g, 'const { $1 } = require("$2");')
      .replace(/import\s+([^\s]+)\s+from\s+['"](.*)['"];?/g, 'const $1 = require("$2");')
      .replace(/const\s+__filename\s+=\s+fileURLToPath\(import\.meta\.url\);/g, '// CommonJS already has __filename')
      .replace(/const\s+__dirname\s+=\s+path\.dirname\(__filename\);/g, '// CommonJS already has __dirname')
      .replace(/export\s+\{\s*([^}]+)\s*\};?/g, 'module.exports = { $1 };')
      .replace(/export\s+default\s+([^;\s]+);?/g, 'module.exports = $1;');
      
    // Write the CommonJS version
    fs.writeFileSync(startCjsPath, cjsContent, 'utf8');
    console.log('Created start.cjs - CommonJS version of start script');
  }
  
  // Ensure server files are accessible in both module formats
  const jsServerPath = path.join(SERVER_DIR, 'prod-server.js');
  const cjsServerPath = path.join(SERVER_DIR, 'prod-server.cjs');
  
  if (fs.existsSync(jsServerPath) && !fs.existsSync(cjsServerPath)) {
    console.log('Creating CommonJS version of server production file...');
    
    // Copy the file for now - a more sophisticated approach would be to convert it
    fs.copyFileSync(jsServerPath, cjsServerPath);
    console.log('Created server/prod-server.cjs');
  }
  
  // Create proper .replit.deployConfig.js
  const deployConfigPath = path.join(ROOT_DIR, '.replit.deployConfig.js');
  if (!fs.existsSync(deployConfigPath)) {
    console.log('Creating Replit deployment configuration...');
    
    const deployConfig = `/**
 * MCP Integration Platform - Replit Deployment Configuration
 */

module.exports = {
  // Specify the deployment target (usually autoscale for production apps)
  deploymentTarget: "autoscale",
  
  // Build command to prepare the application for deployment
  build: ["sh", "-c", "npm run build"],
  
  // Run command for production - use the CommonJS version of the start script
  run: ["sh", "-c", "node start.cjs"],
  
  // Environment variables for production deployment
  env: {
    NODE_ENV: "production"
  }
};
`;
    
    fs.writeFileSync(deployConfigPath, deployConfig, 'utf8');
    console.log('Created .replit.deployConfig.js');
  }
}

/**
 * Fix CSS recovery
 * Ensures critical CSS files and recovery mechanisms are in place
 */
function fixCssRecovery() {
  console.log('Enhancing CSS recovery system...');
  
  // Ensure the recovery-critical.css file exists
  const cssDir = path.join(PUBLIC_DIR, 'assets/css');
  const cssPath = path.join(cssDir, 'recovery-critical.css');
  
  ensureDirectoryExists(cssDir);
  
  if (!fs.existsSync(cssPath)) {
    console.log('Creating critical CSS recovery file...');
    
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
}

/**
 * Fix WebSocket configuration
 * Ensures proper WebSocket configuration for development and production
 */
function fixWebSocketConfig() {
  console.log('Applying WebSocket configuration fixes...');
  
  const wsConfigDir = path.join(CLIENT_DIR, 'src/config');
  const wsConfigPath = path.join(wsConfigDir, 'websocket-config.ts');
  
  ensureDirectoryExists(wsConfigDir);
  
  if (!fs.existsSync(wsConfigPath)) {
    console.log('Creating WebSocket configuration file...');
    
    const wsConfig = `/**
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
    
    fs.writeFileSync(wsConfigPath, wsConfig, 'utf8');
    console.log('Created WebSocket configuration file');
  }
}

/**
 * Update HTML file with critical CSS and proper script references
 */
function updateHtml(timestamp) {
  console.log('Updating HTML with critical CSS and proper script references...');
  
  const indexHtmlPath = path.join(PUBLIC_DIR, 'index.html');
  const distIndexHtmlPath = path.join(DIST_DIR, 'index.html');
  
  // Function to update a specific HTML file
  const updateHtmlFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
      console.log(`HTML file not found: ${filePath}`);
      return;
    }
    
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Add critical CSS inline if not already present
    if (!html.includes('data-critical="true"')) {
      const criticalCssPath = path.join(PUBLIC_DIR, 'assets/css/recovery-critical.css');
      let criticalCss = '';
      
      if (fs.existsSync(criticalCssPath)) {
        criticalCss = fs.readFileSync(criticalCssPath, 'utf8');
      }
      
      const inlineStyle = `<style data-critical="true">${criticalCss}</style>`;
      html = html.replace('</head>', `${inlineStyle}\n</head>`);
    }
    
    // Add versioning to CSS and JS references
    html = html.replace(/href="([^"]+\.css)(\?v=[^"]*)?/g, `href="$1?v=${timestamp}`);
    html = html.replace(/src="([^"]+\.js)(\?v=[^"]*)?/g, `src="$1?v=${timestamp}`);
    
    // Add emergency CSS recovery script
    if (!html.includes('window.applyCssEmergencyFix')) {
      const recoveryScript = `<script>
      window.addEventListener('load', function() {
        if (window.applyCssEmergencyFix) {
          console.log('Emergency CSS fix applied');
          window.applyCssEmergencyFix();
        }
      });
      </script>`;
      
      html = html.replace('</head>', `${recoveryScript}\n</head>`);
    }
    
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Updated HTML file: ${filePath}`);
  };
  
  // Update both the source and dist HTML files if they exist
  updateHtmlFile(indexHtmlPath);
  updateHtmlFile(distIndexHtmlPath);
}

/**
 * Build the application for production
 */
function buildApp() {
  console.log('Building application for production...');
  
  try {
    // Run the build script
    execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
    console.log('Build completed successfully');
    return true;
  } catch (error) {
    console.error('Build failed:', error.message);
    return false;
  }
}

/**
 * Deploy the application (helper for Replit deployment)
 */
function deployApp() {
  console.log('Preparing for deployment...');
  
  // Apply all fixes
  const timestamp = updateVersionTimestamp();
  fixModuleCompatibility();
  fixCssRecovery();
  fixWebSocketConfig();
  updateHtml(timestamp);
  
  // Build the application
  const buildSuccess = buildApp();
  
  if (buildSuccess) {
    console.log('\nApplication is ready for deployment!');
    console.log('Use the Replit deployment interface to deploy the application.');
  } else {
    console.error('\nDeployment preparation failed due to build errors.');
  }
}

/**
 * Verify deployment readiness
 */
function verifyDeploymentReadiness() {
  console.log('Verifying deployment readiness...');
  let readiness = true;
  
  // Check for critical files
  const criticalFiles = [
    { path: path.join(ROOT_DIR, 'start.cjs'), description: 'CommonJS start script' },
    { path: path.join(SERVER_DIR, 'prod-server.cjs'), description: 'CommonJS production server' },
    { path: path.join(ROOT_DIR, '.replit.deployConfig.js'), description: 'Replit deployment configuration' },
    { path: path.join(PUBLIC_DIR, 'assets/css/recovery-critical.css'), description: 'Critical CSS recovery file' },
    { path: path.join(CLIENT_DIR, 'src/config/websocket-config.ts'), description: 'WebSocket configuration' },
    { path: path.join(CLIENT_DIR, 'src/config/version.ts'), description: 'Version timestamp' }
  ];
  
  criticalFiles.forEach(file => {
    if (!fs.existsSync(file.path)) {
      console.error(`\x1b[31m✗ Missing: ${file.description} (${file.path})\x1b[0m`);
      readiness = false;
    } else {
      console.log(`\x1b[32m✓ Found: ${file.description}\x1b[0m`);
    }
  });
  
  if (readiness) {
    console.log('\n\x1b[32m✓ Deployment readiness check passed! Application is ready for deployment.\x1b[0m');
  } else {
    console.error('\n\x1b[31m✗ Deployment readiness check failed! Please fix the issues before deploying.\x1b[0m');
  }
  
  return readiness;
}

/**
 * Clean up redundant files to optimize the codebase
 */
function cleanupRedundantFiles() {
  console.log('Cleaning up redundant files...');
  
  const redundantFiles = [
    // Redundant deployment scripts
    path.join(ROOT_DIR, 'deploy.js'),
    path.join(ROOT_DIR, 'deploy-fix.cjs'),
    path.join(ROOT_DIR, 'deploy-rebuild.js'),
    path.join(ROOT_DIR, 'deploy-rebuild.cjs'),
    path.join(ROOT_DIR, 'deploy-ui-rebuild.js'),
    path.join(ROOT_DIR, 'deployment-fix.js'),
    path.join(ROOT_DIR, 'deployment-fix.cjs'),
    path.join(ROOT_DIR, 'fix-deployment.js'),
    path.join(ROOT_DIR, 'fix-production-css.cjs'),
    path.join(ROOT_DIR, 'fix-production-ui.cjs'),
    path.join(ROOT_DIR, 'rebuild-ui.js'),
    path.join(ROOT_DIR, 'deploy-final-fix.cjs'),
    path.join(ROOT_DIR, 'fix-hmr-websocket.cjs'),
    path.join(ROOT_DIR, 'complete-deployment-fix.cjs'),
    
    // Redundant CSS recovery files
    path.join(CLIENT_DIR, 'src/css-recovery.ts'),
    path.join(CLIENT_DIR, 'src/critical-css-reset.ts'),
    path.join(CLIENT_DIR, 'src/direct-css-injection.ts'),
    path.join(CLIENT_DIR, 'src/utils/css-recovery.ts'),
    path.join(CLIENT_DIR, 'src/utils/css-recovery-manager.ts'),
    path.join(CLIENT_DIR, 'src/utils/css-recovery-enhanced.ts'),
    path.join(CLIENT_DIR, 'src/utils/css-injector.ts'),
    path.join(CLIENT_DIR, 'src/utils/css-verifier.ts'),
    path.join(CLIENT_DIR, 'src/utils/improved-css-recovery.ts'),
    path.join(CLIENT_DIR, 'src/utils/css-direct-fix.ts'),
    
    // Redundant WebSocket files
    path.join(CLIENT_DIR, 'src/hooks/use-websocket.tsx'),
    path.join(CLIENT_DIR, 'src/hooks/use-enhanced-websocket.ts'),
    path.join(CLIENT_DIR, 'src/utils/websocket-client.ts'),
    path.join(CLIENT_DIR, 'src/utils/mcp-websocket.ts'),
    path.join(CLIENT_DIR, 'src/utils/websocket-service.ts'),
    path.join(CLIENT_DIR, 'src/utils/mcp-websocket-client.ts'),
    path.join(CLIENT_DIR, 'src/utils/websocket-utils.ts'),
    path.join(CLIENT_DIR, 'src/utils/websocket-helpers.ts'),
    path.join(CLIENT_DIR, 'src/utils/websocket-enhanced-client.ts'),
    path.join(CLIENT_DIR, 'src/utils/websocket-fix.ts'),
    path.join(ROOT_DIR, 'websocket-test.js'),
    
    // Redundant test files
    path.join(ROOT_DIR, 'tmp/test-openai.js'),
    path.join(ROOT_DIR, 'tmp/test-openai-websearch.js'),
    path.join(ROOT_DIR, 'temp-hash.js')
  ];
  
  let filesRemoved = 0;
  
  redundantFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Removed: ${filePath}`);
        filesRemoved++;
      } catch (error) {
        console.error(`Error removing ${filePath}:`, error.message);
      }
    }
  });
  
  console.log(`Cleanup complete: ${filesRemoved} redundant files removed.`);
}

/**
 * Main function based on command line arguments
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  console.log('============================================');
  console.log('MCP Integration Platform - Deployment Tools');
  console.log('============================================\n');
  
  switch (command) {
    case 'fix':
      console.log('Running all fixes...');
      const timestamp = updateVersionTimestamp();
      fixModuleCompatibility();
      fixCssRecovery();
      fixWebSocketConfig();
      updateHtml(timestamp);
      console.log('\nAll fixes applied successfully!');
      break;
      
    case 'build':
      console.log('Building application...');
      buildApp();
      break;
      
    case 'deploy':
      console.log('Preparing for deployment...');
      deployApp();
      break;
      
    case 'verify':
      console.log('Verifying deployment readiness...');
      verifyDeploymentReadiness();
      break;
      
    case 'cleanup':
      console.log('Cleaning up redundant files...');
      cleanupRedundantFiles();
      break;
      
    case 'all':
      console.log('Running complete workflow: fix, verify, cleanup, build...');
      const ts = updateVersionTimestamp();
      fixModuleCompatibility();
      fixCssRecovery();
      fixWebSocketConfig();
      updateHtml(ts);
      verifyDeploymentReadiness();
      cleanupRedundantFiles();
      buildApp();
      console.log('\nComplete workflow finished!');
      break;
      
    case 'help':
    default:
      console.log('Usage: node deployment-tools.cjs [command]\n');
      console.log('Available commands:');
      console.log('  fix     - Apply all fixes (module compatibility, CSS, WebSocket)');
      console.log('  build   - Build the application for production');
      console.log('  deploy  - Prepare for deployment');
      console.log('  verify  - Verify deployment readiness');
      console.log('  cleanup - Remove redundant files');
      console.log('  all     - Run complete workflow: fix, verify, cleanup, build');
      console.log('  help    - Show this help message');
      break;
  }
  
  console.log('\n============================================');
}

// Run the main function when this script is executed directly
if (require.main === module) {
  main();
}

// Export functions for use in other scripts
module.exports = {
  updateVersionTimestamp,
  fixModuleCompatibility,
  fixCssRecovery,
  fixWebSocketConfig,
  updateHtml,
  buildApp,
  deployApp,
  verifyDeploymentReadiness,
  cleanupRedundantFiles
};
