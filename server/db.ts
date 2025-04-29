import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon serverless connection
neonConfig.webSocketConstructor = ws;

// Validate environment variables
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with optimized settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection to become available
  maxUses: 7500, // Close a connection after it has been used this many times
});

// Register event handlers for connection lifecycle
pool.on('connect', (client) => {
  console.log('Database connection established');
});

pool.on('error', (err, client) => {
  console.error('Unexpected database error on client:', err);
});

pool.on('remove', () => {
  console.log('Database connection removed from pool');
});

// Create drizzle ORM instance with the pool
export const db = drizzle({ client: pool, schema });

// Graceful shutdown function to close all connections
export const closeDatabase = async () => {
  console.log('Closing database pool...');
  await pool.end();
  console.log('All database connections closed');
};

// Register process events for graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT signal, shutting down database connections...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal, shutting down database connections...');
  await closeDatabase();
  process.exit(0);
});

