import { Request, Response } from 'express';
import { databaseMonitor } from '../utils/db-monitor';

/**
 * Controller for health check endpoints
 */
export class HealthController {
  /**
   * Get overall system health status
   */
  async getHealth(_req: Request, res: Response): Promise<Response | void> {
    try {
      // Check database connectivity
      const dbHealthy = await databaseMonitor.performHealthCheck();
      
      // Get database pool statistics
      const dbStats = databaseMonitor.getPoolStatistics();
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      
      // Format health data
      const healthData = {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          healthy: dbHealthy,
          ...dbStats
        },
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        }
      };
      
      // Return 200 if healthy, 503 if not
      return res.status(dbHealthy ? 200 : 503).json(healthData);
    } catch (error) {
      console.error('Error getting health status:', error);
      
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Export singleton instance
export const healthController = new HealthController();
