/**
 * MCP Integration Platform - Database Metadata Processor
 * 
 * This script processes the database metadata from db-metadata.json
 * and provides insights about the database structure.
 * 
 * Usage: node scripts/db-metadata-processor.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory name using ES modules syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Paths to metadata file
const DB_METADATA_PATH = path.resolve(__dirname, '../attached_assets/db-metadata.json');
const SCHEMA_PATH = path.resolve(__dirname, '../shared/schema.ts');

/**
 * Load database metadata from file
 */
function loadMetadata() {
  try {
    if (!fs.existsSync(DB_METADATA_PATH)) {
      console.error(`${colors.red}Error: Metadata file not found at ${DB_METADATA_PATH}${colors.reset}`);
      return null;
    }
    
    const metadataContent = fs.readFileSync(DB_METADATA_PATH, 'utf-8');
    return JSON.parse(metadataContent);
  } catch (error) {
    console.error(`${colors.red}Error loading metadata:${colors.reset}`, error.message);
    return null;
  }
}

/**
 * Get database schemas from metadata
 */
function getSchemas(metadata) {
  const schemasResult = metadata.find(result => result.id === 'schemas');
  return schemasResult ? schemasResult.rows : [];
}

/**
 * Get database entities (tables/views) from metadata
 */
function getEntities(metadata) {
  const entitiesResult = metadata.find(result => result.id === 'entities');
  return entitiesResult ? entitiesResult.rows : [];
}

/**
 * Get tables from metadata
 */
function getTables(metadata) {
  const entities = getEntities(metadata);
  return entities.filter(entity => entity.type === 'table');
}

/**
 * Get enums from metadata
 */
function getEnums(metadata) {
  const enumsResult = metadata.find(result => result.id === 'enums');
  return enumsResult ? enumsResult.rows : [];
}

/**
 * Get constraints from metadata
 */
function getConstraints(metadata) {
  const constraintsResult = metadata.find(result => result.id === 'constraints');
  return constraintsResult ? constraintsResult.rows : [];
}

/**
 * Get columns from metadata
 */
function getColumns(metadata) {
  const columnsResult = metadata.find(result => result.id === 'columns');
  return columnsResult ? columnsResult.rows : [];
}

/**
 * Get columns for a specific table
 */
function getTableColumns(metadata, tableName) {
  const columns = getColumns(metadata);
  return columns.filter(column => column.table_name === tableName);
}

/**
 * Get constraints for a specific table
 */
function getTableConstraints(metadata, tableName) {
  const constraints = getConstraints(metadata);
  return constraints.filter(constraint => constraint.table_name === tableName);
}

/**
 * Check if table is defined in schema.ts
 */
function isTableInSchema(tableName) {
  if (!fs.existsSync(SCHEMA_PATH)) {
    return false;
  }
  
  const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  const tableDefinition = new RegExp(`export const ${tableName}\\s*=\\s*pgTable`, 'gm');
  
  return tableDefinition.test(schemaContent);
}

/**
 * Print database structure overview
 */
function printDatabaseOverview(metadata) {
  const schemas = getSchemas(metadata);
  const tables = getTables(metadata);
  const enums = getEnums(metadata);
  const constraints = getConstraints(metadata);
  
  console.log(`${colors.bright}${colors.blue}====== MCP DATABASE STRUCTURE ======${colors.reset}\n`);
  
  // Print schemas
  console.log(`${colors.cyan}Schemas (${schemas.length}):${colors.reset}`);
  schemas.forEach(schema => {
    console.log(`  ${colors.green}\u2022${colors.reset} ${schema.name}`);
  });
  console.log();
  
  // Print tables
  console.log(`${colors.cyan}Tables (${tables.length}):${colors.reset}`);
  tables.forEach(table => {
    const tableColumns = getTableColumns(metadata, table.name);
    const tableConstraints = getTableConstraints(metadata, table.name);
    const isInSchema = isTableInSchema(table.name);
    
    console.log(
      `  ${colors.green}\u2022${colors.reset} ${table.name} ` + 
      `${colors.dim}(${tableColumns.length} columns, ${tableConstraints.length} constraints)${colors.reset} ` +
      `${isInSchema ? colors.green + '[In Schema.ts]' + colors.reset : colors.yellow + '[Not in Schema.ts]' + colors.reset}`
    );
  });
  console.log();
  
  // Print enums
  if (enums.length > 0) {
    console.log(`${colors.cyan}Enums:${colors.reset}`);
    
    // Group enum values by enum name
    const enumsByName = {};
    enums.forEach(enumItem => {
      if (!enumsByName[enumItem.name]) {
        enumsByName[enumItem.name] = [];
      }
      enumsByName[enumItem.name].push(enumItem.value);
    });
    
    // Print each enum with its values
    Object.entries(enumsByName).forEach(([enumName, values]) => {
      console.log(`  ${colors.green}\u2022${colors.reset} ${enumName}: ${values.join(', ')}`);
    });
    console.log();
  }
  
  // Print schema insights
  console.log(`${colors.bright}${colors.blue}====== SCHEMA ANALYSIS ======${colors.reset}\n`);
  
  // Check for tables not in schema.ts
  const tablesNotInSchema = tables.filter(table => !isTableInSchema(table.name));
  
  if (tablesNotInSchema.length > 0) {
    console.log(`${colors.yellow}Tables missing from schema.ts (${tablesNotInSchema.length}):${colors.reset}`);
    tablesNotInSchema.forEach(table => {
      console.log(`  ${colors.yellow}\u2022${colors.reset} ${table.name}`);
      
      // Show columns for this table
      const tableColumns = getTableColumns(metadata, table.name);
      tableColumns.forEach(column => {
        const isPrimaryKey = constraints.some(c => 
          c.table_name === table.name && 
          c.column_name === column.column_name && 
          c.constraint_type === 'p'
        );
        
        console.log(
          `    ${colors.dim}\u2022${colors.reset} ${column.column_name} ` +
          `${colors.dim}(${column.data_type})${colors.reset}` +
          `${isPrimaryKey ? ' ' + colors.magenta + '[PK]' + colors.reset : ''}` +
          `${column.is_nullable === 'NO' ? ' ' + colors.red + '[NOT NULL]' + colors.reset : ''}`
        );
      });
    });
    console.log();
  } else {
    console.log(`${colors.green}All tables are defined in schema.ts${colors.reset}\n`);
  }
  
  // Print recommendations
  console.log(`${colors.bright}${colors.blue}====== RECOMMENDATIONS ======${colors.reset}\n`);
  
  if (tablesNotInSchema.length > 0) {
    console.log(`${colors.green}\u2022${colors.reset} Add the following tables to schema.ts:`);
    tablesNotInSchema.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    console.log();
  }
  
  // Recommend integrating with Drizzle if not already
  console.log(`${colors.green}\u2022${colors.reset} Use Drizzle ORM to define and manage database schema`);
  console.log(`${colors.green}\u2022${colors.reset} Run database migrations with 'npm run db:push' to apply schema changes`);  
  console.log(`${colors.green}\u2022${colors.reset} Update local-storage.json to reflect current database state`);  
  console.log();
}

// Main execution
const metadata = loadMetadata();

if (metadata) {
  printDatabaseOverview(metadata);
} else {
  process.exit(1);
}
