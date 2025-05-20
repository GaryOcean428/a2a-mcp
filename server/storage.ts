import { users, toolConfigs, type User, type InsertUser, type ToolConfig, type SystemStatus } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { IStorage } from "@shared/storage-interface";
import { ToolRepository } from "./storage/tool-repository";
import { RequestLogRepository } from "./storage/request-log-repository";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private toolRepository: ToolRepository;
  private requestLogRepository: RequestLogRepository;

  constructor() {
    this.toolRepository = new ToolRepository();
    this.requestLogRepository = new RequestLogRepository();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Tool Configuration methods
  async getToolConfig(id: number): Promise<ToolConfig | undefined> {
    return this.toolRepository.getToolConfig(id);
  }
  
  async getAllToolConfigs(): Promise<ToolConfig[]> {
    return this.toolRepository.getAllToolConfigs();
  }
  
  async createToolConfig(config: any): Promise<ToolConfig> {
    return this.toolRepository.createToolConfig(config);
  }
  
  // Status methods
  async getToolStatus(toolName: string): Promise<Record<string, boolean>> {
    try {
      // Use a raw query to match the actual database schema
      const query = "SELECT id, tool_type, active FROM tool_configs WHERE tool_type = $1";
      const result = await (db as any).client.query(query, [toolName]);
      
      const config = result.rows && result.rows.length > 0 ? result.rows[0] : null;
      
      return {
        [toolName]: config?.active || false
      };
    } catch (error) {
      console.error(`Error getting status for tool ${toolName}:`, error);
      return { [toolName]: false };
    }
  }
  
  async updateToolStatus(toolName: string, status: any): Promise<void> {
    try {
      // Use raw queries to match the actual database schema
      const checkQuery = "SELECT id, tool_type, active, config FROM tool_configs WHERE tool_type = $1";
      const result = await (db as any).client.query(checkQuery, [toolName]);
      
      const existingTool = result.rows && result.rows.length > 0 ? result.rows[0] : null;
        
      if (existingTool) {
        // Update the existing tool
        const updateQuery = `
          UPDATE tool_configs 
          SET config = $1, 
              updated_at = $2
          WHERE tool_type = $3
        `;
        
        const updatedConfig = {
          ...(existingTool.config || {}),
          ...status,
          lastUpdated: new Date().toISOString()
        };
        
        await (db as any).client.query(updateQuery, [
          updatedConfig, 
          new Date(), 
          toolName
        ]);
      } else {
        // Create a new tool config
        const insertQuery = `
          INSERT INTO tool_configs 
          (tool_type, active, config, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5)
        `;
        
        const newConfig = {
          ...status,
          lastUpdated: new Date().toISOString()
        };
        
        const now = new Date();
        
        await (db as any).client.query(insertQuery, [
          toolName,
          status.available !== false,
          newConfig,
          now,
          now
        ]);
      }
    } catch (error) {
      console.error(`Error updating tool status for ${toolName}:`, error);
    }
  }
  
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // Use raw query to match the actual database schema
      const rawQuery = "SELECT id, tool_type, active FROM tool_configs WHERE active = true";
      const result = await (db as any).client.query(rawQuery);
      
      const features: Record<string, boolean> = {};
      const activeTools: string[] = [];
      
      if (result.rows && result.rows.length > 0) {
        result.rows.forEach((tool: any) => {
          // Use tool_type as the feature name
          const featureName = tool.tool_type || `tool-${tool.id}`;
          features[featureName] = true;
          activeTools.push(featureName);
        });
      }
      
      // Add default features
      features['api'] = true;
      features['websocket'] = true;
      features['database'] = true;
      
      if (!activeTools.includes('api')) activeTools.push('api');
      if (!activeTools.includes('websocket')) activeTools.push('websocket');
      if (!activeTools.includes('database')) activeTools.push('database');
      
      return {
        version: '0.1.0-alpha',
        uptime: process.uptime(),
        transport: 'http',
        wsEnabled: true,
        environment: process.env.NODE_ENV || 'development',
        features,
        activeTools
      };
    } catch (error) {
      console.error("Error in getSystemStatus:", error);
      
      // Return minimal system status on error
      return {
        version: '0.1.0-alpha',
        uptime: process.uptime(),
        transport: 'http',
        wsEnabled: true,
        environment: process.env.NODE_ENV || 'development',
        features: {
          'api': true, 
          'database': false, 
          'websocket': true
        },
        activeTools: ['api', 'websocket']
      };
    }
  }
  
  // Request logging methods
  async createRequestLog(log: any): Promise<any> {
    return this.requestLogRepository.createRequestLog(log);
  }
}

// Create and export storage instance
export const storage = new DatabaseStorage();