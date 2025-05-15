#!/usr/bin/env node

/**
 * MCP Integration Platform - Deployment Consistency Script
 * 
 * This script ensures full UI consistency between development and production environments
 * by implementing a comprehensive verification and fix process before deployment.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  timestamp: Date.now(),
  version: '1.0.0',
  cssDir: path.join(__dirname, 'public/assets/css'),
  jsDir: path.join(__dirname, 'public/js'),
  clientDir: path.join(__dirname, 'client'),
  criticalCssPath: path.join(__dirname, 'public/assets/css/recovery-critical.css'),
  indexHtmlPath: path.join(__dirname, 'client/index.html'),
  cssInjectorPath: path.join(__dirname, 'public/js/css-injector.js'),
  buildDistDir: path.join(__dirname, 'dist')
};

/**
 * Run verification script to check UI consistency
 */
function verifyConsistency() {
  console.log('\n🔍 Verifying UI consistency...');
  
  try {
    execSync('node ui-consistency-verifier.js', { stdio: 'inherit' });
    console.log('✅ UI consistency verification completed successfully');
    return true;
  } catch (error) {
    console.error('❌ UI consistency verification failed!');
    return false;
  }
}

/**
 * Update version timestamp in config files
 */
function updateVersionTimestamp() {
  console.log('\n🔄 Updating version timestamp...');
  
  try {
    // Create version config if it doesn't exist
    const versionDir = path.join(CONFIG.clientDir, 'src/config');
    const versionPath = path.join(versionDir, 'version.ts');
    
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true });
    }
    
    const versionContent = `/**
 * MCP Integration Platform Version
 * Auto-generated on ${new Date().toISOString()}
 */

export const VERSION = '${CONFIG.timestamp}';
`;
    
    fs.writeFileSync(versionPath, versionContent, 'utf8');
    console.log(`✅ Updated version timestamp to ${CONFIG.timestamp}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update version timestamp:', error);
    return false;
  }
}

/**
 * Create bundle verification script to verify production CSS
 */
function createBundleVerificationScript() {
  console.log('\n🔄 Creating bundle verification script...');
  
  try {
    const verifyDir = path.join(CONFIG.jsDir, 'verify');
    const verifyPath = path.join(verifyDir, 'bundle-verify.js');
    
    if (!fs.existsSync(verifyDir)) {
      fs.mkdirSync(verifyDir, { recursive: true });
    }
    
    const verifyContent = `/**
 * MCP Integration Platform - Production Bundle Verification
 * 
 * This script verifies that the production bundle contains all necessary
 * CSS styles and components for proper rendering.
 * 
 * Version: ${CONFIG.version}-${CONFIG.timestamp}
 */

(function() {
  console.log('[Bundle Verify] Starting production bundle verification...');
  
  // Critical CSS classes to verify
  const CRITICAL_CLASSES = [
    'bg-gradient-to-r',
    'text-transparent',
    'bg-clip-text',
    'feature-card',
    'animate-fade-in-down',
    'from-purple-50',
    'to-white',
    'bg-grid-gray-100',
    'bg-blob-gradient'
  ];
  
  // Verify function to check CSS
  function verifyProductionCSS() {
    // Create test element
    const testEl = document.createElement('div');
    testEl.style.position = 'absolute';
    testEl.style.visibility = 'hidden';
    testEl.style.pointerEvents = 'none';
    document.body.appendChild(testEl);
    
    // Check each critical class
    const missingClasses = [];
    
    CRITICAL_CLASSES.forEach(function(className) {
      testEl.className = className;
      const styles = window.getComputedStyle(testEl);
      
      let isApplied = false;
      
      // Custom checks for each class type
      if (className === 'bg-gradient-to-r') {
        isApplied = styles.backgroundImage.includes('gradient');
      } else if (className === 'text-transparent') {
        isApplied = styles.color === 'transparent' || styles.color === 'rgba(0, 0, 0, 0)';
      } else if (className === 'bg-clip-text') {
        isApplied = styles.webkitBackgroundClip === 'text' || styles.backgroundClip === 'text';
      } else if (className === 'feature-card') {
        isApplied = styles.display === 'flex';
      } else if (className === 'animate-fade-in-down') {
        isApplied = styles.animation !== 'none';
      } else {
        // Default check - see if any CSS property changed from default
        const defaultEl = document.createElement('div');
        document.body.appendChild(defaultEl);
        const defaultStyles = window.getComputedStyle(defaultEl);
        
        // Compare some key properties
        isApplied = (
          styles.color !== defaultStyles.color ||
          styles.backgroundColor !== defaultStyles.backgroundColor ||
          styles.backgroundImage !== defaultStyles.backgroundImage
        );
        
        document.body.removeChild(defaultEl);
      }
      
      if (!isApplied) {
        missingClasses.push(className);
      }
    });
    
    // Clean up test element
    document.body.removeChild(testEl);
    
    // Report results
    if (missingClasses.length > 0) {
      console.error('[Bundle Verify] Missing critical CSS classes in production build:', missingClasses.join(', '));
      document.documentElement.setAttribute('data-mcp-verify-status', 'failed');
      document.documentElement.setAttribute('data-mcp-missing-classes', missingClasses.join(','));
      injectEmergencyCSS(missingClasses);
      return false;
    } else {
      console.log('[Bundle Verify] All critical CSS classes verified in production build ✓');
      document.documentElement.setAttribute('data-mcp-verify-status', 'passed');
      return true;
    }
  }
  
  // Inject emergency CSS if needed
  function injectEmergencyCSS(missingClasses) {
    console.warn('[Bundle Verify] Injecting emergency CSS for missing classes:', missingClasses.join(', '));
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'mcp-emergency-css';
    
    // Build CSS content based on missing classes
    let cssContent = '/* MCP Emergency CSS Fix */\\n';
    
    missingClasses.forEach(function(className) {
      switch(className) {
        case 'bg-gradient-to-r':
          cssContent += '.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important; }\\n';
          break;
        case 'text-transparent':
          cssContent += '.text-transparent { color: transparent !important; }\\n';
          break;
        case 'bg-clip-text':
          cssContent += '.bg-clip-text { -webkit-background-clip: text !important; background-clip: text !important; }\\n';
          break;
        case 'feature-card':
          cssContent += '.feature-card { display: flex !important; flex-direction: column !important; background-color: white !important; border-radius: 0.5rem !important; overflow: hidden !important; border: 1px solid rgba(0, 0, 0, 0.05) !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; }\\n';
          break;
        case 'animate-fade-in-down':
          cssContent += '@keyframes fadeInDown { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }\\n';
          cssContent += '.animate-fade-in-down { animation: fadeInDown 0.5s ease-out !important; }\\n';
          break;
        case 'from-purple-50':
          cssContent += '.from-purple-50 { --tw-gradient-from: rgb(250 245 255) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(250 245 255 / 0)) !important; }\\n';
          break;
        case 'to-white':
          cssContent += '.to-white { --tw-gradient-to: rgb(255 255 255) !important; }\\n';
          break;
        case 'bg-grid-gray-100':
          cssContent += '.bg-grid-gray-100 { background-image: linear-gradient(to right, rgb(243 244 246 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(243 244 246 / 0.1) 1px, transparent 1px) !important; background-size: 24px 24px !important; }\\n';
          break;
        case 'bg-blob-gradient':
          cssContent += '.bg-blob-gradient { background-image: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0) 70%) !important; }\\n';
          break;
      }
    });
    
    // Add combined classes
    cssContent += '/* Combined classes */\\n';
    cssContent += '.bg-gradient-to-r.text-transparent.bg-clip-text { background-image: linear-gradient(to right, rgb(124 58 237), rgb(79 70 229)) !important; color: transparent !important; -webkit-background-clip: text !important; background-clip: text !important; }\\n';
    
    style.textContent = cssContent;
    document.head.appendChild(style);
    
    console.log('[Bundle Verify] Emergency CSS injected');
  }
  
  // Run verification when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verifyProductionCSS);
  } else {
    verifyProductionCSS();
  }
  
  // Also run verification when the page is fully loaded
  window.addEventListener('load', verifyProductionCSS);
})();
`;
    
    fs.writeFileSync(verifyPath, verifyContent, 'utf8');
    console.log('✅ Created bundle verification script');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create bundle verification script:', error);
    return false;
  }
}

/**
 * Build the project for production
 */
function buildProject() {
  console.log('\n🔄 Building project for production...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Project built successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to build project:', error);
    return false;
  }
}

/**
 * Verify the production build
 */
function verifyProductionBuild() {
  console.log('\n🔍 Verifying production build...');
  
  try {
    // Check if dist directory exists
    if (!fs.existsSync(CONFIG.buildDistDir)) {
      console.error('❌ Build directory not found!');
      return false;
    }
    
    // Check for critical files
    const criticalFiles = [
      path.join(CONFIG.buildDistDir, 'public/index.html'),
      path.join(CONFIG.buildDistDir, 'server/prod-server.js')
    ];
    
    const missingFiles = criticalFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      console.error('❌ Missing critical files in build:', missingFiles.join(', '));
      return false;
    }
    
    // Check the HTML for critical CSS and scripts
    const htmlPath = path.join(CONFIG.buildDistDir, 'public/index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for CSS links
    if (!htmlContent.includes('.css')) {
      console.warn('⚠️ No CSS files found in production HTML!');
    }
    
    // Add bundle verification script to production HTML if not present
    if (!htmlContent.includes('bundle-verify.js')) {
      console.log('Adding bundle verification script to production HTML...');
      
      // Copy bundle verification script to dist
      const verifyScript = path.join(CONFIG.jsDir, 'verify/bundle-verify.js');
      const distVerifyDir = path.join(CONFIG.buildDistDir, 'public/js/verify');
      const distVerifyScript = path.join(distVerifyDir, 'bundle-verify.js');
      
      if (!fs.existsSync(distVerifyDir)) {
        fs.mkdirSync(distVerifyDir, { recursive: true });
      }
      
      if (fs.existsSync(verifyScript)) {
        fs.copyFileSync(verifyScript, distVerifyScript);
        
        // Update HTML to include the script
        const updatedHtml = htmlContent.replace(
          '</head>',
          `  <script src="/js/verify/bundle-verify.js"></script>\n  </head>`
        );
        
        fs.writeFileSync(htmlPath, updatedHtml, 'utf8');
        console.log('✅ Added bundle verification script to production HTML');
      }
    }
    
    console.log('✅ Production build verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to verify production build:', error);
    return false;
  }
}

/**
 * Run all deployment consistency steps
 */
function runDeploymentConsistency() {
  console.log('\n🚀 Running deployment consistency process...');
  
  // Step 1: Verify UI consistency
  if (!verifyConsistency()) {
    console.error('❌ UI consistency verification failed, aborting deployment!');
    return false;
  }
  
  // Step 2: Update version timestamp
  if (!updateVersionTimestamp()) {
    console.warn('⚠️ Failed to update version timestamp, continuing anyway...');
  }
  
  // Step 3: Create bundle verification script
  if (!createBundleVerificationScript()) {
    console.warn('⚠️ Failed to create bundle verification script, continuing anyway...');
  }
  
  // Step 4: Build project
  if (!buildProject()) {
    console.error('❌ Project build failed, aborting deployment!');
    return false;
  }
  
  // Step 5: Verify production build
  if (!verifyProductionBuild()) {
    console.error('❌ Production build verification failed, aborting deployment!');
    return false;
  }
  
  return true;
}

// Main function
function main() {
  console.log('===================================================');
  console.log('🚀 MCP Integration Platform - Deployment Consistency');
  console.log('===================================================');
  
  const deploymentSuccess = runDeploymentConsistency();
  
  if (deploymentSuccess) {
    console.log('\n✅ Deployment consistency process completed successfully!');
    console.log('The application is now ready for deployment with consistent UI in both environments.');
    console.log('\n🚀 Please use the "Replit Deploy" button to deploy your application.\n');
  } else {
    console.log('\n❌ Deployment consistency process failed!');
    console.log('Please address the issues mentioned above before deploying.');
  }
  
  return deploymentSuccess ? 0 : 1;
}

// Run the main function
const exitCode = main();
process.exit(exitCode);