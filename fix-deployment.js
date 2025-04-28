#!/usr/bin/env node

/**
 * MCP Integration Platform Deployment Preparation
 * This script applies critical fixes to ensure production builds match development.
 */

const { execSync } = require('child_process');

console.log('🚀 MCP Integration Platform - Deployment Preparation');
console.log('==================================================');

// Run the comprehensive deployment fixes
try {
  console.log('🔄 Applying authentication and component fixes...');
  execSync('node deployment-fix.js', { stdio: 'inherit' });
  
  console.log('🔄 Applying CSS and UI style fixes...');
  execSync('node deploy-fix.cjs', { stdio: 'inherit' });
  
  // Build the application for production
  console.log('🔄 Building application for production...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Final verification
  console.log('🔄 Verifying production build...');
  execSync('node deploy-rebuild.js', { stdio: 'inherit' });
  
  console.log('\n✅ MCP Integration Platform is ready for deployment!');
  console.log('Please use the Replit Deploy button to publish your application.');
} catch (error) {
  console.error('\n❌ Deployment preparation failed!');
  console.error(error.message);
  console.error('\nPlease fix the errors above and try again.');
  process.exit(1);
}