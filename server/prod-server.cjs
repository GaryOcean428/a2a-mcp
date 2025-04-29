/**
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
      console.log(`MCP Production Server (CommonJS) listening on port ${port}`);
    });
    
    return httpServer;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);
