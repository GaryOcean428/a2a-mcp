import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import OpenAI from 'openai';
import { VectorDB, VectorResult } from './vector-db-interface';
import { VectorStorageParams } from '@shared/schema';

/**
 * Weaviate vector database implementation
 */
export class WeaviateVectorDB implements VectorDB {
  private client: WeaviateClient;
  private openai: OpenAI;
  private classCache: Set<string> = new Set();
  private embeddingModel = 'text-embedding-3-small';
  private dimensions = 1536; // Dimensions for text-embedding-3-small
  
  constructor(url: string, apiKey: string, openaiApiKey: string) {
    // Initialize Weaviate client
    this.client = weaviate.client({
      scheme: url.startsWith('https') ? 'https' : 'http',
      host: url.replace(/^https?:\/\//, ''),
      apiKey: new ApiKey(apiKey),
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Initialize OpenAI client for embeddings
    this.openai = new OpenAI({
      apiKey: openaiApiKey
    });
  }
  
  /**
   * Create an embedding vector from text using OpenAI
   */
  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: text
    });
    
    return response.data[0].embedding;
  }
  
  /**
   * Ensure a class exists in Weaviate
   * @param className The class name to ensure
   */
  private async ensureClass(className: string): Promise<void> {
    // Skip if we've already checked this class
    if (this.classCache.has(className)) {
      return;
    }
    
    try {
      // Check if class exists
      const classObj = await this.client.schema
        .classGetter()
        .withClassName(className)
        .do();

      if (!classObj) {
        // Create class if it doesn't exist
        console.log(`Creating Weaviate class: ${className}`);
        
        await this.client.schema
          .classCreator()
          .withClass({
            class: className,
            vectorizer: 'none', // We'll provide our own vectors from OpenAI
            vectorIndexType: 'hnsw',
            vectorIndexConfig: {
              skip: false,
              distance: 'cosine',
            },
            properties: [
              {
                name: 'content',
                dataType: ['text'],
                description: 'The text content',
              },
              {
                name: 'metadata',
                dataType: ['object'],
                description: 'The object containing metadata',
              },
            ],
          })
          .do();
      }
      
      // Cache the class
      this.classCache.add(className);
    } catch (error) {
      console.error(`Error ensuring class: ${className}`, error);
      throw new Error(`Failed to ensure class: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get a properly formatted class name from collection
   * Makes sure the class name starts with a capital letter
   */
  private getClassName(collection: string, options?: VectorStorageParams['weaviateOptions']): string {
    // Use override if provided in options
    if (options?.className) {
      return options.className;
    }
    
    // Convert collection to proper class name format (capitalized)
    return collection.charAt(0).toUpperCase() + collection.slice(1);
  }
  
  /**
   * Store vectors in a collection
   */
  async store(
    collection: string, 
    data: VectorResult | VectorResult[],
    options?: VectorStorageParams['weaviateOptions']
  ): Promise<string[]> {
    const className = this.getClassName(collection, options);
    await this.ensureClass(className);
    
    const items = Array.isArray(data) ? data : [data];
    const ids: string[] = [];
    
    // Process each item
    for (const item of items) {
      const id = item.id || this.generateId();
      let vector = item.vector;
      
      // Generate embedding if vector is not provided but content is
      if (!vector && item.content) {
        vector = await this.createEmbedding(item.content);
      }
      
      if (!vector) {
        throw new Error('Vector or content is required for storage');
      }
      
      // Create object in Weaviate
      await this.client.data
        .creator()
        .withClassName(className)
        .withId(id)
        .withVector(vector)
        .withProperties({
          content: item.content || '',
          metadata: item.metadata || {}
        })
        .do();
      
      ids.push(id);
    }
    
    return ids;
  }
  
  /**
   * Retrieve vectors by IDs
   */
  async retrieve(
    collection: string, 
    ids: string[],
    options?: VectorStorageParams['weaviateOptions']
  ): Promise<VectorResult[]> {
    const className = this.getClassName(collection, options);
    await this.ensureClass(className);
    
    const results: VectorResult[] = [];
    
    // Fetch each object by ID
    for (const id of ids) {
      try {
        const result = await this.client.data
          .getterById()
          .withClassName(className)
          .withId(id)
          .withVector()
          .do();
        
        if (result && result.properties) {
          results.push({
            id: id,
            vector: result.vector as number[],
            metadata: result.properties.metadata || {},
            content: result.properties.content || ''
          });
        }
      } catch (error) {
        console.warn(`Failed to retrieve object ${id} from class ${className}:`, error);
        // Continue with other IDs
      }
    }
    
    return results;
  }
  
  /**
   * Search for vectors using cosine similarity
   */
  async search(
    collection: string, 
    query: string | number[], 
    filters?: any, 
    limit: number = 10,
    options?: VectorStorageParams['weaviateOptions']
  ): Promise<VectorResult[]> {
    const className = this.getClassName(collection, options);
    await this.ensureClass(className);
    
    // Generate embedding from text query if needed
    let vector: number[];
    if (typeof query === 'string') {
      vector = await this.createEmbedding(query);
    } else {
      vector = query;
    }
    
    // Build query
    let searcher = this.client.graphql
      .get()
      .withClassName(className)
      .withFields('id content _additional { vector distance }')
      .withNearVector({ vector, distance: 0.0 })  // Start at 0 distance
      .withLimit(limit);
    
    // Add filter if provided
    if (filters) {
      // Convert filter to Weaviate's where filter format
      searcher = searcher.withWhere(this.convertFilters(filters));
    }
    
    // Execute search
    const response = await searcher.do();
    
    // Process results
    const data = response.data.Get[className] || [];
    
    return data.map((item: any) => ({
      id: item.id,
      score: item._additional?.distance !== undefined ? 1 - item._additional.distance : undefined, // Convert distance to similarity score
      vector: item._additional?.vector,
      content: item.content,
      metadata: item.metadata
    }));
  }
  
  /**
   * Delete vectors by IDs
   */
  async delete(
    collection: string, 
    ids: string[],
    options?: VectorStorageParams['weaviateOptions']
  ): Promise<string[]> {
    const className = this.getClassName(collection, options);
    await this.ensureClass(className);
    
    const deletedIds: string[] = [];
    
    // Delete each object by ID
    for (const id of ids) {
      try {
        await this.client.data
          .deleter()
          .withClassName(className)
          .withId(id)
          .do();
        
        deletedIds.push(id);
      } catch (error) {
        console.warn(`Failed to delete object ${id} from class ${className}:`, error);
        // Continue with other IDs
      }
    }
    
    return deletedIds;
  }
  
  /**
   * Convert filters to Weaviate's where filter format
   */
  private convertFilters(filters: any): any {
    // If filters is already in Weaviate format, return as is
    if (filters.operator || filters.path) {
      return filters;
    }
    
    // Convert simple key-value filters to Weaviate format
    const whereFilter: any = {
      operator: 'And',
      operands: []
    };
    
    for (const [key, value] of Object.entries(filters)) {
      const operand: any = {
        path: ['metadata', key],
        operator: 'Equal',
        valueString: String(value)
      };
      
      whereFilter.operands.push(operand);
    }
    
    return whereFilter;
  }
  
  /**
   * Generate a random ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Cleanup function
   */
  async cleanup() {
    // No explicit cleanup needed for Weaviate
  }
}