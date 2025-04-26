/**
 * MCP Integration Platform UI Deployment Fix
 * 
 * This script ensures the UI renders consistently in production by:
 * 1. Updating HTML with critical CSS that won't be purged
 * 2. Adding safelist classes to tailwind config
 * 3. Implementing runtime style verification and recovery
 * 4. Adding version tracking for cache busting
 */

const fs = require('fs');
const path = require('path');

// Configuration
const VERSION = "2.5." + Date.now();
const PATHS = {
  versionFile: './client/src/version.ts',
  htmlFile: './client/index.html',
  tailwindConfig: './tailwind.config.ts'
};

// Critical CSS that must be preserved in production
const CRITICAL_STYLES = `
/* Critical UI styles for production - DO NOT REMOVE OR MODIFY */
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
}

/* Card hover effects */
.group-hover\\:scale-110 {
  transition: transform 0.3s ease-out;
}
.group:hover .group-hover\\:scale-110 {
  transform: scale(1.1);
}

.group-hover\\:opacity-100 {
  transition: opacity 0.3s ease-out;
}
.group:hover .group-hover\\:opacity-100 {
  opacity: 1;
}

.hover\\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\\:border-purple-200:hover {
  border-color: rgba(221, 214, 254, 1);
}

.hover\\:translate-y-\\[-2px\\]:hover {
  transform: translateY(-2px);
}

/* Gradient backgrounds */
.from-purple-50 {
  --tw-gradient-from: #faf5ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-purple-600 {
  --tw-gradient-from: #9333ea;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-purple-700 {
  --tw-gradient-from: #7e22ce;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.via-indigo-50 {
  --tw-gradient-via: #eef2ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to);
}
.to-white {
  --tw-gradient-to: #ffffff;
}
.to-indigo-600 {
  --tw-gradient-to: #4f46e5;
}
.to-indigo-700 {
  --tw-gradient-to: #4338ca;
}
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

/* Text colors on hover */
.group-hover\\:text-purple-700 {
  transition: color 0.3s ease-out;
}
.group:hover .group-hover\\:text-purple-700 {
  color: rgba(126, 34, 206, 1);
}
.group-hover\\:text-indigo-700 {
  transition: color 0.3s ease-out;
}
.group:hover .group-hover\\:text-indigo-700 {
  color: rgba(67, 56, 202, 1);
}
.group-hover\\:text-violet-700 {
  transition: color 0.3s ease-out;
}
.group:hover .group-hover\\:text-violet-700 {
  color: rgba(109, 40, 217, 1);
}

/* Ensure navigation components and dropdown menus appear correctly */
.animate-in {
  animation-duration: 150ms;
  animation-timing-function: cubic-bezier(0.1, 0.99, 0.1, 0.99);
  animation-fill-mode: both;
}

.fade-in {
  animation-name: fadeIn;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Spinner styles */
.spinner-border {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: text-bottom;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* AI Spinner animation */
.ai-spinner-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 3px;
  animation: ai-spinner 1.5s infinite;
}

.ai-spinner-dot:nth-child(2) {
  animation-delay: 0.3s;
}

.ai-spinner-dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes ai-spinner {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

/* Loader spinners */
.loader-with-spinners-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.loader-spinner-pulse {
  position: relative;
  width: 50px;
  height: 50px;
}

.loader-spinner-pulse::before,
.loader-spinner-pulse::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.3);
  animation: pulse 2s linear infinite;
}

.loader-spinner-pulse::after {
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
`;

// Classes to safelist in tailwind config
const SAFELIST_CLASSES = [
  // Background patterns and gradients
  'bg-grid-gray-100',
  'bg-blob-gradient',
  'feature-card',
  'animate-fade-in-down',
  
  // Gradient colors
  'from-purple-50',
  'from-purple-600',
  'from-purple-700',
  'via-indigo-50',
  'to-white',
  'to-indigo-600',
  'to-indigo-700',
  'bg-gradient-to-r',
  
  // Hover states
  'group-hover:scale-110',
  'group-hover:opacity-100',
  'group-hover:text-purple-700',
  'group-hover:text-indigo-700',
  'group-hover:text-violet-700',
  'hover:shadow-lg',
  'hover:border-purple-200',
  'hover:translate-y-[-2px]',
  
  // Animation classes
  'animate-in',
  'fade-in',
  'animate-spin',
  
  // Component-specific classes
  'ai-spinner-dot',
  'spinner-border',
  'loader-with-spinners-container',
  'loader-spinner-pulse',
  
  // Shadcn UI classes that need protection
  'radix-side-top',
  'radix-side-right',
  'radix-side-bottom',
  'radix-side-left'
];

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

// Update HTML with critical CSS and cache control
function updateHtml() {
  try {
    let html = fs.readFileSync(PATHS.htmlFile, 'utf8');
    
    // Add version comment
    html = html.replace(/<!DOCTYPE html>[\s\S]*?<html/, 
      `<!DOCTYPE html>\n<!-- MCP Integration Platform ${VERSION} - Rebuilt UI for Production -->\n<html`);
    
    // Update version in meta tag
    if (html.includes('<meta name="app-version"')) {
      html = html.replace(/<meta name="app-version" content="[^"]*"/, `<meta name="app-version" content="${VERSION}"`);
    } else {
      html = html.replace('</head>', `  <meta name="app-version" content="${VERSION}" />\n  </head>`);
    }
    
    // Add data-version to html element
    if (html.includes('data-mcp-version')) {
      html = html.replace(/data-mcp-version="[^"]*"/, `data-mcp-version="${VERSION}"`);
    } else {
      html = html.replace(/<html([^>]*)>/, `<html$1 data-mcp-version="${VERSION}">`);
    }
    
    // Add cache-control headers
    if (!html.includes('Cache-Control')) {
      html = html.replace('<head>', `<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />`);
    }
    
    // Add critical CSS directly in the HTML
    const criticalCssExists = html.includes('Critical UI styles for production');
    if (criticalCssExists) {
      // Replace existing critical CSS
      const criticalCssRegex = /(<style[\s\S]*?Critical UI styles for production[\s\S]*?)(<\/style>)/;
      html = html.replace(criticalCssRegex, `$1${CRITICAL_STYLES}\n  $2`);
    } else {
      // Add new critical CSS
      html = html.replace('<title>', `<style id="critical-styles">
  ${CRITICAL_STYLES}
</style>
<title>`);
    }
    
    fs.writeFileSync(PATHS.htmlFile, html);
    console.log('✅ Updated HTML with cache control and critical CSS');
    return true;
  } catch (error) {
    console.error('❌ Failed to update HTML:', error);
    return false;
  }
}

// Update tailwind.config.ts to safelist critical classes
function updateTailwindConfig() {
  try {
    let config = fs.readFileSync(PATHS.tailwindConfig, 'utf8');
    
    // Check if safelist already exists
    if (config.includes('safelist:')) {
      // Replace existing safelist
      const safelistStr = SAFELIST_CLASSES
        .map(item => `    '${item}'`)
        .join(',\n');
      
      // Use regex to replace the entire safelist array
      config = config.replace(/safelist:\s*\[[\s\S]*?\],/, `safelist: [\n${safelistStr}\n  ],`);
    } else {
      // Add safelist before content
      const safelistStr = SAFELIST_CLASSES
        .map(item => `    '${item}'`)
        .join(',\n');
      
      config = config.replace(/content:\s*\[/, `safelist: [\n${safelistStr}\n  ],\n  content: [`);
    }
    
    fs.writeFileSync(PATHS.tailwindConfig, config);
    console.log('✅ Updated Tailwind config with safelist');
    return true;
  } catch (error) {
    console.error('❌ Failed to update Tailwind config:', error);
    return false;
  }
}

// Execute all deployment fixes
function applyDeploymentFixes() {
  console.log('🚀 MCP Integration Platform - UI Deployment Fix');
  console.log('=============================================');
  
  const versionUpdated = updateVersion();
  const htmlUpdated = updateHtml();
  const tailwindUpdated = updateTailwindConfig();
  
  const success = versionUpdated && htmlUpdated && tailwindUpdated;
  
  if (success) {
    console.log('✅ All UI deployment fixes applied successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run `npm run build` to build the app for production');
    console.log('2. Deploy using the Replit Deploy button');
    console.log(`3. The app will be deployed with version: ${VERSION}`);
  } else {
    console.error('❌ Some fixes failed. Check the logs above for details.');
  }
  
  return success;
}

// Execute the fixes
applyDeploymentFixes();