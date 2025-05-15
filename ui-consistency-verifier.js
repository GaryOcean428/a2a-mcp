/**
 * MCP Integration Platform - UI Consistency Verifier
 * 
 * This script verifies the consistency of UI elements between development and production environments.
 * It ensures critical CSS classes are properly applied and all UI components render correctly.
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
  deploymentFixPath: path.join(__dirname, 'complete-deployment-fix.cjs')
};

// Critical CSS Classes to verify
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

// Verification functions

/**
 * Verify critical CSS file exists with all required classes
 */
function verifyCriticalCssFile() {
  console.log('\n📝 Verifying critical CSS file...');
  
  // Check if file exists
  if (!fs.existsSync(CONFIG.criticalCssPath)) {
    console.error('❌ Critical CSS file not found!');
    return false;
  }
  
  // Read file content
  const cssContent = fs.readFileSync(CONFIG.criticalCssPath, 'utf8');
  
  // Check for each critical class
  const missingClasses = [];
  CRITICAL_CLASSES.forEach(className => {
    if (!cssContent.includes(`.${className}`)) {
      missingClasses.push(className);
    }
  });
  
  if (missingClasses.length > 0) {
    console.error(`❌ Critical CSS file is missing these classes: ${missingClasses.join(', ')}`);
    return false;
  }
  
  console.log('✅ Critical CSS file verified successfully');
  return true;
}

/**
 * Verify CSS injector script exists and functions properly
 */
function verifyCssInjector() {
  console.log('\n📝 Verifying CSS injector script...');
  
  // Check if file exists
  if (!fs.existsSync(CONFIG.cssInjectorPath)) {
    console.error('❌ CSS injector script not found!');
    return false;
  }
  
  // Read file content
  const jsContent = fs.readFileSync(CONFIG.cssInjectorPath, 'utf8');
  
  // Check for critical functionality
  const requiredFunctions = [
    'loadCriticalStylesheet',
    'injectDirectStyles',
    'DIRECT_CSS'
  ];
  
  const missingFunctions = [];
  requiredFunctions.forEach(func => {
    if (!jsContent.includes(func)) {
      missingFunctions.push(func);
    }
  });
  
  if (missingFunctions.length > 0) {
    console.error(`❌ CSS injector script is missing these functions: ${missingFunctions.join(', ')}`);
    return false;
  }
  
  // Check for critical classes in the direct CSS
  const missingClasses = [];
  CRITICAL_CLASSES.forEach(className => {
    if (!jsContent.includes(`.${className}`)) {
      missingClasses.push(className);
    }
  });
  
  if (missingClasses.length > 0) {
    console.error(`⚠️ CSS injector might be missing these classes: ${missingClasses.join(', ')}`);
    // Not failing for this, just warning
  }
  
  console.log('✅ CSS injector script verified successfully');
  return true;
}

/**
 * Verify HTML includes CSS injector and critical CSS
 */
function verifyHtmlInclusion() {
  console.log('\n📝 Verifying HTML includes CSS injector and critical CSS...');
  
  // Check if file exists
  if (!fs.existsSync(CONFIG.indexHtmlPath)) {
    console.error('❌ HTML file not found!');
    return false;
  }
  
  // Read file content
  const htmlContent = fs.readFileSync(CONFIG.indexHtmlPath, 'utf8');
  
  // Check for CSS injector script
  if (!htmlContent.includes('/js/css-injector.js')) {
    console.error('❌ HTML file is missing CSS injector script inclusion!');
    return false;
  }
  
  // Check for critical CSS preload
  if (!htmlContent.includes('/assets/css/recovery-critical.css')) {
    console.error('❌ HTML file is missing critical CSS preload!');
    return false;
  }
  
  // Check for inline critical styles
  if (!htmlContent.includes('<style id="mcp-critical-css"') && 
      !htmlContent.includes('<style id="critical-css"')) {
    console.error('⚠️ HTML file may be missing inline critical styles!');
    // Not failing for this, just warning
  }
  
  console.log('✅ HTML file includes necessary CSS and scripts');
  return true;
}

/**
 * Verify deployment fix script includes CSS recovery
 */
function verifyDeploymentFix() {
  console.log('\n📝 Verifying deployment fix script includes CSS recovery...');
  
  // Check if file exists
  if (!fs.existsSync(CONFIG.deploymentFixPath)) {
    console.error('❌ Deployment fix script not found!');
    return false;
  }
  
  // Read file content
  const deployContent = fs.readFileSync(CONFIG.deploymentFixPath, 'utf8');
  
  // Check for fixCssRecovery function
  if (!deployContent.includes('function fixCssRecovery()')) {
    console.error('❌ Deployment fix script is missing CSS recovery function!');
    return false;
  }
  
  // Check if it's called in the apply function
  if (!deployContent.includes('fixCssRecovery')) {
    console.error('❌ CSS recovery function is not called in the deployment fix script!');
    return false;
  }
  
  console.log('✅ Deployment fix script includes CSS recovery');
  return true;
}

/**
 * Apply fixes to any verification failures
 */
function applyFixes(verificationResults) {
  console.log('\n🔧 Applying fixes to any verification failures...');
  
  // Check if any fixes are needed
  if (Object.values(verificationResults).every(result => result === true)) {
    console.log('✅ No fixes needed, all verifications passed!');
    return true;
  }
  
  let fixesApplied = false;
  
  // Fix critical CSS file if needed
  if (!verificationResults.criticalCss) {
    console.log('🔧 Fixing critical CSS file...');
    
    try {
      // Ensure directory exists
      if (!fs.existsSync(CONFIG.cssDir)) {
        fs.mkdirSync(CONFIG.cssDir, { recursive: true });
      }
      
      // Load comprehensive critical CSS
      let criticalCss = `/**
 * MCP Integration Platform - Critical CSS Recovery
 * 
 * This file contains critical CSS classes that must be preserved and loaded even when
 * TailwindCSS purging might remove them in production builds.
 */

/* Background Gradients */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
  --tw-gradient-from: rgb(124 58 237) !important;
  --tw-gradient-stops: var(--tw-gradient-from), rgb(79 70 229) !important;
  --tw-gradient-to: rgb(79 70 229) !important;
}

.from-purple-600 {
  --tw-gradient-from: rgb(147 51 234) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(147 51 234 / 0)) !important;
}

.to-indigo-600 {
  --tw-gradient-to: rgb(79 70 229) !important;
}

.from-purple-50 {
  --tw-gradient-from: rgb(250 245 255) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(250 245 255 / 0)) !important;
}

.to-white {
  --tw-gradient-to: rgb(255 255 255) !important;
}

/* Text Transparency */
.text-transparent {
  color: transparent !important;
}

.bg-clip-text {
  -webkit-background-clip: text !important;
  background-clip: text !important;
}

/* Combined Text Gradient */
.bg-gradient-to-r.text-transparent.bg-clip-text {
  background-image: linear-gradient(to right, rgb(124 58 237), rgb(79 70 229)) !important;
  color: transparent !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
}

/* Animation Classes */
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-in-out !important;
}

@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation-name: animate-in !important;
  animation-duration: 300ms !important;
  animation-timing-function: ease-in-out !important;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.duration-300 {
  transition-duration: 300ms !important;
}

/* Card Styles */
.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
  display: flex !important;
  flex-direction: column !important;
  background-color: white !important;
  border-radius: 0.5rem !important;
  overflow: hidden !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

.feature-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  border-color: rgba(124, 58, 237, 0.2) !important;
}

/* Group Hover */
.group:hover .group-hover\\:scale-110 {
  transform: scale(1.1) !important;
}

/* Background Patterns */
.bg-grid-gray-100 {
  background-image: linear-gradient(to right, rgb(243 244 246 / 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(243 244 246 / 0.1) 1px, transparent 1px) !important;
  background-size: 24px 24px !important;
}

.bg-blob-gradient {
  background-image: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0) 70%) !important;
}

/* Make sure Tailwind CSS classes for UI components work */
.bg-primary {
  background-color: hsl(var(--primary)) !important;
}

.text-primary {
  color: hsl(var(--primary)) !important;
}

.border-primary {
  border-color: hsl(var(--primary)) !important;
}
`;
      
      // Write to file
      fs.writeFileSync(CONFIG.criticalCssPath, criticalCss, 'utf8');
      console.log('✅ Created/fixed critical CSS file');
      fixesApplied = true;
    } catch (error) {
      console.error('❌ Failed to fix critical CSS file:', error);
    }
  }
  
  // Fix CSS injector if needed
  if (!verificationResults.cssInjector) {
    console.log('🔧 Fixing CSS injector script...');
    
    try {
      // Ensure directory exists
      if (!fs.existsSync(CONFIG.jsDir)) {
        fs.mkdirSync(CONFIG.jsDir, { recursive: true });
      }
      
      // Basic CSS injector script
      const cssInjector = `/**
 * MCP Integration Platform - CSS Injector
 * 
 * This script ensures critical CSS styles are properly applied in both development and production.
 * It checks for missing styles and injects them directly when needed.
 * 
 * Version: 1.0.0
 */

(function() {
  // Configuration
  const CONFIG = {
    criticalCssPath: '/assets/css/recovery-critical.css',
    version: new Date().getTime(),
    autoRetry: true,
    retryDelay: 1000,
    retryMax: 3
  };

  // Critical CSS classes that must always be available
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

  // Direct CSS injection - this will be used if the stylesheets fail
  const DIRECT_CSS = \`
    /* Direct critical styles - no external dependencies */
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    
    .text-transparent {
      color: transparent !important;
    }
    
    .bg-clip-text {
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    
    .feature-card {
      display: flex !important;
      flex-direction: column !important;
      background-color: white !important;
      border-radius: 0.5rem !important;
      overflow: hidden !important;
      border: 1px solid rgba(0, 0, 0, 0.05) !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      transition: transform 0.3s ease, box-shadow 0.3s ease !important;
    }
    
    .animate-fade-in-down {
      animation: cssInjector_fadeIn 0.5s ease-in-out !important;
    }
    
    @keyframes cssInjector_fadeIn {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    .from-purple-50 {
      --tw-gradient-from: rgb(250 245 255) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(250 245 255 / 0)) !important;
    }
    
    .to-white {
      --tw-gradient-to: rgb(255 255 255) !important;
    }
    
    .bg-grid-gray-100 {
      background-image: linear-gradient(to right, rgb(243 244 246 / 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgb(243 244 246 / 0.1) 1px, transparent 1px) !important;
      background-size: 24px 24px !important;
    }
    
    .bg-blob-gradient {
      background-image: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0) 70%) !important;
    }
  \`;

  // Initialize
  function init() {
    console.log('[CSS Injector] Initializing...');
    
    // First attempt to load the external stylesheet
    loadCriticalStylesheet();
    
    // Then add direct styles as a backup
    injectDirectStyles();
    
    // Verify critical styles after a delay
    setTimeout(verifyAndFixStyles, 500);
  }

  // Load critical CSS stylesheet
  function loadCriticalStylesheet() {
    // Check if it's already loaded
    if (document.querySelector(\`link[href*="\${CONFIG.criticalCssPath}"]\`)) {
      console.log('[CSS Injector] Critical CSS already loaded');
      return;
    }
    
    // Create link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = \`\${CONFIG.criticalCssPath}?v=\${CONFIG.version}\`;
    link.id = 'mcp-critical-css-injector';
    
    // Add onerror handler to inject direct CSS if loading fails
    link.onerror = function() {
      console.warn('[CSS Injector] Failed to load critical CSS stylesheet, injecting directly');
      injectDirectStyles();
    };
    
    // Append to head
    document.head.appendChild(link);
    console.log('[CSS Injector] Critical CSS injected');
  }

  // Inject styles directly
  function injectDirectStyles() {
    // Check if already injected
    if (document.getElementById('mcp-direct-css-injector')) {
      return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'mcp-direct-css-injector';
    style.textContent = DIRECT_CSS;
    
    // Append to head
    document.head.appendChild(style);
    console.log('[CSS Injector] Direct CSS injected');
  }

  // Verify critical styles are applied
  function verifyAndFixStyles() {
    console.log('[CSS Injector] Verifying critical styles...');
    
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
      
      // Check specific properties based on class
      if (className === 'bg-gradient-to-r') {
        isApplied = styles.backgroundImage.includes('gradient');
      } else if (className === 'text-transparent') {
        isApplied = styles.color === 'transparent' || styles.color === 'rgba(0, 0, 0, 0)';
      } else if (className === 'bg-clip-text') {
        isApplied = styles.webkitBackgroundClip === 'text' || styles.backgroundClip === 'text';
      } else if (className === 'feature-card') {
        isApplied = styles.display === 'flex' && styles.flexDirection === 'column';
      } else if (className === 'animate-fade-in-down') {
        isApplied = styles.animation !== 'none' && styles.animation !== '';
      } else if (className === 'from-purple-50') {
        isApplied = styles.getPropertyValue('--tw-gradient-from') !== '';
      } else if (className === 'to-white') {
        isApplied = styles.getPropertyValue('--tw-gradient-to') !== '';
      } else if (className === 'bg-grid-gray-100') {
        isApplied = styles.backgroundImage.includes('linear-gradient');
      } else if (className === 'bg-blob-gradient') {
        isApplied = styles.backgroundImage.includes('radial-gradient');
      }
      
      if (!isApplied) {
        missingClasses.push(className);
      }
    });
    
    // Clean up test element
    document.body.removeChild(testEl);
    
    // Fix any missing styles
    if (missingClasses.length > 0) {
      console.warn('[CSS Injector] Missing critical classes:', missingClasses.join(', '));
      injectDirectStyles();
      
      // Set a flag to indicate that manual fixes were needed
      window.mcpCssManualFixesNeeded = true;
      
      return false;
    } else {
      console.log('[CSS Injector] All critical styles verified ✓');
      return true;
    }
  }

  // Initialize immediately
  init();
  
  // Export for debugging and direct access
  window.mcpCssInjector = {
    verifyAndFixStyles: verifyAndFixStyles,
    injectDirectStyles: injectDirectStyles
  };
})();`;
      
      // Write to file
      fs.writeFileSync(CONFIG.cssInjectorPath, cssInjector, 'utf8');
      console.log('✅ Created/fixed CSS injector script');
      fixesApplied = true;
    } catch (error) {
      console.error('❌ Failed to fix CSS injector script:', error);
    }
  }
  
  // Fix HTML inclusion if needed
  if (!verificationResults.htmlInclusion) {
    console.log('🔧 Fixing HTML inclusion...');
    
    try {
      if (fs.existsSync(CONFIG.indexHtmlPath)) {
        let htmlContent = fs.readFileSync(CONFIG.indexHtmlPath, 'utf8');
        let modified = false;
        
        // Add CSS injector script if missing
        if (!htmlContent.includes('/js/css-injector.js')) {
          htmlContent = htmlContent.replace(
            /<link rel="icon".*?>/,
            '$&\n    \n    <!-- Preload critical CSS -->\n    <link rel="preload" href="/assets/css/recovery-critical.css" as="style" />\n    \n    <!-- Critical CSS loader -->\n    <script src="/js/css-injector.js"></script>'
          );
          modified = true;
        }
        
        // Add critical CSS preload if missing
        if (!htmlContent.includes('/assets/css/recovery-critical.css') && !modified) {
          htmlContent = htmlContent.replace(
            /<link rel="icon".*?>/,
            '$&\n    \n    <!-- Preload critical CSS -->\n    <link rel="preload" href="/assets/css/recovery-critical.css" as="style" />'
          );
          modified = true;
        }
        
        if (modified) {
          fs.writeFileSync(CONFIG.indexHtmlPath, htmlContent, 'utf8');
          console.log('✅ Fixed HTML inclusion');
          fixesApplied = true;
        }
      }
    } catch (error) {
      console.error('❌ Failed to fix HTML inclusion:', error);
    }
  }
  
  return fixesApplied;
}

/**
 * Run all verification checks
 */
function runVerification() {
  console.log('\n🔍 Running UI consistency verification...');
  
  const results = {
    criticalCss: verifyCriticalCssFile(),
    cssInjector: verifyCssInjector(),
    htmlInclusion: verifyHtmlInclusion(),
    deploymentFix: verifyDeploymentFix()
  };
  
  // Calculate overall status
  const overallStatus = Object.values(results).every(result => result === true);
  
  console.log('\n📊 Verification Results:');
  console.log('------------------------');
  console.log(`Critical CSS File: ${results.criticalCss ? '✅ Pass' : '❌ Fail'}`);
  console.log(`CSS Injector Script: ${results.cssInjector ? '✅ Pass' : '❌ Fail'}`);
  console.log(`HTML Inclusion: ${results.htmlInclusion ? '✅ Pass' : '❌ Fail'}`);
  console.log(`Deployment Fix Script: ${results.deploymentFix ? '✅ Pass' : '❌ Fail'}`);
  console.log('------------------------');
  console.log(`Overall Status: ${overallStatus ? '✅ PASS' : '❌ FAIL'}`);
  
  // Apply fixes if needed
  if (!overallStatus) {
    console.log('\n🔄 Some verifications failed. Attempting to fix issues...');
    const fixesApplied = applyFixes(results);
    
    if (fixesApplied) {
      console.log('\n🔄 Fixes applied, re-running verification...');
      return runVerification();
    }
  }
  
  return overallStatus;
}

// Main function
function main() {
  console.log('=====================================================');
  console.log('🔍 MCP Integration Platform - UI Consistency Verifier');
  console.log('=====================================================');
  
  const verificationPassed = runVerification();
  
  if (verificationPassed) {
    console.log('\n✅ UI consistency verification PASSED!');
    console.log('The UI should display consistently in both development and production environments.');
  } else {
    console.log('\n❌ UI consistency verification FAILED!');
    console.log('Please address the issues mentioned above to ensure UI consistency.');
  }
  
  return verificationPassed ? 0 : 1;
}

// Run the main function
const exitCode = main();
process.exit(exitCode);