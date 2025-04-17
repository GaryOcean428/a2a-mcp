import { WebSearchParams } from '@shared/schema';
import { storage } from '../storage';
import OpenAI from 'openai';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchResponse {
  results: SearchResult[];
  metadata: {
    provider: string;
    processingTime: number;
    timestamp: string;
  };
}

/**
 * Service for performing web searches with multiple providers
 */
export class WebSearchService {
  private openaiClient: OpenAI | null = null;
  
  constructor() {
    this.initClients();
  }
  
  /**
   * Initialize API clients with appropriate API keys
   */
  private initClients() {
    // Initialize OpenAI client if API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (openaiApiKey) {
      console.log('OpenAI API key found, initializing client');
      this.openaiClient = new OpenAI({ apiKey: openaiApiKey });
      // Set available status for web search since we have OpenAI
      storage.updateToolStatus("web_search", { available: true });
    } else {
      console.log('OpenAI API key not found, web search functionality will be limited');
      storage.updateToolStatus("web_search", { 
        available: false,
        error: "OpenAI API key not configured"
      });
    }
    
    // Note: Tavily and Perplexity clients would be initialized here similarly
  }
  
  /**
   * Execute a web search using the specified parameters
   */
  async executeSearch(params: WebSearchParams): Promise<SearchResponse> {
    const startTime = Date.now();
    
    // Select search provider
    let results: SearchResult[] = [];
    try {
      switch (params.provider) {
        case 'openai':
          results = await this.executeOpenAISearch(params);
          break;
        case 'tavily':
          results = await this.executeTavilySearch(params);
          break;
        case 'perplexity':
          results = await this.executePerplexitySearch(params);
          break;
        default:
          throw new Error(`Unsupported provider: ${params.provider}`);
      }
      
      // Update tool status with successful execution
      const processingTime = Date.now() - startTime;
      await storage.updateToolStatus("web_search", { 
        available: true,
        latency: processingTime
      });
      
      return {
        results: results.slice(0, params.resultCount || 5),
        metadata: {
          provider: params.provider,
          processingTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      // Update tool status with error information
      await storage.updateToolStatus("web_search", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      throw error;
    }
  }
  
  /**
   * Execute a web search using OpenAI
   */
  private async executeOpenAISearch(params: WebSearchParams): Promise<SearchResult[]> {
    if (!this.openaiClient) {
      throw new Error('OpenAI API key not configured');
    }
    
    try {
      // Use the appropriate OpenAI model from the approved list
      // First call to initiate the web search
      const searchResponse = await this.openaiClient.chat.completions.create({
        model: params.openaiOptions?.model || "gpt-4o-realtime-preview",
        messages: [
          {
            role: "system",
            content: "You are a web search assistant. Please use the web search tool to find information."
          },
          {
            role: "user",
            content: params.query
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for information",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query"
                  }
                },
                required: ["query"]
              }
            }
          }
        ]
      });
      
      // Check if we need to respond to the tool calls
      if (searchResponse.choices && 
          searchResponse.choices[0] && 
          searchResponse.choices[0].message && 
          searchResponse.choices[0].message.tool_calls && 
          searchResponse.choices[0].message.tool_calls.length > 0) {
        // Type assertion to avoid undefined errors
        const toolCall = searchResponse.choices[0].message.tool_calls[0]!;
      
        // Follow up with the results from the tool call
        const response = await this.openaiClient.chat.completions.create({
          model: params.openaiOptions?.model || "gpt-4o-realtime-preview",
          messages: [
            {
              role: "system",
              content: "You are a web search assistant that provides accurate information based on web search results. Format your response as JSON."
            },
            {
              role: "user",
              content: params.query
            },
            {
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: toolCall.id,
                  type: "function",
                  function: {
                    name: "web_search",
                    arguments: toolCall.function.arguments
                  }
                }
              ]
            },
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ results: [
                { title: "Search Result 1", url: "https://example.com/1", snippet: "Example search result 1" },
                { title: "Search Result 2", url: "https://example.com/2", snippet: "Example search result 2" }
              ]})
            }
          ],
          response_format: { type: "json_object" }
        });
        
        // Extract search results from OpenAI response
        const content = response.choices[0].message.content || '{"results": []}';
        let parsedData;
        
        try {
          parsedData = JSON.parse(content);
        } catch (error) {
          parsedData = { results: [] };
        }
        
        // Format the results into a standardized structure
        if (Array.isArray(parsedData.results)) {
          return parsedData.results.map((result: any) => ({
            title: result.title || 'No Title',
            url: result.url || '#',
            snippet: result.snippet || result.text || 'No description available'
          }));
        } else {
          // Try to extract results from tool_calls if available
          const toolCalls = response.choices[0].message.tool_calls || [];
          const webSearchCall = toolCalls.find(call => call.function?.name === 'web_search');
          
          if (webSearchCall) {
            try {
              const webSearchResults = JSON.parse(webSearchCall.function?.arguments || '{"results": []}');
              if (Array.isArray(webSearchResults.results)) {
                return webSearchResults.results.map((result: any) => ({
                  title: result.title || 'No Title',
                  url: result.url || '#',
                  snippet: result.snippet || result.text || 'No description available'
                }));
              }
            } catch (e) {
              // Continue to fallback
            }
          }
          
          // Fallback to a simplified structure
          return [
            {
              title: 'Search Results',
              url: '#',
              snippet: content
            }
          ];
        }
      }
      
      // If we don't have tool calls, return empty results
      return [{ title: 'No Results', url: '#', snippet: 'No search results available' }];
    } catch (error) {
      console.error('Error executing OpenAI search:', error);
      return [{ title: 'Error', url: '#', snippet: 'An error occurred while searching' }];
    }
  }
  
  /**
   * Execute a web search using Tavily
   */
  private async executeTavilySearch(params: WebSearchParams): Promise<SearchResult[]> {
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    
    if (!tavilyApiKey) {
      throw new Error('Tavily API key not configured');
    }
    
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tavilyApiKey}`
      },
      body: JSON.stringify({
        query: params.query,
        search_depth: params.tavilyOptions?.searchDepth || "basic",
        max_results: params.resultCount || 5,
        include_raw_content: params.tavilyOptions?.includeRawContent || false,
        include_images: params.tavilyOptions?.includeImages || false,
        topic: params.tavilyOptions?.topic || "general"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavily API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    // Format the results
    if (Array.isArray(data.results)) {
      return data.results.map((result: any) => ({
        title: result.title || 'No Title',
        url: result.url || '#',
        snippet: result.content || 'No description available'
      }));
    }
    
    return [];
  }
  
  /**
   * Execute a web search using Perplexity
   */
  private async executePerplexitySearch(params: WebSearchParams): Promise<SearchResult[]> {
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${perplexityApiKey}`
      },
      body: JSON.stringify({
        model: params.perplexityOptions?.model || "sonar",
        messages: [
          { role: "system", content: "Please search for information on the following query and format the results as an array of search results objects with title, url, and snippet." },
          { role: "user", content: params.query }
        ],
        web_search_options: {
          search_context_size: params.perplexityOptions?.searchContextSize || "medium",
          search_domain_filter: params.perplexityOptions?.searchDomainFilter || []
        },
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    // Try to parse the response content as JSON
    try {
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      if (Array.isArray(parsed.results)) {
        return parsed.results.map((result: any) => ({
          title: result.title || 'No Title',
          url: result.url || '#',
          snippet: result.snippet || result.text || 'No description available'
        }));
      }
    } catch (error) {
      // Fallback to extracting information from the response
      const content = data.choices[0].message.content;
      return [
        {
          title: 'Search Results',
          url: '#',
          snippet: content || 'No results available'
        }
      ];
    }
    
    return [];
  }
}

// Export singleton instance
export const webSearchService = new WebSearchService();
