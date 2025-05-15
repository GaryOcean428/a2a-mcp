import { db } from '../db';
import { requestLogs, type RequestLog, type InsertRequestLog } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';

/**
 * Repository for request logging operations
 */
export class RequestLogRepository {
  private pool: Pool;
  
  constructor() {
    // Get the pool from the db connection
    this.pool = (db as any).client;
  }
  
  /**
   * Create a request log entry
   */
  async createRequestLog(log: InsertRequestLog): Promise<RequestLog> {
    try {
      // Convert log data to match the actual database structure
      const preparedLog = {
        userId: log.userId || null,
        endpoint: log.endpoint || '/',
        method: log.method || 'GET',
        requestData: log.requestData || {},
        responseData: log.responseData || null,
        statusCode: log.statusCode || null,
        executionTimeMs: log.executionTimeMs || null,
        toolType: log.toolType || 'unknown',
      };
      
      // Use drizzle ORM insert
      const [result] = await db.insert(requestLogs)
        .values(preparedLog)
        .returning();
      
      return result;
    } catch (error) {
      console.error('Error creating request log:', error);
      throw new Error('Failed to create request log');
    }
  }
  
  /**
   * Get request logs for a user
   */
  async getRequestLogs(userId: string | number, limit = 100): Promise<RequestLog[]> {
    try {
      // Convert userId to string if it's a number
      const userIdStr = typeof userId === 'number' ? String(userId) : userId;
      
      const result = await db.select()
        .from(requestLogs)
        .where(eq(requestLogs.userId, userIdStr))
        .orderBy(desc(requestLogs.timestamp))
        .limit(limit);
      
      return result;
    } catch (error) {
      console.error('Error getting request logs:', error);
      return [];
    }
  }
  
  /**
   * Get request logs for a user filtered by tool type
   */
  async getRequestLogsByToolType(userId: string | number, toolType: string, limit = 100): Promise<RequestLog[]> {
    try {
      // Convert userId to string if it's a number
      const userIdStr = typeof userId === 'number' ? String(userId) : userId;
      
      const result = await db.select()
        .from(requestLogs)
        .where(
          and(
            eq(requestLogs.userId, userIdStr),
            eq(requestLogs.toolType, toolType)
          )
        )
        .orderBy(desc(requestLogs.timestamp))
        .limit(limit);
      
      return result;
    } catch (error) {
      console.error('Error getting request logs by tool type:', error);
      return [];
    }
  }
}