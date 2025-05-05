import { 
  MCPRequest, 
  MCPResponse, 
  MCPToolSchemas,
  WebSearchParams,
  FormAutomationParams,
  VectorStorageParams,
  DataScraperParams,
  StatusParams,
  ToolStatus, // Import ToolStatus type
  SystemStatus // Import SystemStatus type
} from "@shared/schema";
import { webSearchService } from "./web-search-service";
import { formAutomationService } from "./form-automation-service";
import { vectorStorageService } from "./vector-storage-service";
import { dataScrapingService } from "./data-scraping-service";
import { storage } from "../storage";
import { nanoid } from "nanoid";

// Define specific error codes for MCP Service
const MCP_ERROR_CODES = {
  INVALID_REQUEST_FORMAT: "INVALID_REQUEST_FORMAT",
  UNSUPPORTED_TOOL: "UNSUPPORTED_TOOL",
  TOOL_EXECUTION_ERROR: "TOOL_EXECUTION_ERROR",
  INTERNAL_SERVICE_ERROR: "INTERNAL_SERVICE_ERROR",
};

/**
 * Service for handling MCP (Model Context Protocol) requests
 */
export class MCPService {
  /**
   * Process an MCP request
   */
  async processRequest(request: MCPRequest): Promise<MCPResponse> {
    const startTime = Date.now();
    let toolName = "unknown"; // Keep track of the tool name for logging

    try {
      // Validate request format
      if (!request || typeof request !== "object" || !request.id || !request.name) {
        throw this.createServiceError(
          "Invalid MCP request format: Missing id or name",
          MCP_ERROR_CODES.INVALID_REQUEST_FORMAT
        );
      }
      toolName = request.name;
      console.log(`[MCPService] Processing request ${request.id} for tool: ${toolName}`);

      // Process the request based on the tool name
      let results;
      switch (toolName) {
        case "web_search":
          results = await this.handleWebSearch(request.parameters as WebSearchParams);
          break;
        case "form_automation":
          results = await this.handleFormAutomation(request.parameters as FormAutomationParams);
          break;
        case "vector_storage":
          results = await this.handleVectorStorage(request.parameters as VectorStorageParams);
          break;
        case "data_scraper":
          results = await this.handleDataScraper(request.parameters as DataScraperParams);
          break;
        case "status":
          results = await this.handleStatus(request.parameters as StatusParams);
          break;
        // Add case for sandbox if/when implemented
        // case "sandbox":
        //   results = await this.handleSandbox(request.parameters as SandboxParams);
        //   break;
        default:
          throw this.createServiceError(
            `Unsupported tool: ${toolName}`,
            MCP_ERROR_CODES.UNSUPPORTED_TOOL
          );
      }

      const duration = Date.now() - startTime;
      console.log(`[MCPService] Request ${request.id} (${toolName}) completed successfully in ${duration}ms.`);
      return {
        id: request.id,
        results,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorCode = error.code || MCP_ERROR_CODES.TOOL_EXECUTION_ERROR;
      const errorMessage = error.message || "An unexpected error occurred during tool execution";
      console.error(
        `[MCPService] Error processing request ${request?.id || "unknown"} (${toolName}) after ${duration}ms: ${errorCode} - ${errorMessage}`,
        error.details || error
      );

      return {
        id: request?.id || "error", // Use request ID if available
        error: {
          message: errorMessage,
          code: errorCode,
          details: error.details || (error instanceof Error ? error.stack : String(error)), // Include details/stack
        },
      };
    }
  }

  /**
   * Helper to create structured errors
   */
  private createServiceError(message: string, code: string, originalError?: any) {
    const error = new Error(message) as any;
    error.code = code;
    if (originalError) {
      error.details = originalError.message || String(originalError);
    }
    console.error(`[MCPService] Created service error: ${code} - ${message}`, error.details);
    return error;
  }

  /**
   * Handle web search requests
   */
  private async handleWebSearch(parameters: WebSearchParams) {
    console.log(`[MCPService] Executing web search with query: ${parameters?.query}`);
    if (!parameters || typeof parameters.query !== "string") {
      throw this.createServiceError("Invalid parameters for web_search: query is required", "INVALID_PARAMETERS");
    }
    return await webSearchService.executeSearch(parameters);
  }

  /**
   * Handle form automation requests
   */
  private async handleFormAutomation(parameters: FormAutomationParams) {
    console.log(`[MCPService] Automating form at: ${parameters?.url}`);
    if (!parameters || typeof parameters.url !== "string" || typeof parameters.fields !== "object") {
      throw this.createServiceError("Invalid parameters for form_automation: url and fields are required", "INVALID_PARAMETERS");
    }
    return await formAutomationService.automate(parameters);
  }

  /**
   * Handle vector storage requests
   */
  private async handleVectorStorage(parameters: VectorStorageParams) {
    console.log(`[MCPService] Executing vector operation ${parameters?.operation} on collection ${parameters?.collection}`);
    if (!parameters || typeof parameters.operation !== "string" || typeof parameters.collection !== "string") {
      throw this.createServiceError("Invalid parameters for vector_storage: operation and collection are required", "INVALID_PARAMETERS");
    }
    return await vectorStorageService.execute(parameters);
  }

  /**
   * Handle data scraping requests
   */
  private async handleDataScraper(parameters: DataScraperParams) {
    console.log(`[MCPService] Scraping data from: ${parameters?.url}`);
    if (!parameters || typeof parameters.url !== "string" || !Array.isArray(parameters.selectors)) {
      throw this.createServiceError("Invalid parameters for data_scraper: url and selectors array are required", "INVALID_PARAMETERS");
    }
    return await dataScrapingService.scrape(parameters);
  }

  /**
   * Handle status requests
   */
  private async handleStatus(parameters?: StatusParams): Promise<SystemStatus | { tools: ToolStatus[] }> {
    const toolName = parameters?.toolName;
    console.log(`[MCPService] Handling status request for: ${toolName || "system"}`);
    if (toolName) {
      const toolStatus = await storage.getToolStatus(toolName);
      if (!toolStatus || toolStatus.length === 0) {
        throw this.createServiceError(`Tool status not found for: ${toolName}`, "TOOL_NOT_FOUND");
      }
      return { tools: toolStatus }; // Return specific tool status
    }
    // Return the overall system status
    return await storage.getSystemStatus();
  }

  /**
   * Get the schema for a specific tool or all tools
   */
  getToolSchema(toolName?: string): any {
    if (toolName) {
      const schema = MCPToolSchemas[toolName as keyof typeof MCPToolSchemas];
      if (!schema) {
        throw this.createServiceError(`Schema not found for tool: ${toolName}`, "SCHEMA_NOT_FOUND");
      }
      return schema;
    }
    return Object.values(MCPToolSchemas); // Return all schemas
  }

  /**
   * Generate a unique ID for MCP requests
   */
  generateRequestId(): string {
    return `req_${nanoid(12)}`; // Add prefix for clarity
  }
}

// Export singleton instance
export const mcpService = new MCPService();

