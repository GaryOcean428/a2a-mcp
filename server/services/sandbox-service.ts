import { Sandbox } from '@e2b/sdk';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import { storage } from '../storage';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

/**
 * Sandbox templates for different tasks
 */
export enum SandboxTemplate {
  DEFAULT = 'base',
  DATA_SCIENCE = 'data-science',
  DEVELOPMENT = 'development',
  WEB = 'web'
}

/**
 * Result of code execution in a sandbox
 */
export interface CodeExecutionResult {
  id: string;
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  logs?: string[];
  files?: { path: string; content: string }[];
}

/**
 * Service for managing E2B sandboxes
 */
export class SandboxService {
  private sandboxes: Map<string, Sandbox> = new Map();
  private isAvailable: boolean = false;
  private apiKey: string;

  constructor() {
    // Get E2B API key from environment variables
    this.apiKey = process.env.E2B_API_KEY || '';
    
    if (this.apiKey) {
      this.isAvailable = true;
      console.log('E2B API key found, Sandbox execution available');
    } else {
      console.warn('E2B API key not found, Sandbox execution disabled');
    }
    
    // Update tool status
    this.updateStatus(this.isAvailable);
  }

  /**
   * Update tool status
   */
  private async updateStatus(available: boolean, error?: string) {
    await storage.updateToolStatus('sandbox', {
      name: 'sandbox',
      available,
      error,
      lastUsed: available ? new Date().toISOString() : undefined
    });
  }
  
  /**
   * Create a new sandbox
   */
  async createSandbox(template: SandboxTemplate = SandboxTemplate.DEFAULT): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Sandbox service is not available. Missing E2B API key.');
    }
    
    try {
      // Generate a unique ID for the sandbox
      const sandboxId = nanoid();
      
      // Create a new sandbox with the specified template
      const sandbox = await Sandbox.create({
        apiKey: this.apiKey,
        template: template,
        metadata: {
          id: sandboxId,
          createdAt: new Date().toISOString()
        }
      });
      
      // Store the sandbox instance
      this.sandboxes.set(sandboxId, sandbox);
      
      console.log(`Created sandbox ${sandboxId} with template ${template}`);
      
      return sandboxId;
    } catch (error) {
      console.error('Failed to create sandbox:', error);
      throw new Error(`Failed to create sandbox: ${error.message}`);
    }
  }
  
  /**
   * Get a sandbox by ID
   */
  getSandbox(sandboxId: string): Sandbox | undefined {
    return this.sandboxes.get(sandboxId);
  }
  
  /**
   * Execute code in a sandbox
   */
  async executeCode(sandboxId: string, code: string, language: 'javascript' | 'typescript' | 'python' = 'javascript'): Promise<CodeExecutionResult> {
    if (!this.isAvailable) {
      throw new Error('Sandbox service is not available. Missing E2B API key.');
    }
    
    const sandbox = this.getSandbox(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found.`);
    }
    
    const startTime = Date.now();
    
    try {
      let result;
      
      // Execute the code based on the language
      if (language === 'python') {
        result = await sandbox.process.start({
          cmd: 'python3',
          args: ['-c', code],
        });
      } else {
        // Use Node.js for JavaScript and TypeScript
        const extension = language === 'typescript' ? 'ts' : 'js';
        
        // Write code to a file
        const filePath = `/tmp/code_${Date.now()}.${extension}`;
        await sandbox.filesystem.write(filePath, code);
        
        // Execute the file
        if (language === 'typescript') {
          // For TypeScript, use ts-node
          result = await sandbox.process.start({
            cmd: 'npx',
            args: ['ts-node', filePath],
          });
        } else {
          // For JavaScript, use Node.js
          result = await sandbox.process.start({
            cmd: 'node',
            args: [filePath],
          });
        }
      }
      
      const executionTime = Date.now() - startTime;
      
      // Handle the result
      const success = result.exit === 0;
      return {
        id: nanoid(),
        success,
        output: result.stdout,
        error: success ? undefined : result.stderr,
        executionTime,
        logs: [result.stdout, result.stderr].filter(Boolean)
      };
      
    } catch (error) {
      console.error(`Failed to execute code in sandbox ${sandboxId}:`, error);
      
      return {
        id: nanoid(),
        success: false,
        output: '',
        error: `Failed to execute code: ${error.message}`,
        executionTime: Date.now() - startTime,
      };
    }
  }
  
  /**
   * Upload a file to a sandbox
   */
  async uploadFile(sandboxId: string, localFilePath: string, sandboxFilePath: string): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Sandbox service is not available. Missing E2B API key.');
    }
    
    const sandbox = this.getSandbox(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found.`);
    }
    
    try {
      await sandbox.filesystem.upload(localFilePath, sandboxFilePath);
      return true;
    } catch (error) {
      console.error(`Failed to upload file to sandbox ${sandboxId}:`, error);
      return false;
    }
  }
  
  /**
   * Download a file from a sandbox
   */
  async downloadFile(sandboxId: string, sandboxFilePath: string, localFilePath: string): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Sandbox service is not available. Missing E2B API key.');
    }
    
    const sandbox = this.getSandbox(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found.`);
    }
    
    try {
      await sandbox.filesystem.download(sandboxFilePath, localFilePath);
      return true;
    } catch (error) {
      console.error(`Failed to download file from sandbox ${sandboxId}:`, error);
      return false;
    }
  }
  
  /**
   * Install a package in a sandbox
   */
  async installPackage(sandboxId: string, packageName: string, packageManager: 'npm' | 'pip' = 'npm'): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Sandbox service is not available. Missing E2B API key.');
    }
    
    const sandbox = this.getSandbox(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found.`);
    }
    
    try {
      let result;
      
      if (packageManager === 'npm') {
        result = await sandbox.process.start({
          cmd: 'npm',
          args: ['install', packageName, '--save'],
        });
      } else {
        result = await sandbox.process.start({
          cmd: 'pip',
          args: ['install', packageName],
        });
      }
      
      const success = result.exit === 0;
      if (!success) {
        console.error(`Failed to install ${packageName} in sandbox ${sandboxId}:`, result.stderr);
      }
      
      return success;
    } catch (error) {
      console.error(`Failed to install ${packageName} in sandbox ${sandboxId}:`, error);
      return false;
    }
  }
  
  /**
   * Close a sandbox
   */
  async closeSandbox(sandboxId: string): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }
    
    const sandbox = this.getSandbox(sandboxId);
    if (!sandbox) {
      return false;
    }
    
    try {
      await sandbox.close();
      this.sandboxes.delete(sandboxId);
      return true;
    } catch (error) {
      console.error(`Failed to close sandbox ${sandboxId}:`, error);
      return false;
    }
  }
  
  /**
   * List all sandboxes
   */
  listSandboxes(): string[] {
    return Array.from(this.sandboxes.keys());
  }
  
  /**
   * Get information about all sandboxes
   */
  getSandboxesInfo(): { id: string; template: string; createdAt: string }[] {
    return Array.from(this.sandboxes.entries()).map(([id, sandbox]) => ({
      id,
      template: sandbox.metadata?.template || 'unknown',
      createdAt: sandbox.metadata?.createdAt || 'unknown'
    }));
  }
  
  /**
   * Clean up function for service cleanup
   */
  async cleanup() {
    // Close all sandboxes
    for (const [id, sandbox] of this.sandboxes.entries()) {
      try {
        await sandbox.close();
        console.log(`Closed sandbox ${id}`);
      } catch (error) {
        console.error(`Failed to close sandbox ${id}:`, error);
      }
    }
    
    this.sandboxes.clear();
  }
}

// Export a singleton instance
export const sandboxService = new SandboxService();