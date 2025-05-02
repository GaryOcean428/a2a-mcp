/**
 * MCP Integration Platform - UI Build Optimization Script
 * 
 * This script optimizes the UI build process for production environments
 * by handling critical CSS injection, cache busting, and ensuring
 * all necessary styles are preserved during the build process.
 */

const fs = require('fs');
const path = require('path');

/**
 * Update the version timestamp for cache busting
 */
function updateVersion() {
  const timestamp = Date.now();
const versionContent = `/**
 * MCP Integration Platform Version
 * Used for cache busting and debugging
 */

// Current version with timestamp for cache busting
export const version = "1.0.0-${timestamp}";

// Export a helper for cache busting URLs
export function addVersionToUrl(url) {
  const separator = url.includes('?') ? '&' : '?';
  return \`\${url}\${separator}v=\${version}\`;
}
`;

  // Make sure the directory exists
  const versionFilePath = path.resolve('./client/src/version.ts');
  fs.writeFileSync(versionFilePath, versionContent, 'utf8');
  
  console.log(`✓ Updated version timestamp: ${Date.now()}`);
  return Date.now();
}

/**
 * Ensure the public directory exists
 */
function ensurePublicDir() {
  const publicDir = path.resolve('./public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
}

/**
 * Update HTML with critical CSS and properly setup resources
 */
function updateHtml() {
  // Read the HTML file
  const htmlFilePath = path.resolve('./client/index.html');
  let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  // Extract the existing head content
  const headMatch = htmlContent.match(/<head>([\s\S]*?)<\/head>/);
  const headContent = headMatch ? headMatch[1] : '';
  
  // Check if we already have critical CSS
  const hasCriticalStyles = headContent.includes('<!-- Critical styles for immediate rendering -->');
  
  if (!hasCriticalStyles) {
    // Critical CSS to inject
    const criticalCss = `
    <!-- Critical styles for immediate rendering -->
    <style id="mcp-critical-css">
      :root {
        --mcp-max-width: 1200px;
        --mcp-content-padding: 2rem;
        --mcp-border-radius: 0.5rem;
        --mcp-transition-duration: 300ms;
      }
      
      /* Responsive container class for consistent layout */
      .mcp-container {
        width: 100%;
        max-width: var(--mcp-max-width);
        margin-left: auto;
        margin-right: auto;
        padding-left: var(--mcp-content-padding);
        padding-right: var(--mcp-content-padding);
      }
      
      /* Optimized transitions */
      .optimized-card-transition {
        transition-property: transform, box-shadow, border-color;
        transition-duration: var(--mcp-transition-duration);
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Responsive width utility */
      .mcp-responsive-width {
        width: 100%;
        max-width: 100%;
      }
      
      @media (min-width: 1024px) {
        .mcp-responsive-width {
          max-width: 980px;
        }
      }
      
      @media (min-width: 1280px) {
        .mcp-responsive-width {
          max-width: 1200px;
        }
      }
    </style>`;
    
    // Find the <head> tag and add critical CSS right after it
    htmlContent = htmlContent.replace(
      '<head>',
      `<head>${criticalCss}`
    );
  }
  
  // Add verification script if not already present
  if (!htmlContent.includes('css-verify.js')) {
    const verificationScript = `
    <!-- CSS verification and recovery -->
    <script src="/css-verify.js?v=${Date.now()}"></script>`;
    
    // Add just before the closing </head> tag
    htmlContent = htmlContent.replace(
      '</head>',
      `${verificationScript}\n  </head>`
    );
  }
  
  // Version for cache busting
  const version = Date.now().toString();
  
  // Update the HTML file
  fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  console.log('✓ Updated HTML with critical CSS and verification script');
}

/**
 * Copy styles to public directory for accessibility in production
 */
function copyProductionCss() {
  // Create production CSS for recovery in public folder
  const productionCssContent = `
/* MCP Production CSS - Version ${Date.now()} */

/* MCP custom components */
.mcp-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
  border: 1px solid transparent;
}

.mcp-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
  border-color: rgba(124, 58, 237, 0.1);
}

/* Sidebar layout classes */
.sidebar-fixed {
  width: 100%;
  max-width: 280px;
  flex-shrink: 0;
}

.content-with-sidebar {
  width: 100%;
  max-width: calc(100% - 280px);
  margin-left: auto;
}

/* Responsive fixes for mobile */
@media (max-width: 768px) {
  .sidebar-fixed {
    max-width: 100%;
  }
  
  .content-with-sidebar {
    max-width: 100%;
  }
}

/* Grid and background patterns */
.mcp-grid-pattern {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}

.mcp-blob-gradient {
  background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
  filter: blur(50px);
}

.mcp-hero-gradient {
  background-image: linear-gradient(to right, #a78bfa, #818cf8);
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Optimized transition classes */
.mcp-optimized-transition {
  transition-property: transform, box-shadow, border-color, color, background-color, opacity;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.optimized-card-transition {
  transition-property: transform, box-shadow, border-color;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.optimized-hover-transition {
  transition-property: color, background-color, opacity;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animation fixes */
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

/* Responsive containers */
.mcp-container-responsive {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .mcp-container-responsive {
    max-width: 640px;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 768px) {
  .mcp-container-responsive {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .mcp-container-responsive {
    max-width: 1024px;
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (min-width: 1280px) {
  .mcp-container-responsive {
    max-width: 1280px;
  }
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

.to-indigo-600 {
  --tw-gradient-to: #4f46e5;
}

.to-white {
  --tw-gradient-to: #ffffff;
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}
`;
  
  // Ensure public directory exists
  ensurePublicDir();
  
  // Write production CSS to public folder
  fs.writeFileSync(
    path.resolve('./public/production.css'),
    productionCssContent,
    'utf8'
  );
  
  console.log('✓ Created production CSS file for recovery');
}

/**
 * Main function to optimize the build process
 */
function optimizeBuild() {
  console.log('Starting UI build optimization...');
  
  // Update version for cache busting
  const version = updateVersion();
  
  // Update HTML with critical CSS
  updateHtml();
  
  // Copy production CSS to public folder
  copyProductionCss();
  
  console.log('UI build optimization completed successfully.');
}

// Run the optimization
optimizeBuild();
