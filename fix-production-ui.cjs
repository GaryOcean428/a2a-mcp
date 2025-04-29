/**
 * MCP Integration Platform - Production UI Fix
 * 
 * This script directly addresses the visual inconsistencies between
 * development and production by updating just the critical files.
 */

const fs = require('fs');
const path = require('path');

// Step 1: Update version.ts
const versionFile = './client/src/version.ts';
if (!fs.existsSync(path.dirname(versionFile))) {
  fs.mkdirSync(path.dirname(versionFile), { recursive: true });
}

const version = `2.5.${Date.now()}`;
fs.writeFileSync(
  versionFile,
  `// Auto-generated version file - DO NOT EDIT MANUALLY
export const VERSION = "${version}";
export const TIMESTAMP = ${Date.now()};
export const PRODUCTION_READY = true;
export const BUILD_DATE = "${new Date().toISOString()}";
`
);

console.log(`✅ Updated version to ${version}`);

// Step 2: Create a clean index.html file with inline CSS
const htmlFile = './client/index.html';
const htmlContent = `<!DOCTYPE html>
<html lang="en" data-mcp-version="${version}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MCP Integration Platform</title>
    <meta name="description" content="Model Context Protocol Integration Platform for AI applications" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    
    <!-- Critical inline CSS for production consistency -->
    <style id="critical-css">
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

      .dark {
        --background: 222.2 84% 4.9%;
        --foreground: 210 40% 98%;
        --card: 222.2 84% 4.9%;
        --card-foreground: 210 40% 98%;
        --popover: 222.2 84% 4.9%;
        --popover-foreground: 210 40% 98%;
        --primary: 263 70% 50%;
        --primary-foreground: 210 40% 98%;
        --secondary: 217.2 32.6% 17.5%;
        --secondary-foreground: 210 40% 98%;
        --muted: 217.2 32.6% 17.5%;
        --muted-foreground: 215 20.2% 65.1%;
        --accent: 217.2 32.6% 17.5%;
        --accent-foreground: 210 40% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 210 40% 98%;
        --border: 217.2 32.6% 17.5%;
        --input: 217.2 32.6% 17.5%;
        --ring: 263 70% 50%;
      }

      /* Critical animation keyframes */
      @keyframes animate-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes animate-fade-in-down {
        from {
          opacity: 0;
          transform: translateY(-15px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Critical utility classes */
      .feature-card {
        background-color: white !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        padding: 1.5rem !important;
        transition-property: all !important;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
        transition-duration: 150ms !important;
      }

      .bg-gradient-to-r {
        background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
      }

      .animate-in {
        animation-name: animate-in !important;
        animation-duration: 150ms !important;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      .animate-fade-in-down {
        animation-name: animate-fade-in-down !important;
        animation-duration: 800ms !important;
        animation-fill-mode: both !important;
      }

      /* Group hover utilities */
      .group:hover .group-hover\\:scale-110 {
        transform: scale(1.1) !important;
      }

      /* Explicit gradient backgrounds */
      .from-purple-50 {
        --tw-gradient-from: #faf5ff !important;
        --tw-gradient-to: rgb(250 245 255 / 0) !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
      }
      
      .from-purple-600 {
        --tw-gradient-from: #9333ea !important;
        --tw-gradient-to: rgb(147 51 234 / 0) !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
      }
      
      .to-indigo-600 {
        --tw-gradient-to: #4f46e5 !important;
      }

      /* Critical backgrounds */
      .bg-grid-gray-100 {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
      }

      .bg-blob-gradient {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%239333ea' fill-opacity='0.1' d='M11.1,-15.9C14.5,-12.8,17.2,-9.2,18.3,-5.3C19.4,-1.4,18.9,2.8,17,6.3C15,9.7,11.7,12.4,7.7,15.4C3.7,18.4,-0.9,21.7,-5.9,21.8C-10.9,21.9,-16.4,18.8,-19.1,14.2C-21.8,9.6,-21.9,3.6,-20.9,-2.3C-19.9,-8.1,-17.9,-14,-14,-17.1C-10.1,-20.3,-5,-20.8,-0.4,-20.3C4.1,-19.8,8.3,-18.3,11.1,-15.9Z' transform='translate(50 50)'%3E%3C/path%3E%3C/svg%3E") !important;
      }
    </style>
    
    <!-- Version verification -->
    <script>window.MCP_DEPLOYMENT_VERIFIED = true; window.MCP_VERSION = "${version}";</script>
  </head>
  <body>
    <!-- Root element for React to mount -->
    <div id="root"></div>
    
    <!-- Fallback static content that will be shown before React loads -->
    <div class="static-landing">
      <header class="header">
        <a href="/" class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 18l6-6-6-6"></path>
            <path d="M8 6l-6 6 6 6"></path>
          </svg>
          MCP Integration Platform
        </a>
        <nav class="nav-links">
          <a href="/documentation" class="nav-link">Documentation</a>
          <a href="/cline-integration" class="nav-link">Cline Integration</a>
          <a href="/api/status" class="nav-link">API Status</a>
        </nav>
      </header>
      
      <section class="hero">
        <h1>MCP Integration Platform</h1>
        <p>A secure, high-performance Model Context Protocol (MCP) integration platform that provides standardized interfaces for AI-powered applications to leverage web search, form automation, vector storage, and data scraping.</p>
        <a href="/api/status" class="button">Check API Status</a>
      </section>
      
      <div class="container">
        <h2 class="section-title">Available Tools</h2>
        <div class="card-grid">
          <div class="card">
            <div class="card-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h3>Web Search</h3>
            <p>Search the web with multiple provider options including OpenAI, Tavily, and Perplexity</p>
          </div>
          
          <div class="card">
            <div class="card-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h3>Form Automation</h3>
            <p>Fill and submit web forms programmatically with validation</p>
          </div>
          
          <div class="card">
            <div class="card-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
            </div>
            <h3>Vector Storage</h3>
            <p>Connect to embeddings databases for semantic search and retrieval</p>
          </div>
          
          <div class="card">
            <div class="card-icon amber">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            <h3>Data Scraping</h3>
            <p>Extract structured data from websites with configurable policies</p>
          </div>
        </div>
      </div>
      
      <footer class="footer">
        <div class="footer-links">
          <a href="/documentation" class="footer-link">📄 Documentation</a>
          <a href="/cline-integration" class="footer-link">🔗 Cline Integration</a>
          <a href="https://github.com/cline-ai/cline" target="_blank" rel="noopener noreferrer" class="footer-link">🌐 Cline GitHub</a>
        </div>
        <div class="footer-copyright">© 2025 MCP Integration Platform</div>
      </footer>
    </div>
    
    <script type="module" src="/src/main.tsx"></script>
    
    <script>
      // Hide static landing when React mounts
      document.addEventListener('DOMContentLoaded', function() {
        const root = document.getElementById('root');
        const staticLanding = document.querySelector('.static-landing');
        
        // Use MutationObserver to watch for changes in the root element
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && root.children.length > 0) {
              // React has mounted, hide the static landing
              if (staticLanding) {
                staticLanding.style.display = 'none';
              }
              observer.disconnect();
            }
          });
        });
        
        // Start observing the root element
        observer.observe(root, { childList: true });
      });
    </script>
    
    <!-- CSS verification and recovery script -->
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const shouldVerify = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
        if (shouldVerify) {
          const script = document.createElement('script');
          script.src = '/deploy-verify.js?v=${Date.now()}';
          document.body.appendChild(script);
        }
      });
    </script>
  </body>
</html>`;

fs.writeFileSync(htmlFile, htmlContent);
console.log(`✅ Updated HTML file with clean structure and critical CSS`);

// Step 3: Update deploy-verify.js
const deployVerifyFile = './public/deploy-verify.js';
if (!fs.existsSync(path.dirname(deployVerifyFile))) {
  fs.mkdirSync(path.dirname(deployVerifyFile), { recursive: true });
}

const deployVerifyContent = `/**
 * MCP Integration Platform - CSS Verification and Recovery
 * This script verifies that all critical CSS classes are properly loaded
 * and recovers them if necessary.
 * 
 * Version: ${version}
 */
(function() {
  console.log("[CSS Verify] Running verification...");
  
  // Check if critical inline styles are present
  const hasInlineStyles = document.querySelector('style#critical-css') !== null;
  console.log("[CSS Verify] Critical inline styles present:", hasInlineStyles);
  
  // Check if external stylesheets are loaded
  const externalStyles = document.querySelectorAll('link[rel="stylesheet"]');
  console.log("[CSS Verify] External stylesheets loaded:", externalStyles.length);
  
  // Test critical CSS classes
  console.log("[CSS Verify] Testing critical CSS classes:");
  
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
    'animate-in',
    'hover:translate-y-[-2px]',
    'hover:shadow-lg',
    'hover:border-purple-200'
  ];
  
  // Create a hidden test element
  const testEl = document.createElement('div');
  testEl.style.position = 'absolute';
  testEl.style.visibility = 'hidden';
  testEl.style.pointerEvents = 'none';
  testEl.style.zIndex = '-1000';
  testEl.style.opacity = '0';
  document.body.appendChild(testEl);
  
  const missingClasses = [];
  
  criticalClasses.forEach(className => {
    // Reset element
    testEl.className = '';
    // Get computed style before
    const beforeStyle = window.getComputedStyle(testEl);
    const beforeProps = {
      transform: beforeStyle.transform,
      animation: beforeStyle.animation,
      backgroundImage: beforeStyle.backgroundImage,
      opacity: beforeStyle.opacity,
      boxShadow: beforeStyle.boxShadow,
      borderColor: beforeStyle.borderColor
    };
    
    // Apply class
    testEl.className = className;
    
    // Get computed style after
    const afterStyle = window.getComputedStyle(testEl);
    
    // Check if styles changed
    const hasEffect = 
      beforeProps.transform !== afterStyle.transform ||
      beforeProps.animation !== afterStyle.animation ||
      beforeProps.backgroundImage !== afterStyle.backgroundImage ||
      beforeProps.opacity !== afterStyle.opacity ||
      beforeProps.boxShadow !== afterStyle.boxShadow ||
      beforeProps.borderColor !== afterStyle.borderColor;
    
    console.log("[CSS Verify] -", className + ":", hasEffect ? "OK" : "MISSING");
    
    if (!hasEffect) {
      missingClasses.push(className);
    }
  });
  
  // Clean up
  document.body.removeChild(testEl);
  
  console.log("[CSS Verify] Verification complete");
  
  // If we have missing classes, inject emergency styles
  if (missingClasses.length > 0) {
    console.warn("❌ Some critical CSS classes failed verification:", missingClasses.join(", "));
    
    console.log("%c🔄 Triggering CSS recovery process", "color: blue; font-weight: bold;");
    console.log("[CSS Recovery] Checking for missing styles...");
    
    // Inject inline emergency recovery CSS
    console.log("[CSS Recovery] Injecting inline CSS recovery...");
    
    const recoveryCSS = \`
    /* MCP Critical CSS Recovery - Version ${version} */
    .feature-card {
      position: relative !important;
      overflow: hidden !important;
      border-radius: 0.5rem !important;
      border-width: 1px !important;
      border-color: hsl(var(--border)) !important;
      padding: 1.5rem !important;
      background-color: hsl(var(--card)) !important;
      cursor: pointer !important;
      transition-property: all !important;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
      transition-duration: 300ms !important;
    }
    .feature-card:hover {
      border-color: rgb(233 213 255) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
    }
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    .animate-in {
      animation-name: animate-in !important;
      animation-duration: 0.5s !important;
      animation-timing-function: ease-out !important;
      animation-fill-mode: both !important;
      animation-direction: normal !important;
    }
    .animate-fade-in-down {
      animation-name: animate-fade-in-down !important;
      animation-duration: 0.8s !important;
      animation-fill-mode: both !important; 
    }
    @keyframes animate-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes animate-fade-in-down {
      from {
        opacity: 0;
        transform: translateY(-15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    /* Target group-hover utilities */
    .group:hover .group-hover\\:scale-110 {
      transform: scale(1.1) !important;
    }
    /* Hover effects */
    .hover\\:translate-y-\\[-2px\\]:hover {
      transform: translateY(-2px) !important;
    }
    .hover\\:shadow-lg:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    }
    .hover\\:border-purple-200:hover {
      border-color: rgb(233 213 255) !important;
    }
    /* Explicit gradient backgrounds */
    .from-purple-50 {
      --tw-gradient-from: #faf5ff !important;
      --tw-gradient-to: rgb(250 245 255 / 0) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .from-purple-600 {
      --tw-gradient-from: #9333ea !important;
      --tw-gradient-to: rgb(147 51 234 / 0) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .to-indigo-600 {
      --tw-gradient-to: #4f46e5 !important;
    }
    /* Critical background patterns */
    .bg-grid-gray-100 {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
    }
    
    .bg-blob-gradient {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%239333ea' fill-opacity='0.1' d='M11.1,-15.9C14.5,-12.8,17.2,-9.2,18.3,-5.3C19.4,-1.4,18.9,2.8,17,6.3C15,9.7,11.7,12.4,7.7,15.4C3.7,18.4,-0.9,21.7,-5.9,21.8C-10.9,21.9,-16.4,18.8,-19.1,14.2C-21.8,9.6,-21.9,3.6,-20.9,-2.3C-19.9,-8.1,-17.9,-14,-14,-17.1C-10.1,-20.3,-5,-20.8,-0.4,-20.3C4.1,-19.8,8.3,-18.3,11.1,-15.9Z' transform='translate(50 50)'%3E%3C/path%3E%3C/svg%3E") !important;
    }\`;
    
    const styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    styleEl.id = 'mcp-css-recovery';
    styleEl.appendChild(document.createTextNode(recoveryCSS));
    document.head.appendChild(styleEl);
    
    console.log("[CSS Recovery] ✅ Recovery complete - MCP CSS restored");
  }
})();`;

fs.writeFileSync(deployVerifyFile, deployVerifyContent);
console.log(`✅ Created verification script`);

// Step 4: Create production.css file
const productionCssFile = './public/production.css';
if (!fs.existsSync(path.dirname(productionCssFile))) {
  fs.mkdirSync(path.dirname(productionCssFile), { recursive: true });
}

// Extract the CSS from the HTML file (between <style> tags)
const cssMatch = htmlContent.match(/<style id="critical-css">([\s\S]*?)<\/style>/);
const cssContent = cssMatch ? cssMatch[1] : '';

fs.writeFileSync(productionCssFile, cssContent);
console.log(`✅ Created production.css file`);

// Step 5: Update Tailwind config to safelist critical classes
const tailwindConfigFile = './tailwind.config.ts';
if (fs.existsSync(tailwindConfigFile)) {
  let configContent = fs.readFileSync(tailwindConfigFile, 'utf8');
  
  // Comprehensive list of classes that need to be preserved
  const safelist = [
    // Animations
    'animate-in',
    'animate-out',
    'animate-fade-in-down',
    'motion-safe:animate-in',
    'motion-safe:animate-out',
    'fade-in',
    'animate-spin',
    
    // Feature cards
    'feature-card',
    'group-hover:scale-110',
    'group-hover:opacity-100',
    'group-hover:text-purple-700',
    'group-hover:text-indigo-700',
    'group-hover:text-violet-700',
    
    // Hover effects
    'hover:shadow-lg',
    'hover:border-purple-200',
    'hover:translate-y-[-2px]',
    
    // Gradient backgrounds
    'bg-gradient-to-r',
    'from-purple-50',
    'from-purple-600',
    'from-purple-700',
    'via-indigo-50',
    'to-white',
    'to-indigo-600',
    'to-indigo-700',
    
    // Special backgrounds
    'bg-grid-gray-100',
    'bg-blob-gradient',
    
    // Radix UI classes
    'radix-side-top',
    'radix-side-right',
    'radix-side-bottom',
    'radix-side-left'
  ];
  
  // Check if safelist already exists
  if (configContent.includes('safelist:')) {
    // Replace existing safelist
    configContent = configContent.replace(
      /safelist:\s*\[[^\]]*\]/,
      `safelist: ${JSON.stringify(safelist)}`
    );
  } else {
    // Add safelist to the config
    configContent = configContent.replace(
      'content: [',
      `safelist: ${JSON.stringify(safelist)},\n  content: [`
    );
  }
  
  fs.writeFileSync(tailwindConfigFile, configContent);
  console.log(`✅ Updated Tailwind config with safelist`);
}

console.log(`🎉 Production UI fix complete! You can now build and deploy the project.`);