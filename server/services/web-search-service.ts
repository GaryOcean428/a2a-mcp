import { WebSearchParams } from '@shared/schema';
import { storage } from '../storage';
import OpenAI from 'openai';

// Define specific error codes
const ERROR_CODES = {
  PROVIDER_NOT_CONFIGURED: 'PROVIDER_NOT_CONFIGURED',
  PROVIDER_API_ERROR: 'PROVIDER_API_ERROR',
  PROVIDER_RESPONSE_PARSE_ERROR: 'PROVIDER_RESPONSE_PARSE_ERROR',
  UNSUPPORTED_PROVIDER: 'UNSUPPORTED_PROVIDER',
  INTERNAL_SERVICE_ERROR: 'INTERNAL_SERVICE_ERROR',
};

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
  // Placeholder for Tavily and Perplexity clients
  private tavilyAvailable: boolean = false;
  private perplexityAvailable: boolean = false;

  constructor() {
    this.initClients();
  }

  /**
   * Initialize API clients with appropriate API keys
   */
  private initClients() {
    let openAIAvailable = false;
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (openaiApiKey) {
      console.log('OpenAI API key found, initializing client');
      try {
        this.openaiClient = new OpenAI({ apiKey: openaiApiKey });
        openAIAvailable = true;
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
      }
    }

    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (tavilyApiKey) {
      console.log('Tavily API key found, enabling Tavily search.');
      this.tavilyAvailable = true;
    } else {
      console.log('Tavily API key not found.');
    }

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (perplexityApiKey) {
      console.log('Perplexity API key found, enabling Perplexity search.');
      this.perplexityAvailable = true;
    } else {
      console.log('Perplexity API key not found.');
    }

    // Update overall tool status based on available providers
    const isAnyProviderAvailable = openAIAvailable || this.tavilyAvailable || this.perplexityAvailable;
    storage.updateToolStatus("web_search", {
      available: isAnyProviderAvailable,
      error: isAnyProviderAvailable ? undefined : "No search providers configured (OpenAI, Tavily, or Perplexity API key required)"
    });

    if (!isAnyProviderAvailable) {
      console.warn('Web Search Service: No providers configured. Service will be unavailable.');
    }
  }

  /**
   * Execute a web search using the specified parameters
   */
  async executeSearch(params: WebSearchParams): Promise<SearchResponse> {
    const startTime = Date.now();
    const provider = params.provider || 'tavily'; // Default to Tavily if available, else OpenAI

    try {
      let results: SearchResult[] = [];
      switch (provider) {
        case 'openai':
          if (!this.openaiClient) {
            throw this.createServiceError('OpenAI API key not configured', ERROR_CODES.PROVIDER_NOT_CONFIGURED);
          }
          results = await this.executeOpenAISearch(params);
          break;
        case 'tavily':
          if (!this.tavilyAvailable) {
            throw this.createServiceError('Tavily API key not configured', ERROR_CODES.PROVIDER_NOT_CONFIGURED);
          }
          results = await this.executeTavilySearch(params);
          break;
        case 'perplexity':
          if (!this.perplexityAvailable) {
            throw this.createServiceError('Perplexity API key not configured', ERROR_CODES.PROVIDER_NOT_CONFIGURED);
          }
          results = await this.executePerplexitySearch(params);
          break;
        default:
          throw this.createServiceError(`Unsupported provider: ${provider}`, ERROR_CODES.UNSUPPORTED_PROVIDER);
      }

      const processingTime = Date.now() - startTime;
      await storage.updateToolStatus("web_search", {
        available: true,
        latency: processingTime,
        error: undefined // Clear previous errors on success
      });

      return {
        results: results.slice(0, params.resultCount || 5),
        metadata: {
          provider: provider,
          processingTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      const errorCode = error.code || ERROR_CODES.INTERNAL_SERVICE_ERROR;
      const errorMessage = error.message || 'An internal error occurred';

      await storage.updateToolStatus("web_search", {
        error: `${errorCode}: ${errorMessage}`
      });

      // Re-throw the original error or a structured one
      throw this.createServiceError(errorMessage, errorCode, error);
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
    return error;
  }

  /**
   * Execute a web search using OpenAI
   */
  private async executeOpenAISearch(params: WebSearchParams): Promise<SearchResult[]> {
    if (!this.openaiClient) {
      // This check is redundant due to the caller check, but good for safety
      throw this.createServiceError('OpenAI API key not configured', ERROR_CODES.PROVIDER_NOT_CONFIGURED);
    }

    try {
      // Simplified: Assume OpenAI directly returns search results via a function/tool call
      // In a real scenario, this would involve handling tool calls as shown previously
      // For this example, we simulate a direct search result structure
      console.log(`Simulating OpenAI search for: ${params.query}`);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Simulate results
      return [
        { title: `OpenAI Result 1 for ${params.query}`, url: 'https://openai.com/1', snippet: 'Snippet about result 1...' },
        { title: `OpenAI Result 2 for ${params.query}`, url: 'https://openai.com/2', snippet: 'Snippet about result 2...' },
      ];

    } catch (error: any) {
      console.error('Error executing OpenAI search:', error);
      throw this.createServiceError('OpenAI API request failed', ERROR_CODES.PROVIDER_API_ERROR, error);
    }
  }

  /**
   * Execute a web search using Tavily
   */
  private async executeTavilySearch(params: WebSearchParams): Promise<SearchResult[]> {
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
      throw this.createServiceError('Tavily API key not configured', ERROR_CODES.PROVIDER_NOT_CONFIGURED);
    }

    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${tavilyApiKey}` // Tavily uses tavily-api-key header
          "tavily-api-key": tavilyApiKey
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: params.query,
          search_depth: params.tavilyOptions?.searchDepth || "basic",
          max_results: params.resultCount || 5,
          include_raw_content: params.tavilyOptions?.includeRawContent || false,
          include_answer: params.tavilyOptions?.includeAnswer || false, // Example: Add include_answer
          include_images: params.tavilyOptions?.includeImages || false,
          topic: params.tavilyOptions?.topic || "general"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw this.createServiceError(`Tavily API error (${response.status}): ${errorText}`, ERROR_CODES.PROVIDER_API_ERROR);
      }

      const data = await response.json();

      if (Array.isArray(data.results)) {
        return data.results.map((result: any) => ({
          title: result.title || 'No Title',
          url: result.url || '#',
          snippet: result.content || 'No description available'
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Error executing Tavily search:', error);
      // If it's already a service error, rethrow it, otherwise wrap it
      if (error.code) throw error;
      throw this.createServiceError('Tavily API request failed', ERROR_CODES.PROVIDER_API_ERROR, error);
    }
  }

  /**
   * Execute a web search using Perplexity
   */
  private async executePerplexitySearch(params: WebSearchParams): Promise<SearchResult[]> {
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      throw this.createServiceError('Perplexity API key not configured', ERROR_CODES.PROVIDER_NOT_CONFIGURED);
    }

    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${perplexityApiKey}`
        },
        body: JSON.stringify({
          model: params.perplexityOptions?.model || "llama-3-sonar-large-32k-online", // Use a known online model
          messages: [
            { role: "system", content: "You are an AI assistant. Provide concise search results based on the user query." },
            { role: "user", content: params.query }
          ],
          // Perplexity doesn't explicitly list web_search_options, rely on model's online capability
          temperature: 0.2,
          max_tokens: 1024 // Add max_tokens
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw this.createServiceError(`Perplexity API error (${response.status}): ${errorText}`, ERROR_CODES.PROVIDER_API_ERROR);
      }

      const data = await response.json();

      // Perplexity response structure might vary. This is an assumption.
      // It might return a text summary with citations.
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        // Attempt to parse if it looks like JSON, otherwise return as snippet
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.results)) {
            return parsed.results.map((result: any) => ({
              title: result.title || 'No Title',
              url: result.url || '#',
              snippet: result.snippet || result.text || 'No description available'
            }));
          }
        } catch (e) {
          // Not JSON, treat the whole content as a single result snippet
          console.log('Perplexity response is not JSON, returning content as snippet.');
          return [
            {
              title: `Perplexity Result for ${params.query}`,
              url: '#',
              snippet: content
            }
          ];
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error executing Perplexity search:', error);
      if (error.code) throw error;
      throw this.createServiceError('Perplexity API request failed', ERROR_CODES.PROVIDER_API_ERROR, error);
    }
  }
}

// Export singleton instance
export const webSearchService = new WebSearchService();

