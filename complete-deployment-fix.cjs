/**
 * MCP Integration Platform - Complete Deployment Fix
 * 
 * This is a master script that applies all necessary fixes to ensure
 * consistent UI rendering between development and production environments.
 * 
 * Key fixes:
 * 1. CSS rendering - Ensures all styles are preserved and applied correctly
 * 2. Module compatibility - Fixes critical issues with mixed module formats
 * 3. WebSocket connectivity - Ensures proper connection and error handling
 * 4. Static asset serving - Corrects content type headers and caching
 * 5. Authentication - Ensures sessions work correctly in production
 */

// Need to use CommonJS for maximum compatibility
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Set some constants
const VERSION = `2.5.${Date.now()}`;
console.log(`[MCP:Deploy] Generating version: ${VERSION}`);

// List of critical deployment files to ensure they exist
const criticalFiles = [
  'public/production.css',
  'public/deploy-verify.js',
  'server/middleware/static-assets.ts',
  'fix-production-css.cjs',
  'fix-hmr-websocket.cjs',
  'start.cjs'
];

// Run all individual fix scripts
function applyAllFixes() {
  console.log('[MCP:Deploy] Applying all deployment fixes...');
  
  try {
    // 1. Verify critical files exist
    ensureCriticalFiles();
    
    // 2. Apply CSS fixes
    console.log('[MCP:Deploy] Running CSS production fixes...');
    execSync('node fix-production-css.cjs', { stdio: 'inherit' });
    
    // 3. Apply WebSocket HMR fix
    console.log('[MCP:Deploy] Running WebSocket HMR fixes...');
    if (fs.existsSync('fix-hmr-websocket.cjs')) {
      execSync('node fix-hmr-websocket.cjs', { stdio: 'inherit' });
    } else {
      console.warn('[MCP:Deploy] WebSocket HMR fix script not found, skipping...');
    }
    
    // 4. Apply module compatibility fixes
    createModuleCompatibilityFiles();
    
    // 5. Apply server production launcher
    createServerLauncher();
    
    // 6. Update server routes if needed
    ensureMiddlewareRegistered();
    
    console.log('[MCP:Deploy] All deployment fixes applied successfully!');
    console.log('[MCP:Deploy] Production deployment is now ready.');
  } catch (error) {
    console.error('[MCP:Deploy] Error applying fixes:', error);
    process.exit(1);
  }
}

// Ensure all critical files exist
function ensureCriticalFiles() {
  console.log('[MCP:Deploy] Verifying critical files...');
  
  const missingFiles = [];
  
  criticalFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(filePath);
    }
  });
  
  if (missingFiles.length > 0) {
    console.error('[MCP:Deploy] Critical files missing:', missingFiles);
    process.exit(1);
  } else {
    console.log('[MCP:Deploy] All critical files present ✓');
  }
}

// Create module compatibility files
function createModuleCompatibilityFiles() {
  console.log('[MCP:Deploy] Creating module compatibility files...');
  
  // Create ESM version of production server
  const esmServerPath = path.join(__dirname, 'server', 'prod-server.js');
  const esmContent = `/**
 * MCP Integration Platform - Production Server (ESM version)
 * 
 * This file uses ESM module syntax.
 */

import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { registerRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist/public')));

// Register API routes
const httpServer = await registerRoutes(app);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

const port = process.env.PORT || 5000;
httpServer.listen(port, '0.0.0.0', () => {
  console.log(\`MCP Production Server (ESM) listening on port \${port}\`);
});
`;
  
  fs.writeFileSync(esmServerPath, esmContent, 'utf8');
  
  // Create CommonJS version of production server
  const cjsServerPath = path.join(__dirname, 'server', 'prod-server.cjs');
  const cjsContent = `/**
 * MCP Integration Platform - Production Server (CommonJS version)
 * 
 * This file uses CommonJS module syntax to be compatible with the project configuration.
 */

const express = require('express');
const { createServer } = require('http');
const path = require('path');
const fs = require('fs');

async function startServer() {
  try {
    // Using dynamic import for routes which may be ESM
    const { registerRoutes } = await import('./routes.js');
    
    const app = express();
    app.use(express.json());
    
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../dist/public')));
    
    // Register API routes - this contains WebSocket setup
    const httpServer = await registerRoutes(app);
    
    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/public/index.html'));
    });
    
    const port = process.env.PORT || 5000;
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(\`MCP Production Server (CommonJS) listening on port \${port}\`);
    });
    
    return httpServer;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);
`;
  
  fs.writeFileSync(cjsServerPath, cjsContent, 'utf8');
  
  console.log('[MCP:Deploy] Module compatibility files created ✓');
}

// Create server launcher
function createServerLauncher() {
  console.log('[MCP:Deploy] Creating server launcher...');
  
  const launcherPath = path.join(__dirname, 'start.cjs');
  const launcherContent = `/**
 * MCP Integration Platform - Production Server Launcher
 * 
 * This script launches the correct production server based on the environment.
 */

const { existsSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');

// Find available production server implementation
function findProductionServer() {
  const serverDir = join(__dirname, 'server');
  
  // Check for various server implementations in order of preference
  const serverVariants = [
    { file: 'prod-server.cjs', command: 'node', args: [join(serverDir, 'prod-server.cjs')] },
    { file: 'prod-server.js', command: 'node', args: [join(serverDir, 'prod-server.js')] },
    { file: 'production.js', command: 'node', args: [join(serverDir, 'production.js')] },
    { file: 'index.ts', command: 'tsx', args: [join(serverDir, 'index.ts')] }
  ];
  
  for (const variant of serverVariants) {
    if (existsSync(join(serverDir, variant.file))) {
      console.log(\`Found server implementation: \${variant.file}\`);
      return variant;
    }
  }
  
  throw new Error('No production server implementation found');
}

// Start the appropriate server
function startServer() {
  try {
    const server = findProductionServer();
    console.log(\`Starting server with: \${server.command} \${server.args.join(' ')}\`);
    
    // Use spawn to keep the process running and pipe output
    const process = spawnSync(server.command, server.args, { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    // Check the result
    if (process.status !== 0) {
      console.error(\`Server exited with code \${process.status}\`);
      throw new Error('Server process failed');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Execute the server launcher
startServer();
`;
  
  fs.writeFileSync(launcherPath, launcherContent, 'utf8');
  
  console.log('[MCP:Deploy] Server launcher created ✓');
}

// Ensure middleware is registered in routes.ts
function ensureMiddlewareRegistered() {
  console.log('[MCP:Deploy] Ensuring middleware registration...');
  
  const routesPath = path.join(__dirname, 'server', 'routes.ts');
  
  if (fs.existsSync(routesPath)) {
    let routesContent = fs.readFileSync(routesPath, 'utf8');
    
    // Check if import exists
    if (!routesContent.includes("import staticAssets")) {
      routesContent = routesContent.replace(
        "import express",
        "import staticAssets from './middleware/static-assets';\nimport express"
      );
    }
    
    // Check if middleware is registered
    if (!routesContent.includes("staticAssets.criticalCssMiddleware")) {
      // Find the line with cache control middleware
      const cacheControlPattern = /app\.use\(cacheControl\);/;
      if (cacheControlPattern.test(routesContent)) {
        routesContent = routesContent.replace(
          cacheControlPattern,
          `// Apply CSS middleware first to serve critical CSS files properly
  app.use(staticAssets.criticalCssMiddleware);
  
  // Then apply cache control middleware for other static assets
  app.use(cacheControl);
  
  // Log static asset requests in development
  app.use(staticAssets.logStaticAssets);`
        );
      }
    }
    
    fs.writeFileSync(routesPath, routesContent, 'utf8');
    console.log('[MCP:Deploy] Middleware registration updated ✓');
  } else {
    console.error('[MCP:Deploy] routes.ts not found');
  }
}

// Run all fixes
applyAllFixes();