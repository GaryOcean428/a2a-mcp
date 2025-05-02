/**
 * MCP Integration Platform - Database Schema
 * 
 * This file defines the database schema and types for the application.
 */

import { pgTable, serial, text, timestamp, json, boolean, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Users Table
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('user'),
  apiKey: text('api_key'),
  active: boolean('active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * API Keys Table
 */
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull().references(() => users.id),
  key: text('key').notNull().unique(),
  name: text('name'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
});

/**
 * Types
 */

// User select type
export type User = typeof users.$inferSelect;

// User insert schema
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Separate login schema (email + password)
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Refined user insert schema for registration
export const registrationSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// User insert type
export type InsertUser = z.infer<typeof insertUserSchema>;

// API Key select type
export type ApiKey = typeof apiKeys.$inferSelect;

// API Key insert schema
export const insertApiKeySchema = createInsertSchema(apiKeys)
  .omit({ id: true, createdAt: true, lastUsedAt: true });

// API Key insert type
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

/**
 * Tool Configuration Table
 */
export const toolConfigs = pgTable('tool_configs', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull().references(() => users.id),
  toolType: text('tool_type').notNull(),
  providerType: text('provider_type').notNull(),
  name: text('name'),
  active: boolean('active').notNull().default(true),
  config: json('config').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tool Config select type
export type ToolConfig = typeof toolConfigs.$inferSelect;

// Tool Config insert schema
export const insertToolConfigSchema = createInsertSchema(toolConfigs, {
  toolType: z.string().min(1, 'Tool type is required'),
  providerType: z.string().min(1, 'Provider type is required'),
  config: z.record(z.string(), z.any()).refine(val => Object.keys(val).length > 0, {
    message: 'Configuration cannot be empty',
  }),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Tool Config insert type
export type InsertToolConfig = z.infer<typeof insertToolConfigSchema>;

/**
 * Request Logs Table
 */
export const requestLogs = pgTable('request_logs', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  toolType: text('tool_type').notNull(),
  providerType: text('provider_type'),
  endpoint: text('endpoint'),
  requestData: json('request_data'),
  responseData: json('response_data'),
  statusCode: text('status_code'),
  executionTimeMs: serial('execution_time_ms'),
  errorMessage: text('error_message'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Request Log select type
export type RequestLog = typeof requestLogs.$inferSelect;

// Request Log insert schema
export const insertRequestLogSchema = createInsertSchema(requestLogs, {
  toolType: z.string().min(1, 'Tool type is required'),
  requestData: z.record(z.string(), z.any()).optional(),
  responseData: z.record(z.string(), z.any()).optional(),
}).omit({ id: true, timestamp: true });

// Request Log insert type
export type InsertRequestLog = z.infer<typeof insertRequestLogSchema>;

/**
 * Session Table for Express Session
 */
export const sessionTable = pgTable('session', {
  sid: varchar('sid').primaryKey().notNull(),
  sess: json('sess').notNull(),
  expire: timestamp('expire', { precision: 6 }).notNull(),
});

// Session select type
export type Session = typeof sessionTable.$inferSelect;

// Session insert schema
export const insertSessionSchema = createInsertSchema(sessionTable);

// Session insert type
export type InsertSession = z.infer<typeof insertSessionSchema>;

/**
 * Status Types
 */
export interface ToolStatus {
  name: string;
  available: boolean;
  latency?: number;
  lastUsed?: string;
  error?: string;
}

export interface SystemStatus {
  version: string;
  uptime: number;
  transport: string;
  lastRequest?: string;
  activeTools: ToolStatus[];
}

/**
 * MCP Protocol Types
 */
export interface MCPRequest {
  id: string;
  name: string;
  parameters: any;
}

export interface MCPResponse {
  id: string;
  results?: any;
  error?: {
    code: string;
    message: string;
  };
}

// Web Search Parameters
export interface WebSearchParams {
  query: string;
  numResults?: number;
  includeLinks?: boolean;
  searchType?: 'web' | 'news' | 'images';
}

// Form Automation Parameters
export interface FormAutomationParams {
  url: string;
  fields: Record<string, string>;
  submitSelector?: string;
  waitForNavigation?: boolean;
}

// Vector Storage Parameters
export interface VectorStorageParams {
  operation: 'store' | 'retrieve' | 'delete' | 'list';
  collection: string;
  ids?: string[];
  embeddings?: number[][];
  metadata?: Record<string, any>[];
  query?: number[];
  topK?: number;
}

// Data Scraper Parameters
export interface DataScraperParams {
  url: string;
  selectors: string[];
  waitForSelector?: string;
  transform?: 'table' | 'list' | 'json';
}

// Status Parameters
export interface StatusParams {
  toolName?: string;
}

// Sandbox Parameters
export interface SandboxParams {
  operation: 'create' | 'execute' | 'upload' | 'download' | 'install' | 'close' | 'list';
  sandboxId?: string;
  template?: string;
  code?: string;
  language?: string;
  localFilePath?: string;
  sandboxFilePath?: string;
  packageName?: string;
  packageManager?: 'npm' | 'pip';
}

export const sandboxSchema = z.object({
  operation: z.enum(['create', 'execute', 'upload', 'download', 'install', 'close', 'list']),
  sandboxId: z.string().optional(),
  template: z.string().optional(),
  code: z.string().optional(),
  language: z.string().optional(),
  localFilePath: z.string().optional(),
  sandboxFilePath: z.string().optional(),
  packageName: z.string().optional(),
  packageManager: z.enum(['npm', 'pip']).optional()
});

// MCP Tool Schemas
export const MCPToolSchemas = {
  web_search: {
    name: 'web_search',
    description: 'Search the web for current information',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query'
        },
        numResults: {
          type: 'number',
          description: 'Number of results to return',
          default: 5
        },
        includeLinks: {
          type: 'boolean',
          description: 'Whether to include links in results',
          default: true
        },
        searchType: {
          type: 'string',
          enum: ['web', 'news', 'images'],
          description: 'Type of search to perform',
          default: 'web'
        }
      },
      required: ['query']
    }
  },
  form_automation: {
    name: 'form_automation',
    description: 'Automate form filling and submission',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL of the form to automate'
        },
        fields: {
          type: 'object',
          description: 'Form fields to fill (field name to value)'
        },
        submitSelector: {
          type: 'string',
          description: 'CSS selector for submit button',
          default: 'button[type="submit"]'
        },
        waitForNavigation: {
          type: 'boolean',
          description: 'Whether to wait for page navigation after submit',
          default: true
        }
      },
      required: ['url', 'fields']
    }
  },
  vector_storage: {
    name: 'vector_storage',
    description: 'Store and retrieve vector embeddings',
    parameters: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['store', 'retrieve', 'delete', 'list'],
          description: 'Operation to perform'
        },
        collection: {
          type: 'string',
          description: 'Collection name for vectors'
        },
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Vector IDs (for store/retrieve/delete)'
        },
        embeddings: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' }
          },
          description: 'Vector embeddings to store'
        },
        metadata: {
          type: 'array',
          items: { type: 'object' },
          description: 'Metadata for vectors'
        },
        query: {
          type: 'array',
          items: { type: 'number' },
          description: 'Query vector for retrieval'
        },
        topK: {
          type: 'number',
          description: 'Number of results to return for retrieval',
          default: 10
        }
      },
      required: ['operation', 'collection']
    }
  },
  data_scraper: {
    name: 'data_scraper',
    description: 'Scrape data from web pages',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL of the page to scrape'
        },
        selectors: {
          type: 'array',
          items: { type: 'string' },
          description: 'CSS selectors for elements to scrape'
        },
        waitForSelector: {
          type: 'string',
          description: 'CSS selector to wait for before scraping'
        },
        transform: {
          type: 'string',
          enum: ['table', 'list', 'json'],
          description: 'Transform the scraped data into this format',
          default: 'json'
        }
      },
      required: ['url', 'selectors']
    }
  },
  status: {
    name: 'status',
    description: 'Get system or tool status',
    parameters: {
      type: 'object',
      properties: {
        toolName: {
          type: 'string',
          description: 'Specific tool to get status for'
        }
      }
    }
  }
};
