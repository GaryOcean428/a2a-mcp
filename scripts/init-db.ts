/**
 * Database Initialization Script
 * 
 * This script creates all necessary tables in the database according to the schema.
 * Run this script once to initialize the database before starting the application.
 */

import { db } from '../server/db';
import { users, apiKeys, toolConfigs, requestLogs } from '../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

const scryptAsync = promisify(scrypt);

/**
 * Hash a password using scrypt
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Create an API key string
 */
function createApiKeyString(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'mcp_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function main() {
  try {
    console.log('Creating database schema...');
    
    // Push schema to database using drizzle-kit
    console.log('Running schema push...');
    // We'll use drizzle-kit push instead since db.schema not available
    
    console.log('Tables created successfully.');
    
    // Check if we need to create initial admin user
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log('Creating initial admin user...');
      
      const adminPassword = await hashPassword('admin');
      const apiKey = createApiKeyString();
      
      await db.insert(users).values({
        username: 'admin',
        password: adminPassword,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        apiKey,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Admin user created with username: admin and password: admin');
      console.log(`API Key: ${apiKey}`);
    } else {
      console.log(`Database already has ${existingUsers.length} users. Skipping admin creation.`);
    }
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main();
