import { db } from '../db';
import { requestLogs, type RequestLog, type InsertRequestLog } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Repository for request log related database operations
 */
export class RequestLogRepository {
  /**
   * Create a new request log entry
   */
  async createRequestLog(log: InsertRequestLog): Promise<RequestLog> {
    try {
      const [requestLog] = await db.insert(requestLogs)
        .values({
          ...log,
          userId: log.userId ?? null,
          statusCode: log.statusCode ?? null,
          executionTimeMs: log.executionTimeMs ?? null,
          responseData: log.responseData ?? null,
          timestamp: new Date()
        })
        .returning();
      
      return requestLog;
    } catch (error) {
      console.error('Error creating request log:', error);
      throw new Error('Failed to create request log');
    }
  }
  
  /**
   * Get request logs for a user
   */
  async getRequestLogs(userId: number, limit = 100): Promise<RequestLog[]> {
    try {
      return await db.select()
        .from(requestLogs)
        .where(eq(requestLogs.userId, userId))
        .orderBy(desc(requestLogs.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('Error getting request logs:', error);
      return [];
    }
  }
  
  /**
   * Get request logs for a user filtered by tool type
   */
  async getRequestLogsByToolType(userId: number, toolType: string, limit = 100): Promise<RequestLog[]> {
    try {
      return await db.select()
        .from(requestLogs)
        .where(
          and(
            eq(requestLogs.userId, userId),
            eq(requestLogs.toolType as any, toolType)
          )
        )
        .orderBy(desc(requestLogs.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('Error getting request logs by tool type:', error);
      return [];
    }
  }
}