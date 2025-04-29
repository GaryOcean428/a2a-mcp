/**
 * MCP Integration Platform - Production Server Fix Script (CommonJS version)
 * 
 * This script ensures production server compatibility with both ESM and CommonJS.
 */

const fs = require('fs');
const path = require('path');

// Root directory of the project
const rootDir = path.join(__dirname, '..');

// Paths for server files
const serverDir = path.join(rootDir, 'server');
const prodServerJs = path.join(serverDir, 'prod-server.js');
const prodServerCjs = path.join(serverDir, 'prod-server.cjs');

// ESM version of prod-server.js (using import/export)
const esmServerContent = `/**
 * MCP Integration Platform - Production Server (ESM version)
 * 
 * This file uses ESM module syntax.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files with correct MIME types
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, filePath) => {
    // Set correct MIME types for JS and CSS files
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    
    // Add caching headers for static assets except HTML
    if (!filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for static assets
    } else {
      // No caching for HTML files
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Support for JSON request bodies
app.use(express.json());

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

// Always serve index.html for any non-API routes (SPA)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Please build the app before deploying.');
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('Production server running at http://0.0.0.0:' + PORT);
  console.log('Environment: ' + (process.env.NODE_ENV || 'production'));
  console.log('Server time: ' + new Date().toISOString());
});
`;

// CommonJS version of prod-server.cjs (using require/module.exports)
const cjsServerContent = `/**
 * MCP Integration Platform - Production Server (CommonJS version)
 * 
 * This file uses CommonJS module syntax to be compatible with the project configuration.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files with correct MIME types
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, filePath) => {
    // Set correct MIME types for JS and CSS files
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    
    // Add caching headers for static assets except HTML
    if (!filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for static assets
    } else {
      // No caching for HTML files
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Support for JSON request bodies
app.use(express.json());

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

// Always serve index.html for any non-API routes (SPA)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Please build the app before deploying.');
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('Production server running at http://0.0.0.0:' + PORT);
  console.log('Environment: ' + (process.env.NODE_ENV || 'production'));
  console.log('Server time: ' + new Date().toISOString());
});
`;

// Launcher script (CommonJS) for production
const launcherContent = `/**
 * MCP Integration Platform - Production Server Launcher
 * 
 * This script launches the correct production server based on the environment.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine which production server file to use
function findProductionServer() {
  const cjsPath = path.join(__dirname, 'server/prod-server.cjs');
  const jsPath = path.join(__dirname, 'server/prod-server.js');
  
  // Prefer the CommonJS version if it exists
  if (fs.existsSync(cjsPath)) {
    return cjsPath;
  } else if (fs.existsSync(jsPath)) {
    return jsPath;
  } else {
    throw new Error('No production server file found!');
  }
}

// Launch the server
function startServer() {
  try {
    const serverPath = findProductionServer();
    console.log('Starting production server: ' + serverPath);
    
    // Launch the server with the appropriate Node.js flags
    const isCommonJS = serverPath.endsWith('.cjs');
    const args = isCommonJS ? [] : ['--experimental-modules'];
    args.push(serverPath);
    
    const server = spawn('node', args, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    server.on('error', (err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
    
    server.on('exit', (code) => {
      if (code !== 0) {
        console.error('Server exited with code ' + code);
        process.exit(code);
      }
    });
  } catch (err) {
    console.error('Error starting server:', err.message);
    process.exit(1);
  }
}

// Start the server
startServer();
`;

/**
 * Write files with proper encoding
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created file: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`Error creating file ${filePath}:`, err);
    return false;
  }
}

/**
 * Create server files for both ESM and CommonJS
 */
function fixProductionServer() {
  console.log('Fixing production server for compatibility...');
  
  // Create ESM version
  writeFile(prodServerJs, esmServerContent);
  
  // Create CommonJS version
  writeFile(prodServerCjs, cjsServerContent);
  
  // Create launcher script
  writeFile(path.join(rootDir, 'start.js'), launcherContent);
  
  console.log('Production server files created successfully.');
  console.log('Use "node start.js" to launch the appropriate production server.');
}

// Run the fix
try {
  fixProductionServer();
} catch (err) {
  console.error('Failed to fix production server:', err);
  process.exit(1);
}
