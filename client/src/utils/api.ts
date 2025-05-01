/**
 * MCP Integration Platform - API Utilities
 * 
 * This module provides utility functions for making API requests with consistent error handling.
 */

import { logger } from './logger';

// Default base URL for API requests
const API_BASE_URL = '';

// API request options interface
interface RequestOptions {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  signal?: AbortSignal;
}

/**
 * Make a GET request to the API
 */
export async function apiGet<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  logger.debug(`Fetching data from ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: options.credentials || 'include',
      cache: options.cache || 'no-cache',
      signal: options.signal,
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const error = new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }
    
    // Parse and return response data
    return await response.json();
  } catch (error) {
    // Log API errors
    logger.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Make a POST request to the API
 */
export async function apiPost<T = any>(
  endpoint: string,
  data: any,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  logger.debug(`Posting data to ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: options.credentials || 'include',
      cache: options.cache || 'no-cache',
      body: JSON.stringify(data),
      signal: options.signal,
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const error = new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }
    
    // Parse and return response data
    return await response.json();
  } catch (error) {
    // Log API errors
    logger.error(`Error posting data to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Make a PUT request to the API
 */
export async function apiPut<T = any>(
  endpoint: string,
  data: any,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  logger.debug(`Putting data to ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: options.credentials || 'include',
      cache: options.cache || 'no-cache',
      body: JSON.stringify(data),
      signal: options.signal,
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const error = new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }
    
    // Parse and return response data
    return await response.json();
  } catch (error) {
    // Log API errors
    logger.error(`Error putting data to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Make a DELETE request to the API
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  logger.debug(`Deleting data from ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: options.credentials || 'include',
      cache: options.cache || 'no-cache',
      signal: options.signal,
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const error = new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }
    
    // Parse and return response data
    return await response.json();
  } catch (error) {
    // Log API errors
    logger.error(`Error deleting data from ${endpoint}:`, error);
    throw error;
  }
}
