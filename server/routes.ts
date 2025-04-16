import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mcpController } from "./controllers/mcp-controller";
import { apiKeyAuth } from "./middleware/auth-middleware";
import { globalRateLimiter, toolRateLimiter } from "./middleware/rate-limit-middleware";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

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
  
  // Initialize MCP controller with WebSocket support
  mcpController.initialize(httpServer);
  
  // Apply global rate limiter to all API routes
  app.use('/api', globalRateLimiter.middleware());
  
  // Authentication routes
  app.post('/api/register', async (req, res) => {
    try {
      // Validate input
      const validatedData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUserByName = await storage.getUserByUsername(validatedData.username);
      if (existingUserByName) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      // Create new user
      const user = await storage.createUser(validatedData);
      
      // Sanitize response (remove password)
      const { password, ...userResponse } = user;
      
      res.status(201).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  
  app.post('/api/login', async (req, res) => {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);
      
      // Authenticate user
      const user = await storage.validateUserCredentials(
        validatedData.username,
        validatedData.password
      );
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login time
      await storage.updateUserLastLogin(user.id);
      
      // Sanitize response (remove password)
      const { password, ...userResponse } = user;
      
      res.status(200).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
  
  // API Key management routes (protected)
  app.post('/api/keys/generate', apiKeyAuth, async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const apiKey = await storage.generateApiKey(userId);
      res.status(200).json({ apiKey });
    } catch (error) {
      console.error('API key generation error:', error);
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  });
  
  app.post('/api/keys/revoke', apiKeyAuth, async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      await storage.revokeApiKey(userId);
      res.status(200).json({ message: 'API key revoked successfully' });
    } catch (error) {
      console.error('API key revocation error:', error);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  });
  
  // User profile route (protected)
  app.get('/api/user/profile', apiKeyAuth, async (req, res) => {
    try {
      const apiKey = req.header('X-API-Key');
      if (!apiKey) {
        return res.status(401).json({ error: 'API key is required' });
      }
      
      const user = await storage.getUserByApiKey(apiKey);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Sanitize response (remove password)
      const { password, ...userProfile } = user;
      
      res.status(200).json(userProfile);
    } catch (error) {
      console.error('Profile retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve profile' });
    }
  });
  
  // MCP API route for HTTP transport
  app.post('/api/mcp', 
    apiKeyAuth, 
    toolRateLimiter.middleware(), 
    mcpController.handleHttpRequest.bind(mcpController)
  );
  
  // Tool schema routes
  app.get('/api/schema', mcpController.getAllSchemas.bind(mcpController));
  app.get('/api/schema/:toolName', mcpController.getSchema.bind(mcpController));
  
  // Status routes
  app.get('/api/status', mcpController.getStatus.bind(mcpController));
  app.get('/api/status/:toolName', mcpController.getToolStatus.bind(mcpController));
  
  // Serve static HTML for all client routes to enable client-side routing
  app.get(['/', '/auth', '/web-search', '/form-automation', '/vector-storage', 
           '/data-scraping', '/settings', '/documentation'], (req, res) => {
    const htmlPath = path.join(process.cwd(), 'client/index.html');
    
    try {
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        res.status(404).send('HTML file not found');
      }
    } catch (error) {
      console.error('Error serving HTML file:', error);
      res.status(500).send('Error serving HTML file');
    }
  });
  
  // Add a test route
  app.get('/test', (req, res) => {
    res.send({ 
      message: 'Hello from the MCP Integration Platform!',
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
  });
  
  // Catch-all route to support client-side routing
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    const htmlPath = path.join(process.cwd(), 'client/index.html');
    
    try {
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        res.status(404).send('HTML file not found');
      }
    } catch (error) {
      console.error('Error serving HTML file:', error);
      res.status(500).send('Error serving HTML file');
    }
  });
  
  // Initialize STDIO transport for local MCP server
  // Only enable in development or when explicitly requested
  if (process.env.ENABLE_STDIO_TRANSPORT === 'true' || process.env.NODE_ENV === 'development') {
    mcpController.handleStdioRequest();
  }
  
  return httpServer;
}
