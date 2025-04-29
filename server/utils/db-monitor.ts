import { pool } from '../db';

/**
 * Database monitoring utility that logs pool statistics at regular intervals
 * and provides functions to check database health
 */
export class DatabaseMonitor {
  private monitorInterval: NodeJS.Timeout | null = null;
  private intervalSeconds: number;
  
  /**
   * Create a new database monitor
   * @param intervalSeconds How often to log statistics (in seconds)
   */
  constructor(intervalSeconds: number = 60) {
    this.intervalSeconds = intervalSeconds;
  }
  
  /**
   * Start monitoring database connection pool
   */
  start(): void {
    if (this.monitorInterval) {
      this.stop();
    }
    
    console.log(`Starting database monitor with ${this.intervalSeconds}s interval`);
    
    this.monitorInterval = setInterval(() => {
      this.logPoolStatistics();
    }, this.intervalSeconds * 1000);
    
    // Log initial statistics
    this.logPoolStatistics();
  }
  
  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('Database monitor stopped');
    }
  }
  
  /**
   * Log current pool statistics
   */
  logPoolStatistics(): void {
    const stats = this.getPoolStatistics();
    
    console.log('----- Database Pool Statistics -----');
    console.log(`Total connections: ${stats.totalCount}`);
    console.log(`Idle connections: ${stats.idleCount}`);
    console.log(`Waiting clients: ${stats.waitingCount}`);
    console.log('------------------------------------');
  }
  
  /**
   * Get current pool statistics
   */
  getPoolStatistics(): { totalCount: number; idleCount: number; waitingCount: number } {
    return {
      // @ts-ignore - These properties exist but aren't in the type definitions
      totalCount: pool.totalCount || 0,
      idleCount: pool.idleCount || 0,
      waitingCount: pool.waitingCount || 0
    };
  }
  
  /**
   * Perform a health check query to verify database connectivity
   */
  async performHealthCheck(): Promise<boolean> {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT 1 as health_check');
        return result.rows.length > 0 && result.rows[0].health_check === 1;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseMonitor = new DatabaseMonitor();
