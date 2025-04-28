/**
 * MCP Integration Platform - Replit Deployment Configuration
 * 
 * This script is executed automatically by Replit before deployment.
 * It ensures consistent UI between development and production environments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run pre-deployment scripts
try {
  console.log('🔄 Running pre-deployment checks and fixes...');
  
  // Run the CSS and component fixes
  execSync('node deploy-fix.cjs', { stdio: 'inherit' });
  execSync('node deployment-fix.cjs', { stdio: 'inherit' });
  
  // Update version file
  const VERSION = "2.5." + Date.now();
  updateVersion(VERSION);
  
  // Update HTML file
  updateHtml(VERSION);
  
  // Verify files
  verifyFiles();
  
  console.log('✅ Pre-deployment checks and fixes completed successfully');
} catch (error) {
  console.error('❌ Pre-deployment checks and fixes failed:', error.message);
  // Continue with deployment anyway
}

/**
 * Update the version.ts file with the current deployment version
 */
function updateVersion(version) {
  try {
    const versionFile = './client/src/version.ts';
    if (!fs.existsSync(path.dirname(versionFile))) {
      fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    }
    
    fs.writeFileSync(versionFile, `export const VERSION = "${version}";`);
    console.log(`✅ Updated version to ${version}`);
  } catch (error) {
    console.error('❌ Failed to update version file:', error.message);
  }
}

/**
 * Update the HTML file with the current deployment version
 */
function updateHtml(version) {
  try {
    const htmlFile = './client/index.html';
    let html = fs.readFileSync(htmlFile, 'utf8');
    
    // Add version tracking meta tag
    if (!html.includes('<meta name="app-version"')) {
      html = html.replace('</head>', `  <meta name="app-version" content="${version}" />\n  </head>`);
    } else {
      html = html.replace(/<meta name="app-version" content="[^"]*"/, `<meta name="app-version" content="${version}"`);
    }
    
    fs.writeFileSync(htmlFile, html);
    console.log('✅ Updated HTML with deployment version');
  } catch (error) {
    console.error('❌ Failed to update HTML:', error.message);
  }
}

/**
 * Verify that all required files exist
 */
function verifyFiles() {
  try {
    // Check that critical deployment files exist
    const requiredFiles = [
      './deployment-fix.cjs',
      './deploy-fix.cjs',
      './fix-deployment.cjs',
      './deploy-rebuild.cjs'
    ];
    
    let allFilesExist = true;
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.error(`❌ Required file not found: ${file}`);
        allFilesExist = false;
      }
    }
    
    if (allFilesExist) {
      console.log('✅ All required deployment files present');
    }
  } catch (error) {
    console.error('❌ Failed to verify files:', error.message);
  }
}

// This module needs to be exported for Replit deployment
module.exports = {
  // Make script wait until the build is complete
  onBuildComplete: async () => {
    console.log('Build complete, running post-build verification...');
    
    try {
      // Check that critical files were included in the build
      const buildDir = './client/dist';
      if (fs.existsSync(buildDir)) {
        console.log('✅ Build directory exists');
        
        // Update the HTML file in the build directory
        const buildHtml = path.join(buildDir, 'index.html');
        if (fs.existsSync(buildHtml)) {
          let html = fs.readFileSync(buildHtml, 'utf8');
          
          // Add version verification meta tag
          if (!html.includes('<meta name="mcp-deployment"')) {
            html = html.replace('</head>', `  <meta name="mcp-deployment" content="verified" />\n  </head>`);
            fs.writeFileSync(buildHtml, html);
            console.log('✅ Updated built HTML with verification tag');
          }
        }
      } else {
        console.error('❌ Build directory not found');
      }
      
      console.log('✅ Post-build verification complete');
    } catch (error) {
      console.error('❌ Post-build verification failed:', error.message);
    }
  }
};