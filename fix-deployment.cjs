/**
 * MCP Integration Platform - Deployment Fix
 * 
 * This script fixes the production server module compatibility issues
 * by ensuring we're using the CommonJS version.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('Applying deployment fixes for MCP Integration Platform...');

// Paths
const packageJsonPath = path.join(__dirname, 'package.json');
const prodServerCjsPath = path.join(__dirname, 'server', 'prod-server.cjs');
const startCjsPath = path.join(__dirname, 'start.cjs');

// Check if prod-server.cjs exists
if (!fs.existsSync(prodServerCjsPath)) {
  console.error('Error: prod-server.cjs not found. Please run scripts/fix-production-server.cjs first.');
  process.exit(1);
}

// Create a deployment script that includes all fixes for production
const deployScriptPath = path.join(__dirname, 'deploy-fix.cjs');
const deployScriptContent = `/**
 * MCP Integration Platform - Deployment Fix
 * 
 * This script applies all necessary fixes for production deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Applying all production deployment fixes...');

// 1. Run the build with production optimizations
console.log('\n1. Building the application for production...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 2. Verify the CommonJS server version is available
console.log('\n2. Verifying server compatibility...');
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
console.log('\n3. Starting production server...');
try {
  console.log('\nStarting server with: node start.cjs');
  console.log('--------------------------------------------');
  execSync('node start.cjs', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Server failed to start:', error.message);
  process.exit(1);
}
`;

// Write the deployment script
fs.writeFileSync(deployScriptPath, deployScriptContent, 'utf8');
console.log(`Created deployment script: ${deployScriptPath}`);

// Create a comprehensive solution script that fixes all issues
const completeFixPath = path.join(__dirname, 'complete-deployment-fix.cjs');
const completeFixContent = `/**
 * MCP Integration Platform - Complete Deployment Fix
 * 
 * This script applies all necessary fixes for production deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Applying comprehensive deployment fixes...');

// 1. Ensure production server compatibility
console.log('\n1. Fixing production server compatibility...');
try {
  execSync('node scripts/fix-production-server.cjs', { stdio: 'inherit' });
  console.log('✅ Server compatibility fixes applied');
} catch (error) {
  console.error('❌ Failed to apply server compatibility fixes:', error.message);
  process.exit(1);
}

// 2. Fix CSS inconsistencies
console.log('\n2. Fixing CSS inconsistencies...');
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
console.log('\n3. Running security checks...');
try {
  execSync('node scripts/check-for-secrets.cjs', { stdio: 'inherit' });
  console.log('✅ Security checks passed');
} catch (error) {
  console.error('❌ Security check failed:', error.message);
  console.log('\nPlease review and fix security issues before deploying');
  process.exit(1);
}

// 4. Create deployment fix script
console.log('\n4. Creating deployment scripts...');
try {
  execSync('node fix-deployment.cjs', { stdio: 'inherit' });
  console.log('✅ Deployment scripts created');
} catch (error) {
  console.error('❌ Failed to create deployment scripts:', error.message);
  process.exit(1);
}

console.log('\nAll fixes applied successfully! ✨');
console.log('\nTo deploy:');
console.log('1. Run: npm run build');
console.log('2. Run: node start.cjs');
console.log('\nOr use the automatic deployment script:');
console.log('node deploy-fix.cjs');
`;

// Write the comprehensive fix script
fs.writeFileSync(completeFixPath, completeFixContent, 'utf8');
console.log(`Created comprehensive fix script: ${completeFixPath}`);

// Update the deployment documentation to mention the fix scripts
const deploymentMdPath = path.join(__dirname, 'DEPLOYMENT.md');
if (fs.existsSync(deploymentMdPath)) {
  let deploymentMd = fs.readFileSync(deploymentMdPath, 'utf8');
  
  // Only add if not already present
  if (!deploymentMd.includes('### Automated Deployment Fix')) {
    const deploymentInfo = `\n### Automated Deployment Fix\n\nFor convenience, we've included automated fix scripts that handle all compatibility issues:\n\n\`\`\`bash\n# Comprehensive fix for all deployment issues\nnode complete-deployment-fix.cjs\n\n# Deploy with compatibility fixes applied\nnode deploy-fix.cjs\n\`\`\`\n\nThese scripts ensure that the correct module format is used, CSS is consistent, and all security checks pass.\n`;
    
    // Find a good place to insert this info
    const troubleshootingSection = deploymentMd.indexOf('## Troubleshooting');
    if (troubleshootingSection !== -1) {
      // Insert before the Troubleshooting section
      deploymentMd = deploymentMd.substring(0, troubleshootingSection) + deploymentInfo + deploymentMd.substring(troubleshootingSection);
    } else {
      // Append to the end of the file
      deploymentMd += deploymentInfo;
    }
    
    fs.writeFileSync(deploymentMdPath, deploymentMd, 'utf8');
    console.log('Updated deployment documentation with fix scripts');
  }
}

console.log('\nDeployment fixes applied successfully! ✨');
console.log('\nTo deploy:');
console.log('1. Run: npm run build');
console.log('2. Run: node start.cjs');
console.log('\nOr use the automatic deployment script:');
console.log('node deploy-fix.cjs');
