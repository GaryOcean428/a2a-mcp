/**
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
