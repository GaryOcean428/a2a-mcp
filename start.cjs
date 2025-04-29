/**
 * MCP Integration Platform - Production Server Launcher (CommonJS)
 * 
 * This script launches the production server using CommonJS format.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine which production server file to use
function findProductionServer() {
  const cjsPath = path.join(__dirname, 'server/prod-server.cjs');
  const jsPath = path.join(__dirname, 'server/prod-server.js');
  
  // Always use the CommonJS version for maximum compatibility
  if (fs.existsSync(cjsPath)) {
    return cjsPath;
  } else if (fs.existsSync(jsPath)) {
    console.warn('Warning: Using ESM server file, may cause compatibility issues');
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
    
    // CommonJS version doesn't need special flags
    const server = spawn('node', [serverPath], {
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
