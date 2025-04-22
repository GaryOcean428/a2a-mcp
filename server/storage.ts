import { 
  users, 
  toolConfigs, 
  requestLogs,
  type User, 
  type InsertUser, 
  type ToolConfig, 
  type InsertToolConfig,
  type RequestLog,
  type InsertRequestLog,
  type SystemStatus,
  type ToolStatus
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserApiKey(userId: number, apiKey: string | null): Promise<void>;
  validateUserCredentials(username: string, password: string): Promise<User | undefined>;
  generateApiKey(userId: number): Promise<string>;
  revokeApiKey(userId: number): Promise<void>;
  updateUserLastLogin(userId: number): Promise<void>;
  updateUserRole(userId: number, role: string): Promise<void>;
  updateUserActiveStatus(userId: number, active: boolean): Promise<void>;
  
  // Tool configuration operations
  getToolConfig(id: number): Promise<ToolConfig | undefined>;
  getToolConfigByUserAndType(userId: number, toolType: string): Promise<ToolConfig | undefined>;
  getAllToolConfigs(userId: number): Promise<ToolConfig[]>;
  createToolConfig(config: InsertToolConfig): Promise<ToolConfig>;
  updateToolConfig(id: number, config: Partial<ToolConfig>): Promise<ToolConfig | undefined>;
  
  // Request logging operations
  createRequestLog(log: InsertRequestLog): Promise<RequestLog>;
  getRequestLogs(userId: number, limit?: number): Promise<RequestLog[]>;
  getRequestLogsByToolType(userId: number, toolType: string, limit?: number): Promise<RequestLog[]>;
  
  // Status operations
  getSystemStatus(): Promise<SystemStatus>;
  getToolStatus(toolName?: string): Promise<ToolStatus[]>;
  updateToolStatus(toolName: string, status: Partial<ToolStatus>): Promise<void>;
}

import { db } from './db';
import { eq, or, and, desc } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import session from 'express-session';
import ConnectPg from 'connect-pg-simple';
import { pool } from './db';

// Session store setup
const PostgresSessionStore = ConnectPg(session);

// Async versions of crypto functions
const scryptAsync = promisify(scrypt);

/**
 * Hash a password using scrypt
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare a supplied password with a stored hash
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    // Handle case when stored password doesn't have the expected format
    if (!stored || !stored.includes('.')) {
      console.error('Invalid stored password format');
      return false;
    }
    
    const [hashed, salt] = stored.split('.');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // Ensure both buffers are of the same length before comparison
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error('Buffer length mismatch in password comparison');
      return false;
    }
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export class DatabaseStorage implements IStorage {
  // Tool status tracking
  private toolStatus: Map<string, ToolStatus>;
  private systemStatus: SystemStatus;
  // Session store for authentication
  public sessionStore: session.Store;
  
  constructor() {
    // Initialize in-memory tool status (this would be in the database in a production app)
    this.toolStatus = new Map();
    
    // Initialize system status
    this.systemStatus = {
      version: "0.1.0-alpha",
      uptime: 0,
      transport: "STDIO",
      activeTools: []
    };
    
    // Set up session store using the same database connection
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true,
      tableName: 'session' // Default
    });
    
    // Initialize default tool statuses
    const defaultTools = ["web_search", "form_automation", "vector_storage", "data_scraper", "status"];
    defaultTools.forEach(tool => {
      this.toolStatus.set(tool, {
        name: tool,
        available: false,
        latency: 0
      });
    });
    
    // Status tool is always available
    this.toolStatus.set("status", {
      name: "status",
      available: true,
      latency: 0
    });
    
    this.updateSystemStatus();
  }
  
  private updateSystemStatus() {
    // Update active tools in system status
    this.systemStatus.activeTools = Array.from(this.toolStatus.values());
    
    // Start a timer to update uptime every second
    setInterval(() => {
      this.systemStatus.uptime += 1;
    }, 1000);
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }
  
  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(and(eq(users.apiKey, apiKey), eq(users.active, true)));
      return user;
    } catch (error) {
      console.error('Error getting user by API key:', error);
      return undefined;
    }
  }

  // Creates a random API key string
  private createApiKeyString(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'mcp_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Hash the password before storing
      const hashedPassword = await hashPassword(insertUser.password);
      
      const [user] = await db.insert(users)
        .values({
          ...insertUser,
          password: hashedPassword,
          apiKey: this.createApiKeyString(),
          role: 'user',
          active: true,
          createdAt: new Date()
        })
        .returning();
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }
  
  async updateUserApiKey(userId: number, apiKey: string | null): Promise<void> {
    try {
      await db.update(users)
        .set({ apiKey })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user API key:', error);
      throw new Error('Failed to update API key');
    }
  }
  
  async validateUserCredentials(usernameOrEmail: string, password: string): Promise<User | undefined> {
    try {
      // Check if the input is an email (contains @)
      const isEmail = usernameOrEmail.includes('@');
      
      // Find the user by username or email
      let user: User | undefined;
      
      if (isEmail) {
        console.log('Authenticating with email:', usernameOrEmail);
        user = await this.getUserByEmail(usernameOrEmail);
      } else {
        console.log('Authenticating with username:', usernameOrEmail);
        user = await this.getUserByUsername(usernameOrEmail);
      }
      
      if (!user || !user.active) {
        console.log('User not found or inactive');
        return undefined;
      }
      
      const isPasswordValid = await comparePasswords(password, user.password);
      
      if (!isPasswordValid) {
        console.log('Password invalid for user:', user.username);
        return undefined;
      }
      
      console.log('Authentication successful for user:', user.username);
      return user;
    } catch (error) {
      console.error('Error validating user credentials:', error);
      return undefined;
    }
  }
  
  async generateApiKey(userId: number): Promise<string> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const apiKey = this.createApiKeyString();
      await this.updateUserApiKey(userId, apiKey);
      return apiKey;
    } catch (error) {
      console.error('Error generating API key:', error);
      throw new Error('Failed to generate API key');
    }
  }
  
  async revokeApiKey(userId: number): Promise<void> {
    try {
      await this.updateUserApiKey(userId, null);
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw new Error('Failed to revoke API key');
    }
  }
  
  async updateUserLastLogin(userId: number): Promise<void> {
    try {
      await db.update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user last login:', error);
    }
  }
  
  async updateUserRole(userId: number, role: string): Promise<void> {
    try {
      await db.update(users)
        .set({ role })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }
  
  async updateUserActiveStatus(userId: number, active: boolean): Promise<void> {
    try {
      await db.update(users)
        .set({ active })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user active status:', error);
      throw new Error('Failed to update user active status');
    }
  }
  
  // Tool configuration operations
  async getToolConfig(id: number): Promise<ToolConfig | undefined> {
    try {
      const [config] = await db.select().from(toolConfigs).where(eq(toolConfigs.id, id));
      return config;
    } catch (error) {
      console.error('Error getting tool config:', error);
      return undefined;
    }
  }
  
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
  
  // Request logging operations
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
      
      // Update last request time in system status
      this.systemStatus.lastRequest = new Date().toISOString();
      
      return requestLog;
    } catch (error) {
      console.error('Error creating request log:', error);
      throw new Error('Failed to create request log');
    }
  }
  
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
  
  // Status operations
  async getSystemStatus(): Promise<SystemStatus> {
    this.updateSystemStatus();
    return this.systemStatus;
  }
  
  async getToolStatus(toolName?: string): Promise<ToolStatus[]> {
    if (toolName) {
      const status = this.toolStatus.get(toolName);
      return status ? [status] : [];
    }
    return Array.from(this.toolStatus.values());
  }
  
  async updateToolStatus(toolName: string, status: Partial<ToolStatus>): Promise<void> {
    const currentStatus = this.toolStatus.get(toolName) || { 
      name: toolName,
      available: false
    };
    
    this.toolStatus.set(toolName, {
      ...currentStatus,
      ...status,
      lastUsed: new Date().toISOString()
    });
    
    // Update active tools in system status
    this.systemStatus.activeTools = Array.from(this.toolStatus.values());
  }
}

// Export singleton instance of DatabaseStorage for use throughout the application
export const storage = new DatabaseStorage();
