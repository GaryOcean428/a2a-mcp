/**
 * MCP Integration Platform - Replit Deployment Configuration
 */

module.exports = {
  // Specify the deployment target (usually autoscale for production apps)
  deploymentTarget: "autoscale",
  
  // Build command to prepare the application for deployment
  build: ["sh", "-c", "npm run build"],
  
  // Run command for production - use the CommonJS version of the start script
  run: ["sh", "-c", "node start.cjs"],
  
  // Environment variables for production deployment
  env: {
    NODE_ENV: "production"
  }
};
