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
      const [config] = await db.select()
        .from(toolConfigs)
        .where(eq(toolConfigs.name, toolName));
      
      return {
        [toolName]: config?.enabled || false
      };
    } catch (error) {
      console.error(`Error getting status for tool ${toolName}:`, error);
      return { [toolName]: false };
    }
  }
  
  async updateToolStatus(toolName: string, status: any): Promise<void> {
    try {
      // First check if we have this tool in our config
      const [existingTool] = await db.select()
        .from(toolConfigs)
        .where(eq(toolConfigs.name, toolName));
        
      if (existingTool) {
        // Update the existing tool
        await db.update(toolConfigs)
          .set({
            config: {
              ...existingTool.config,
              ...status,
              lastUpdated: new Date().toISOString()
            }
          })
          .where(eq(toolConfigs.name, toolName));
      } else {
        // Create a new tool config
        await db.insert(toolConfigs)
          .values({
            name: toolName,
            type: 'tool',
            enabled: status.available !== false,
            config: {
              ...status,
              lastUpdated: new Date().toISOString()
            }
          });
      }
    } catch (error) {
      console.error(`Error updating tool status for ${toolName}:`, error);
    }
  }
  
  async getSystemStatus(): Promise<SystemStatus> {
    // Get all enabled tools
    const tools = await db.select()
      .from(toolConfigs)
      .where(eq(toolConfigs.enabled, true));
    
    const features: Record<string, boolean> = {};
    tools.forEach(tool => {
      features[tool.name] = true;
    });
    
    return {
      version: '0.1.0-alpha',
      uptime: process.uptime(),
      transport: 'http',
      wsEnabled: true,
      environment: process.env.NODE_ENV || 'development',
      features
    };
  }
  
  // Request logging methods
  async createRequestLog(log: any): Promise<any> {
    return this.requestLogRepository.createRequestLog(log);
  }
}

// Create and export storage instance
export const storage = new DatabaseStorage();