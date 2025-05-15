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
   * Get a tool configuration by name and type
   */
  async getToolConfigByNameAndType(name: string, type: string): Promise<ToolConfig | undefined> {
    try {
      const [config] = await db.select()
        .from(toolConfigs)
        .where(
          and(
            eq(toolConfigs.name, name),
            eq(toolConfigs.type, type)
          )
        );
      return config;
    } catch (error) {
      console.error('Error getting tool config by name and type:', error);
      return undefined;
    }
  }
  
  /**
   * Get all tool configurations
   */
  async getAllToolConfigs(): Promise<ToolConfig[]> {
    try {
      return await db.select().from(toolConfigs);
    } catch (error) {
      console.error('Error getting all tool configs:', error);
      return [];
    }
  }
  
  /**
   * Get all enabled tool configurations
   */
  async getEnabledToolConfigs(): Promise<ToolConfig[]> {
    try {
      return await db.select()
        .from(toolConfigs)
        .where(eq(toolConfigs.enabled, true));
    } catch (error) {
      console.error('Error getting enabled tool configs:', error);
      return [];
    }
  }
  
  /**
   * Create a tool configuration
   */
  async createToolConfig(config: InsertToolConfig): Promise<ToolConfig> {
    try {
      const [toolConfig] = await db.insert(toolConfigs)
        .values({
          ...config,
          enabled: config.enabled ?? true
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