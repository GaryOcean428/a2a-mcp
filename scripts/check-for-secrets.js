/**
 * MCP Integration Platform - Secret Detection Script
 * 
 * This script scans the codebase for potential hardcoded secrets or API keys.
 * Run this before committing code to ensure no sensitive information is exposed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the project root
const projectRoot = path.join(__dirname, '..');

// Directories to exclude from scanning
const excludedDirs = ['node_modules', 'dist', '.git'];

// Patterns that might indicate secrets or API keys
const sensitivePatterns = [
  // API key patterns
  /['"](sk|pk)_(live|test)_[0-9a-zA-Z]{24}['"]/, // Generic API key pattern
  /['"](a|sk|pk)-[0-9a-zA-Z]{32,}['"]/, // Common API key formats
  /['"]xox[pbaors]-[0-9a-zA-Z]{10,48}['"]/, // Slack tokens
  /['"]gh[pousat]_[0-9a-zA-Z]{36}['"]/, // GitHub tokens
  /['"]AIza[0-9A-Za-z-_]{35}['"]/, // Google API Key
  /['"]AKIA[0-9A-Z]{16}['"]/, // AWS Access Key
  /['"]OPENAI_API_KEY['"]\s*[=:]\s*['"][^'"]*['"]/, // OpenAI API Key
  /['"]PINECONE_API_KEY['"]\s*[=:]\s*['"][^'"]*['"]/, // Pinecone API Key
  /['"]E2B_API_KEY['"]\s*[=:]\s*['"][^'"]*['"]/, // E2B API Key
  /['"]DATABASE_URL['"]\s*[=:]\s*['"][^'"]*['"]/, // Database URLs containing credentials
  
  // Password patterns
  /password['"]\s*[=:]\s*['"][^'"]{4,}['"]/, // Generic password assignment
  
  // AWS secret access key patterns
  /['"][0-9a-zA-Z/+]{40}['"]/ // AWS Secret Access Key
];

// Files to include in scanning (by extension)
const includedExtensions = [
  '.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.yml', '.yaml'
];

// Exceptions - patterns that are okay to have in the codebase
const exceptions = [
  /['"](OPENAI_API_KEY|PINECONE_API_KEY|E2B_API_KEY|DATABASE_URL)['"]/, // Environment variable names (without values)
  /example|placeholder|template|sample/, // Example/placeholder strings
  /YOUR_[A-Z_]+_HERE/, // Placeholder template strings
  /\$\{[^}]*\}/, // Template literal placeholders
  /process\.env\.[A-Z_]+/ // Environment variable references
];

/**
 * Check if a path should be excluded from scanning
 */
function shouldExcludePath(checkPath) {
  const relativePath = path.relative(projectRoot, checkPath);
  
  // Skip excluded directories
  if (excludedDirs.some(dir => relativePath.startsWith(dir))) {
    return true;
  }
  
  // Skip environment example file
  if (relativePath === '.env.example') {
    return true;
  }
  
  // Check if it's an included file type
  const ext = path.extname(checkPath).toLowerCase();
  if (!includedExtensions.includes(ext)) {
    return true;
  }
  
  return false;
}

/**
 * Check if a line contains what looks like a hardcoded secret
 */
function containsSensitiveData(line) {
  // Skip empty lines or comment lines
  if (!line.trim() || line.trim().startsWith('//') || line.trim().startsWith('*')) {
    return false;
  }
  
  // Check if any sensitive pattern matches
  for (const pattern of sensitivePatterns) {
    if (pattern.test(line)) {
      // Check if it's a known exception
      for (const exception of exceptions) {
        if (exception.test(line)) {
          return false;
        }
      }
      return true;
    }
  }
  
  return false;
}

/**
 * Recursively scan a directory for sensitive information
 */
async function scanDirectory(scanPath) {
  const issues = [];
  
  // Get all files and directories
  const entries = await fs.promises.readdir(scanPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(scanPath, entry.name);
    
    if (shouldExcludePath(fullPath)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const subIssues = await scanDirectory(fullPath);
      issues.push(...subIssues);
    } else {
      // Scan individual file
      const fileIssues = await scanFile(fullPath);
      issues.push(...fileIssues);
    }
  }
  
  return issues;
}

/**
 * Scan a single file for sensitive information
 */
async function scanFile(filePath) {
  const issues = [];
  
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (containsSensitiveData(line)) {
        issues.push({
          file: path.relative(projectRoot, filePath),
          line: index + 1,
          content: line.trim()
        });
      }
    });
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
  
  return issues;
}

/**
 * Main function to run the secret scanning tool
 */
async function main() {
  console.log('Scanning for potentially hardcoded secrets...');
  
  try {
    const issues = await scanDirectory(projectRoot);
    
    if (issues.length === 0) {
      console.log('✅ No potential secrets found in the codebase!');
      process.exit(0);
    } else {
      console.log(`⚠️ Found ${issues.length} potential secrets in the codebase:`);
      
      // Group issues by file for better readability
      const issuesByFile = {};
      issues.forEach(issue => {
        if (!issuesByFile[issue.file]) {
          issuesByFile[issue.file] = [];
        }
        issuesByFile[issue.file].push(issue);
      });
      
      // Print issues grouped by file
      Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
        console.log(`\n\u001b[1;31mFile: ${file}\u001b[0m`);
        fileIssues.forEach(issue => {
          console.log(`  Line ${issue.line}: ${issue.content}`);
        });
      });
      
      console.log('\nPlease review these potential secrets and make sure they are not actual secrets.');
      console.log('If they are legitimate hardcoded values (like constants or test placeholders), consider adding them to the exceptions list.');
      
      process.exit(1); // Exit with error code to fail CI/CD pipelines
    }
  } catch (error) {
    console.error('Error during scanning:', error);
    process.exit(1);
  }
}

// Run the scanner
main();
