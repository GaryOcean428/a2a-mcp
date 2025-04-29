/**
 * Static assets middleware for MCP Integration Platform
 * 
 * This middleware ensures proper content type headers for critical CSS files
 * and handles version-specific cache control.
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Get content type based on file extension
 */
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  const contentTypes: Record<string, string> = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.html': 'text/html',
    '.txt': 'text/plain',
  };
  
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Critical CSS middleware
 * This ensures the production.css file is served with correct headers
 */
export function criticalCssMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only handle production.css and deploy-verify.js
  if (req.path !== '/production.css' && req.path !== '/deploy-verify.js' && !req.path.startsWith('/assets/production.css')) {
    return next();
  }
  
  // Determine file path
  let filePath;
  if (req.path === '/production.css') {
    filePath = path.join(process.cwd(), 'public', 'production.css');
  } else if (req.path === '/deploy-verify.js') {
    filePath = path.join(process.cwd(), 'public', 'deploy-verify.js');
  } else {
    filePath = path.join(process.cwd(), 'dist', 'public', 'assets', 'production.css');
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`[StaticAssets] File not found: ${filePath}`);
    return next();
  }

  // Set content type and cache control headers
  res.setHeader('Content-Type', getContentType(filePath));
  
  // Add version query parameter for cache busting if not already present
  if (!req.query.v) {
    const version = Date.now().toString();
    req.url = `${req.path}?v=${version}`;
  }
  
  // Apply cache control
  const maxAge = 31536000; // 1 year in seconds
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  
  // Send the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`[StaticAssets] Error reading file: ${err.message}`);
      return next();
    }
    
    res.send(data);
  });
}

/**
 * Log static asset requests in development
 */
export function logStaticAssets(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'production') {
    if (req.path.endsWith('.css') || req.path.endsWith('.js')) {
      console.log(`[StaticAssets] Serving: ${req.path}${req.query.v ? `?v=${req.query.v}` : ''}`);
    }
  }
  next();
}

export default {
  criticalCssMiddleware,
  logStaticAssets
};