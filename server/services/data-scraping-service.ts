import { DataScraperParams } from '@shared/schema';
import { storage } from '../storage';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';
import http from 'http';

interface ScrapedData {
  [key: string]: string | string[];
}

interface ScrapingResult {
  data: ScrapedData[];
  format: string;
  metadata: {
    url: string;
    timestamp: string;
    processingTime: number;
    pagesScraped: number;
  };
}

/**
 * Service for web scraping operations
 * Using HTTP requests instead of browser automation for the demo environment
 */
export class DataScrapingService {
  
  constructor() {
    // Update status to available
    this.updateStatus(true);
  }
  
  /**
   * Update tool status
   */
  private async updateStatus(available: boolean, error?: string) {
    try {
      await storage.updateToolStatus("data_scraper", { 
        available,
        error
      });
    } catch (err) {
      console.error('Failed to update tool status:', err);
    }
  }
  
  /**
   * Scrape data from a website
   * Using simple HTTP request instead of browser automation in this demo
   */
  async scrape(params: DataScraperParams): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    // Validate parameters
    if (!params.url) {
      throw new Error('URL is required');
    }
    
    try {
      // Create mock data to simulate scraped content
      const mockData: ScrapedData[] = [];
      const pagesScraped = 1;
      
      // Create sample data that represents what would be scraped
      mockData.push({
        title: `Content from ${params.url}`,
        url: params.url,
        timestamp: new Date().toISOString(),
        note: "This is a simplified version without browser automation for the demo environment",
        selectors: JSON.stringify(params.selectors || {})
      });
      
      // Simple HTTP request to verify URL is accessible
      await new Promise<void>((resolve, reject) => {
        const request = (params.url.startsWith('https') ? https : http).get(params.url, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              // Add status information to mock data
              mockData[0].status = `${res.statusCode} ${res.statusMessage}`;
              
              // Add content length if available
              if (res.headers['content-length']) {
                mockData[0].contentLength = res.headers['content-length'];
              }
              
              // Add content type if available
              if (res.headers['content-type']) {
                mockData[0].contentType = res.headers['content-type'];
              }
              
              resolve();
            } else {
              reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
            }
          });
        });
        
        request.on('error', (err) => {
          reject(err);
        });
        
        // Set timeout
        request.setTimeout(params.timeout || 10000, () => {
          request.destroy();
          reject(new Error('Request timed out'));
        });
      });
      
      // Format the output
      const result = await this.formatOutput(mockData, params.format || 'json');
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Update tool status
      this.updateStatus(true);
      
      return {
        data: result,
        format: params.format || 'json',
        metadata: {
          url: params.url,
          timestamp: new Date().toISOString(),
          processingTime,
          pagesScraped
        }
      };
    } catch (error) {
      // Update tool status with error
      this.updateStatus(true, error instanceof Error ? error.message : String(error));
      
      throw error;
    }
  }
  
  /**
   * Format scraped data according to the requested format
   */
  private async formatOutput(data: ScrapedData[], format: string): Promise<ScrapedData[]> {
    switch (format) {
      case 'json':
        return data;
        
      case 'csv':
        // Convert data to CSV format
        if (data.length === 0) {
          return [];
        }
        
        // Create a temporary file for CSV output
        const tempFile = path.join(os.tmpdir(), `scrape-${Date.now()}.csv`);
        
        // Get CSV headers from the first data item
        const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));
        
        // Create CSV writer
        const csvWriter = createObjectCsvWriter({
          path: tempFile,
          header: headers
        });
        
        // Write data to CSV
        await csvWriter.writeRecords(data);
        
        // Read CSV content
        const csvContent = fs.readFileSync(tempFile, 'utf-8');
        
        // Clean up temporary file
        fs.unlinkSync(tempFile);
        
        // Return CSV content as the only item in a data array
        return [{ csv: csvContent }];
        
      case 'text':
        // Convert data to plain text
        return data.map(item => {
          const text = Object.entries(item)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            })
            .join('\n');
          
          return { text };
        });
        
      default:
        return data;
    }
  }
  
  /**
   * Clean up resources when service is destroyed - no-op in this implementation
   */
  async cleanup() {
    // No resources to clean up in this implementation
  }
}

// Export singleton instance
export const dataScrapingService = new DataScrapingService();
