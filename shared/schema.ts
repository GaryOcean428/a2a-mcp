import { pgTable, serial, text, timestamp, varchar, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("user"),
  apiKey: varchar("api_key", { length: 255 }).default(""),
  active: boolean("active").default(true),
  lastLogin: timestamp("last_login"),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tool configuration table
export const toolConfigs = pgTable("tool_configs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  enabled: boolean("enabled").default(true),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Request logs table
export const requestLogs = pgTable("request_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  requestData: jsonb("request_data").notNull(),
  responseData: jsonb("response_data"),
  statusCode: integer("status_code"),
  executionTimeMs: integer("execution_time_ms"),
  toolType: text("tool_type").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type ToolConfig = typeof toolConfigs.$inferSelect;
export type InsertToolConfig = typeof toolConfigs.$inferInsert;

export type RequestLog = typeof requestLogs.$inferSelect;
export type InsertRequestLog = typeof requestLogs.$inferInsert;

export type ToolStatus = {
  name: string;
  available: boolean;
  latency: number;
  lastUsed?: string;
};

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true });
  
export const insertToolConfigSchema = createInsertSchema(toolConfigs)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertRequestLogSchema = createInsertSchema(requestLogs)
  .omit({ id: true, timestamp: true });

// MCP Tool Schemas
export interface MCPRequest {
  id: string;
  name: string;
  parameters: any;
}

export interface MCPResponse {
  id: string;
  results?: any;
  error?: {
    message: string;
    code: string;
  };
}

export interface WebSearchParams {
  query: string;
  resultCount?: number;
  provider: 'openai' | 'tavily' | 'perplexity';
  safeSearch?: boolean;
  openaiOptions?: {
    model?: string;
    temperature?: number;
  };
  tavilyOptions?: {
    searchDepth?: string;
    includeRawContent?: boolean;
    includeImages?: boolean;
    topic?: string;
  };
  perplexityOptions?: {
    model?: string;
    searchContextSize?: string;
    searchDomainFilter?: string[];
  };
}

export interface FormAutomationParams {
  url: string;
  actions: Array<{
    selector: string;
    action: 'click' | 'input' | 'select';
    value?: string;
  }>;
  waitForNavigation?: boolean;
}

export interface VectorStorageParams {
  operation: 'search' | 'retrieve' | 'store' | 'delete';
  collection: string;
  provider: 'pinecone' | 'weaviate';
  query?: string;
  embedding?: number[];
  ids?: string[];
  data?: Record<string, any>;
  filters?: Record<string, any>;
  limit?: number;
  weaviateOptions?: {
    className?: string;
  };
}

export interface DataScraperParams {
  url: string;
  selectors: Record<string, string>;
  paginate?: {
    selector: string;
    maxPages?: number;
  };
}

export interface StatusParams {
  toolName?: string;
}

export const MCPToolSchemas = {
  web_search: z.object({
    query: z.string(),
    numResults: z.number().optional(),
    safeSearch: z.boolean().optional()
  }),
  form_automation: z.object({
    url: z.string().url(),
    actions: z.array(z.object({
      selector: z.string(),
      action: z.enum(['click', 'input', 'select']),
      value: z.string().optional()
    })),
    waitForNavigation: z.boolean().optional()
  }),
  vector_storage: z.object({
    operation: z.enum(['query', 'insert', 'update', 'delete']),
    collection: z.string(),
    data: z.array(z.object({
      id: z.string().optional(),
      vector: z.array(z.number()).optional(),
      metadata: z.record(z.any()).optional(),
      text: z.string().optional()
    })).optional(),
    filter: z.record(z.any()).optional(),
    topK: z.number().optional()
  }),
  data_scraper: z.object({
    url: z.string().url(),
    selectors: z.record(z.string()),
    paginate: z.object({
      selector: z.string(),
      maxPages: z.number().optional()
    }).optional()
  }),
  status: z.object({
    toolName: z.string().optional()
  }),
  sandbox: z.object({
    operation: z.enum(['execute', 'validate']),
    code: z.string(),
    language: z.enum(['javascript', 'python', 'typescript']),
    timeout: z.number().optional()
  })
};

// Sandbox schema
export const sandboxSchema = z.object({
  operation: z.enum(['execute', 'validate']),
  code: z.string(),
  language: z.enum(['javascript', 'python', 'typescript']),
  timeout: z.number().optional()
});

export type SystemStatus = {
  version: string;
  uptime: number;
  transport: string;
  lastRequest?: string;
  activeTools: ToolStatus[];
  wsEnabled: boolean;
  environment: string;
  features: Record<string, boolean>;
};