/**
 * MCP Integration Platform - Database Metadata Types
 * 
 * This file defines TypeScript interfaces for the database metadata structure
 * imported from db-metadata.json. These types help ensure type safety when
 * working with database schemas, tables, columns, and constraints.
 */

/**
 * Database Schema Information
 */
export interface DbSchemaInfo {
  name: string;
}

/**
 * Database Entity (Table/View) Information
 */
export interface DbEntityInfo {
  schema: string;
  name: string;
  type: 'table' | 'view' | 'mat_view' | null;
  definition: string | null;
}

/**
 * Database Enum Information
 */
export interface DbEnumInfo {
  schema_name: string;
  name: string;
  value: string;
}

/**
 * Database Constraint Information
 */
export interface DbConstraintInfo {
  constraint_type: string;
  constraint_schema: string;
  constraint_name: string;
  table_name: string;
  column_name: string;
  expression: string;
  foreign_table_schema: string | null;
  foreign_table_name: string | null;
  foreign_column_name: string | null;
  update_rule: string | null;
  delete_rule: string | null;
}

/**
 * Database Column Information
 */
export interface DbColumnInfo {
  table_schema: string;
  table_name: string;
  column_name: string;
  column_default: string | null;
  is_nullable: 'YES' | 'NO';
  data_type: string;
  additional_dt: string;
  type_schema: string;
  type_name: string;
  array_dimensions: number;
  attnum: number;
  identity_type: string;
  generated_type: string;
  identity_name: string | null;
  identity_increment: string | null;
  identity_max: string | null;
  identity_min: string | null;
  identity_start: string | null;
  identity_cache: string | null;
  identity_cycle: boolean | null;
}

/**
 * Database Metadata Query Result
 */
export interface DbMetadataQueryResult {
  id: string;
  sql: string;
  rows: DbSchemaInfo[] | DbEntityInfo[] | DbEnumInfo[] | DbConstraintInfo[] | DbColumnInfo[];
}

/**
 * Complete Database Metadata
 */
export type DbMetadata = Array<DbMetadataQueryResult>;

/**
 * Helper function to get schemas from metadata
 */
export function getSchemas(metadata: DbMetadata): DbSchemaInfo[] {
  const schemasResult = metadata.find(result => result.id === 'schemas');
  return schemasResult ? schemasResult.rows as DbSchemaInfo[] : [];
}

/**
 * Helper function to get entities (tables/views) from metadata
 */
export function getEntities(metadata: DbMetadata): DbEntityInfo[] {
  const entitiesResult = metadata.find(result => result.id === 'entities');
  return entitiesResult ? entitiesResult.rows as DbEntityInfo[] : [];
}

/**
 * Helper function to get tables from metadata
 */
export function getTables(metadata: DbMetadata): DbEntityInfo[] {
  const entities = getEntities(metadata);
  return entities.filter(entity => entity.type === 'table');
}

/**
 * Helper function to get enums from metadata
 */
export function getEnums(metadata: DbMetadata): DbEnumInfo[] {
  const enumsResult = metadata.find(result => result.id === 'enums');
  return enumsResult ? enumsResult.rows as DbEnumInfo[] : [];
}

/**
 * Helper function to get constraints from metadata
 */
export function getConstraints(metadata: DbMetadata): DbConstraintInfo[] {
  const constraintsResult = metadata.find(result => result.id === 'constraints');
  return constraintsResult ? constraintsResult.rows as DbConstraintInfo[] : [];
}

/**
 * Helper function to get columns from metadata
 */
export function getColumns(metadata: DbMetadata): DbColumnInfo[] {
  const columnsResult = metadata.find(result => result.id === 'columns');
  return columnsResult ? columnsResult.rows as DbColumnInfo[] : [];
}

/**
 * Helper function to get columns for a specific table
 */
export function getTableColumns(metadata: DbMetadata, tableName: string): DbColumnInfo[] {
  const columns = getColumns(metadata);
  return columns.filter(column => column.table_name === tableName);
}

/**
 * Helper function to get constraints for a specific table
 */
export function getTableConstraints(metadata: DbMetadata, tableName: string): DbConstraintInfo[] {
  const constraints = getConstraints(metadata);
  return constraints.filter(constraint => constraint.table_name === tableName);
}

/**
 * Helper function to check if a table exists in the metadata
 */
export function tableExists(metadata: DbMetadata, tableName: string): boolean {
  const tables = getTables(metadata);
  return tables.some(table => table.name === tableName);
}
