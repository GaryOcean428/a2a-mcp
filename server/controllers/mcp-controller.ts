import { Request, Response } from 'express';
import { mcpService } from '../services/mcp-service';
import { storage } from '../storage';
import { WebSocketServer, WebSocket } from 'ws';
import { MCPRequest, MCPResponse } from '@shared/schema';
import { Server } from 'http';
import { nanoid } from 'nanoid';

const STDIO_RESPONSE_DELAY = 50; // Small delay to simulate IO

/**
 * Controller for handling MCP API endpoints and WebSocket connections
 */
export class MCPController {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  
  /**
   * Initialize WebSocket server for SSE transport
   */
  initialize(server: Server) {
    // Use a specific path for the WebSocket server to avoid conflicts with Vite's HMR WebSocket
    try {
      this.wss = new WebSocketServer({ 
        server,
        path: '/mcp-ws'
      });
      
      console.log('WebSocket server initialized at path: /mcp-ws');
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
    }
    
    // Handle WebSocket server errors
    if (this.wss) {
      this.wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
      });
      
      this.wss.on('connection', (ws, req) => {
      const clientId = nanoid();
      this.clients.set(clientId, ws);
      
      // Log client connection with IP and URL
      const ip = req.socket.remoteAddress || 'unknown';
      const url = req.url || 'unknown';
      console.log(`New WebSocket client connected: ${clientId} from ${ip}, url: ${url}`);
      
      // Check connection health with WebSocket ready state
      if (ws.readyState === WebSocket.OPEN) {
        console.log(`Client ${clientId} connection is OPEN`);
        
        // Send tool schema list on connection
        try {
          const schemas = mcpService.getToolSchema();
          ws.send(JSON.stringify({
            event: 'schemas',
            data: schemas
          }));
          console.log(`Sent schemas to client ${clientId}`);
        } catch (error) {
          console.error(`Error sending schemas to client ${clientId}:`, error);
        }
      } else {
        console.warn(`Client ${clientId} connection not open, state: ${ws.readyState}`);
      }
      
      // Setup ping interval to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000); // Send ping every 30 seconds
      
      ws.on('message', async (message) => {
        try {
          // Log the raw message for debugging
          console.log(`Received WebSocket message from ${clientId}: ${message.toString().substring(0, 100)}...`);
          
          const data = JSON.parse(message.toString());
          
          if (data.type === 'mcp_request') {
            await this.handleWebSocketRequest(clientId, ws, data.request);
          } else if (data.type === 'ping') {
            // Respond to ping messages
            ws.send(JSON.stringify({
              event: 'pong',
              timestamp: Date.now()
            }));
          }
        } catch (error) {
          console.error(`Error processing WebSocket message from ${clientId}:`, error);
          
          // Only send error response if connection is still open
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              event: 'error',
              data: {
                message: error instanceof Error ? error.message : String(error)
              }
            }));
          }
        }
      });
      
      ws.on('pong', () => {
        // Handle pong responses to keep track of client latency
        console.log(`Received pong from client ${clientId}`);
      });
      
      ws.on('close', (code, reason) => {
        console.log(`WebSocket client ${clientId} disconnected: code ${code}, reason: ${reason || 'none'}`);
        this.clients.delete(clientId);
        clearInterval(pingInterval);
      });
      
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
    });
    }
  }
  
  /**
   * Handle MCP requests via HTTP
   */
  async handleHttpRequest(req: Request, res: Response) {
    try {
      const request = req.body as MCPRequest;
      
      // Generate request ID if not provided
      if (!request.id) {
        request.id = mcpService.generateRequestId();
      }
      
      // Get user ID from request
      const userId = (req as any).user?.id;
      
      // Create request log entry
      if (userId) {
        await storage.createRequestLog({
          userId,
          toolType: request.name as any, // Cast to any to avoid type issues
          requestData: request,
          responseData: null,
          statusCode: 0,
          executionTimeMs: 0
        });
      }
      
      // Process the request
      const response = await mcpService.processRequest(request);
      
      // Update request log with response
      if (userId) {
        await storage.createRequestLog({
          userId,
          toolType: request.name as any, // Cast to any to avoid type issues
          requestData: request,
          responseData: response,
          statusCode: response.error ? 400 : 200,
          executionTimeMs: 0
        });
      }
      
      res.json(response);
    } catch (error) {
      console.error('Error handling MCP HTTP request:', error);
      
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'SERVER_ERROR'
        }
      });
    }
  }
  
  /**
   * Handle MCP requests via WebSocket
   */
  private async handleWebSocketRequest(clientId: string, ws: WebSocket, request: MCPRequest) {
    try {
      // Generate request ID if not provided
      if (!request.id) {
        request.id = mcpService.generateRequestId();
      }
      
      // Process the request
      const response = await mcpService.processRequest(request);
      
      // Send the response
      ws.send(JSON.stringify({
        event: 'response',
        data: response
      }));
    } catch (error) {
      console.error('Error handling WebSocket request:', error);
      
      ws.send(JSON.stringify({
        event: 'error',
        data: {
          message: error instanceof Error ? error.message : String(error),
          requestId: request.id
        }
      }));
    }
  }
  
  /**
   * Handle MCP STDIO transport requests from stdin
   */
  async handleStdioRequest() {
    // Listen for requests on stdin
    process.stdin.on('data', async (chunk) => {
      try {
        const input = chunk.toString().trim();
        
        // Try to parse as JSON
        const request = JSON.parse(input) as MCPRequest;
        
        // Generate request ID if not provided
        if (!request.id) {
          request.id = mcpService.generateRequestId();
        }
        
        // Process the request
        const response = await mcpService.processRequest(request);
        
        // Add a small delay to simulate IO
        setTimeout(() => {
          // Write response to stdout
          process.stdout.write(JSON.stringify(response) + '\n');
        }, STDIO_RESPONSE_DELAY);
      } catch (error) {
        console.error('Error handling STDIO request:', error);
        
        const errorResponse: MCPResponse = {
          id: 'error',
          error: {
            message: error instanceof Error ? error.message : String(error),
            code: 'PARSE_ERROR'
          }
        };
        
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    });
    
    // Send available tool schemas to stdout
    const schemas = mcpService.getToolSchema();
    process.stdout.write(JSON.stringify({
      id: 'schemas',
      schemas
    }) + '\n');
    
    console.log('STDIO transport initialized');
  }
  
  /**
   * Get the tool schema
   */
  getSchema(req: Request, res: Response) {
    try {
      const toolName = req.params.toolName;
      const schema = mcpService.getToolSchema(toolName);
      
      if (!schema) {
        return res.status(404).json({
          error: {
            message: `Tool '${toolName}' not found`,
            code: 'TOOL_NOT_FOUND'
          }
        });
      }
      
      res.json(schema);
    } catch (error) {
      console.error('Error getting tool schema:', error);
      
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'SERVER_ERROR'
        }
      });
    }
  }
  
  /**
   * Get all tool schemas
   */
  getAllSchemas(_req: Request, res: Response) {
    try {
      const schemas = mcpService.getToolSchema();
      res.json(schemas);
    } catch (error) {
      console.error('Error getting all tool schemas:', error);
      
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'SERVER_ERROR'
        }
      });
    }
  }
  
  /**
   * Get system status
   */
  async getStatus(_req: Request, res: Response) {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting system status:', error);
      
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'SERVER_ERROR'
        }
      });
    }
  }
  
  /**
   * Get tool status
   */
  async getToolStatus(req: Request, res: Response) {
    try {
      const toolName = req.params.toolName;
      const status = await storage.getToolStatus(toolName);
      
      if (status.length === 0) {
        return res.status(404).json({
          error: {
            message: `Tool '${toolName}' not found`,
            code: 'TOOL_NOT_FOUND'
          }
        });
      }
      
      res.json(status[0]);
    } catch (error) {
      console.error('Error getting tool status:', error);
      
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'SERVER_ERROR'
        }
      });
    }
  }
}

// Export singleton instance
export const mcpController = new MCPController();
