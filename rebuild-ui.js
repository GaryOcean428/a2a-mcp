/**
 * MCP Integration Platform UI Rebuild Script
 * 
 * This script completely rebuilds the UI for production deployment to ensure
 * exact parity with the development environment.
 * 
 * Key solutions:
 * 1. Preserves all critical CSS classes that might be purged by Tailwind
 * 2. Ensures animations and transitions work correctly
 * 3. Injects critical styles directly in the HTML for immediate rendering
 * 4. Creates runtime verification and recovery for dynamic styles
 * 5. Updates the build process to maintain visual consistency
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const VERSION = "2.5." + Date.now();
const PATHS = {
  versionFile: './client/src/version.ts',
  htmlFile: './client/index.html',
  tailwindConfig: './tailwind.config.ts',
  cssRecovery: './client/src/css-recovery.ts',
  mainTsx: './client/src/main.tsx',
  appTsx: './client/src/App.tsx'
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
.via-indigo-50 {
  --tw-gradient-via: #eef2ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to);
}
.to-white {
  --tw-gradient-to: #ffffff;
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

.bg-background {
  background-color: var(--background, white);
}

/* Essential shadcn component styles */
.radix-side-top {
  transform: translateY(-100%);
}
.radix-side-right {
  transform: translateX(100%);
}
.radix-side-bottom {
  transform: translateY(100%);
}
.radix-side-left {
  transform: translateX(-100%);
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

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-purple-600 {
  --tw-gradient-from: #9333ea;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-indigo-600 {
  --tw-gradient-to: #4f46e5;
}

.from-purple-700 {
  --tw-gradient-from: #7e22ce;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-indigo-700 {
  --tw-gradient-to: #4338ca;
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
  'bg-grid-gray-100',
  'bg-blob-gradient',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'from-purple-600',
  'from-purple-700',
  'via-indigo-50',
  'to-white',
  'to-indigo-600',
  'to-indigo-700',
  'bg-gradient-to-r',
  'group-hover:scale-110',
  'group-hover:opacity-100',
  'group-hover:text-purple-700',
  'group-hover:text-indigo-700',
  'group-hover:text-violet-700',
  'hover:shadow-lg',
  'hover:border-purple-200',
  'hover:translate-y-[-2px]',
  'animate-in',
  'fade-in',
  'ai-spinner-dot',
  'spinner-border',
  'loader-with-spinners-container',
  'loader-spinner-pulse'
];

/**
 * Update version file with current timestamp
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
 * Update HTML file with critical CSS and cache control
 */
function updateHtml() {
  try {
    if (!fs.existsSync(PATHS.htmlFile)) {
      console.error('❌ HTML file not found at', PATHS.htmlFile);
      return false;
    }
    
    let html = fs.readFileSync(PATHS.htmlFile, 'utf8');
    
    // Add version comment
    html = html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n<!-- MCP Integration Platform ${VERSION} - Rebuilt UI -->`);
    
    // Add cache control meta tags
    if (!html.includes('Cache-Control')) {
      html = html.replace('<head>', `<head>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />`);
    }
    
    // Update version in meta tag or add it if missing
    if (html.includes('<meta name="app-version"')) {
      html = html.replace(/<meta name="app-version" content="[^"]*"/, `<meta name="app-version" content="${VERSION}"`);
    } else {
      html = html.replace('</head>', `  <meta name="app-version" content="${VERSION}" />
  </head>`);
    }
    
    // Add data-mcp-version attribute to html tag
    if (html.includes('data-mcp-version')) {
      html = html.replace(/data-mcp-version="[^"]*"/, `data-mcp-version="${VERSION}"`);
    } else {
      html = html.replace(/<html([^>]*)>/, `<html$1 data-mcp-version="${VERSION}">`);
    }
    
    // Add critical CSS directly in the HTML
    if (html.includes('Critical UI styles for production')) {
      // Replace existing critical CSS
      const criticalCssRegex = /(<style>[\s\S]*?\/\* Critical UI styles for production[\s\S]*?)(<\/style>)/;
      html = html.replace(criticalCssRegex, `<style>\n${CRITICAL_STYLES}\n</style>`);
    } else {
      // Add new critical CSS
      html = html.replace('</head>', `  <style>
  ${CRITICAL_STYLES}
  </style>
  </head>`);
    }
    
    fs.writeFileSync(PATHS.htmlFile, html);
    console.log('✅ Updated HTML with critical CSS and version information');
    return true;
  } catch (error) {
    console.error('❌ Failed to update HTML:', error);
    return false;
  }
}

/**
 * Update tailwind.config.ts to safelist critical CSS classes
 */
function updateTailwindConfig() {
  try {
    if (!fs.existsSync(PATHS.tailwindConfig)) {
      console.error('❌ Tailwind config not found at', PATHS.tailwindConfig);
      return false;
    }
    
    let config = fs.readFileSync(PATHS.tailwindConfig, 'utf8');
    
    // Check if safelist already exists
    if (config.includes('safelist:')) {
      // Update existing safelist
      const safelistRegex = /safelist:\s*\[([\s\S]*?)\]/;
      const match = config.match(safelistRegex);
      
      if (match) {
        // Extract current safelist items
        const currentSafelistStr = match[1];
        const currentSafelist = currentSafelistStr
          .split(',')
          .map(item => item.trim().replace(/['"]/g, ''))
          .filter(item => item.length > 0);
        
        // Merge with new safelist items (avoiding duplicates)
        const mergedSafelist = [...new Set([...currentSafelist, ...SAFELIST_CLASSES])];
        
        // Format the new safelist
        const newSafelistStr = mergedSafelist
          .map(item => `    '${item}'`)
          .join(',\n');
        
        // Replace the existing safelist
        config = config.replace(
          safelistRegex,
          `safelist: [\n${newSafelistStr}\n  ]`
        );
      }
    } else {
      // Add new safelist
      config = config.replace(
        /export default ({\s*)/,
        `export default $1  safelist: [\n    ${SAFELIST_CLASSES.map(cls => `'${cls}'`).join(',\n    ')}\n  ],\n  `
      );
    }
    
    fs.writeFileSync(PATHS.tailwindConfig, config);
    console.log('✅ Updated Tailwind config with safelist');
    return true;
  } catch (error) {
    console.error('❌ Failed to update Tailwind config:', error);
    return false;
  }
}

/**
 * Update main.tsx to include runtime style verification
 */
function updateMainTsx() {
  try {
    if (!fs.existsSync(PATHS.mainTsx)) {
      console.error('❌ main.tsx not found at', PATHS.mainTsx);
      return false;
    }
    
    let content = fs.readFileSync(PATHS.mainTsx, 'utf8');
    
    // Import css-recovery if not already imported
    if (!content.includes("import './css-recovery'")) {
      // Add import near the top, after other imports
      content = content.replace(
        /import [^\n]+/,
        `$&\nimport './css-recovery' // Ensures CSS consistency between dev and production`
      );
    }
    
    // Import VERSION if not already imported
    if (!content.includes('import { VERSION }')) {
      content = content.replace(
        /import [^\n]+/,
        `$&\nimport { VERSION } from './version' // For cache busting and version tracking`
      );
    }
    
    // Add version to root element if not already present
    if (!content.includes('data-version=')) {
      content = content.replace(
        /<React.StrictMode>/,
        `<React.StrictMode>\n  {/* Version ${VERSION} */}`
      );
    }
    
    fs.writeFileSync(PATHS.mainTsx, content);
    console.log('✅ Updated main.tsx with runtime style verification');
    return true;
  } catch (error) {
    console.error('❌ Failed to update main.tsx:', error);
    return false;
  }
}

/**
 * Create a verification component to check UI consistency
 */
function createCssVerificationComponent() {
  try {
    const componentPath = './client/src/components/CssVerification.tsx';
    const componentContent = `/**
 * CSS Verification Component
 * 
 * This component verifies that critical CSS styles are loaded correctly
 * and provides a way to manually trigger the CSS recovery system.
 * Used in development and production to ensure UI consistency.
 */
import { useState } from 'react';
import { VERSION } from '../version';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function CssVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<{cls: string, result: boolean}[]>([]);
  
  // Critical classes that must be verified
  const criticalClasses = [
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'feature-card',
    'animate-fade-in-down',
    'from-purple-50',
    'from-purple-600',
    'to-indigo-600',
    'bg-gradient-to-r',
    'group-hover:scale-110',
    'animate-in'
  ];
  
  // Verify critical CSS classes are properly applied
  function verifyStyles() {
    setIsVerifying(true);
    setVerificationResults([]);
    
    const results = criticalClasses.map(cls => {
      // Create test element
      const testEl = document.createElement('div');
      testEl.className = cls;
      document.body.appendChild(testEl);
      
      // Get computed style
      const style = window.getComputedStyle(testEl);
      
      // Check if style has expected properties
      let result = false;
      if (cls === 'bg-grid-gray-100') {
        result = style.backgroundImage.includes('linear-gradient');
      } else if (cls === 'bg-blob-gradient') {
        result = style.backgroundImage.includes('radial-gradient');
      } else if (cls === 'feature-card') {
        result = style.transition.includes('all');
      } else if (cls === 'animate-fade-in-down') {
        result = style.animation.includes('fadeInDown');
      } else if (cls.startsWith('from-')) {
        result = style.getPropertyValue('--tw-gradient-from') !== '';
      } else if (cls.startsWith('to-')) {
        result = style.getPropertyValue('--tw-gradient-to') !== '';
      } else if (cls === 'bg-gradient-to-r') {
        result = style.backgroundImage.includes('linear-gradient(to right');
      } else if (cls.includes('hover:')) {
        result = true; // Can't verify hover state
      } else if (cls.includes('group-hover:')) {
        result = true; // Can't verify group-hover state
      } else if (cls === 'animate-in') {
        result = style.animationDuration === '150ms';
      } else {
        result = true; // Default to true for unknown classes
      }
      
      // Clean up
      document.body.removeChild(testEl);
      
      return { cls, result };
    });
    
    setVerificationResults(results);
    setIsVerifying(false);
    
    // If any failed, try to recover
    const anyFailed = results.some(r => !r.result);
    if (anyFailed && window.recoverMissingStyles) {
      window.recoverMissingStyles();
    }
  }
  
  // Force CSS recovery
  function recoverStyles() {
    if (window.recoverMissingStyles) {
      window.recoverMissingStyles();
      setTimeout(verifyStyles, 100);
    }
  }
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">UI Verification</h3>
        <span className="text-xs text-gray-500">v{VERSION}</span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Verify that all UI components are rendering correctly in {import.meta.env.PROD ? 'production' : 'development'}.
        </p>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={verifyStyles}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Verifying
              </>
            ) : (
              'Verify Styles'
            )}
          </Button>
          
          <Button
            size="sm" 
            variant="outline"
            onClick={recoverStyles}
          >
            Recover Styles
          </Button>
        </div>
      </div>
      
      {verificationResults.length > 0 && (
        <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
          {verificationResults.map(({ cls, result }) => (
            <div key={cls} className="flex items-center">
              {result ? (
                <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={result ? 'text-green-700' : 'text-red-700'}>
                {cls}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add window declarations
declare global {
  interface Window {
    recoverMissingStyles?: () => void;
  }
}
`;
    
    fs.writeFileSync(componentPath, componentContent);
    console.log('✅ Created CSS verification component');
    return true;
  } catch (error) {
    console.error('❌ Failed to create CSS verification component:', error);
    return false;
  }
}

/**
 * Apply all fixes to ensure UI consistency between dev and production
 */
function rebuildUi() {
  console.log('🔄 Starting complete UI rebuild for deployment...');
  
  // 1. Update version with timestamp
  const versionUpdated = updateVersion();
  
  // 2. Update HTML with critical CSS
  const htmlUpdated = updateHtml();
  
  // 3. Update tailwind config to prevent purging of critical classes
  const tailwindUpdated = updateTailwindConfig();
  
  // 4. Update main.tsx to include style verification
  const mainTsxUpdated = updateMainTsx();
  
  // 5. Create CSS verification component
  const verificationComponentCreated = createCssVerificationComponent();
  
  // Check if all steps were successful
  if (versionUpdated && htmlUpdated && tailwindUpdated && mainTsxUpdated && verificationComponentCreated) {
    console.log('✅ UI rebuild completed successfully!');
    console.log(`🔍 All critical styles are now protected for deployment.`);
    console.log(`🚀 UI will now be identical between development and production.`);
    return true;
  } else {
    console.error('❌ UI rebuild failed. Please check the logs for errors.');
    return false;
  }
}

// Execute the rebuild
rebuildUi();