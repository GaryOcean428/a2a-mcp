import { Request, Response } from 'express';
import { storage } from '../storage';
import { databaseMonitor } from '../utils/db-monitor';
import logger from '../utils/logger';

// Create a specialized logger for status operations
const statusLogger = logger.child('Status');

/**
 * Controller for system and tool status endpoints
 */
export class StatusController {
  /**
   * Get the overall system status including available tools
   */
  async getSystemStatus(req: Request, res: Response): Promise<Response | void> {
    try {
      const systemStatus = await storage.getSystemStatus();
      
      // Add additional runtime information
      const enhancedStatus = {
        ...systemStatus,
        nodeVersion: process.version,
        platform: process.platform,
        hostname: req.hostname,
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      };
      
      statusLogger.debug('System status requested', { 
        client: req.ip,
        uptime: systemStatus.uptime
      });
      
      return res.status(200).json(enhancedStatus);
    } catch (error) {
      statusLogger.error('Error getting system status:', error);
      return res.status(500).json({ error: 'Failed to retrieve system status' });
    }
  }
  
  /**
   * Get the status of a specific tool or all tools
   */
  async getToolStatus(req: Request, res: Response): Promise<Response | void> {
    try {
      const toolName = req.params.toolName;
      const toolStatus = await storage.getToolStatus(toolName);
      
      if (toolName && toolStatus.length === 0) {
        statusLogger.warn('Tool status requested for unknown tool', { toolName });
        return res.status(404).json({ error: `Tool '${toolName}' not found` });
      }
      
      statusLogger.debug('Tool status requested', { 
        client: req.ip,
        toolName: toolName || 'all',
        toolCount: toolStatus.length
      });
      
      return res.status(200).json(toolStatus);
    } catch (error) {
      statusLogger.error('Error getting tool status:', error);
      return res.status(500).json({ error: 'Failed to retrieve tool status' });
    }
  }
  
  /**
   * Get detailed system health metrics including database status
   */
  async getHealthMetrics(req: Request, res: Response): Promise<Response | void> {
    try {
      // Add database health check
      const dbHealthy = await databaseMonitor.performHealthCheck();
      const dbStats = databaseMonitor.getPoolStatistics();
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      
      // Get uptime from system status
      const systemStatus = await storage.getSystemStatus();
      
      // Get active tools count
      const activeTools = await storage.getToolStatus();
      const activeToolsCount = activeTools.filter(tool => tool.available).length;
      
      // Format health data
      const healthData = {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: systemStatus.uptime,
        environment: process.env.NODE_ENV || 'development',
        hostname: req.hostname,
        database: {
          healthy: dbHealthy,
          ...dbStats
        },
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        },
        tools: {
          total: activeTools.length,
          active: activeToolsCount
        }
      };
      
      statusLogger.debug('Health metrics requested', { 
        client: req.ip, 
        healthy: dbHealthy
      });
      
      // Return 200 if healthy, 503 if not
      return res.status(dbHealthy ? 200 : 503).json(healthData);
    } catch (error) {
      statusLogger.error('Error getting health status:', error);
      
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Export singleton instance
export const statusController = new StatusController();
