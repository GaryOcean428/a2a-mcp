import { SystemStatus, ToolStatus } from '@shared/schema';

/**
 * Repository for system and tool status operations
 */
export class StatusRepository {
  // Private storage for tool status
  private toolStatus: Map<string, ToolStatus>;
  private systemStatus: SystemStatus;
  private uptimeInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Initialize in-memory tool status
    this.toolStatus = new Map();
    
    // Initialize system status
    this.systemStatus = {
      version: "0.1.0-alpha",
      uptime: 0,
      transport: "STDIO",
      activeTools: [],
      wsEnabled: true,
      environment: process.env.NODE_ENV || "development",
      features: {},
    };
    
    // Initialize default tool statuses
    const defaultTools = ["web_search", "form_automation", "vector_storage", "data_scraper", "status", "sandbox"];
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
    
    this.startUptimeCounter();
    this.updateSystemStatus();
  }
  
  /**
   * Start the uptime counter
   */
  private startUptimeCounter() {
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
    }
    
    this.uptimeInterval = setInterval(() => {
      this.systemStatus.uptime += 1;
    }, 1000);
  }
  
  /**
   * Update system status with current tool status
   */
  private updateSystemStatus() {
    // Update active tools in system status
    this.systemStatus.activeTools = Array.from(this.toolStatus.values());
  }
  
  /**
   * Get system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    this.updateSystemStatus();
    return this.systemStatus;
  }
  
  /**
   * Get tool status
   */
  async getToolStatus(toolName?: string): Promise<ToolStatus[]> {
    if (toolName) {
      const status = this.toolStatus.get(toolName);
      return status ? [status] : [];
    }
    return Array.from(this.toolStatus.values());
  }
  
  /**
   * Update tool status
   */
  async updateToolStatus(toolName: string, status: Partial<ToolStatus>): Promise<void> {
    const currentStatus = this.toolStatus.get(toolName) || {
      name: toolName,
      available: false,
      latency: 0,
    };
    
    this.toolStatus.set(toolName, {
      ...currentStatus,
      ...status,
      lastUsed: new Date().toISOString()
    });
    
    // Update active tools in system status
    this.updateSystemStatus();
  }
  
  /**
   * Set last request time
   */
  updateLastRequestTime() {
    this.systemStatus.lastRequest = new Date().toISOString();
  }
  
  /**
   * Set transport type
   */
  setTransportType(type: 'STDIO' | 'SSE') {
    this.systemStatus.transport = type;
  }
  
  /**
   * Cleanup resources when the repository is no longer used
   */
  cleanup() {
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
      this.uptimeInterval = null;
    }
  }
}