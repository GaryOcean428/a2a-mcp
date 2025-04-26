/**
 * MCP Integration Platform - Replit Deployment Configuration
 * 
 * This script is executed automatically by Replit before deployment.
 * It ensures consistent UI between development and production environments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generate a version tag that includes the deployment timestamp
const VERSION = "2.5." + Date.now();

// Key paths that need to be updated for deployment
const PATHS = {
  versionFile: './client/src/version.ts',
  productionCss: './client/src/production.css',
  cssRecovery: './client/src/css-recovery.ts',
  verificationComponent: './client/src/components/CssVerification.tsx',
  htmlFile: './client/index.html'
};

/**
 * Update the version.ts file with the current deployment version
 */
function updateVersion() {
  try {
    fs.writeFileSync(PATHS.versionFile, `export const VERSION = "${VERSION}";`);
    console.log(`✅ Updated version to ${VERSION}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update version file:', error);
    return false;
  }
}

/**
 * Update the HTML file with the current deployment version
 */
function updateHtml() {
  try {
    if (!fs.existsSync(PATHS.htmlFile)) {
      console.error('❌ HTML file not found at', PATHS.htmlFile);
      return false;
    }
    
    let html = fs.readFileSync(PATHS.htmlFile, 'utf8');
    
    // Update version in HTML comment
    html = html.replace(/MCP Integration Platform v([0-9\.]+)/, `MCP Integration Platform v${VERSION}`);
    
    // Update version in meta tag
    html = html.replace(/<meta name="app-version" content="[^"]*"/, `<meta name="app-version" content="${VERSION}"`);
    
    // Add data-mcp-version attribute to html tag if not already present
    if (!html.includes('data-mcp-version')) {
      html = html.replace(/<html([^>]*)>/, `<html$1 data-mcp-version="${VERSION}">`);
    } else {
      html = html.replace(/data-mcp-version="[^"]*"/, `data-mcp-version="${VERSION}"`);
    }
    
    fs.writeFileSync(PATHS.htmlFile, html);
    console.log('✅ Updated HTML with new version');
    return true;
  } catch (error) {
    console.error('❌ Failed to update HTML:', error);
    return false;
  }
}

/**
 * Verify that all required files exist
 */
function verifyFiles() {
  try {
    const requiredFiles = [
      PATHS.versionFile,
      PATHS.productionCss,
      PATHS.cssRecovery,
      PATHS.verificationComponent,
      PATHS.htmlFile
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      console.error('❌ Missing required files:', missingFiles);
      return false;
    }
    
    console.log('✅ All required files are present');
    return true;
  } catch (error) {
    console.error('❌ Failed to verify files:', error);
    return false;
  }
}

/**
 * Apply all fixes required for deployment
 */
function applyDeploymentFixes() {
  console.log('🔧 MCP Integration Platform Deployment Configuration');
  console.log('===================================================');
  
  // 1. Verify all required files exist
  const filesVerified = verifyFiles();
  if (!filesVerified) {
    console.error('❌ File verification failed. Stopping deployment configuration.');
    process.exit(1);
  }
  
  // 2. Update version
  const versionUpdated = updateVersion();
  if (!versionUpdated) {
    console.error('❌ Version update failed. Stopping deployment configuration.');
    process.exit(1);
  }
  
  // 3. Update HTML
  const htmlUpdated = updateHtml();
  if (!htmlUpdated) {
    console.error('❌ HTML update failed. Stopping deployment configuration.');
    process.exit(1);
  }
  
  console.log('✅ All deployment fixes applied successfully');
  console.log('===================================================');
}

// Run all the fixes
applyDeploymentFixes();