// Override database configuration for Codex environment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Try to load dotenv if available
try {
  const dotenv = await import('dotenv');
  dotenv.config();
  console.log('Environment variables loaded from .env file');
} catch (err) {
  console.log('Dotenv not available, continuing without it');
}

// Check for drizzle config file
const drizzleConfigPath = path.join(process.cwd(), 'drizzle.config.ts');
if (fs.existsSync(drizzleConfigPath)) {
  let content = fs.readFileSync(drizzleConfigPath, 'utf8');
  
  console.log('Original database configuration:');
  const connectionMatches = content.match(/['"]postgres(?:ql)?:\/\/[^'"]+['"]/g);
  if (connectionMatches) {
    connectionMatches.forEach(match => console.log(match));
    
    // Replace connection string with local database
    content = content.replace(
      /['"]postgres(?:ql)?:\/\/[^'"]+['"]/g,
      "'******localhost:5432/app_db'"
    );
    
    fs.writeFileSync(drizzleConfigPath, content);
    console.log('Successfully patched drizzle.config.ts to use local database');
  } else {
    console.log('No direct connection string found in drizzle.config.ts');
    
    // Look for environment variable usage
    if (content.includes('process.env.DATABASE_URL')) {
      console.log('Found environment variable usage for database connection');
      console.log('Ensuring .env file contains correct DATABASE_URL');
    }
  }
} else {
  console.log('drizzle.config.ts not found, looking for other database config files');
  
  // Look for other potential database configuration files
  ['server/db/index.ts', 'server/database.ts', 'server/config.ts'].forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log();
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(content.slice(0, 500) + '...');
    }
  });
}

console.log('Database configuration override completed');