/**
 * MCP Integration Platform - Version Information
 * 
 * This file contains version information for the application.
 * It is used for logging, debugging, and cache busting.
 */

// Version format: major.minor.timestamp
// The timestamp ensures each build has a unique version
export const version = '1.0.' + Date.now();

// Build information
export const buildInfo = {
  timestamp: Date.now(),
  date: new Date().toISOString(),
  environment: process.env.NODE_ENV || import.meta.env.MODE,
  production: process.env.NODE_ENV === 'production' || import.meta.env.PROD
};

// Log version on startup
console.log(`MCP Integration Platform v${version}`);
console.log(`Build: ${buildInfo.date} (${buildInfo.environment})`);
