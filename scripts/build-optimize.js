/**
 * MCP Integration Platform - Build Optimization Script
 * 
 * This script optimizes the build process by ensuring proper file organization,
 * preventing duplication, and ensuring critical CSS and verification scripts
 * are properly included in the build.
 * 
 * Key features:
 * - Consolidates CSS files to prevent duplication
 * - Ensures critical CSS is inlined in HTML
 * - Updates paths to use the new organization structure
 * - Ensures verification scripts are properly included
 * - Handles cache busting with proper versioning
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  timestamp: Date.now(),
  version: `1.0.0-${Date.now()}`,
  directories: {
    public: './public',
    assets: './public/assets',
    css: './public/assets/css',
    js: './public/assets/js',
    client: './client',
    clientPublic: './client/public',
    dist: './dist'
  }
};

/**
 * Create necessary directories if they don't exist
 */
function createDirectories() {
  console.log('Creating necessary directories...');
  
  Object.values(CONFIG.directories).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
  
  // Create JS directory inside assets if it doesn't exist
  if (!fs.existsSync(CONFIG.directories.js)) {
    fs.mkdirSync(CONFIG.directories.js, { recursive: true });
    console.log(`✓ Created directory: ${CONFIG.directories.js}`);
  }
}

/**
 * Update the version file with a consistent timestamp for cache busting
 */
function updateVersionFile() {
  console.log('Updating version file...');
  
  const versionFilePath = path.join(CONFIG.directories.client, 'src/version.ts');
  const versionContent = `/**
 * MCP Integration Platform Version
 * Used for cache busting and debugging
 */

// Current version with timestamp for cache busting
export const version = "${CONFIG.version}";

// Export a helper function for cache busting URLs
export function addVersionToUrl(url) {
  const separator = url.includes('?') ? '&' : '?';
  return \`\${url}\${separator}v=\${version}\`;
}
`;
  
  fs.writeFileSync(versionFilePath, versionContent, 'utf8');
  console.log(`✓ Updated version file with timestamp: ${CONFIG.timestamp}`);
}

/**
 * Copy and organize verification scripts
 */
function organizeVerificationScripts() {
  console.log('Organizing verification scripts...');
  
  // Copy our consolidated verification script to JS directory
  const sourceVerificationScript = path.join(CONFIG.directories.public, 'css-verification.js');
  const destVerificationScript = path.join(CONFIG.directories.js, 'verification.js');
  
  if (fs.existsSync(sourceVerificationScript)) {
    fs.copyFileSync(sourceVerificationScript, destVerificationScript);
    console.log(`✓ Copied verification script to: ${destVerificationScript}`);
  } else {
    console.log(`Warning: Verification script not found at ${sourceVerificationScript}`);
  }
  
  // Remove old duplicate verification scripts
  const oldScripts = [
    path.join(CONFIG.directories.public, 'deploy-verify.js'),
    path.join(CONFIG.directories.public, 'css-verify.js'),
    path.join(CONFIG.directories.clientPublic, 'deploy-verify.js')
  ];
  
  oldScripts.forEach(script => {
    if (fs.existsSync(script)) {
      fs.unlinkSync(script);
      console.log(`✓ Removed deprecated script: ${script}`);
    }
  });
}

/**
 * Organize CSS files
 */
function organizeCssFiles() {
  console.log('Organizing CSS files...');
  
  // Rename the consolidated CSS file with version
  const sourceCssFile = path.join(CONFIG.directories.css, 'recovery.css');
  const destCssFile = path.join(CONFIG.directories.css, `recovery-${CONFIG.timestamp}.css`);
  
  if (fs.existsSync(sourceCssFile)) {
    // Copy with version in the filename
    fs.copyFileSync(sourceCssFile, destCssFile);
    console.log(`✓ Created versioned CSS file: ${destCssFile}`);
  } else {
    console.log(`Warning: Recovery CSS file not found at ${sourceCssFile}`);
  }
  
  // Remove old duplicate CSS files
  const oldCssFiles = [
    path.join(CONFIG.directories.public, 'critical.css'),
    path.join(CONFIG.directories.public, 'production.css')
  ];
  
  oldCssFiles.forEach(cssFile => {
    if (fs.existsSync(cssFile)) {
      fs.unlinkSync(cssFile);
      console.log(`✓ Removed deprecated CSS file: ${cssFile}`);
    }
  });
}

/**
 * Update HTML with critical CSS and proper script references
 */
function updateHtml() {
  console.log('Updating HTML with critical CSS and script references...');
  
  const htmlFilePath = path.join(CONFIG.directories.client, 'index.html');
  
  if (!fs.existsSync(htmlFilePath)) {
    console.log(`Warning: HTML file not found at ${htmlFilePath}`);
    return;
  }
  
  let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  // Extract the existing head content
  const headMatch = htmlContent.match(/<head>([\s\S]*?)<\/head>/);
  const headContent = headMatch ? headMatch[1] : '';
  
  // Check if we already have critical CSS
  const hasCriticalStyles = headContent.includes('<!-- Critical styles for immediate rendering -->');
  
  if (!hasCriticalStyles) {
    // Use a smaller subset of critical CSS to inline in the HTML
    const criticalInlineCSS = `
    <!-- Critical styles for immediate rendering -->
    <style id="mcp-critical-css">
      :root {
        --background: 0 0% 100%;
        --foreground: 222.2 84% 4.9%;
        --card: 0 0% 100%;
        --card-foreground: 222.2 84% 4.9%;
        --primary: 263 70% 50%;
        --primary-foreground: 210 40% 98%;
        --mcp-max-width: 1200px;
        --mcp-content-padding: 2rem;
        --mcp-border-radius: 0.5rem;
        --mcp-transition-duration: 300ms;
      }
      
      /* Responsive container for layout */
      .mcp-container {
        width: 100%;
        max-width: var(--mcp-max-width);
        margin-left: auto;
        margin-right: auto;
        padding-left: var(--mcp-content-padding);
        padding-right: var(--mcp-content-padding);
      }
      
      /* Basic loading styles */
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        height: 100vh;
        width: 100%;
      }
      
      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: hsl(var(--primary));
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>`;
    
    // Add critical CSS right after the <head> tag
    htmlContent = htmlContent.replace(
      '<head>',
      `<head>${criticalInlineCSS}`
    );
    
    console.log('✓ Added critical inline CSS to HTML');
  }
  
  // Update verification script reference if needed
  if (htmlContent.includes('deploy-verify.js') || htmlContent.includes('css-verify.js')) {
    // Replace with our consolidated verification script
    htmlContent = htmlContent.replace(
      /<script[^>]*src=["\']\/(?:deploy-verify\.js|css-verify\.js)[\"\']+[^>]*><\/script>/g,
      `<script src="/assets/js/verification.js?v=${CONFIG.timestamp}"></script>`
    );
    
    console.log('✓ Updated verification script reference in HTML');
  } else if (!htmlContent.includes('/assets/js/verification.js')) {
    // Add verification script if it doesn't exist
    htmlContent = htmlContent.replace(
      '</head>',
      `  <script src="/assets/js/verification.js?v=${CONFIG.timestamp}"></script>\n  </head>`
    );
    
    console.log('✓ Added verification script reference to HTML');
  }
  
  // Update recovery CSS reference
  if (htmlContent.includes('production.css') || htmlContent.includes('critical.css')) {
    // Replace with our consolidated recovery CSS
    htmlContent = htmlContent.replace(
      /<link[^>]*href=["\']\/(?:production\.css|critical\.css)[\"\']+[^>]*>/g,
      `<link rel="stylesheet" href="/assets/css/recovery-${CONFIG.timestamp}.css">`
    );
    
    console.log('✓ Updated recovery CSS reference in HTML');
  } else if (!htmlContent.includes('/assets/css/recovery')) {
    // Add recovery CSS link if it doesn't exist
    htmlContent = htmlContent.replace(
      '</head>',
      `  <link rel="stylesheet" href="/assets/css/recovery-${CONFIG.timestamp}.css">\n  </head>`
    );
    
    console.log('✓ Added recovery CSS reference to HTML');
  }
  
  // Update data-version attributes
  htmlContent = htmlContent.replace(
    /data-mcp-version="[^"]*"/g,
    `data-mcp-version="${CONFIG.version}"`
  );
  
  // Save the updated HTML
  fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  console.log('✓ Updated HTML file saved');
}

/**
 * Run the complete build optimization process
 */
function optimizeBuild() {
  console.log('Starting build optimization process...');
  console.log(`Timestamp: ${CONFIG.timestamp}`);
  console.log(`Version: ${CONFIG.version}`);
  console.log('-----------------------------------');
  
  // Create necessary directories
  createDirectories();
  
  // Update version file
  updateVersionFile();
  
  // Organize verification scripts
  organizeVerificationScripts();
  
  // Organize CSS files
  organizeCssFiles();
  
  // Update HTML with critical CSS and proper script references
  updateHtml();
  
  console.log('-----------------------------------');
  console.log('Build optimization completed successfully!');
  console.log('Codebase has been cleaned up and organized.');
}

// Run the optimization
optimizeBuild();
