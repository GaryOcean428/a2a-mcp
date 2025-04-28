#!/usr/bin/env node

/**
 * MCP Integration Platform Deployment Preparation
 * This script applies critical fixes to ensure production builds match development.
 */

const { execSync } = require('child_process');

console.log('🔄 Applying MCP Integration Platform Deployment Fixes...');

// Run the comprehensive deployment fixes
execSync('node deployment-fix.cjs', { stdio: 'inherit' });

// Build the application for production
console.log('🔄 Building application for production...');
execSync('npm run build', { stdio: 'inherit' });

console.log('✅ MCP Integration Platform is ready for deployment!');
