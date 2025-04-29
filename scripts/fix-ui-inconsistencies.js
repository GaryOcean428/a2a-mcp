/**
 * MCP Integration Platform - UI Consistency Fix Script
 * 
 * This script detects and fixes UI inconsistencies between development and production
 * environments by:
 * 
 * 1. Creating a production-ready CSS bundle that preserves critical classes
 * 2. Adding runtime verification to detect and recover from missing styles
 * 3. Injecting inline critical CSS for immediate rendering
 * 4. Fixing MIME type issues that can cause blank pages
 * 5. Adding cache busting for CSS and JS assets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  distDir: path.resolve(__dirname, '../dist'),
  clientSrcDir: path.resolve(__dirname, '../client/src'),
  publicDir: path.resolve(__dirname, '../public'),
  criticalClasses: [
    // Layout classes
    'flex', 'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'md:grid-cols-2', 
    'lg:grid-cols-3', 'gap-4', 'p-4', 'py-8', 'px-4', 'm-4', 'mx-auto', 'my-8',
    
    // Component classes
    'bg-white', 'bg-gray-50', 'bg-purple-50', 'bg-purple-100', 'bg-indigo-50',
    'text-gray-500', 'text-gray-700', 'text-purple-600', 'text-indigo-600',
    'rounded-lg', 'shadow-sm', 'shadow-md', 'shadow-lg', 'border', 'border-gray-200',
    
    // Animation classes
    'animate-fade-in-down', 'animate-spin', 'transition-all', 'duration-300', 'ease-in-out',
    
    // Interactive classes
    'hover:shadow-lg', 'hover:border-purple-200', 'hover:translate-y-[-2px]',
    'focus:ring-2', 'focus:ring-purple-600', 'focus:outline-none',
    
    // Background patterns
    'bg-grid-gray-100', 'bg-blob-gradient', 'bg-gradient-to-r',
    'from-purple-50', 'to-white', 'via-indigo-50'
  ],
  mimeTypes: {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  }
};

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Generate version timestamp for cache busting
 */
function generateVersion() {
  return Date.now().toString();
}

/**
 * Create a production-ready CSS file with critical classes
 */
function createProductionCss() {
  console.log('\nCreating production CSS file...');
  
  const version = generateVersion();
  const productionCssPath = path.join(config.publicDir, 'production.css');
  
  // Basic styles for critical elements
  let criticalCss = `
/* MCP Integration Platform Production CSS - v${version} */

/* Critical base styles */
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #f9fafb;
  color: #111827;
}

/* Layout utilities */
.flex { display: flex; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.gap-4 { gap: 1rem; }
.p-4 { padding: 1rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.m-4 { margin: 1rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.my-8 { margin-top: 2rem; margin-bottom: 2rem; }

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

/* Component styles */
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-purple-50 { background-color: #f5f3ff; }
.bg-purple-100 { background-color: #ede9fe; }
.bg-indigo-50 { background-color: #eef2ff; }

.text-gray-500 { color: #6b7280; }
.text-gray-700 { color: #374151; }
.text-purple-600 { color: #7c3aed; }
.text-indigo-600 { color: #4f46e5; }

.rounded-lg { border-radius: 0.5rem; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.border { border-width: 1px; }
.border-gray-200 { border-color: #e5e7eb; }

/* Animation styles */
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

.animate-fade-in-down { animation: fadeInDown 0.5s ease-out; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin { animation: spin 1s linear infinite; }
.transition-all { transition-property: all; }
.duration-300 { transition-duration: 300ms; }
.ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }

/* Interactive styles */
.hover\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.hover\:border-purple-200:hover { border-color: #ddd6fe; }
.hover\:translate-y-\[-2px\]:hover { transform: translateY(-2px); }
.focus\:ring-2:focus { box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.5); }
.focus\:ring-purple-600:focus { box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.5); }
.focus\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }

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
}

.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.from-purple-50 { --tw-gradient-from: #f5f3ff; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(245, 243, 255, 0)); }
.to-white { --tw-gradient-to: #ffffff; }
.via-indigo-50 { --tw-gradient-stops: var(--tw-gradient-from), #eef2ff, var(--tw-gradient-to, rgba(238, 242, 255, 0)); }
`;

  // Generate the production CSS file
  fs.writeFileSync(productionCssPath, criticalCss, 'utf8');
  console.log(`Created production CSS file: ${productionCssPath}`);
  
  return {
    path: productionCssPath,
    version
  };
}

/**
 * Update HTML files to include production CSS and add cache busting
 */
function updateHtmlFiles(cssInfo) {
  console.log('\nUpdating HTML files with production CSS...');
  
  const version = cssInfo.version;
  const htmlFiles = [
    path.join(config.distDir, 'index.html'),
    path.join(config.clientSrcDir, 'index.html')
  ];
  
  for (const htmlFile of htmlFiles) {
    if (fs.existsSync(htmlFile)) {
      let html = fs.readFileSync(htmlFile, 'utf8');
      
      // Add link to production CSS with cache busting
      if (!html.includes('production.css')) {
        const cssLink = `<link rel="stylesheet" href="/production.css?v=${version}">`;
        html = html.replace('</head>', `  ${cssLink}\n</head>`);
      }
      
      // Add cache busting to existing assets
      html = html.replace(/(\.js|\.css)(\")/g, `$1?v=${version}$2`);
      
      // Add MIME type verification script
      const mimeScript = `
  <script>
    // Verify and fix MIME types
    (function() {
      function checkCSS() {
        const testElement = document.createElement('div');
        testElement.className = 'animate-fade-in-down';
        document.body.appendChild(testElement);
        
        const styles = window.getComputedStyle(testElement);
        const hasAnimation = styles.animationName !== 'none';
        
        if (!hasAnimation) {
          console.warn('Critical CSS not loaded correctly, applying fallback...');
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = '/production.css?v=${version}&fallback=1';
          document.head.appendChild(link);
        }
        
        setTimeout(() => testElement.remove(), 1000);
      }
      
      // Wait for DOM to be fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkCSS);
      } else {
        checkCSS();
      }
    })();
  </script>
`;
      
      // Add the verification script before the closing body tag
      html = html.replace('</body>', `${mimeScript}\n</body>`);
      
      // Write the updated HTML
      fs.writeFileSync(htmlFile, html, 'utf8');
      console.log(`Updated HTML file: ${htmlFile}`);
    }
  }
}

/**
 * Copy production CSS to the dist directory
 */
function copyProductionCssToDist(cssInfo) {
  console.log('\nCopying production CSS to dist directory...');
  
  // Ensure dist directory exists
  ensureDirectoryExists(config.distDir);
  
  const targetPath = path.join(config.distDir, 'production.css');
  fs.copyFileSync(cssInfo.path, targetPath);
  console.log(`Copied production CSS to: ${targetPath}`);
}

/**
 * Create a server middleware file for setting correct MIME types
 */
function createMimeTypeMiddleware() {
  console.log('\nCreating MIME type middleware...');
  
  const middlewarePath = path.join(__dirname, '../server/middleware/mime-types.ts');
  const middlewareDir = path.dirname(middlewarePath);
  
  // Create middleware directory if it doesn't exist
  ensureDirectoryExists(middlewareDir);
  
  const middlewareContent = `
/**
 * MIME Type Middleware
 * 
 * This middleware ensures correct Content-Type headers are set for all static files
 * to prevent MIME type errors in production.
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';

// MIME type mapping
const mimeTypes: Record<string, string> = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

/**
 * Set proper MIME types for all static files to prevent browser MIME type errors
 */
export function mimeTypeMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path.includes('.')) {
    const ext = path.extname(req.path).toLowerCase();
    if (mimeTypes[ext]) {
      res.type(mimeTypes[ext]);
    }
  }
  next();
}
  `;
  
  fs.writeFileSync(middlewarePath, middlewareContent, 'utf8');
  console.log(`Created MIME type middleware: ${middlewarePath}`);
  
  // Now add an import to the server/index.ts file if it doesn't already have it
  try {
    const serverIndexPath = path.join(__dirname, '../server/index.ts');
    if (fs.existsSync(serverIndexPath)) {
      let serverContent = fs.readFileSync(serverIndexPath, 'utf8');
      
      if (!serverContent.includes('mime-types')) {
        // Add import statement
        const importLine = "import { mimeTypeMiddleware } from './middleware/mime-types';";
        serverContent = serverContent.replace(
          'import express',
          `${importLine}\nimport express`
        );
        
        // Add middleware usage
        const middlewareLine = 'app.use(mimeTypeMiddleware);';
        serverContent = serverContent.replace(
          'app.use(express.json());',
          `app.use(express.json());\n${middlewareLine}`
        );
        
        fs.writeFileSync(serverIndexPath, serverContent, 'utf8');
        console.log(`Updated server/index.ts to use MIME type middleware`);
      }
    }
  } catch (error) {
    console.warn('Could not update server/index.ts:', error.message);
  }
}

/**
 * Main function to execute all fixes
 */
function fixUiInconsistencies() {
  console.log('MCP Integration Platform - UI Consistency Fix Script');
  console.log('='.repeat(60));
  
  // Generate production CSS
  const cssInfo = createProductionCss();
  
  // Update HTML files with production CSS and cache busting
  updateHtmlFiles(cssInfo);
  
  // Copy production CSS to dist directory
  copyProductionCssToDist(cssInfo);
  
  // Create MIME type middleware
  createMimeTypeMiddleware();
  
  console.log('\n='.repeat(60));
  console.log('UI consistency fixes applied successfully!');
  console.log('Version:', cssInfo.version);
}

// Execute all fixes
fixUiInconsistencies();
