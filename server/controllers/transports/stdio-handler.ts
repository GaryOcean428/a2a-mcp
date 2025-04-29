import { mcpService } from '../../services/mcp-service';
import { MCPRequest, MCPResponse } from '@shared/schema';

/**
 * Handler for MCP STDIO transport
 */
export class StdioHandler {
  private static RESPONSE_DELAY = 50; // Small delay to simulate IO
  
  /**
   * Initialize the STDIO transport handlers
   */
  initialize(): void {
    // Listen for requests on stdin
    process.stdin.on('data', this.handleStdinData.bind(this));
    
    // Send available tool schemas to stdout
    this.sendSchemas();
    
    console.log('STDIO transport initialized');
  }
  
  /**
   * Handle data received from stdin
   */
  private async handleStdinData(chunk: Buffer): Promise<void> {
    try {
      const input = chunk.toString().trim();
      
      // Try to parse as JSON
      const request = JSON.parse(input) as MCPRequest;
      
      // Generate request ID if not provided
      if (!request.id) {
        request.id = mcpService.generateRequestId();
      }
      
      // Process the request
      const response = await mcpService.processRequest(request);
      
      // Add a small delay to simulate IO
      setTimeout(() => {
        // Write response to stdout
        process.stdout.write(JSON.stringify(response) + '\n');
      }, StdioHandler.RESPONSE_DELAY);
    } catch (error) {
      console.error('Error handling STDIO request:', error);
      
      const errorResponse: MCPResponse = {
        id: 'error',
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'PARSE_ERROR'
        }
      };
      
      process.stdout.write(JSON.stringify(errorResponse) + '\n');
    }
  }
  
  /**
   * Send available tool schemas to stdout
   */
  private sendSchemas(): void {
    const schemas = mcpService.getToolSchema();
    process.stdout.write(JSON.stringify({
      id: 'schemas',
      schemas
    }) + '\n');
  }
}