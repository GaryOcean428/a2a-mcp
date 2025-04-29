/**
 * MCP Integration Platform - Deployment Fix
 * 
 * This script applies all necessary fixes for production deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Applying all production deployment fixes...');

// 1. Run the build with production optimizations
console.log('
1. Building the application for production...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 2. Verify the CommonJS server version is available
console.log('
2. Verifying server compatibility...');
const prodServerCjsPath = path.join(__dirname, 'server', 'prod-server.cjs');
if (!fs.existsSync(prodServerCjsPath)) {
  console.error('❌ CommonJS server version not found');
  console.log('Running production server fix...');
  try {
    execSync('node scripts/fix-production-server.cjs', { stdio: 'inherit' });
    console.log('✅ Server compatibility fixes applied');
  } catch (error) {
    console.error('❌ Failed to apply server compatibility fixes:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ CommonJS server version is available');
}

// 3. Start the production server using the CommonJS version
console.log('
3. Starting production server...');
try {
  console.log('
Starting server with: node start.cjs');
  console.log('--------------------------------------------');
  execSync('node start.cjs', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Server failed to start:', error.message);
  process.exit(1);
}
