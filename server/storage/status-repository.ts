import { SystemStatus, ToolStatus } from '@shared/schema';

/**
 * Repository for system and tool status management
 */
export class StatusRepository {
  private toolStatus: Map<string, ToolStatus>;
  private systemStatus: SystemStatus;
  private uptimeInterval: NodeJS.Timeout | null = null;
  
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
   * Start the uptime counter interval
   */
  private startUptimeCounter(): void {
    // Clear any existing interval
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
    }
    
    // Start a timer to update uptime every second
    this.uptimeInterval = setInterval(() => {
      this.systemStatus.uptime += 1;
    }, 1000);
  }
  
  /**
   * Update the system status with current tool data
   */
  private updateSystemStatus(): void {
    // Update active tools in system status
    this.systemStatus.activeTools = Array.from(this.toolStatus.values());
  }
  
  /**
   * Get the current system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    this.updateSystemStatus();
    return this.systemStatus;
  }
  
  /**
   * Get the status of a specific tool or all tools
   */
  async getToolStatus(toolName?: string): Promise<ToolStatus[]> {
    if (toolName) {
      const status = this.toolStatus.get(toolName);
      return status ? [status] : [];
    }
    return Array.from(this.toolStatus.values());
  }
  
  /**
   * Update a tool's status
   */
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
    this.updateSystemStatus();
  }
  
  /**
   * Update the last request timestamp
   */
  setLastRequest(): void {
    this.systemStatus.lastRequest = new Date().toISOString();
  }
  
  /**
   * Set the transport type
   */
  setTransportType(transport: 'STDIO' | 'SSE'): void {
    this.systemStatus.transport = transport;
  }
}