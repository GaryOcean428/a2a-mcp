/**
 * MCP Integration Platform - Replit Auth Migration Script
 *
 * This script migrates the database schema to support Replit Auth integration.
 * It changes user ID columns from serial to varchar in the relevant tables.
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Starting Replit Auth migration script...');
  
  // Create a connection pool
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable not set');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    console.log('Checking for existing sessions table...');
    
    // Check if sessions table exists
    const sessionsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions'
      );
    `);
    
    if (!sessionsTableCheck.rows[0].exists) {
      console.log('Creating sessions table...');
      
      // Create sessions table for Replit Auth
      await client.query(`
        CREATE TABLE sessions (
          sid VARCHAR(255) PRIMARY KEY NOT NULL,
          sess JSON NOT NULL,
          expire TIMESTAMP NOT NULL
        );
      `);
      
      // Check if index exists before creating it
      const indexExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_indexes
          WHERE indexname = 'IDX_session_expire'
        );
      `);
      
      if (!indexExists.rows[0].exists) {
        await client.query(`
          CREATE INDEX "IDX_session_expire" ON sessions (expire);
        `);
      } else {
        console.log('Index IDX_session_expire already exists');
      }
      
      console.log('Sessions table created successfully');
    } else {
      console.log('Sessions table already exists');
    }
    
    // Now let's update the users table
    console.log('Checking users table structure...');
    
    const userIdTypeCheck = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'id';
    `);
    
    // If users table ID is already varchar, we don't need to migrate
    if (userIdTypeCheck.rows.length > 0 && userIdTypeCheck.rows[0].data_type === 'character varying') {
      console.log('Users table already has varchar ID - no migration needed');
    } else {
      console.log('Backing up users table...');
      
      // Backup the users table
      await client.query(`
        CREATE TABLE users_backup AS 
        SELECT * FROM users;
      `);
      
      // Create the new users table with the Replit Auth schema
      console.log('Creating new users table with Replit Auth schema...');
      
      // Drop the old users table
      await client.query('DROP TABLE users CASCADE;');
      
      // Create new users table with varchar ID
      await client.query(`
        CREATE TABLE users (
          id VARCHAR(255) PRIMARY KEY NOT NULL,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          bio TEXT,
          profile_image_url VARCHAR(255),
          role TEXT DEFAULT 'user',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('Users table recreated with Replit Auth schema');
    }
    
    // Update related tables if they exist
    console.log('Checking for related tables...');
    
    // Check if toolConfigs table exists
    const toolConfigsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tool_configs'
      );
    `);
    
    if (toolConfigsExists.rows[0].exists) {
      console.log('Recreating tool_configs table to avoid foreign key issues...');
      
      // Backup the table
      await client.query('CREATE TABLE tool_configs_backup AS SELECT * FROM tool_configs;');
      
      // Drop the table with cascading to remove constraints
      await client.query('DROP TABLE tool_configs CASCADE;');
      
      // Create new table with varchar user_id
      await client.query(`
        CREATE TABLE tool_configs (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          tool_type TEXT NOT NULL,
          config JSONB NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('tool_configs table recreated successfully');
    }
    
    // Check if requestLogs table exists
    const requestLogsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'request_logs'
      );
    `);
    
    if (requestLogsExists.rows[0].exists) {
      console.log('Recreating request_logs table to avoid foreign key issues...');
      
      // Backup the table
      await client.query('CREATE TABLE request_logs_backup AS SELECT * FROM request_logs;');
      
      // Drop the table with cascading to remove constraints
      await client.query('DROP TABLE request_logs CASCADE;');
      
      // Create new table with varchar user_id
      await client.query(`
        CREATE TABLE request_logs (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          tool_type TEXT NOT NULL,
          request_data JSONB NOT NULL,
          response_data JSONB,
          status_code INTEGER,
          execution_time_ms INTEGER,
          timestamp TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('request_logs table recreated successfully');
    }
    
    // Check if apiKeys table exists and drop it (no longer needed with Replit Auth)
    const apiKeysExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'api_keys'
      );
    `);
    
    if (apiKeysExists.rows[0].exists) {
      console.log('Creating backup of api_keys table before dropping...');
      
      // Backup the table
      await client.query('CREATE TABLE api_keys_backup AS SELECT * FROM api_keys;');
      
      // Drop the table
      await client.query('DROP TABLE api_keys;');
      
      console.log('api_keys table dropped (not needed with Replit Auth)');
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
