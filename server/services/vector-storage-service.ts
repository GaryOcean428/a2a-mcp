import { VectorStorageParams } from '@shared/schema';
import { storage } from '../storage';
import { VectorDB, VectorResult } from './vector-db-interface';
import { PineconeVectorDB } from './pinecone-vector-db';
import { WeaviateVectorDB } from './weaviate-vector-db';

interface VectorResponse {
  results: VectorResult[];
  operation: string;
  collection: string;
  provider: string;
  metadata: {
    processingTime: number;
    timestamp: string;
  };
}

/**
 * Service for vector storage operations
 */
export class VectorStorageService {
  private pineconeDB: VectorDB | null = null;
  private weaviateDB: VectorDB | null = null;
  
  constructor() {
    this.initializeVectorDBs();
  }
  
  /**
   * Initialize vector databases
   */
  private async initializeVectorDBs() {
    const pineconeApiKey = process.env.PINECONE_API_KEY || '';
    const weaviateUrl = process.env.WEAVIATE_URL || '';
    const weaviateApiKey = process.env.WEAVIATE_API_KEY || '';
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    
    const missingKeys: string[] = [];
    let dbAvailable = false;
    
    // Initialize Pinecone if API keys are available
    if (pineconeApiKey && openaiApiKey) {
      try {
        this.pineconeDB = new PineconeVectorDB(pineconeApiKey, openaiApiKey);
        console.log('Pinecone and OpenAI API keys found, Pinecone vector storage available');
        dbAvailable = true;
      } catch (error) {
        console.error('Failed to initialize Pinecone:', error);
        missingKeys.push('Pinecone (init failed)');
      }
    } else {
      if (!pineconeApiKey) missingKeys.push('Pinecone');
    }
    
    // Initialize Weaviate if API keys are available
    if (weaviateUrl && weaviateApiKey && openaiApiKey) {
      try {
        this.weaviateDB = new WeaviateVectorDB(weaviateUrl, weaviateApiKey, openaiApiKey);
        console.log('Weaviate, OpenAI API keys, and Weaviate URL found, Weaviate vector storage available');
        dbAvailable = true;
      } catch (error) {
        console.error('Failed to initialize Weaviate:', error);
        missingKeys.push('Weaviate (init failed)');
      }
    } else {
      if (!weaviateUrl) missingKeys.push('Weaviate URL');
      if (!weaviateApiKey) missingKeys.push('Weaviate API Key');
    }
    
    if (!openaiApiKey) {
      missingKeys.push('OpenAI');
    }
    
    // Update tool status
    if (dbAvailable) {
      await storage.updateToolStatus("vector_storage", { 
        available: true 
      });
    } else {
      const errorMessage = missingKeys.length > 0
        ? `${missingKeys.join(', ')} not configured for vector storage`
        : 'No vector database provider available';
        
      console.log(errorMessage);
      await storage.updateToolStatus("vector_storage", { 
        available: false,
        error: errorMessage
      });
    }
  }
  
  /**
   * Get the appropriate vector database based on provider
   */
  private getVectorDB(provider: string): VectorDB {
    switch (provider) {
      case 'pinecone':
        if (!this.pineconeDB) {
          throw new Error('Pinecone is not configured. Check Pinecone API key.');
        }
        return this.pineconeDB;
        
      case 'weaviate':
        if (!this.weaviateDB) {
          throw new Error('Weaviate is not configured. Check Weaviate URL and API key.');
        }
        return this.weaviateDB;
        
      default:
        throw new Error(`Unsupported vector database provider: ${provider}`);
    }
  }
  
  /**
   * Execute a vector storage operation
   */
  async execute(params: VectorStorageParams): Promise<VectorResponse> {
    const startTime = Date.now();
    
    try {
      // Check required parameters
      if (!params.collection) {
        throw new Error('Collection name is required');
      }
      
      // Get the provider (default to pinecone if not specified)
      const provider = params.provider || 'pinecone';
      
      // Get the appropriate vector database based on provider
      const db = this.getVectorDB(provider);
      
      let results: VectorResult[] = [];
      
      // Execute the appropriate operation
      switch (params.operation) {
        case 'search':
          if (!params.query && !params.embedding) {
            throw new Error('Either query or embedding is required for search operation');
          }
          
          results = await db.search(
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
          
          results = await db.retrieve(params.collection, params.ids);
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
          
          const storedIds = await db.store(params.collection, vectorData);
          results = [{ id: storedIds[0] }];
          break;
          
        case 'delete':
          if (!params.ids || params.ids.length === 0) {
            throw new Error('Document IDs are required for delete operation');
          }
          
          const deletedIds = await db.delete(params.collection, params.ids);
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
        latency: processingTime,
        lastUsed: new Date().toISOString()
      });
      
      return {
        results,
        operation: params.operation,
        collection: params.collection,
        provider,
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
