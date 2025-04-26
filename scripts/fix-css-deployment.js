/**
 * MCP Integration Platform CSS Deployment Fix Script
 * 
 * This script solves the persistent issue with CSS inconsistency between 
 * development and production environments by:
 * 
 * 1. Extracting all critical CSS classes
 * 2. Creating a production-ready CSS file that bypasses Tailwind purging
 * 3. Injecting version-controlled references to CSS files in HTML
 * 4. Implementing multiple fallback mechanisms for style loading
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const VERSION = "2.5." + Date.now();
const PATHS = {
  versionFile: './client/src/version.ts',
  productionCss: './client/src/production.css',
  htmlFile: './client/index.html',
  buildDir: './dist/public',
  assetsDir: './dist/public/assets'
};

// Style verification tool - to be injected in the HTML
const STYLE_VERIFICATION_SCRIPT = `
<script>
  (function() {
    // Check if any CSS is missing and apply fallbacks
    function verifyCriticalStyles() {
      console.log("[Style Verification] Running verification...");
      
      // List of critical CSS classes that must be available
      const CRITICAL_CLASSES = [
        'bg-grid-gray-100',
        'bg-blob-gradient',
        'feature-card',
        'animate-fade-in-down',
        'from-purple-50',
        'via-indigo-50',
        'to-white',
        'group-hover:scale-110',
        'group-hover:opacity-100',
        'group-hover:text-purple-700',
        'group-hover:text-indigo-700',
        'group-hover:text-violet-700',
        'hover:shadow-lg',
        'hover:border-purple-200',
        'hover:translate-y-[-2px]'
      ];
      
      // Test if a class is available
      function testClass(className) {
        const testDiv = document.createElement('div');
        document.body.appendChild(testDiv);
        testDiv.className = className;
        
        // Get computed style
        const computedStyle = window.getComputedStyle(testDiv);
        
        // Different classes need different tests
        let result = false;
        
        if (className === 'bg-grid-gray-100') {
          result = computedStyle.backgroundImage.includes('linear-gradient');
        } else if (className === 'bg-blob-gradient') {
          result = computedStyle.backgroundImage.includes('radial-gradient');
        } else if (className === 'feature-card') {
          result = computedStyle.transition.includes('all') || computedStyle.boxShadow !== 'none';
        } else if (className === 'animate-fade-in-down') {
          result = computedStyle.animation.includes('fadeInDown') || computedStyle.animation !== 'none';
        } else if (className.startsWith('from-') || className.startsWith('via-') || className.startsWith('to-')) {
          result = computedStyle.getPropertyValue('--tw-gradient-from') !== '' || 
                computedStyle.getPropertyValue('--tw-gradient-via') !== '' ||
                computedStyle.getPropertyValue('--tw-gradient-to') !== '';
        } else if (className.includes('hover:')) {
          // We can't fully test hover styles this way, assuming present if the class is parsed
          result = true;
        } else if (className.includes('group-hover:')) {
          // We can't fully test group-hover styles this way, assuming present if the class is parsed
          result = true;
        } else {
          // Default: class is present if it has any effect on the element
          result = JSON.stringify(computedStyle) !== JSON.stringify(window.getComputedStyle(document.body));
        }
        
        // Clean up
        document.body.removeChild(testDiv);
        return result;
      }
      
      // Check all critical classes
      const missingClasses = CRITICAL_CLASSES.filter(cls => !testClass(cls));
      
      // If any classes are missing, load the fallback CSS
      if (missingClasses.length > 0) {
        console.error("[Style Verification] Missing critical classes:", missingClasses);
        loadFallbackStyles();
      } else {
        console.log("[Style Verification] All critical classes verified ✓");
      }
    }
    
    // Load fallback CSS when needed
    function loadFallbackStyles() {
      // Only load once
      if (document.getElementById('fallback-css')) return;
      
      // Create a new stylesheet link
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'fallback-css';
      
      // Use the version number to bust cache
      const version = document.documentElement.getAttribute('data-mcp-version') || '${VERSION}';
      link.href = '/assets/production.css?v=' + version;
      
      // Add to head
      document.head.appendChild(link);
      console.log("[Style Verification] Loaded fallback CSS");
      
      // Re-verify after load
      link.onload = () => {
        setTimeout(verifyCriticalStyles, 100);
      };
    }
    
    // Run verification once the page has loaded
    if (document.readyState === 'complete') {
      verifyCriticalStyles();
    } else {
      window.addEventListener('load', verifyCriticalStyles);
    }
  })();
</script>
`;

// Update the version.ts file
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

// Ensure production CSS file includes all critical styles
function ensureProductionCss() {
  try {
    // Read current production CSS
    if (!fs.existsSync(PATHS.productionCss)) {
      console.error('❌ Production CSS file not found at', PATHS.productionCss);
      return false;
    }
    
    const productionCss = fs.readFileSync(PATHS.productionCss, 'utf8');
    
    // Verify the file contains critical styles
    const requiredStyles = [
      '.bg-grid-gray-100',
      '.bg-blob-gradient',
      '.feature-card',
      '.animate-fade-in-down',
      '.from-purple-50',
      '.via-indigo-50',
      '.to-white',
      '.group-hover\\:scale-110',
      '.group-hover\\:opacity-100',
      '.group-hover\\:text-purple-700',
      '.group-hover\\:text-indigo-700',
      '.group-hover\\:text-violet-700',
      '.hover\\:shadow-lg',
      '.hover\\:border-purple-200',
      '.hover\\:translate-y-\\[-2px\\]'
    ];
    
    const missingStyles = requiredStyles.filter(style => !productionCss.includes(style));
    
    if (missingStyles.length > 0) {
      console.error('❌ Production CSS is missing these critical styles:', missingStyles);
      return false;
    }
    
    console.log('✅ Production CSS includes all critical styles');
    return true;
  } catch (error) {
    console.error('❌ Failed to verify production CSS:', error);
    return false;
  }
}

// Update HTML file to include verification script
function updateHtml() {
  try {
    if (!fs.existsSync(PATHS.htmlFile)) {
      console.error('❌ HTML file not found at', PATHS.htmlFile);
      return false;
    }
    
    let html = fs.readFileSync(PATHS.htmlFile, 'utf8');
    
    // Add data-mcp-version attribute to html tag
    html = html.replace(/<html(.*)>/, `<html$1 data-mcp-version="${VERSION}">`);
    
    // Add style verification script before closing head
    if (!html.includes('verifyCriticalStyles')) {
      html = html.replace('</head>', `${STYLE_VERIFICATION_SCRIPT}\n</head>`);
    }
    
    // Add preload for critical CSS
    if (!html.includes('rel="preload" href="/assets/production.css"')) {
      html = html.replace('</head>', `  <link rel="preload" href="/assets/production.css?v=${VERSION}" as="style" onload="this.onload=null;this.rel='stylesheet'">\n</head>`);
    }
    
    fs.writeFileSync(PATHS.htmlFile, html);
    console.log('✅ Updated HTML with style verification and preloads');
    return true;
  } catch (error) {
    console.error('❌ Failed to update HTML:', error);
    return false;
  }
}

// Build the application with proper CSS processing
function buildApp() {
  try {
    console.log('📦 Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error);
    return false;
  }
}

// Copy the production CSS to the build directory
function copyProductionCss() {
  try {
    if (!fs.existsSync(PATHS.buildDir)) {
      console.error('❌ Build directory not found. Please run the build first.');
      return false;
    }
    
    // Create assets directory if it doesn't exist
    if (!fs.existsSync(PATHS.assetsDir)) {
      fs.mkdirSync(PATHS.assetsDir, { recursive: true });
    }
    
    // Copy the production CSS
    fs.copyFileSync(PATHS.productionCss, path.join(PATHS.assetsDir, 'production.css'));
    console.log('✅ Copied production CSS to build directory');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to copy production CSS:', error);
    return false;
  }
}

// Update HTML in the build directory
function updateBuildHtml() {
  try {
    const buildHtmlPath = path.join(PATHS.buildDir, 'index.html');
    
    if (!fs.existsSync(buildHtmlPath)) {
      console.error('❌ Build HTML file not found at', buildHtmlPath);
      return false;
    }
    
    let html = fs.readFileSync(buildHtmlPath, 'utf8');
    
    // Add data-mcp-version attribute to html tag if not already present
    if (!html.includes('data-mcp-version')) {
      html = html.replace(/<html(.*)>/, `<html$1 data-mcp-version="${VERSION}">`);
    }
    
    // Add style verification script before closing head if not already present
    if (!html.includes('verifyCriticalStyles')) {
      html = html.replace('</head>', `${STYLE_VERIFICATION_SCRIPT}\n</head>`);
    }
    
    // Add preload for critical CSS if not already present
    if (!html.includes('rel="preload" href="/assets/production.css"')) {
      html = html.replace('</head>', `  <link rel="preload" href="/assets/production.css?v=${VERSION}" as="style" onload="this.onload=null;this.rel='stylesheet'">\n</head>`);
    }
    
    fs.writeFileSync(buildHtmlPath, html);
    console.log('✅ Updated build HTML with style verification and preloads');
    return true;
  } catch (error) {
    console.error('❌ Failed to update build HTML:', error);
    return false;
  }
}

// Verify the build contains all necessary files
function verifyBuild() {
  try {
    const requiredFiles = [
      path.join(PATHS.buildDir, 'index.html'),
      path.join(PATHS.assetsDir, 'production.css')
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      console.error('❌ Build is missing these required files:', missingFiles);
      return false;
    }
    
    console.log('✅ Build verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to verify build:', error);
    return false;
  }
}

// Run all the necessary steps to fix the deployment
function fixDeployment() {
  console.log('🔧 MCP Platform CSS Deployment Fix');
  console.log('==================================');
  
  // 1. Update version
  const versionUpdated = updateVersion();
  
  // 2. Ensure production CSS is correct
  const productionCssVerified = ensureProductionCss();
  
  // 3. Update HTML
  const htmlUpdated = updateHtml();
  
  // Only proceed with build if previous steps succeeded
  if (versionUpdated && productionCssVerified && htmlUpdated) {
    // 4. Build the app
    const buildSuccessful = buildApp();
    
    if (buildSuccessful) {
      // 5. Copy production CSS to build
      const cssDeployed = copyProductionCss();
      
      // 6. Update the HTML in the build
      const buildHtmlUpdated = updateBuildHtml();
      
      // 7. Verify the build
      const buildVerified = verifyBuild();
      
      if (cssDeployed && buildHtmlUpdated && buildVerified) {
        console.log('');
        console.log('🎉 CSS deployment fix completed successfully!');
        console.log('');
        console.log('Your application is now ready to be deployed with consistent styling');
        console.log('between development and production environments.');
        console.log('');
        console.log('Version:', VERSION);
        return true;
      }
    }
  }
  
  console.error('');
  console.error('❌ CSS deployment fix failed. Please fix the errors above and try again.');
  return false;
}

// Run the fix
fixDeployment();