import { 
  type User, 
  type InsertUser, 
  type ToolConfig, 
  type InsertToolConfig,
  type RequestLog,
  type InsertRequestLog,
  type SystemStatus,
  type ToolStatus
} from '@shared/schema';
import { UserRepository } from './user-repository';
import { ToolRepository } from './tool-repository';
import { RequestLogRepository } from './request-log-repository';
import { StatusRepository } from './status-repository';
import session from 'express-session';
import ConnectPg from 'connect-pg-simple';
import { pool } from '../db';

// Session store setup
const PostgresSessionStore = ConnectPg(session);

// Define the storage interface
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
  
  // Session store for authentication
  sessionStore: session.Store;
}

/**
 * DatabaseStorage class that implements the IStorage interface
 * by delegating operations to specialized repositories
 */
export class DatabaseStorage implements IStorage {
  // Specialized repositories
  private userRepository: UserRepository;
  private toolRepository: ToolRepository;
  private requestLogRepository: RequestLogRepository;
  private statusRepository: StatusRepository;
  
  // Session store for authentication
  public sessionStore: session.Store;
  
  constructor() {
    // Initialize repositories
    this.userRepository = new UserRepository();
    this.toolRepository = new ToolRepository();
    this.requestLogRepository = new RequestLogRepository();
    this.statusRepository = new StatusRepository();
    
    // Set up session store using the same database connection
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true,
      tableName: 'session' // Default
    });
  }
  
  // User operations delegation
  async getUser(id: number): Promise<User | undefined> {
    return this.userRepository.getUser(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.getUserByUsername(username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.getUserByEmail(email);
  }
  
  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    return this.userRepository.getUserByApiKey(apiKey);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    return this.userRepository.createUser(user);
  }
  
  async updateUserApiKey(userId: number, apiKey: string | null): Promise<void> {
    return this.userRepository.updateUserApiKey(userId, apiKey);
  }
  
  async validateUserCredentials(username: string, password: string): Promise<User | undefined> {
    return this.userRepository.validateUserCredentials(username, password);
  }
  
  async generateApiKey(userId: number): Promise<string> {
    return this.userRepository.generateApiKey(userId);
  }
  
  async revokeApiKey(userId: number): Promise<void> {
    return this.userRepository.revokeApiKey(userId);
  }
  
  async updateUserLastLogin(userId: number): Promise<void> {
    return this.userRepository.updateUserLastLogin(userId);
  }
  
  async updateUserRole(userId: number, role: string): Promise<void> {
    return this.userRepository.updateUserRole(userId, role);
  }
  
  async updateUserActiveStatus(userId: number, active: boolean): Promise<void> {
    return this.userRepository.updateUserActiveStatus(userId, active);
  }
  
  // Tool configuration operations delegation
  async getToolConfig(id: number): Promise<ToolConfig | undefined> {
    return this.toolRepository.getToolConfig(id);
  }
  
  async getToolConfigByUserAndType(userId: number, toolType: string): Promise<ToolConfig | undefined> {
    return this.toolRepository.getToolConfigByUserAndType(userId, toolType);
  }
  
  async getAllToolConfigs(userId: number): Promise<ToolConfig[]> {
    return this.toolRepository.getAllToolConfigs(userId);
  }
  
  async createToolConfig(config: InsertToolConfig): Promise<ToolConfig> {
    return this.toolRepository.createToolConfig(config);
  }
  
  async updateToolConfig(id: number, config: Partial<ToolConfig>): Promise<ToolConfig | undefined> {
    return this.toolRepository.updateToolConfig(id, config);
  }
  
  // Request logging operations delegation
  async createRequestLog(log: InsertRequestLog): Promise<RequestLog> {
    const requestLog = await this.requestLogRepository.createRequestLog(log);
    
    // Update last request time in system status
    this.statusRepository.setLastRequest();
    
    return requestLog;
  }
  
  async getRequestLogs(userId: number, limit = 100): Promise<RequestLog[]> {
    return this.requestLogRepository.getRequestLogs(userId, limit);
  }
  
  async getRequestLogsByToolType(userId: number, toolType: string, limit = 100): Promise<RequestLog[]> {
    return this.requestLogRepository.getRequestLogsByToolType(userId, toolType, limit);
  }
  
  // Status operations delegation
  async getSystemStatus(): Promise<SystemStatus> {
    return this.statusRepository.getSystemStatus();
  }
  
  async getToolStatus(toolName?: string): Promise<ToolStatus[]> {
    return this.statusRepository.getToolStatus(toolName);
  }
  
  async updateToolStatus(toolName: string, status: Partial<ToolStatus>): Promise<void> {
    return this.statusRepository.updateToolStatus(toolName, status);
  }
}

// Export singleton instance of DatabaseStorage for use throughout the application
export const storage = new DatabaseStorage();