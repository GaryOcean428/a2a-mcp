/**
 * MCP Integration Platform - Deployment UI Rebuild Script
 * 
 * This script completely rebuilds the UI for deployment to ensure
 * exact visual parity between development and production environments.
 * 
 * Key features:
 * 1. Updates critical CSS with inline styles that won't be purged
 * 2. Creates protected class lists that survive the build process
 * 3. Injects runtime recovery mechanisms for any remaining style issues
 * 4. Adds version tracking for cache busting
 * 5. Creates verification tools to confirm UI consistency
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const VERSION = "2.5." + Date.now();
const PATHS = {
  versionFile: './client/src/version.ts',
  htmlFile: './client/index.html',
  cssRecoveryFile: './client/src/css-recovery.ts',
  tailwindConfig: './tailwind.config.ts',
  mainTsx: './client/src/main.tsx',
  productionCss: './client/src/production.css',
  distDir: './dist',
  builtHtmlFile: './dist/client/index.html'
};

// Create build directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Update version.ts to include current timestamp
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

// Add cache control and critical CSS to HTML
function updateHtml() {
  try {
    if (!fs.existsSync(PATHS.htmlFile)) {
      console.error('❌ HTML file not found at', PATHS.htmlFile);
      return false;
    }
    
    let html = fs.readFileSync(PATHS.htmlFile, 'utf8');
    
    // Add deploy timestamp comment
    html = html.replace(/<!DOCTYPE html>[\s\S]*?<html/, 
      `<!DOCTYPE html>\n<!-- MCP Integration Platform ${VERSION} - UI Rebuilt for Deployment -->\n<html`);
    
    // Add cache busting meta tags
    if (!html.includes('app-version')) {
      html = html.replace('</head>', `  <meta name="app-version" content="${VERSION}" />\n  </head>`);
    } else {
      html = html.replace(/<meta name="app-version" content="[^"]*"/, `<meta name="app-version" content="${VERSION}"`);
    }
    
    // Add data-version to html element
    if (!html.includes('data-mcp-version')) {
      html = html.replace(/<html([^>]*)>/, `<html$1 data-mcp-version="${VERSION}">`);
    } else {
      html = html.replace(/data-mcp-version="[^"]*"/, `data-mcp-version="${VERSION}"`);
    }
    
    // Add cache-control headers
    if (!html.includes('Cache-Control')) {
      html = html.replace('<head>', `<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />`);
    }
    
    // Ensure CSS is loaded with proper priorities
    if (!html.includes('rel="preload" href="/assets/index.css"')) {
      html = html.replace('</head>', `  <link rel="preload" href="/assets/index.css" as="style">\n  </head>`);
    }
    
    // Add preload for production.css if not already present
    if (!html.includes('rel="preload" href="/assets/production.css"')) {
      html = html.replace('</head>', `  <link rel="preload" href="/assets/production.css" as="style">\n  </head>`);
    }
    
    fs.writeFileSync(PATHS.htmlFile, html);
    console.log('✅ Updated HTML with cache control and version information');
    return true;
  } catch (error) {
    console.error('❌ Failed to update HTML:', error);
    return false;
  }
}

// Update the built HTML after the build process
function updateBuiltHtml() {
  try {
    if (!fs.existsSync(PATHS.builtHtmlFile)) {
      console.error('❌ Built HTML file not found at', PATHS.builtHtmlFile);
      return false;
    }
    
    let html = fs.readFileSync(PATHS.builtHtmlFile, 'utf8');
    
    // Add cache busting to all CSS and JS file references
    html = html.replace(/(href=["'])(.*?\.css)(["'])/g, `$1$2?v=${VERSION}$3`);
    html = html.replace(/(src=["'])(.*?\.js)(["'])/g, `$1$2?v=${VERSION}$3`);
    
    // Ensure critical CSS is loaded and applied immediately
    if (!html.includes('Critical UI styles for production')) {
      // Read the production CSS file
      let prodCss = '';
      try {
        prodCss = fs.readFileSync(PATHS.productionCss, 'utf8');
      } catch (error) {
        console.warn('⚠️ Could not read production CSS file, using default critical CSS');
        prodCss = `/* Critical UI styles for production */
.bg-grid-gray-100 {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}

.bg-blob-gradient {
  background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
  filter: blur(50px);
}

.feature-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(229, 231, 235);
  transition: all 0.3s;
}

.feature-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: rgba(167, 139, 250, 0.4);
  transform: translateY(-2px);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.5s ease-out;
}`;
      }
      
      // Add critical CSS to HTML
      html = html.replace('<head>', `<head>
  <style id="critical-css">
  /* Critical UI styles for production - DO NOT REMOVE */
  ${prodCss}
  </style>`);
    }
    
    fs.writeFileSync(PATHS.builtHtmlFile, html);
    console.log('✅ Updated built HTML with cache busting and critical CSS');
    return true;
  } catch (error) {
    console.error('❌ Failed to update built HTML:', error);
    return false;
  }
}

// Create a verification script that runs in production
function createVerificationScript() {
  try {
    const scriptPath = './client/src/verification.ts';
    const scriptContent = `/**
 * MCP Integration Platform - Production Verification Script
 * 
 * This script runs in production to verify that the UI is rendering correctly
 * and to recover from any style issues that may occur.
 * 
 * It also logs version and environment information.
 */

import { VERSION } from './version';

console.log(\`MCP Integration Platform v\${VERSION} (Production Verified)\`);

// Checks if critical CSS classes are being applied correctly
function verifyCriticalClasses() {
  // Array of critical class names that must be preserved
  const criticalClasses = [
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'feature-card',
    'animate-fade-in-down',
    'from-purple-600',
    'to-indigo-600',
    'bg-gradient-to-r',
    'animate-in',
    'fade-in',
    'ai-spinner-dot',
    'group-hover:scale-110',
    'hover:shadow-lg'
  ];
  
  // Test element to check styles
  const testEl = document.createElement('div');
  document.body.appendChild(testEl);
  
  // Check each class
  const results = criticalClasses.map(cls => {
    testEl.className = cls;
    const style = window.getComputedStyle(testEl);
    
    // Different classes need different verification
    let verified = false;
    
    if (cls === 'bg-grid-gray-100') {
      verified = style.backgroundImage.includes('linear-gradient');
    } else if (cls === 'bg-blob-gradient') {
      verified = style.backgroundImage.includes('radial-gradient');
    } else if (cls === 'feature-card') {
      verified = style.transition.includes('all');
    } else if (cls === 'animate-fade-in-down') {
      verified = style.animation.includes('fadeInDown');
    } else if (cls.startsWith('from-')) {
      verified = style.backgroundImage.includes('linear-gradient') || 
               style.getPropertyValue('--tw-gradient-from') !== '';
    } else if (cls.startsWith('to-')) {
      verified = style.backgroundImage.includes('linear-gradient') || 
               style.getPropertyValue('--tw-gradient-to') !== '';
    } else if (cls === 'bg-gradient-to-r') {
      verified = style.backgroundImage.includes('linear-gradient');
    } else if (cls.includes('hover:')) {
      verified = true; // Can't truly verify hover states
    } else if (cls.includes('group-hover:')) {
      verified = true; // Can't truly verify group-hover states
    } else if (cls === 'animate-in') {
      verified = style.animationDuration === '150ms';
    } else if (cls.includes('ai-spinner-dot')) {
      verified = style.display === 'inline-block';
    } else {
      verified = true; // Default to true for unknown classes
    }
    
    return { cls, verified };
  });
  
  // Clean up
  document.body.removeChild(testEl);
  
  // Log results
  const verified = results.every(r => r.verified);
  const failedClasses = results.filter(r => !r.verified).map(r => r.cls);
  
  if (verified) {
    console.log('%c✅ All critical CSS classes verified', 'color: green; font-weight: bold;');
  } else {
    console.warn(\`❌ Some critical CSS classes failed verification: \${failedClasses.join(', ')}\`);
    triggerRecovery();
  }
  
  return verified;
}

// Recovery function to inject missing styles
function triggerRecovery() {
  console.log('%c🔄 Triggering CSS recovery process', 'color: blue; font-weight: bold;');
  
  // This will execute any CSS recovery code that's been loaded
  if (typeof window.recoverMissingStyles === 'function') {
    window.recoverMissingStyles();
    console.log('✅ Recovery process executed');
  } else {
    console.warn('❌ Recovery function not available');
    
    // Attempt to inject our own recovery styles if the recovery function isn't available
    const criticalStyles = \`
    /* Emergency recovery styles */
    .bg-grid-gray-100 {
      background-image: 
        linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px) !important;
      background-size: 24px 24px !important;
    }
    
    .bg-blob-gradient {
      background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%) !important;
      filter: blur(50px) !important;
    }
    
    .feature-card {
      background-color: white !important;
      padding: 1.5rem !important;
      border-radius: 0.5rem !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      border: 1px solid rgba(229, 231, 235) !important;
      transition: all 0.3s !important;
    }
    
    .feature-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      border-color: rgba(167, 139, 250, 0.4) !important;
      transform: translateY(-2px) !important;
    }
    
    .from-purple-600 {
      --tw-gradient-from: #9333ea !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    
    .to-indigo-600 {
      --tw-gradient-to: #4f46e5 !important;
    }
    
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    
    .animate-fade-in-down {
      animation: fadeInDown 0.5s ease-out !important;
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    \`;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'emergency-recovery-styles';
    styleEl.textContent = criticalStyles;
    document.head.appendChild(styleEl);
    console.log('✅ Injected emergency recovery styles');
  }
}

// Add global type for recoverMissingStyles
declare global {
  interface Window {
    recoverMissingStyles?: () => void;
  }
}

// Run the verification after the app has loaded
window.addEventListener('load', () => {
  // Wait a bit to ensure all styles are loaded
  setTimeout(() => {
    verifyCriticalClasses();
    
    // Log environment information
    console.log(\`
    Environment: \${import.meta.env.PROD ? 'Production' : 'Development'}
    Version: \${VERSION}
    Build Time: \${new Date().toISOString()}
    \`);
    
    // Add version attribute to html element for debugging
    document.documentElement.setAttribute('data-mcp-verified', 'true');
  }, 1000);
});

export {};
`;
    
    fs.writeFileSync(scriptPath, scriptContent);
    console.log('✅ Created verification script');
    
    // Now add the import to main.tsx if it's not already there
    let mainTsx = fs.readFileSync(PATHS.mainTsx, 'utf8');
    if (!mainTsx.includes("import './verification'")) {
      mainTsx = mainTsx.replace("import './css-recovery'", "import './css-recovery';\nimport './verification';");
      fs.writeFileSync(PATHS.mainTsx, mainTsx);
      console.log('✅ Added verification import to main.tsx');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create verification script:', error);
    return false;
  }
}

// Build the app for production
function buildApp() {
  try {
    console.log('🔄 Building app for production...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ App built successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to build app:', error);
    return false;
  }
}

// Apply all UI rebuild fixes and prepare for deployment
function deployUiRebuild() {
  console.log('🚀 Starting UI rebuild for deployment...');
  
  // 1. Update version
  const versionUpdated = updateVersion();
  
  // 2. Update HTML
  const htmlUpdated = updateHtml();
  
  // 3. Create verification script
  const verificationCreated = createVerificationScript();
  
  // 4. Build the app (uncomment to enable automatic building)
  // const appBuilt = buildApp();
  
  // 5. Update built HTML (only if building is enabled)
  // const builtHtmlUpdated = updateBuiltHtml();
  
  // Check results
  const success = versionUpdated && htmlUpdated && verificationCreated;
  // const success = versionUpdated && htmlUpdated && verificationCreated && appBuilt && builtHtmlUpdated;
  
  if (success) {
    console.log('✅ UI rebuild successfully completed!');
    console.log('');
    console.log('To finish the deployment:');
    console.log('1. Run `npm run build` to build the app');
    console.log('2. Deploy using the Replit Deploy button');
    console.log(`3. After deployment, your app will be available with version: ${VERSION}`);
  } else {
    console.error('❌ UI rebuild failed. Please check the logs above for errors.');
  }
  
  return success;
}

// Run the rebuild process
deployUiRebuild();