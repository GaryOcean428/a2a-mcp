import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage/index";
import { mcpController } from "./controllers/mcp-controller";
import { sandboxController } from "./controllers/sandbox-controller";
import { statusController } from "./controllers/status-controller";
import { databaseMonitor } from "./utils/db-monitor";
// No longer using API key auth with Replit Auth
import { globalRateLimiter, toolRateLimiter } from "./middleware/rate-limit-middleware";
import { setupApiDocs } from "./middleware/api-docs";
import staticAssets from "./middleware/static-assets";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Cache control middleware for production static assets
const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  // Add cache busting for CSS and JS files in production
  if (process.env.NODE_ENV === 'production') {
    if (req.path.endsWith('.css') || req.path.endsWith('.js')) {
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
  next();
};

// Create authentication validation schemas
const loginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6)
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6).max(100),
  email: z.string().email()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Start database monitoring
  databaseMonitor.start();
  
  // Apply CSS middleware first to serve critical CSS files properly
  app.use(staticAssets.criticalCssMiddleware);
  
  // Then apply cache control middleware for other static assets
  app.use(cacheControl);
  
  // Log static asset requests in development
  app.use(staticAssets.logStaticAssets);
  
  // Initialize MCP controller with WebSocket support
  mcpController.initialize(httpServer);
  
  // Apply global rate limiter to all API routes
  app.use('/api', globalRateLimiter.middleware());
  
  // Set up authentication system with Passport
  setupAuth(app);
  
  // Set up Swagger UI for API documentation
  setupApiDocs(app);
  
  // Add route validation middleware for auth routes
  app.use('/api/login', (req, res, next) => {
    if (req.method === 'POST') {
      try {
        loginSchema.parse(req.body);
        next();
      } catch (error: any) {
        res.status(400).json({ error: 'Invalid login data', details: error.errors || 'Validation error' });
      }
    } else {
      next();
    }
  });
  
  app.use('/api/register', (req, res, next) => {
    if (req.method === 'POST') {
      try {
        registerSchema.parse(req.body);
        next();
      } catch (error: any) {
        res.status(400).json({ error: 'Invalid registration data', details: error.errors || 'Validation error' });
      }
    } else {
      next();
    }
  });
  
  // API routes are protected by Replit Auth instead of API Keys
  
  // User profile route (protected by Replit Auth)
  app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Profile retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve profile' });
    }
  });
  
  // Standard /api/user endpoint for backward compatibility
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('User retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve user data' });
    }
  });
  
  // MCP API route for HTTP transport
  app.post('/api/mcp', 
    isAuthenticated, 
    toolRateLimiter.middleware(), 
    mcpController.handleHttpRequest.bind(mcpController)
  );
  
  // Tool schema routes
  app.get('/api/schema', mcpController.getAllSchemas.bind(mcpController));
  app.get('/api/schema/:toolName', mcpController.getSchema.bind(mcpController));
  
  // Status and health routes
  app.get('/api/status', statusController.getSystemStatus.bind(statusController));
  app.get('/api/status/:toolName', statusController.getToolStatus.bind(statusController));
  app.get('/api/health', statusController.getHealthMetrics.bind(statusController));
  app.get('/api/metrics', statusController.getHealthMetrics.bind(statusController)); // Alias for compatibility
  
  // Sandbox API endpoint
  app.post('/api/sandbox', isAuthenticated, toolRateLimiter.middleware(), sandboxController.handleRequest.bind(sandboxController));
  
  // Documentation API routes
  app.get('/api/documentation', (req, res) => {
    try {
      const docPath = path.join(process.cwd(), 'README.md');
      if (fs.existsSync(docPath)) {
        const content = fs.readFileSync(docPath, 'utf-8');
        res.setHeader('Content-Type', 'text/markdown');
        res.send(content);
      } else {
        // If README.md doesn't exist, create a simple documentation
        const fallbackContent = `# MCP Integration Platform Documentation

## Overview
The MCP Integration Platform provides a standardized interface for AI applications to leverage web search, form automation, vector storage, and data scraping capabilities.

## Features
- **Web Search**: Search the web with multiple provider options (Tavily, Perplexity, OpenAI)
- **Form Automation**: Fill and submit web forms programmatically
- **Vector Storage**: Connect to vector databases for semantic search and retrieval
- **Data Scraping**: Extract structured data from websites with configurable policies

## API Access
To use the API, you need to:
1. Register for an account
2. Generate an API key through the settings page
3. Include the API key in your requests using the \`X-API-Key\` header

## For more information
Check out the [Cline Integration Guide](/cline-integration) for detailed usage examples.
`;
        res.setHeader('Content-Type', 'text/markdown');
        res.send(fallbackContent);
      }
    } catch (error) {
      console.error('Error serving documentation:', error);
      res.status(500).send('Error loading documentation');
    }
  });

  app.get('/api/cline-integration', (req, res) => {
    try {
      const clineDocsPath = path.join(process.cwd(), 'CLINE_INTEGRATION.md');
      if (fs.existsSync(clineDocsPath)) {
        // Read the content and dynamically replace the localhost URL with the current host
        let content = fs.readFileSync(clineDocsPath, 'utf-8');
        
        // Get the current host from the request
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
        const currentUrl = `${protocol}://${host}/api/mcp`;
        
        // Replace placeholder URLs with the current URL in the documentation
        content = content.replace(/https:\/\/\[YOUR-REPLIT-URL\]\/api\/mcp/g, currentUrl);
        
        res.setHeader('Content-Type', 'text/markdown');
        res.send(content);
      } else {
        res.status(404).send('# Cline Integration Documentation Not Found\n\nThe integration guide appears to be missing.');
      }
    } catch (error) {
      console.error('Error serving Cline integration guide:', error);
      res.status(500).send('Error loading Cline integration guide');
    }
  });
  
  // Provide the Cline configuration with current server URL
  app.get('/api/cline-config', (req, res) => {
    try {
      const configPath = path.join(process.cwd(), 'CLINE_SERVER_CONFIG.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Get the current host from the request
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
        
        // Construct clean URL with normalized paths
        // Ensure there are no double slashes in the URL
        const baseUrl = `${protocol}://${host}`;
        const apiPath = '/api/mcp';
        const cleanUrl = baseUrl + apiPath;
        
        // Update the URL with the actual server URL
        config.server.url = cleanUrl;
        
        // Log the generated URL for debugging
        console.log(`Generated Cline config URL: ${cleanUrl}`);
        
        res.json(config);
      } else {
        res.status(404).json({ error: 'Cline server configuration not found' });
      }
    } catch (error) {
      console.error('Failed to read Cline server configuration:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // We'll rely on the catch-all route at the end to handle client-side routing
  
  // Add a test route
  app.get('/test', (req, res) => {
    res.send({ 
      message: 'Hello from the MCP Integration Platform!',
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
  });
  
  // Serve standalone auth page
  app.get('/auth-standalone', (req, res) => {
    const standaloneAuthPath = path.join(process.cwd(), 'client/standalone-auth.html');
    if (fs.existsSync(standaloneAuthPath)) {
      res.sendFile(standaloneAuthPath);
    } else {
      res.status(404).send('Authentication page not found');
    }
  });
  
  // Add the catch-all route for production mode only
  if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      
      res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
    });
  }
  
  // Initialize STDIO transport for local MCP server
  // Only enable in development or when explicitly requested
  if (process.env.ENABLE_STDIO_TRANSPORT === 'true' || process.env.NODE_ENV === 'development') {
    mcpController.handleStdioRequest();
  }
  
  // Set up graceful shutdown
  const gracefulShutdown = async () => {
    console.log('Received shutdown signal, stopping server...');
    
    // Stop database monitoring
    databaseMonitor.stop();
    
    // Close the HTTP server
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    
    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  // Listen for termination signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  return httpServer;
}
