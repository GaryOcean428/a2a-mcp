/**
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
      console.log(`Found server implementation: ${variant.file}`);
      return variant;
    }
  }
  
  throw new Error('No production server implementation found');
}

// Start the appropriate server
function startServer() {
  try {
    const server = findProductionServer();
    console.log(`Starting server with: ${server.command} ${server.args.join(' ')}`);
    
    // Use spawn to keep the process running and pipe output
    const process = spawnSync(server.command, server.args, { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    // Check the result
    if (process.status !== 0) {
      console.error(`Server exited with code ${process.status}`);
      throw new Error('Server process failed');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Execute the server launcher
startServer();
