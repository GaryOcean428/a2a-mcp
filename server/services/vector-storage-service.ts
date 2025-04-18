import { VectorStorageParams } from '@shared/schema';
import { storage } from '../storage';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

interface VectorResult {
  id: string;
  score?: number;
  metadata?: any;
  vector?: number[];
  content?: string;
}

interface VectorResponse {
  results: VectorResult[];
  operation: string;
  collection: string;
  metadata: {
    processingTime: number;
    timestamp: string;
  };
}

/**
 * Pinecone vector database implementation
 */
class PineconeVectorDB {
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
  private async createEmbedding(text: string): Promise<number[]> {
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

/**
 * Service for vector storage operations
 */
export class VectorStorageService {
  private db: PineconeVectorDB | null = null;
  
  constructor() {
    this.initializeVectorDB();
  }
  
  /**
   * Initialize vector database
   */
  private async initializeVectorDB() {
    const pineconeApiKey = process.env.PINECONE_API_KEY || '';
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    
    if (pineconeApiKey && openaiApiKey) {
      try {
        this.db = new PineconeVectorDB(pineconeApiKey, openaiApiKey);
        console.log('Pinecone and OpenAI API keys found, vector storage service available');
        await storage.updateToolStatus("vector_storage", { 
          available: true 
        });
      } catch (error) {
        console.error('Failed to initialize Pinecone:', error);
        await storage.updateToolStatus("vector_storage", { 
          available: false,
          error: `Failed to initialize Pinecone: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    } else {
      const missingKeys = [];
      if (!pineconeApiKey) missingKeys.push('Pinecone');
      if (!openaiApiKey) missingKeys.push('OpenAI');
      
      console.log(`${missingKeys.join(' and ')} API key(s) not found, vector storage functionality will be limited`);
      await storage.updateToolStatus("vector_storage", { 
        available: false,
        error: `${missingKeys.join(' and ')} API key(s) not configured for vector storage`
      });
    }
  }
  
  /**
   * Execute a vector storage operation
   */
  async execute(params: VectorStorageParams): Promise<VectorResponse> {
    const startTime = Date.now();
    
    try {
      // Ensure db is initialized
      if (!this.db) {
        throw new Error('Vector database is not initialized. Check API keys.');
      }
      
      // Ensure collection is provided
      if (!params.collection) {
        throw new Error('Collection name is required');
      }
      
      let results: VectorResult[] = [];
      
      // Execute the appropriate operation
      switch (params.operation) {
        case 'search':
          if (!params.query && !params.embedding) {
            throw new Error('Either query or embedding is required for search operation');
          }
          
          results = await this.db.search(
            params.collection, 
            params.query || params.embedding!, 
            params.filters, 
            params.limit
          );
          break;
          
        case 'retrieve':
          if (!params.ids || params.ids.length === 0) {
            throw new Error('Document IDs are required for retrieve operation');
          }
          
          results = await this.db.retrieve(params.collection, params.ids);
          break;
          
        case 'store':
          if (!params.data) {
            throw new Error('Data is required for store operation');
          }
          
          // Generate an ID if none is provided
          const vectorId = params.ids && params.ids.length > 0 
            ? String(params.ids[0]) 
            : `vector-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          
          // Convert data to VectorResult format
          const vectorData: VectorResult = {
            id: vectorId,
            metadata: params.data,
            vector: params.embedding,
            content: params.query
          };
          
          const storedIds = await this.db.store(params.collection, vectorData);
          results = [{ id: storedIds[0] }];
          break;
          
        case 'delete':
          if (!params.ids || params.ids.length === 0) {
            throw new Error('Document IDs are required for delete operation');
          }
          
          const deletedIds = await this.db.delete(params.collection, params.ids);
          results = deletedIds.map(id => ({ id }));
          break;
          
        default:
          throw new Error(`Unsupported operation: ${params.operation}`);
      }
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Update tool status
      await storage.updateToolStatus("vector_storage", {
        available: true,
        latency: processingTime
      });
      
      return {
        results,
        operation: params.operation,
        collection: params.collection,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      // Update tool status with error
      await storage.updateToolStatus("vector_storage", {
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }
}

// Export singleton instance
export const vectorStorageService = new VectorStorageService();
