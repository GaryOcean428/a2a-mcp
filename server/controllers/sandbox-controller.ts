import { Request, Response } from 'express';
import { sandboxService } from '../services/sandbox-service';
import { sandboxSchema } from '@shared/schema';
import { storage } from '../storage';

/**
 * Controller for sandbox operations
 */
export class SandboxController {
  /**
   * Handle sandbox operation request
   */
  async handleRequest(req: Request, res: Response) {
    try {
      // Validate the request
      const validationResult = sandboxSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request parameters',
          details: validationResult.error.errors
        });
      }
      
      const params = validationResult.data;
      
      // Log the request
      const log = await storage.createRequestLog({
        userId: req.user?.id || 0,
        toolType: 'sandbox',
        requestData: params,
        statusCode: 200,
        executionTimeMs: 0
      });
      
      const startTime = Date.now();
      
      try {
        // Execute the sandbox operation
        const result = await sandboxService.handleOperation(params);
        
        // Update the tool status
        const executionTime = Date.now() - startTime;
        await storage.updateToolStatus('sandbox', {
          name: 'sandbox',
          available: true,
          latency: executionTime,
          lastUsed: new Date().toISOString()
        });
        
        // Since there's no direct updateRequestLog method, we'll just log the result
        console.log(`Sandbox operation completed in ${executionTime}ms, ID: ${log.id}`);
        // In a production system, we would update the log with the result
        
        return res.json(result);
      } catch (error: any) {
        // Handle errors
        const executionTime = Date.now() - startTime;
        // Create a new log entry for the error instead of updating
        // since the storage interface doesn't have an updateRequestLog method
        await storage.createRequestLog({
          userId: req.user?.id || 0,
          toolType: 'sandbox',
          requestData: req.body,
          responseData: { error: error.message },
          executionTimeMs: executionTime,
          statusCode: 500
        });
        
        return res.status(500).json({
          error: error.message
        });
      }
    } catch (error: any) {
      console.error('Error in sandbox controller:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}

export const sandboxController = new SandboxController();