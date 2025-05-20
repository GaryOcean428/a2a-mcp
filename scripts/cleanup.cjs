#!/usr/bin/env node

/**
 * MCP Integration Platform Cleanup Script
 * 
 * This script provides a centralized way to clean up redundant files
 * using the unified deployment tools in deployment-tools.cjs.
 */

// Import unified deployment tools
const deploymentTools = require('./deployment-tools.cjs');

/**
 * Main function
 */
async function main() {
  console.log('============================================');
  console.log('MCP Integration Platform - Codebase Cleanup');
  console.log('============================================\n');
  
  // Run the cleanup process
  console.log('Cleaning up redundant files...');
  deploymentTools.cleanupRedundantFiles();
  
  console.log('\n============================================');
  console.log('Codebase cleanup completed!');
  console.log('============================================');
}

// Run the main function
main().catch(error => {
  console.error('Cleanup error:', error);
  process.exit(1);
});
