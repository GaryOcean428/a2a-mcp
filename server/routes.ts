import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mcpController } from "./controllers/mcp-controller";
import { apiKeyAuth } from "./middleware/auth-middleware";
import { globalRateLimiter, toolRateLimiter } from "./middleware/rate-limit-middleware";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize MCP controller with WebSocket support
  mcpController.initialize(httpServer);
  
  // Apply global rate limiter to all API routes
  app.use('/api', globalRateLimiter.middleware());
  
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
  
  // Serve static HTML for root route
  app.get('/', (req, res) => {
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
  
  // Initialize STDIO transport for local MCP server
  // Only enable in development or when explicitly requested
  if (process.env.ENABLE_STDIO_TRANSPORT === 'true' || process.env.NODE_ENV === 'development') {
    mcpController.handleStdioRequest();
  }
  
  return httpServer;
}
