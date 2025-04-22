import { MCPRequest, MCPResponse } from '@shared/schema';
import { getApiBaseUrl } from '../config';

/**
 * MCP client for making requests to the MCP server
 */
export class MCPClient {
  private baseUrl: string;
  private apiKey: string | null;
  private responseHandlers: Map<string, (response: MCPResponse) => void> = new Map();
  
  /**
   * Create a new MCP client
   * @param options Client options
   */
  constructor(options: { 
    baseUrl?: string;
    apiKey?: string;
  } = {}) {
    // Set base URL with fallback to current origin using config
    this.baseUrl = options.baseUrl || getApiBaseUrl();
    
    // For development, use a default API key
    const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
    if (isDevelopment && !options.apiKey) {
      this.apiKey = 'dev-api-key';
      console.log('Development mode: Using default API key');
    } else {
      this.apiKey = options.apiKey || null;
    }
    
    // Log client initialization for debugging
    console.log(`MCP client initialized with baseUrl: ${this.baseUrl}`);
  }
  
  /**
   * Send a request to the MCP server via HTTP
   */
  async sendRequest(request: Omit<MCPRequest, 'id'>): Promise<MCPResponse> {
    // Generate a unique ID for the request
    const id = this.generateRequestId();
    const fullRequest: MCPRequest = {
      ...request,
      id
    };
    
    // Use HTTP as the default transport method
    return this.sendHttpRequest(fullRequest);
  }
  
  /**
   * Send a request via HTTP
   */
  private async sendHttpRequest(request: MCPRequest): Promise<MCPResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    
    // Use configured base URL with clean path
    const apiUrl = this.createApiUrl(this.baseUrl, '/api/mcp');
    
    console.log(`Sending MCP HTTP request to: ${apiUrl}`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        credentials: 'include' // Include cookies for session auth
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MCP request failed: ${response.status} ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate a unique ID for requests
   */
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  /**
   * Helper function to create a clean URL with no double slashes
   */
  private createApiUrl(baseUrl: string, path: string): string {
    // Clean up the base URL first (remove trailing slashes)
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // Fix common issues with baseUrl
    let fixedBaseUrl = cleanBaseUrl;
    
    // Handle undefined port issue
    if (fixedBaseUrl.includes(':undefined')) {
      fixedBaseUrl = fixedBaseUrl.split(':undefined').join('');
    }
    
    // Handle other undefined occurrences
    if (fixedBaseUrl.includes('undefined')) {
      fixedBaseUrl = fixedBaseUrl.replace('undefined', '');
    }
    
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return fixedBaseUrl + normalizedPath;
  }

  /**
   * Get the status of the MCP server
   */
  async getStatus(): Promise<any> {
    const apiUrl = this.createApiUrl(this.baseUrl, '/api/status');
    
    try {
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Silently fail without logging to console
        return {
          version: "Unknown",
          uptime: 0,
          transport: "Unknown",
          activeTools: []
        };
      }
      
      return response.json();
    } catch (error) {
      // Return a minimal fallback status instead of throwing
      return {
        version: "Unknown",
        uptime: 0,
        transport: "Unknown",
        activeTools: []
      };
    }
  }
  
  /**
   * Get the status of a specific tool
   */
  async getToolStatus(toolName: string): Promise<any> {
    const apiUrl = this.createApiUrl(this.baseUrl, `/api/status/${toolName}`);
    
    try {
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        return {
          name: toolName,
          available: false,
          error: "Could not connect to status API"
        };
      }
      
      return response.json();
    } catch (error) {
      return {
        name: toolName,
        available: false,
        error: "Could not connect to status API"
      };
    }
  }
  
  /**
   * Get all tool schemas
   */
  async getSchemas(): Promise<any[]> {
    const apiUrl = this.createApiUrl(this.baseUrl, '/api/schema');
    
    try {
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get schemas: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
      throw error;
    }
  }
  
  /**
   * Get the schema for a specific tool
   */
  async getToolSchema(toolName: string): Promise<any> {
    const apiUrl = this.createApiUrl(this.baseUrl, `/api/schema/${toolName}`);
    
    try {
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get tool schema: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Failed to fetch schema for ${toolName}:`, error);
      throw error;
    }
  }
}

// Create a default client instance
export const mcpClient = new MCPClient();