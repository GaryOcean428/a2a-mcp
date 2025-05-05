#!/usr/bin/env node

/**
 * MCP Integration Platform Deployment Script
 * 
 * This script provides a centralized way to run deployment operations.
 * It uses the unified deployment tools in deployment-tools.cjs.
 */

// Import unified deployment tools
const deploymentTools = require('./deployment-tools.cjs');

/**
 * Main function
 */
async function main() {
  console.log('============================================');
  console.log('MCP Integration Platform - Deployment');
  console.log('============================================\n');
  
  // Run the full deployment workflow
  console.log('Running complete deployment workflow...');
  
  // 1. Update version timestamp
  const timestamp = deploymentTools.updateVersionTimestamp();
  console.log(`Version timestamp updated: ${timestamp}`);
  
  // 2. Fix module compatibility
  deploymentTools.fixModuleCompatibility();
  console.log('Module compatibility fixes applied.');
  
  // 3. Fix CSS recovery
  deploymentTools.fixCssRecovery();
  console.log('CSS recovery system enhanced.');
  
  // 4. Fix WebSocket configuration
  deploymentTools.fixWebSocketConfig();
  console.log('WebSocket configuration fixed.');
  
  // 5. Update HTML with critical CSS
  deploymentTools.updateHtml(timestamp);
  console.log('HTML files updated with critical CSS and version info.');
  
  // 6. Verify deployment readiness
  const isReady = deploymentTools.verifyDeploymentReadiness();
  
  if (!isReady) {
    console.error('\nDeployment preparation failed readiness checks.');
    process.exit(1);
  }
  
  // 7. Build the application
  const buildSuccess = deploymentTools.buildApp();
  
  if (!buildSuccess) {
    console.error('\nDeployment build process failed.');
    process.exit(1);
  }
  
  console.log('\n============================================');
  console.log('Deployment preparation completed successfully!');
  console.log('============================================');
  console.log('\nTo deploy your application, use the Replit deployment interface.');
}

// Run the main function
main().catch(error => {
  console.error('Deployment error:', error);
  process.exit(1);
});
