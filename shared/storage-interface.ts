import { User, InsertUser, ToolConfig, InsertToolConfig, RequestLog, InsertRequestLog, SystemStatus, ToolStatus } from './schema';
import { Store } from 'express-session';

/**
 * Storage interface for the application
 */
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
  setTransportType(type: 'STDIO' | 'SSE'): void;
  
  // Session store
  sessionStore: Store;
}