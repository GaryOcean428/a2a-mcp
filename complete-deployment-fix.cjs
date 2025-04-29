/**
 * MCP Integration Platform - Complete Deployment Fix
 * 
 * This script applies all necessary fixes for production deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Applying comprehensive deployment fixes...');

// 1. Ensure production server compatibility
console.log('
1. Fixing production server compatibility...');
try {
  execSync('node scripts/fix-production-server.cjs', { stdio: 'inherit' });
  console.log('✅ Server compatibility fixes applied');
} catch (error) {
  console.error('❌ Failed to apply server compatibility fixes:', error.message);
  process.exit(1);
}

// 2. Fix CSS inconsistencies
console.log('
2. Fixing CSS inconsistencies...');
try {
  const cssFixScript = path.join(__dirname, 'scripts', 'fix-ui-inconsistencies.js');
  if (fs.existsSync(cssFixScript)) {
    execSync('node scripts/fix-ui-inconsistencies.js', { stdio: 'inherit' });
    console.log('✅ CSS consistency fixes applied');
  } else {
    console.log('⚠️ CSS fix script not found, skipping');
  }
} catch (error) {
  console.warn('⚠️ Warning: CSS fixes encountered an issue:', error.message);
  // Continue despite CSS issues
}

// 3. Run security checks
console.log('
3. Running security checks...');
try {
  execSync('node scripts/check-for-secrets.cjs', { stdio: 'inherit' });
  console.log('✅ Security checks passed');
} catch (error) {
  console.error('❌ Security check failed:', error.message);
  console.log('
Please review and fix security issues before deploying');
  process.exit(1);
}

// 4. Create deployment fix script
console.log('
4. Creating deployment scripts...');
try {
  execSync('node fix-deployment.cjs', { stdio: 'inherit' });
  console.log('✅ Deployment scripts created');
} catch (error) {
  console.error('❌ Failed to create deployment scripts:', error.message);
  process.exit(1);
}

console.log('
All fixes applied successfully! ✨');
console.log('
To deploy:');
console.log('1. Run: npm run build');
console.log('2. Run: node start.cjs');
console.log('
Or use the automatic deployment script:');
console.log('node deploy-fix.cjs');
