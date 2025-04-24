import { nanoid } from 'nanoid';
import { storage } from '../storage';
import { SandboxParams } from '@shared/schema';
import * as fs from 'fs';
import { Sandbox } from '@e2b/sdk';

// Sandbox templates for different tasks
export enum SandboxTemplate {
  DEFAULT = 'base',
  DATA_SCIENCE = 'data-science',
  DEVELOPMENT = 'development',
  WEB = 'web'
}

// Result of code execution in a sandbox
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
  private sandboxes: Map<string, any> = new Map();
  private isAvailable: boolean = false;
  private apiKey: string;

  constructor() {
    // Get E2B API key from environment variables
    this.apiKey = process.env.E2B_API_KEY || '';
    
    // Check if API key is available
    if (this.apiKey) {
      this.isAvailable = true;
      console.log('E2B API key found, Sandbox execution available');
    } else {
      console.warn('E2B API key not found, Sandbox execution disabled');
      this.isAvailable = false;
    }
    
    // Update tool status
    this.updateToolStatus(this.isAvailable);
  }

  /**
   * Update tool status
   */
  private async updateToolStatus(available: boolean, error?: string) {
    await storage.updateToolStatus('sandbox', {
      name: 'sandbox',
      available,
      error,
      lastUsed: available ? new Date().toISOString() : undefined
    });
  }
  
  /**
   * Handle sandbox operations
   */
  async handleOperation(params: SandboxParams): Promise<any> {
    if (!this.isAvailable && params.operation !== 'list') {
      throw new Error('Sandbox service is not available. E2B API key is required.');
    }
    
    switch (params.operation) {
      case 'create':
        return this.createSandbox(params.template as SandboxTemplate);
      
      case 'execute':
        if (!params.sandboxId) throw new Error('Sandbox ID is required');
        if (!params.code) throw new Error('Code to execute is required');
        return this.executeCode(
          params.sandboxId, 
          params.code, 
          params.language || 'javascript'
        );
      
      case 'upload':
        if (!params.sandboxId) throw new Error('Sandbox ID is required');
        if (!params.localFilePath) throw new Error('Local file path is required');
        if (!params.sandboxFilePath) throw new Error('Sandbox file path is required');
        return this.uploadFile(
          params.sandboxId,
          params.localFilePath,
          params.sandboxFilePath
        );
      
      case 'download':
        if (!params.sandboxId) throw new Error('Sandbox ID is required');
        if (!params.sandboxFilePath) throw new Error('Sandbox file path is required');
        if (!params.localFilePath) throw new Error('Local file path is required');
        return this.downloadFile(
          params.sandboxId,
          params.sandboxFilePath,
          params.localFilePath
        );
      
      case 'install':
        if (!params.sandboxId) throw new Error('Sandbox ID is required');
        if (!params.packageName) throw new Error('Package name is required');
        return this.installPackage(
          params.sandboxId,
          params.packageName,
          params.packageManager || 'npm'
        );
      
      case 'close':
        if (!params.sandboxId) throw new Error('Sandbox ID is required');
        return this.closeSandbox(params.sandboxId);
      
      case 'list':
        return {
          sandboxes: this.listSandboxes(),
          available: this.isAvailable
        };
      
      default:
        throw new Error(`Unknown sandbox operation: ${params.operation}`);
    }
  }

  /**
   * Create a new sandbox
   */
  private async createSandbox(template: SandboxTemplate = SandboxTemplate.DEFAULT): Promise<{ sandboxId: string }> {
    if (!this.isAvailable) {
      throw new Error('Sandbox service is not available');
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
      
      return { sandboxId };
    } catch (error: any) {
      console.error('Failed to create sandbox:', error);
      throw new Error(`Failed to create sandbox: ${error.message}`);
    }
  }
  
  /**
   * Execute code in a sandbox
   */
  private async executeCode(
    sandboxId: string, 
    code: string, 
    language: string = 'javascript'
  ): Promise<CodeExecutionResult> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    
    const startTime = Date.now();
    
    try {
      let result;
      
      // Execute the code based on the language
      if (language === 'python') {
        result = await sandbox.process.start({
          cmd: 'python3',
          args: ['-c', code]
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
            args: ['ts-node', filePath]
          });
        } else {
          // For JavaScript, use Node.js
          result = await sandbox.process.start({
            cmd: 'node',
            args: [filePath]
          });
        }
      }
      
      const executionTime = Date.now() - startTime;
      
      // Handle the result
      return {
        id: nanoid(),
        success: result.exit === 0,
        output: result.stdout || '',
        error: result.stderr || undefined,
        executionTime,
        logs: [result.stdout, result.stderr].filter(Boolean)
      };
      
    } catch (error: any) {
      return {
        id: nanoid(),
        success: false,
        output: '',
        error: `Failed to execute code: ${error.message}`,
        executionTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Upload a file to a sandbox
   */
  private async uploadFile(sandboxId: string, localFilePath: string, sandboxFilePath: string): Promise<{ success: boolean }> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    
    try {
      await sandbox.filesystem.write(
        sandboxFilePath,
        await fs.promises.readFile(localFilePath, 'utf-8')
      );
      return { success: true };
    } catch (error: any) {
      console.error(`Failed to upload file to sandbox ${sandboxId}:`, error);
      return { success: false };
    }
  }
  
  /**
   * Download a file from a sandbox
   */
  private async downloadFile(sandboxId: string, sandboxFilePath: string, localFilePath: string): Promise<{ success: boolean }> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    
    try {
      const content = await sandbox.filesystem.read(sandboxFilePath);
      await fs.promises.writeFile(localFilePath, content);
      return { success: true };
    } catch (error: any) {
      console.error(`Failed to download file from sandbox ${sandboxId}:`, error);
      return { success: false };
    }
  }
  
  /**
   * Install a package in a sandbox
   */
  private async installPackage(
    sandboxId: string, 
    packageName: string, 
    packageManager: string = 'npm'
  ): Promise<{ success: boolean }> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    
    try {
      let result;
      
      if (packageManager === 'npm') {
        result = await sandbox.process.start({
          cmd: 'npm',
          args: ['install', packageName, '--save']
        });
      } else {
        result = await sandbox.process.start({
          cmd: 'pip',
          args: ['install', packageName]
        });
      }
      
      const success = result.exit === 0;
      return { success };
    } catch (error: any) {
      console.error(`Failed to install ${packageName} in sandbox ${sandboxId}:`, error);
      return { success: false };
    }
  }
  
  /**
   * Close a sandbox
   */
  private async closeSandbox(sandboxId: string): Promise<{ success: boolean }> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      return { success: false };
    }
    
    try {
      await sandbox.close();
      this.sandboxes.delete(sandboxId);
      return { success: true };
    } catch (error: any) {
      console.error(`Failed to close sandbox ${sandboxId}:`, error);
      return { success: false };
    }
  }
  
  /**
   * List all sandboxes
   */
  private listSandboxes(): { id: string; template?: string; createdAt?: string }[] {
    return Array.from(this.sandboxes.entries()).map(([id, sandbox]) => {
      try {
        return {
          id,
          template: sandbox.metadata?.template,
          createdAt: sandbox.metadata?.createdAt
        };
      } catch {
        return { id };
      }
    });
  }
  
  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // Close all sandboxes
    for (const [id, sandbox] of this.sandboxes.entries()) {
      try {
        await sandbox.close();
      } catch (error) {
        console.error(`Failed to close sandbox ${id}:`, error);
      }
    }
    
    this.sandboxes.clear();
  }
}

// Export a singleton instance
export const sandboxService = new SandboxService();