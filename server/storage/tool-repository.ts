import { db } from '../db';
import { toolConfigs, type ToolConfig, type InsertToolConfig } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Repository for tool configuration operations
 */
export class ToolRepository {
  /**
   * Get a tool configuration by ID
   */
  async getToolConfig(id: number): Promise<ToolConfig | undefined> {
    try {
      const [config] = await db.select().from(toolConfigs).where(eq(toolConfigs.id, id));
      return config;
    } catch (error) {
      console.error('Error getting tool config:', error);
      return undefined;
    }
  }
  
  /**
   * Get a tool configuration by user ID and tool type
   */
  async getToolConfigByUserAndType(userId: number, toolType: string): Promise<ToolConfig | undefined> {
    try {
      const [config] = await db.select()
        .from(toolConfigs)
        .where(
          and(
            eq(toolConfigs.userId, userId),
            // Use direct SQL comparison for enum value
            eq(toolConfigs.toolType as any, toolType)
          )
        );
      return config;
    } catch (error) {
      console.error('Error getting tool config by user and type:', error);
      return undefined;
    }
  }
  
  /**
   * Get all tool configurations for a user
   */
  async getAllToolConfigs(userId: number): Promise<ToolConfig[]> {
    try {
      return await db.select()
        .from(toolConfigs)
        .where(eq(toolConfigs.userId, userId));
    } catch (error) {
      console.error('Error getting all tool configs:', error);
      return [];
    }
  }
  
  /**
   * Create a tool configuration
   */
  async createToolConfig(config: InsertToolConfig): Promise<ToolConfig> {
    try {
      const now = new Date();
      const [toolConfig] = await db.insert(toolConfigs)
        .values({
          ...config,
          active: config.active ?? true,
          createdAt: now,
          updatedAt: now
        })
        .returning();
      return toolConfig;
    } catch (error) {
      console.error('Error creating tool config:', error);
      throw new Error('Failed to create tool config');
    }
  }
  
  /**
   * Update a tool configuration
   */
  async updateToolConfig(id: number, configUpdate: Partial<ToolConfig>): Promise<ToolConfig | undefined> {
    try {
      const [updatedConfig] = await db.update(toolConfigs)
        .set({
          ...configUpdate,
          updatedAt: new Date()
        })
        .where(eq(toolConfigs.id, id))
        .returning();
      return updatedConfig;
    } catch (error) {
      console.error('Error updating tool config:', error);
      return undefined;
    }
  }
}