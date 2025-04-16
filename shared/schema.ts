import { pgTable, text, serial, integer, boolean, json, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  apiKey: text("api_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Available MCP tool types
export const toolTypeEnum = pgEnum("tool_type", [
  "web_search",
  "form_automation",
  "vector_storage",
  "data_scraper",
  "status"
]);

// Provider types for web search
export const providerTypeEnum = pgEnum("provider_type", [
  "openai",
  "tavily",
  "perplexity",
]);

// Configurations for tools
export const toolConfigs = pgTable("tool_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolType: toolTypeEnum("tool_type").notNull(),
  active: boolean("active").default(true).notNull(),
  config: json("config").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertToolConfigSchema = createInsertSchema(toolConfigs).pick({
  userId: true,
  toolType: true,
  active: true,
  config: true,
});

// Log entries for all MCP requests
export const requestLogs = pgTable("request_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolType: toolTypeEnum("tool_type").notNull(),
  requestData: json("request_data").notNull(),
  responseData: json("response_data"),
  statusCode: integer("status_code"),
  executionTimeMs: integer("execution_time_ms"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertRequestLogSchema = createInsertSchema(requestLogs).pick({
  userId: true,
  toolType: true,
  requestData: true,
  responseData: true,
  statusCode: true,
  executionTimeMs: true,
});

// Tool schemas for MCP
export const webSearchSchema = z.object({
  query: z.string().min(1).describe("The search query to execute"),
  provider: z.enum(["openai", "tavily", "perplexity"]).default("openai").describe("Search provider to use"),
  resultCount: z.number().int().min(1).max(50).default(5).describe("Number of results to return"),
  openaiOptions: z.object({
    searchContextSize: z.enum(["low", "medium", "high"]).default("medium").describe("Amount of search context to retrieve"),
  }).optional(),
  tavilyOptions: z.object({
    searchDepth: z.enum(["basic", "advanced"]).default("basic").describe("Depth of search to perform"),
    topic: z.enum(["general", "news"]).default("general"),
    includeRawContent: z.boolean().default(false),
    includeImages: z.boolean().default(false),
  }).optional(),
  perplexityOptions: z.object({
    model: z.enum(["sonar", "sonar-pro"]).default("sonar").describe("Perplexity model to use"),
    searchContextSize: z.enum(["low", "medium", "high"]).default("medium"),
    searchDomainFilter: z.array(z.string()).optional().describe("List of domains to filter by (prefix with - to exclude)"),
  }).optional(),
});

export const formAutomationSchema = z.object({
  url: z.string().url().describe("URL of the form to automate"),
  formData: z.record(z.any()).describe("Key-value pairs of form fields and values"),
  submitForm: z.boolean().default(true).describe("Whether to submit the form after filling"),
  waitForNavigation: z.boolean().default(true).describe("Whether to wait for page navigation after submission"),
  timeout: z.number().int().min(1000).max(30000).default(5000).describe("Maximum time to wait for operation completion (ms)"),
});

export const vectorStorageSchema = z.object({
  operation: z.enum(["search", "retrieve", "store", "delete"]).describe("Operation to perform"),
  collection: z.string().describe("Vector collection to operate on"),
  query: z.string().optional().describe("Query text for semantic search"),
  embedding: z.array(z.number()).optional().describe("Pre-computed embedding vector (optional)"),
  filters: z.record(z.any()).optional().describe("Metadata filters for search"),
  limit: z.number().int().min(1).max(100).default(10).describe("Maximum number of results"),
  data: z.record(z.any()).optional().describe("Data to store (for store operations)"),
  ids: z.array(z.string()).optional().describe("Document IDs (for retrieve/delete operations)"),
});

export const dataScraperSchema = z.object({
  url: z.string().url().describe("URL to scrape"),
  selectors: z.record(z.string()).optional().describe("Named CSS selectors to extract data"),
  format: z.enum(["json", "csv", "text"]).default("json").describe("Output format"),
  pagination: z.object({
    enabled: z.boolean().default(false),
    nextSelector: z.string().optional(),
    maxPages: z.number().int().default(1),
  }).optional().describe("Pagination configuration"),
  javascript: z.boolean().default(true).describe("Whether to execute JavaScript on the page"),
  timeout: z.number().int().min(1000).max(60000).default(10000).describe("Maximum time to wait for scraping completion (ms)"),
});

export const statusSchema = z.object({
  toolName: z.string().optional().describe("Name of the tool to check status for (optional, if not provided, returns all tool statuses)"),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ToolConfig = typeof toolConfigs.$inferSelect;
export type InsertToolConfig = z.infer<typeof insertToolConfigSchema>;

export type RequestLog = typeof requestLogs.$inferSelect;
export type InsertRequestLog = z.infer<typeof insertRequestLogSchema>;

export type WebSearchParams = z.infer<typeof webSearchSchema>;
export type FormAutomationParams = z.infer<typeof formAutomationSchema>;
export type VectorStorageParams = z.infer<typeof vectorStorageSchema>;
export type DataScraperParams = z.infer<typeof dataScraperSchema>;
export type StatusParams = z.infer<typeof statusSchema>;

// Tool schemas with MCP annotations
export const MCPToolSchemas = {
  web_search: {
    name: "web_search",
    description: "Search the web for information with multiple provider options",
    inputSchema: webSearchSchema,
    annotations: {
      title: "Web Search",
      readOnlyHint: true,
      openWorldHint: true
    }
  },
  form_automation: {
    name: "form_automation",
    description: "Fill and submit web forms with validation",
    inputSchema: formAutomationSchema,
    annotations: {
      title: "Form Automation",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true
    }
  },
  vector_storage: {
    name: "vector_storage",
    description: "Connect to vector databases for semantic search and retrieval",
    inputSchema: vectorStorageSchema,
    annotations: {
      title: "Vector Storage",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false
    }
  },
  data_scraper: {
    name: "data_scraper",
    description: "Extract structured data from websites with configurable policies",
    inputSchema: dataScraperSchema,
    annotations: {
      title: "Data Scraper",
      readOnlyHint: true,
      openWorldHint: true
    }
  },
  status: {
    name: "status",
    description: "Check the status of MCP tools and platform health",
    inputSchema: statusSchema,
    annotations: {
      title: "Status",
      readOnlyHint: true,
      openWorldHint: false
    }
  }
};

export type MCPRequest = {
  id: string;
  name: string;
  parameters: any;
};

export type MCPResponse = {
  id: string;
  results?: any;
  error?: {
    message: string;
    code?: string;
  };
};

export type ToolStatus = {
  name: string;
  available: boolean;
  latency?: number;
  error?: string;
  lastUsed?: string;
};

export type SystemStatus = {
  version: string;
  uptime: number;
  transport: 'STDIO' | 'SSE';
  activeTools: ToolStatus[];
  lastRequest?: string;
};
