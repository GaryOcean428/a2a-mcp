/**
 * MCP Integration Platform - Database Schema
 * 
 * This file defines the database schema and types for the application.
 */

import { pgTable, serial, text, timestamp, json, boolean, varchar, index, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Users Table for Replit Auth
 */
export const users = pgTable('users', {
  id: varchar('id').primaryKey().notNull(),
  username: varchar('username').unique().notNull(),
  email: varchar('email').unique(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  bio: text('bio'),
  profileImageUrl: varchar('profile_image_url'),
  role: text('role').default('user'),
  active: boolean('active').default(true),
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
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address').optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Type for upserting a user from Replit Auth
export type UpsertUser = typeof users.$inferInsert;

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
 * Sessions Table for Replit Auth
 */
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [
    index("IDX_session_expire").on(table.expire)
  ]
);

// Session select type
export type Session = typeof sessions.$inferSelect;

// Session insert schema
export const insertSessionSchema = createInsertSchema(sessions);

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
  provider?: 'openai' | 'tavily' | 'perplexity';
  // Provider-specific parameters
  tavilyOptions?: {
    searchDepth?: 'basic' | 'advanced';
    includeRawContent?: boolean;
    includeImages?: boolean;
    includeAnswer?: boolean;
    topic?: string;
  };
  perplexityOptions?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  openaiOptions?: {
    model?: string;
    temperature?: number;
    systemPrompt?: string;
  };
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
  javascript?: string; // Optional JavaScript to execute on the page
  pagination?: {
    enabled: boolean;
    nextSelector?: string; // CSS selector for the next page button
    maxPages?: number; // Maximum number of pages to scrape
    delay?: number; // Delay between page navigations in ms
  };
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }>;
  headers?: Record<string, string>;
  proxy?: string;
  timeout?: number;
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
        },
        provider: {
          type: 'string',
          enum: ['openai', 'tavily', 'perplexity'],
          description: 'Search provider to use'
        },
        tavilyOptions: {
          type: 'object',
          description: 'Tavily-specific options',
          properties: {
            searchDepth: {
              type: 'string',
              enum: ['basic', 'advanced'],
              description: 'Depth of search to perform',
              default: 'basic'
            },
            includeRawContent: {
              type: 'boolean',
              description: 'Whether to include raw content in results',
              default: false
            },
            includeImages: {
              type: 'boolean',
              description: 'Whether to include images in search results',
              default: false
            },
            includeAnswer: {
              type: 'boolean',
              description: 'Whether to include an AI-generated answer',
              default: false
            },
            topic: {
              type: 'string',
              description: 'Topic category to focus search on',
              default: 'general'
            }
          }
        },
        perplexityOptions: {
          type: 'object',
          description: 'Perplexity-specific options',
          properties: {
            model: {
              type: 'string',
              description: 'Perplexity model to use',
              default: 'llama-3-sonar-large-32k-online'
            },
            temperature: {
              type: 'number',
              description: 'Temperature for generation',
              default: 0.2
            },
            maxTokens: {
              type: 'number',
              description: 'Maximum tokens to generate',
              default: 1024
            }
          }
        },
        openaiOptions: {
          type: 'object',
          description: 'OpenAI-specific options',
          properties: {
            model: {
              type: 'string',
              description: 'OpenAI model to use',
              default: 'gpt-4o'
            },
            temperature: {
              type: 'number',
              description: 'Temperature for generation',
              default: 0.7
            },
            systemPrompt: {
              type: 'string',
              description: 'System prompt to use for search',
              default: 'You are a helpful search assistant.'
            }
          }
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
        },
        javascript: {
          type: 'string',
          description: 'Optional JavaScript to execute on the page before scraping'
        },
        pagination: {
          type: 'object',
          description: 'Configuration for paginated scraping',
          properties: {
            enabled: {
              type: 'boolean',
              description: 'Whether to enable pagination',
              default: false
            },
            nextSelector: {
              type: 'string',
              description: 'CSS selector for the next page button/link'
            },
            maxPages: {
              type: 'number',
              description: 'Maximum number of pages to scrape',
              default: 5
            },
            delay: {
              type: 'number',
              description: 'Delay between page navigations in milliseconds',
              default: 1000
            }
          },
          required: ['enabled']
        },
        cookies: {
          type: 'array',
          description: 'Cookies to set before scraping',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Cookie name'
              },
              value: {
                type: 'string',
                description: 'Cookie value'
              },
              domain: {
                type: 'string',
                description: 'Cookie domain'
              },
              path: {
                type: 'string',
                description: 'Cookie path',
                default: '/'
              }
            },
            required: ['name', 'value']
          }
        },
        headers: {
          type: 'object',
          description: 'HTTP headers to send with the request'
        },
        proxy: {
          type: 'string',
          description: 'Proxy server to use for the request'
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds for the scraping operation',
          default: 30000
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
