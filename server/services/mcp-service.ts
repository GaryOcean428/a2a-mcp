import { 
  MCPRequest, 
  MCPResponse, 
  MCPToolSchemas,
  WebSearchParams,
  FormAutomationParams,
  VectorStorageParams,
  DataScraperParams,
  StatusParams
} from '@shared/schema';
import { webSearchService } from './web-search-service';
import { formAutomationService } from './form-automation-service';
import { vectorStorageService } from './vector-storage-service';
import { dataScrapingService } from './data-scraping-service';
import { storage } from '../storage';
import { nanoid } from 'nanoid';

/**
 * Service for handling MCP (Model Context Protocol) requests
 */
export class MCPService {
  /**
   * Process an MCP request
   */
  async processRequest(request: MCPRequest): Promise<MCPResponse> {
    const startTime = Date.now();
    
    try {
      // Validate request format
      if (!request.id || !request.name) {
        throw new Error('Invalid MCP request format');
      }
      
      // Process the request based on the tool name
      let results;
      
      switch (request.name) {
        case 'web_search':
          results = await this.handleWebSearch(request.parameters);
          break;
          
        case 'form_automation':
          results = await this.handleFormAutomation(request.parameters);
          break;
          
        case 'vector_storage':
          results = await this.handleVectorStorage(request.parameters);
          break;
          
        case 'data_scraper':
          results = await this.handleDataScraper(request.parameters);
          break;
          
        case 'status':
          results = await this.handleStatus(request.parameters);
          break;
          
        default:
          throw new Error(`Unsupported tool: ${request.name}`);
      }
      
      return {
        id: request.id,
        results
      };
    } catch (error) {
      return {
        id: request.id,
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'TOOL_ERROR'
        }
      };
    }
  }
  
  /**
   * Handle web search requests
   */
  private async handleWebSearch(parameters: WebSearchParams) {
    // Log the start of web search operation
    console.log(`Executing web search: ${parameters.query}`);
    
    // Execute the search
    return await webSearchService.executeSearch(parameters);
  }
  
  /**
   * Handle form automation requests
   */
  private async handleFormAutomation(parameters: FormAutomationParams) {
    // Log the start of form automation operation
    console.log(`Automating form at: ${parameters.url}`);
    
    // Execute form automation
    return await formAutomationService.automate(parameters);
  }
  
  /**
   * Handle vector storage requests
   */
  private async handleVectorStorage(parameters: VectorStorageParams) {
    // Log the start of vector storage operation
    console.log(`Executing vector operation ${parameters.operation} on collection ${parameters.collection}`);
    
    // Execute vector storage operation
    return await vectorStorageService.execute(parameters);
  }
  
  /**
   * Handle data scraping requests
   */
  private async handleDataScraper(parameters: DataScraperParams) {
    // Log the start of data scraping operation
    console.log(`Scraping data from: ${parameters.url}`);
    
    // Execute data scraping
    return await dataScrapingService.scrape(parameters);
  }
  
  /**
   * Handle status requests
   */
  private async handleStatus(parameters: StatusParams) {
    // If a specific tool is requested, return only that tool's status
    if (parameters.toolName) {
      const toolStatus = await storage.getToolStatus(parameters.toolName);
      return { tools: toolStatus };
    }
    
    // Otherwise return the system status
    const systemStatus = await storage.getSystemStatus();
    return systemStatus;
  }
  
  /**
   * Get the schema for a specific tool or all tools
   */
  getToolSchema(toolName?: string) {
    if (toolName) {
      return MCPToolSchemas[toolName as keyof typeof MCPToolSchemas];
    }
    
    return Object.values(MCPToolSchemas);
  }
  
  /**
   * Generate a unique ID for MCP requests
   */
  generateRequestId(): string {
    return nanoid();
  }
}

// Export singleton instance
export const mcpService = new MCPService();
