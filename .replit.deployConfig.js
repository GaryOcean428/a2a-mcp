/**
 * MCP Integration Platform - Replit Deployment Configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run the complete deployment fix script
try {
  console.log('Running complete deployment fix...');
  execSync('node complete-deployment-fix.cjs', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running deployment fix:', error);
}
