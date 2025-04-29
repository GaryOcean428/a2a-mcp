/**
 * MCP Integration Platform - Production Server Launcher
 * 
 * This script launches the correct production server based on the environment.
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
const { spawn } = require('child_process');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine which server version to use
const useCommonJS = process.env.USE_COMMONJS === 'true';
const serverPath = useCommonJS ? 
  path.join(__dirname, 'server', 'prod-server.cjs') :
  path.join(__dirname, 'server', 'prod-server.js');


// Launch the server
function startServer() {
  try {
    console.log('Starting production server: ' + serverPath);
    
    // Launch the server with the appropriate Node.js flags
    const args = useCommonJS ? [] : ['--experimental-modules'];
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