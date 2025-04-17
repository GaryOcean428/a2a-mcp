import { VectorStorageParams } from '@shared/schema';
import { storage } from '../storage';

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
 * In-memory vector database for development purposes
 * In production, this would be replaced with a connection to a real vector database
 */
class InMemoryVectorDB {
  private collections: Map<string, Map<string, VectorResult>>;
  
  constructor() {
    this.collections = new Map();
  }
  
  /**
   * Get or create a collection
   */
  private getCollection(name: string): Map<string, VectorResult> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }
  
  /**
   * Store vectors in a collection
   */
  async store(collection: string, data: VectorResult | VectorResult[]): Promise<string[]> {
    const col = this.getCollection(collection);
    const items = Array.isArray(data) ? data : [data];
    const ids: string[] = [];
    
    for (const item of items) {
      const id = item.id || this.generateId();
      col.set(id, { ...item, id });
      ids.push(id);
    }
    
    return ids;
  }
  
  /**
   * Retrieve vectors by IDs
   */
  async retrieve(collection: string, ids: string[]): Promise<VectorResult[]> {
    const col = this.getCollection(collection);
    return ids.map(id => col.get(id)).filter(Boolean) as VectorResult[];
  }
  
  /**
   * Search for vectors using cosine similarity
   */
  async search(
    collection: string, 
    query: string | number[], 
    filters?: any, 
    limit?: number
  ): Promise<VectorResult[]> {
    const col = this.getCollection(collection);
    const items = Array.from(col.values());
    
    // In a real implementation, this would use proper vector search algorithms
    // For this example, we'll just return a subset of items sorted by a random score
    let results = items.map(item => ({
      ...item,
      score: Math.random() // Simulate relevance score
    }));
    
    // Apply filters if provided
    if (filters) {
      results = results.filter(item => {
        // Simple filter implementation
        for (const [key, value] of Object.entries(filters)) {
          if (!item.metadata || item.metadata[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Sort by score and limit results
    results.sort((a, b) => (b.score || 0) - (a.score || 0));
    return results.slice(0, limit || 10);
  }
  
  /**
   * Delete vectors by IDs
   */
  async delete(collection: string, ids: string[]): Promise<string[]> {
    const col = this.getCollection(collection);
    const deletedIds: string[] = [];
    
    for (const id of ids) {
      if (col.has(id)) {
        col.delete(id);
        deletedIds.push(id);
      }
    }
    
    return deletedIds;
  }
  
  /**
   * Generate a random ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Service for vector storage operations
 */
export class VectorStorageService {
  private db: InMemoryVectorDB;
  
  constructor() {
    // Initialize vector database
    this.db = new InMemoryVectorDB();
    
    // Check if OpenAI API key is available for embeddings
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (openaiApiKey) {
      console.log('OpenAI API key found, vector storage service available');
      storage.updateToolStatus("vector_storage", { 
        available: true 
      });
    } else {
      console.log('OpenAI API key not found, vector storage functionality will be limited');
      storage.updateToolStatus("vector_storage", { 
        available: false,
        error: "OpenAI API key not configured for embeddings"
      });
    }
  }
  
  /**
   * Execute a vector storage operation
   */
  async execute(params: VectorStorageParams): Promise<VectorResponse> {
    const startTime = Date.now();
    
    try {
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
          
          // Convert data to VectorResult format
          const vectorData: VectorResult = {
            id: params.ids?.[0],
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
