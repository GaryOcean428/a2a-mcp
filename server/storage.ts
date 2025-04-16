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
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserApiKey(userId: number, apiKey: string): Promise<void>;
  
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private toolConfigs: Map<number, ToolConfig>;
  private requestLogs: Map<number, RequestLog>;
  private toolStatus: Map<string, ToolStatus>;
  private systemStatus: SystemStatus;
  private userIdCounter: number;
  private configIdCounter: number;
  private logIdCounter: number;

  constructor() {
    this.users = new Map();
    this.toolConfigs = new Map();
    this.requestLogs = new Map();
    this.toolStatus = new Map();
    this.userIdCounter = 1;
    this.configIdCounter = 1;
    this.logIdCounter = 1;
    
    // Initialize system status
    this.systemStatus = {
      version: "0.1.0-alpha",
      uptime: 0,
      transport: "STDIO",
      activeTools: []
    };
    
    // Initialize default tool statuses
    const defaultTools = ["web_search", "form_automation", "vector_storage", "data_scraper", "status"];
    defaultTools.forEach(tool => {
      this.toolStatus.set(tool, {
        name: tool,
        available: true,
        latency: 0
      });
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
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.apiKey === apiKey,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      apiKey: this.generateApiKey(),
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserApiKey(userId: number, apiKey: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.apiKey = apiKey;
      this.users.set(userId, user);
    }
  }
  
  // Tool configuration operations
  async getToolConfig(id: number): Promise<ToolConfig | undefined> {
    return this.toolConfigs.get(id);
  }
  
  async getToolConfigByUserAndType(userId: number, toolType: string): Promise<ToolConfig | undefined> {
    return Array.from(this.toolConfigs.values()).find(
      (config) => config.userId === userId && config.toolType === toolType,
    );
  }
  
  async getAllToolConfigs(userId: number): Promise<ToolConfig[]> {
    return Array.from(this.toolConfigs.values()).filter(
      (config) => config.userId === userId,
    );
  }
  
  async createToolConfig(config: InsertToolConfig): Promise<ToolConfig> {
    const id = this.configIdCounter++;
    const now = new Date();
    const toolConfig: ToolConfig = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.toolConfigs.set(id, toolConfig);
    return toolConfig;
  }
  
  async updateToolConfig(id: number, configUpdate: Partial<ToolConfig>): Promise<ToolConfig | undefined> {
    const config = this.toolConfigs.get(id);
    if (config) {
      const updatedConfig = {
        ...config,
        ...configUpdate,
        updatedAt: new Date()
      };
      this.toolConfigs.set(id, updatedConfig);
      return updatedConfig;
    }
    return undefined;
  }
  
  // Request logging operations
  async createRequestLog(log: InsertRequestLog): Promise<RequestLog> {
    const id = this.logIdCounter++;
    const requestLog: RequestLog = {
      ...log,
      id,
      timestamp: new Date()
    };
    this.requestLogs.set(id, requestLog);
    
    // Update last request time in system status
    this.systemStatus.lastRequest = new Date().toISOString();
    
    return requestLog;
  }
  
  async getRequestLogs(userId: number, limit = 100): Promise<RequestLog[]> {
    return Array.from(this.requestLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async getRequestLogsByToolType(userId: number, toolType: string, limit = 100): Promise<RequestLog[]> {
    return Array.from(this.requestLogs.values())
      .filter(log => log.userId === userId && log.toolType === toolType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  // Status operations
  async getSystemStatus(): Promise<SystemStatus> {
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
  
  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'mcp_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const storage = new MemStorage();
