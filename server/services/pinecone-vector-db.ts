import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { VectorDB, VectorResult } from './vector-db-interface';

/**
 * Pinecone vector database implementation
 */
export class PineconeVectorDB implements VectorDB {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexCache: Set<string> = new Set();
  private embeddingModel = 'text-embedding-3-small';
  private dimensions = 1536; // Dimensions for text-embedding-3-small
  
  constructor(apiKey: string, openaiApiKey: string) {
    // Initialize Pinecone client
    this.pinecone = new Pinecone({
      apiKey: apiKey,
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
   * Initialize a collection (index) if it doesn't exist
   */
  private async ensureIndex(name: string): Promise<void> {
    // Skip if we've already checked this index
    if (this.indexCache.has(name)) {
      return;
    }
    
    try {
      // Check if index exists
      const indexes = await this.pinecone.listIndexes();
      
      // Use Array.from to ensure we have an iterable array
      const indexArray = Array.isArray(indexes) ? indexes : Array.from(indexes as any);
      const indexNames = indexArray.map((idx: any) => idx.name || '');
      
      const exists = indexNames.includes(name);
      
      if (!exists) {
        // Create the index if it doesn't exist
        try {
          // Simple approach with fewer TypeScript errors
          const createIndexOptions = {
            name,
            dimension: this.dimensions,
            metric: 'cosine'
          };
          
          // Use any type to bypass TypeScript checking on the createIndex parameters
          await (this.pinecone as any).createIndex(createIndexOptions);
          
          // Wait for index to be ready
          console.log(`Creating Pinecone index: ${name}`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (createError) {
          console.error('Error creating Pinecone index:', createError);
          // Try alternative method in case the API format changed
          console.log('Attempting alternative index creation method...');
          await (this.pinecone as any).createIndex({
            name,
            spec: {
              dimension: this.dimensions,
              metric: 'cosine'
            }
          });
        }
      }
      
      // Cache the index
      this.indexCache.add(name);
    } catch (error) {
      console.error(`Error ensuring index: ${name}`, error);
      throw new Error(`Failed to ensure index: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get the index (collection)
   */
  private async getIndex(name: string) {
    await this.ensureIndex(name);
    return this.pinecone.index(name);
  }
  
  /**
   * Store vectors in a collection
   */
  async store(collection: string, data: VectorResult | VectorResult[]): Promise<string[]> {
    const index = await this.getIndex(collection);
    const items = Array.isArray(data) ? data : [data];
    const ids: string[] = [];
    
    // Prepare records for upsert
    const records = await Promise.all(items.map(async (item) => {
      const id = item.id || this.generateId();
      let vector = item.vector;
      
      // Generate embedding if vector is not provided but content is
      if (!vector && item.content) {
        vector = await this.createEmbedding(item.content);
      }
      
      if (!vector) {
        throw new Error('Vector or content is required for storage');
      }
      
      ids.push(id);
      
      return {
        id,
        values: vector,
        metadata: item.metadata || {}
      };
    }));
    
    // Upsert records
    await index.upsert(records);
    
    return ids;
  }
  
  /**
   * Retrieve vectors by IDs
   */
  async retrieve(collection: string, ids: string[]): Promise<VectorResult[]> {
    const index = await this.getIndex(collection);
    const response = await index.fetch(ids);
    
    return Object.values(response.records).map(record => ({
      id: record.id,
      vector: record.values,
      metadata: record.metadata,
    }));
  }
  
  /**
   * Search for vectors using cosine similarity
   */
  async search(
    collection: string, 
    query: string | number[], 
    filters?: any, 
    limit: number = 10
  ): Promise<VectorResult[]> {
    const index = await this.getIndex(collection);
    
    // Generate embedding from text query if needed
    let vector: number[];
    if (typeof query === 'string') {
      vector = await this.createEmbedding(query);
    } else {
      vector = query;
    }
    
    // Perform vector search
    const searchRequest: any = {
      vector,
      topK: limit,
      includeValues: true,
      includeMetadata: true
    };
    
    // Add filter if provided
    if (filters) {
      searchRequest.filter = filters;
    }
    
    const response = await index.query(searchRequest);
    
    // Convert to VectorResult format
    return (response.matches || []).map(match => ({
      id: match.id,
      score: match.score,
      vector: match.values,
      metadata: match.metadata
    }));
  }
  
  /**
   * Delete vectors by IDs
   */
  async delete(collection: string, ids: string[]): Promise<string[]> {
    const index = await this.getIndex(collection);
    await index.deleteMany(ids);
    return ids;
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
    // No cleanup needed for Pinecone
  }
}