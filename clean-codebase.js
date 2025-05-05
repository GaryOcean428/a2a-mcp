#!/usr/bin/env node

/**
 * MCP Integration Platform - Codebase Cleanup Script
 * 
 * This script orchestrates the codebase cleanup process using the
 * consolidated deployment tools.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import unified deployment tools
const deploymentTools = require('./scripts/deployment-tools.cjs');

/**
 * Main function
 */
async function main() {
  console.log('============================================');
  console.log('MCP Integration Platform - Codebase Cleanup');
  console.log('============================================\n');
  
  // Run clean up redundant files
  console.log('Cleaning up redundant files...');
  deploymentTools.cleanupRedundantFiles();
  
  // Run the deployment readiness verification
  console.log('\nVerifying deployment readiness...');
  const isReady = deploymentTools.verifyDeploymentReadiness();
  
  if (isReady) {
    console.log('\nDeployment readiness check passed!');
  } else {
    console.error('\nDeployment readiness check failed.');
    console.log('Running automatic fixes...');
    
    // Apply all fixes
    const timestamp = deploymentTools.updateVersionTimestamp();
    deploymentTools.fixModuleCompatibility();
    deploymentTools.fixCssRecovery();
    deploymentTools.fixWebSocketConfig();
    deploymentTools.updateHtml(timestamp);
    
    // Verify again
    console.log('\nVerifying deployment readiness again...');
    const isNowReady = deploymentTools.verifyDeploymentReadiness();
    
    if (isNowReady) {
      console.log('\nDeployment readiness check now passes!');
    } else {
      console.error('\nDeployment readiness check still failing. Manual intervention required.');
      process.exit(1);
    }
  }
  
  console.log('\n============================================');
  console.log('Codebase cleanup completed successfully!');
  console.log('============================================');
  console.log('\nThe codebase has been cleaned up and optimized.');
  console.log('To deploy the application, run: node scripts/deploy.js');
}

// Run the main function
main().catch(error => {
  console.error('Cleanup error:', error);
  process.exit(1);
});
