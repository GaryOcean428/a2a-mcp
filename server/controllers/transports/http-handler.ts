import { Request, Response } from 'express';
import { mcpService } from '../../services/mcp-service';
import { storage } from '../../storage/index';
import { MCPRequest } from '@shared/schema';

/**
 * Handler for MCP HTTP requests
 */
export class HttpHandler {
  /**
   * Handle an MCP request via HTTP
   */
  async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      const request = req.body as MCPRequest;
      
      // Generate request ID if not provided
      if (!request.id) {
        request.id = mcpService.generateRequestId();
      }
      
      // Get user ID from request
      const userId = (req as any).user?.id;
      
      // Create request log entry
      const startTime = Date.now();
      if (userId) {
        await storage.createRequestLog({
          userId,
          toolType: request.name as any,
          requestData: request,
          responseData: null,
          statusCode: 0,
          executionTimeMs: 0
        });
      }
      
      // Process the request
      const response = await mcpService.processRequest(request);
      
      // Calculate execution time
      const executionTimeMs = Date.now() - startTime;
      
      // Update request log with response
      if (userId) {
        await storage.createRequestLog({
          userId,
          toolType: request.name as any,
          requestData: request,
          responseData: response,
          statusCode: response.error ? 400 : 200,
          executionTimeMs
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
}