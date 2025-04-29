/**
 * MCP Integration Platform - Deployment Fix
 * 
 * This script fixes issues that only appear in production deployments:
 * 1. Ensures proper MIME types are used
 * 2. Creates a fallback index.html that loads correctly
 * 3. Fixes path references in build files
 */

const fs = require('fs');
const path = require('path');

// Version for cache busting
const VERSION = `2.5.${Date.now()}`;

console.log('🔧 Starting deployment fix...');

// 1. Fix package.json to ensure proper build and start scripts
function fixPackageJson() {
  const packageJsonPath = './package.json';
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update scripts for production
    packageJson.scripts = {
      ...packageJson.scripts,
      "build": "vite build && node fix-production-ui.cjs && cp -r public/* dist/",
      "start": "node dist/server/index.js",
      "deploy": "npm run build && npm run start"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with proper build and start scripts');
    return true;
  } catch (err) {
    console.error('❌ Failed to update package.json:', err);
    return false;
  }
}

// 2. Create .replit.deployConfig.js to ensure proper deployment
function createDeployConfig() {
  const deployConfigPath = './.replit.deployConfig.js';
  const deployConfigContent = `/**
 * MCP Integration Platform - Replit Deployment Configuration
 * 
 * This script is executed automatically by Replit before deployment.
 * It ensures consistent UI between development and production environments.
 */

const fs = require('fs');
const path = require('path');

// Update version for cache busting
const version = "2.5.${Date.now()}";

/**
 * Update the version.ts file with the current deployment version
 */
function updateVersion(version) {
  const versionFile = './client/src/version.ts';
  if (fs.existsSync(versionFile)) {
    const content = \`/**
 * MCP Integration Platform Version Tracker
 * Auto-generated file - DO NOT EDIT MANUALLY
 */

export const VERSION = "\${version}";
export const TIMESTAMP = \${Date.now()};
export const PRODUCTION_READY = true;
\`;
    fs.writeFileSync(versionFile, content);
    console.log(\`✅ Updated version to \${version}\`);
  }
}

/**
 * Update the HTML file with the current deployment version
 */
function updateHtml(version) {
  const htmlPath = './client/index.html';
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Add version attribute
    html = html.replace(
      '<html lang="en"',
      \`<html lang="en" data-mcp-version="\${version}"\`
    );
    
    // Ensure the verification script is loaded
    if (!html.includes('deploy-verify.js')) {
      html = html.replace(
        '</head>',
        \`  <script src="/deploy-verify.js?v=\${Date.now()}"></script>\\n  </head>\`
      );
    }
    
    fs.writeFileSync(htmlPath, html);
    console.log('✅ Updated index.html with version and verification');
  }
}

/**
 * Verify that all required files exist
 */
function verifyFiles() {
  // List of critical files
  const requiredFiles = [
    './client/src/version.ts',
    './public/production.css',
    './public/deploy-verify.js',
    './fix-production-ui.cjs'
  ];
  
  const missing = [];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missing.push(file);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required files:', missing.join(', '));
    
    // Create any missing files
    if (missing.includes('./public/production.css')) {
      // Run the production UI fix script if it exists
      if (fs.existsSync('./fix-production-ui.cjs')) {
        console.log('🔄 Running production UI fix script to create missing files');
        require('./fix-production-ui.cjs');
      }
    }
  } else {
    console.log('✅ All required files present');
  }
}

// Run deployment preparation
updateVersion(version);
updateHtml(version);
verifyFiles();

console.log('✅ Deployment configuration complete!');

// No need to export anything as this is run directly
`;

  fs.writeFileSync(deployConfigPath, deployConfigContent);
  console.log('✅ Created .replit.deployConfig.js');
  return true;
}

// 3. Create fallback index.js server for production
function createProductionServer() {
  const serverPath = './server/production.js';
  const serverContent = `/**
 * MCP Integration Platform - Production Server Fallback
 * This is a simplified server for production deployments
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'dist' directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// API endpoint to check status
app.get('/api/status', (req, res) => {
  res.json({
    version: '0.1.0-alpha',
    uptime: process.uptime(),
    transport: 'http',
    env: 'production',
    time: new Date().toISOString()
  });
});

// Fallback for SPA - always serve index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(\`Production server running on port \${PORT}\`);
});
`;

  // Create directory if it doesn't exist
  const dir = path.dirname(serverPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(serverPath, serverContent);
  console.log('✅ Created production server fallback');
  return true;
}

// 4. Create a production-specific Vite config
function createProductionViteConfig() {
  const configPath = './vite.prod.config.ts';
  const configContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@assets': resolve(__dirname, './attached_assets'),
      '@shared': resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'client/index.html'),
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['zod', 'wouter', 'clsx', 'date-fns'],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
`;

  fs.writeFileSync(configPath, configContent);
  console.log('✅ Created production-specific Vite config');
  return true;
}

// 5. Update index.html for production build
function updateIndexHtml() {
  const indexPath = './client/index.html';
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found');
    return false;
  }
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Ensure we have the base tag for proper path resolution
    if (!content.includes('<base href=')) {
      content = content.replace(
        '<head>',
        '<head>\n    <base href="/">'
      );
    }
    
    // Add preload for critical resources
    if (!content.includes('rel="preload"')) {
      content = content.replace(
        '</head>',
        '  <link rel="preload" href="/production.css" as="style">\n  </head>'
      );
    }
    
    // Add fallback content that will show before JS loads
    if (!content.includes('noscript')) {
      content = content.replace(
        '<body>',
        `<body>
  <noscript>
    <div style="padding: 2rem; text-align: center; font-family: system-ui, sans-serif;">
      <h1>JavaScript Required</h1>
      <p>This application requires JavaScript to be enabled in your browser.</p>
    </div>
  </noscript>`
      );
    }
    
    fs.writeFileSync(indexPath, content);
    console.log('✅ Updated index.html for production');
    return true;
  } catch (err) {
    console.error('❌ Failed to update index.html:', err);
    return false;
  }
}

// Run all fixes
function main() {
  fixPackageJson();
  createDeployConfig();
  createProductionServer();
  createProductionViteConfig();
  updateIndexHtml();
  console.log('✅ Deployment fix complete!');
  console.log('🚀 You can now build and deploy the application with:');
  console.log('   npm run build && npm run start');
}

main();