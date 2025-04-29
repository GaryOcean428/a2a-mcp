/**
 * MCP Integration Platform - Fix Production CSS
 * 
 * This script creates a simplified HTML file without any problematic CSS
 * to ensure it builds properly for production.
 */

const fs = require('fs');
const path = require('path');

// Version tag
const version = `2.5.${Date.now()}`;

// Update version file
const versionFile = './client/src/version.ts';
if (!fs.existsSync(path.dirname(versionFile))) {
  fs.mkdirSync(path.dirname(versionFile), { recursive: true });
}

fs.writeFileSync(
  versionFile,
  `// Auto-generated version file - DO NOT EDIT MANUALLY
export const VERSION = "${version}";
export const TIMESTAMP = ${Date.now()};
export const PRODUCTION_READY = true;
`
);

console.log(`✅ Updated version to ${version}`);

// Create a simple, clean HTML file
const htmlFile = './client/index.html';
const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MCP Integration Platform</title>
    <meta name="description" content="Model Context Protocol Integration Platform" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />

    <style>
      /* Critical CSS for production consistency */
      :root {
        --primary: 263 70% 50%;
        --background: 0 0% 100%;
        --foreground: 222.2 84% 4.9%;
      }
            
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .fade-in {
        animation: fadeIn 0.5s ease-out;
      }
    </style>
    
    <!-- Version info -->
    <script>window.MCP_VERSION = "${version}";</script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

fs.writeFileSync(htmlFile, htmlContent);
console.log('✅ Created simplified HTML for production build');

// Create a production CSS file that will be loaded via JavaScript
const productionCssFile = './public/production.css';
if (!fs.existsSync(path.dirname(productionCssFile))) {
  fs.mkdirSync(path.dirname(productionCssFile), { recursive: true });
}

const cssContent = `/* Critical CSS for MCP Integration Platform */
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
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
}`;

fs.writeFileSync(productionCssFile, cssContent);
console.log('✅ Created production.css file');

// Create a script to inject critical CSS in production
const injectCssFile = './client/src/injector.ts';
const injectCssContent = `/**
 * Production CSS Injector
 * This module injects critical CSS in production environments
 */

// Only run in production
if (import.meta.env.PROD) {
  console.log('💉 Injecting production CSS...');
  
  // Create a link element to load production.css
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/production.css?v=${Date.now()}';
  document.head.appendChild(link);
  
  // Also inject critical CSS directly
  const style = document.createElement('style');
  style.id = 'mcp-critical-css';
  style.textContent = \`
  /* Critical MCP styles */
  .feature-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    transition: all 0.3s ease;
  }
  .feature-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.5s ease-out;
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
  document.head.appendChild(style);
}

export {};
`;

if (!fs.existsSync(path.dirname(injectCssFile))) {
  fs.mkdirSync(path.dirname(injectCssFile), { recursive: true });
}
fs.writeFileSync(injectCssFile, injectCssContent);
console.log('✅ Created CSS injector module');

// Update main.tsx to import the injector
const mainFile = './client/src/main.tsx';
if (fs.existsSync(mainFile)) {
  let mainContent = fs.readFileSync(mainFile, 'utf8');
  
  // Add injector import if not already present
  if (!mainContent.includes('./injector')) {
    // Add after the first import statement
    const firstImportEndIdx = mainContent.indexOf(';') + 1;
    mainContent = 
      mainContent.substring(0, firstImportEndIdx) + 
      '\nimport "./injector"; // Critical CSS injector for production\n' +
      mainContent.substring(firstImportEndIdx);
    
    fs.writeFileSync(mainFile, mainContent);
    console.log('✅ Updated main.tsx with CSS injector import');
  } else {
    console.log('⚠️ Injector import already present in main.tsx');
  }
}

console.log('🎉 Production CSS fix complete! Try building the app now.');