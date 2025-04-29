import { Request, Response } from 'express';
import { mcpService } from '../services/mcp-service';
import { storage } from '../storage/index';

/**
 * Controller for handling status and schema endpoints
 */
export class StatusController {
  /**
   * Get the schema for a specific tool
   */
  getSchema(req: Request, res: Response): void {
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
  getAllSchemas(_req: Request, res: Response): void {
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
  async getStatus(_req: Request, res: Response): Promise<void> {
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
  async getToolStatus(req: Request, res: Response): Promise<void> {
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
export const statusController = new StatusController();