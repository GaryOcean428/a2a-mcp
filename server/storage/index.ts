import { UserRepository } from './user-repository';
import { ToolRepository } from './tool-repository';
import { RequestLogRepository } from './request-log-repository';
import { StatusRepository } from './status-repository';
import session from 'express-session';
import ConnectPg from 'connect-pg-simple';
import { pool } from '../db';
import { IStorage } from '@shared/storage-interface';

// Session store setup
const PostgresSessionStore = ConnectPg(session);

/**
 * Unified storage interface that combines all repositories
 */
export class DatabaseStorage implements IStorage {
  private userRepo: UserRepository;
  private toolRepo: ToolRepository;
  private requestLogRepo: RequestLogRepository;
  private statusRepo: StatusRepository;
  public sessionStore: session.Store;
  
  constructor() {
    // Initialize repositories
    this.userRepo = new UserRepository();
    this.toolRepo = new ToolRepository();
    this.requestLogRepo = new RequestLogRepository();
    this.statusRepo = new StatusRepository();
    
    // Set up session store using the same database connection
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true,
      tableName: 'session' // Default
    });
  }
  
  // User Repository methods
  getUser(id: number) {
    return this.userRepo.getUser(id);
  }
  
  getUserByUsername(username: string) {
    return this.userRepo.getUserByUsername(username);
  }
  
  getUserByEmail(email: string) {
    return this.userRepo.getUserByEmail(email);
  }
  
  getUserByApiKey(apiKey: string) {
    return this.userRepo.getUserByApiKey(apiKey);
  }
  
  createUser(user: any) {
    return this.userRepo.createUser(user);
  }
  
  updateUserApiKey(userId: number, apiKey: string | null) {
    return this.userRepo.updateUserApiKey(userId, apiKey);
  }
  
  validateUserCredentials(username: string, password: string) {
    return this.userRepo.validateUserCredentials(username, password);
  }
  
  generateApiKey(userId: number) {
    return this.userRepo.generateApiKey(userId);
  }
  
  revokeApiKey(userId: number) {
    return this.userRepo.revokeApiKey(userId);
  }
  
  updateUserLastLogin(userId: number) {
    return this.userRepo.updateUserLastLogin(userId);
  }
  
  updateUserRole(userId: number, role: string) {
    return this.userRepo.updateUserRole(userId, role);
  }
  
  updateUserActiveStatus(userId: number, active: boolean) {
    return this.userRepo.updateUserActiveStatus(userId, active);
  }
  
  // Tool Repository methods
  getToolConfig(id: number) {
    return this.toolRepo.getToolConfig(id);
  }
  
  getToolConfigByUserAndType(userId: number, toolType: string) {
    return this.toolRepo.getToolConfigByUserAndType(userId, toolType);
  }
  
  getAllToolConfigs(userId: number) {
    return this.toolRepo.getAllToolConfigs(userId);
  }
  
  createToolConfig(config: any) {
    return this.toolRepo.createToolConfig(config);
  }
  
  updateToolConfig(id: number, config: any) {
    return this.toolRepo.updateToolConfig(id, config);
  }
  
  // Request Log Repository methods
  createRequestLog(log: any) {
    // Update last request time in system status
    this.statusRepo.updateLastRequestTime();
    return this.requestLogRepo.createRequestLog(log);
  }
  
  getRequestLogs(userId: number, limit?: number) {
    return this.requestLogRepo.getRequestLogs(userId, limit);
  }
  
  getRequestLogsByToolType(userId: number, toolType: string, limit?: number) {
    return this.requestLogRepo.getRequestLogsByToolType(userId, toolType, limit);
  }
  
  // Status Repository methods
  getSystemStatus() {
    return this.statusRepo.getSystemStatus();
  }
  
  getToolStatus(toolName?: string) {
    return this.statusRepo.getToolStatus(toolName);
  }
  
  updateToolStatus(toolName: string, status: any) {
    return this.statusRepo.updateToolStatus(toolName, status);
  }
  
  setTransportType(type: 'STDIO' | 'SSE') {
    this.statusRepo.setTransportType(type);
  }
}

// Export singleton instance of DatabaseStorage for use throughout the application
export const storage = new DatabaseStorage();