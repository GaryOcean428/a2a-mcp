/**
 * Vector database interface
 * This interface defines the required operations for vector database providers
 */

export interface VectorResult {
  id: string;
  score?: number;
  metadata?: any;
  vector?: number[];
  content?: string;
}

export interface VectorDB {
  /**
   * Store vectors in a collection
   * @param collection Collection/class name
   * @param data Vector data to store
   * @returns Array of stored IDs
   */
  store(collection: string, data: VectorResult | VectorResult[]): Promise<string[]>;
  
  /**
   * Retrieve vectors by IDs
   * @param collection Collection/class name
   * @param ids Vector IDs to retrieve
   * @returns Retrieved vector results
   */
  retrieve(collection: string, ids: string[]): Promise<VectorResult[]>;
  
  /**
   * Search for vectors
   * @param collection Collection/class name
   * @param query Query string or vector
   * @param filters Optional metadata filters
   * @param limit Maximum number of results
   * @returns Search results
   */
  search(
    collection: string, 
    query: string | number[],
    filters?: any,
    limit?: number
  ): Promise<VectorResult[]>;
  
  /**
   * Delete vectors by IDs
   * @param collection Collection/class name
   * @param ids Vector IDs to delete
   * @returns Deleted vector IDs
   */
  delete(collection: string, ids: string[]): Promise<string[]>;
  
  /**
   * Cleanup resources
   */
  cleanup(): Promise<void>;
}