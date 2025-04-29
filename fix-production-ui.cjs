/**
 * MCP Integration Platform - Production UI Fix
 * 
 * This script addresses the UI rendering differences between development and production
 * by ensuring critical CSS is available in both environments.
 */

const fs = require('fs');
const path = require('path');

// Generate a version timestamp
const VERSION = `2.5.${Date.now()}`;

// File paths
const PATHS = {
  versionFile: './client/src/version.ts',
  mainTsx: './client/src/main.tsx',
  productionCss: './public/production.css',
  deployVerify: './public/deploy-verify.js'
};

// Create the version file
function createVersionFile() {
  const content = `/**
 * MCP Integration Platform Version Tracker
 * Auto-generated file - DO NOT EDIT MANUALLY
 */

export const VERSION = "${VERSION}";
export const TIMESTAMP = ${Date.now()};
export const PRODUCTION_READY = true;
`;

  // Ensure directory exists
  const dir = path.dirname(PATHS.versionFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(PATHS.versionFile, content);
  console.log(`✅ Created version file with timestamp ${Date.now()}`);
}

// Update main.tsx to import version and load production CSS
function updateMainTsx() {
  if (!fs.existsSync(PATHS.mainTsx)) {
    console.error('❌ main.tsx file not found');
    return false;
  }

  let content = fs.readFileSync(PATHS.mainTsx, 'utf8');

  // Add version import if it doesn't exist
  if (!content.includes('import { VERSION }')) {
    content = content.replace(
      /import ([^;]+)/,
      `import { VERSION } from './version';\nimport $1`
    );
  }

  // Add production CSS loading if not present
  if (!content.includes('if (import.meta.env.PROD)')) {
    const cssLoader = `
// Load production CSS in production environment
if (import.meta.env.PROD) {
  console.log('Production environment detected, loading critical CSS');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = \`/production.css?v=\${VERSION}\`;
  document.head.appendChild(link);
}
`;

    // Insert before the createRoot call
    content = content.replace(
      /createRoot\(document\.getElementById\("root"\)!\)\.render/,
      `${cssLoader}\n\ncreateRoot(document.getElementById("root")!).render`
    );
  }

  fs.writeFileSync(PATHS.mainTsx, content);
  console.log('✅ Updated main.tsx with production CSS loading');
  return true;
}

// Create production CSS file with critical styles
function createProductionCss() {
  const content = `/* MCP Integration Platform - Critical Production CSS (v${VERSION}) */

/* Core theme variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 263 70% 50%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 263 70% 50%;
  --radius: 0.5rem;
}

/* Base styles */
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  margin: 0;
  padding: 0;
}

/* Critical components */
.feature-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.feature-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #e9d5ff;
  transform: translateY(-2px);
}

/* Critical animations */
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
}

/* Gradient utilities */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-purple-50 {
  --tw-gradient-from: #faf5ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0));
}

.from-purple-600 {
  --tw-gradient-from: #9333ea;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0));
}

.to-indigo-600 {
  --tw-gradient-to: #4f46e5;
}

/* Background patterns */
.bg-grid-gray-100 {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}

.bg-blob-gradient {
  background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
  filter: blur(50px);
}`;

  // Ensure directory exists
  const dir = path.dirname(PATHS.productionCss);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(PATHS.productionCss, content);
  console.log('✅ Created production CSS file');
}

// Create deployment verification script
function createDeployVerify() {
  const content = `/**
 * MCP Integration Platform - CSS Verification and Recovery
 * This script verifies that all critical CSS classes are properly loaded
 * and recovers them if necessary.
 * 
 * Version: ${VERSION}
 */

(function() {
  // Only run in production
  if (window.location.hostname.includes('localhost') || window.location.hostname.includes('.replit.dev')) {
    console.log('[Deploy Verify] Development environment detected, verification not needed');
    return;
  }

  console.log('[Deploy Verify] Production environment detected, verifying CSS');

  // List of critical CSS classes to verify
  const criticalClasses = [
    'feature-card',
    'animate-fade-in-down',
    'bg-gradient-to-r',
    'bg-grid-gray-100',
    'bg-blob-gradient'
  ];

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(verifyCss, 500);
  });

  function verifyCss() {
    console.log('[Deploy Verify] Checking critical CSS classes');
    
    // Create test element
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    testDiv.style.pointerEvents = 'none';
    testDiv.style.left = '-9999px';
    document.body.appendChild(testDiv);
    
    // Check each class
    const missingClasses = [];
    
    criticalClasses.forEach(className => {
      testDiv.className = className;
      const style = window.getComputedStyle(testDiv);
      
      // Simple detection logic for each class
      let isStyled = false;
      switch (className) {
        case 'feature-card':
          isStyled = style.backgroundColor === 'rgb(255, 255, 255)' &&
                    style.borderRadius !== '0px';
          break;
        case 'animate-fade-in-down':
          isStyled = style.animationName !== 'none';
          break;
        case 'bg-gradient-to-r':
          isStyled = style.backgroundImage.includes('linear-gradient');
          break;
        case 'bg-grid-gray-100':
        case 'bg-blob-gradient':
          isStyled = style.backgroundImage !== 'none';
          break;
        default:
          isStyled = style.color !== 'rgb(0, 0, 0)' ||
                    style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      }
      
      if (!isStyled) {
        missingClasses.push(className);
      }
    });
    
    // Clean up test element
    document.body.removeChild(testDiv);
    
    // Report results
    if (missingClasses.length > 0) {
      console.warn('[Deploy Verify] Missing CSS classes:', missingClasses);
      recoverCss(missingClasses);
    } else {
      console.log('[Deploy Verify] All critical CSS classes verified ✓');
    }
  }

  function recoverCss(missingClasses) {
    console.log('[Deploy Verify] Recovering missing CSS classes');
    
    // Only inject if we have missing classes
    if (missingClasses.length === 0) return;
    
    // Create emergency styles
    const style = document.createElement('style');
    style.id = 'mcp-emergency-css';
    style.textContent = \`
    /* MCP Emergency CSS Recovery - Version ${VERSION} */
    .feature-card {
      background-color: white !important;
      padding: 1.5rem !important;
      border-radius: 0.5rem !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #f3f4f6 !important;
      transition: all 0.3s ease !important;
    }
    
    .feature-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      border-color: #e9d5ff !important;
      transform: translateY(-2px) !important;
    }
    
    @keyframes mcp-fade-in-down {
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
      animation: mcp-fade-in-down 0.5s ease-out !important;
    }
    
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    
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
    \`;
    
    document.head.appendChild(style);
    console.log('[Deploy Verify] Emergency CSS recovery applied ✓');
  }
})();`;

  // Ensure directory exists
  const dir = path.dirname(PATHS.deployVerify);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(PATHS.deployVerify, content);
  console.log('✅ Created deployment verification script');
}

// Update index.html to load deployment verification script
function updateIndexHtml() {
  const indexPath = './client/index.html';
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html file not found');
    return false;
  }

  let content = fs.readFileSync(indexPath, 'utf8');

  // Add deploy-verify.js script if not present
  if (!content.includes('deploy-verify.js')) {
    content = content.replace(
      '</head>',
      `  <script src="/deploy-verify.js?v=${Date.now()}"></script>\n  </head>`
    );
  }

  // Add version attribute to html tag
  if (!content.includes('data-mcp-version')) {
    content = content.replace(
      '<html lang="en">',
      `<html lang="en" data-mcp-version="${VERSION}">`
    );
  }

  fs.writeFileSync(indexPath, content);
  console.log('✅ Updated index.html with deployment verification');
  return true;
}

// Run all functions
function main() {
  console.log('🔧 Starting production UI fix');
  createVersionFile();
  updateMainTsx();
  createProductionCss();
  createDeployVerify();
  updateIndexHtml();
  console.log('✅ Production UI fix complete!');
}

main();