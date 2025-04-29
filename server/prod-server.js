/**
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
  console.log(`MCP Production Server (ESM) listening on port ${port}`);
});
