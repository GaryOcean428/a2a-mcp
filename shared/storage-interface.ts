import { InsertUser, User, ToolConfig, SystemStatus } from "./schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tool Configuration methods
  getToolConfig(id: number): Promise<ToolConfig | undefined>;
  getAllToolConfigs(): Promise<ToolConfig[]>;
  createToolConfig(config: any): Promise<ToolConfig>;
  
  // Status methods
  getToolStatus(toolName: string): Promise<Record<string, boolean>>;
  updateToolStatus(toolName: string, status: any): Promise<void>;
  getSystemStatus(): Promise<SystemStatus>;
  
  // Request logging methods
  createRequestLog(log: any): Promise<any>;
}