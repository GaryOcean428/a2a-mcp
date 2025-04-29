/**
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
