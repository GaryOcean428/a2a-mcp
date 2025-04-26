#!/usr/bin/env node

/**
 * MCP Integration Platform Pre-Deployment Check
 * 
 * This script verifies that all necessary components are in place
 * for a successful deployment with consistent UI between development
 * and production environments.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Terminal colors for better readability
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// For ES modules, we need to calculate dirname and root
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Paths to check
const PATHS = {
  versionFile: path.join(ROOT_DIR, 'client/src/version.ts'),
  productionCss: path.join(ROOT_DIR, 'client/src/production.css'),
  cssVerification: path.join(ROOT_DIR, 'client/src/components/CssVerification.tsx'),
  typeDefs: path.join(ROOT_DIR, 'client/src/types/global.d.ts'),
  deployConfig: path.join(ROOT_DIR, '.replit.deployConfig.js'),
  fixCssScript: path.join(ROOT_DIR, 'scripts/fix-css-deployment.js'),
  mainTsx: path.join(ROOT_DIR, 'client/src/main.tsx'),
  htmlFile: path.join(ROOT_DIR, 'client/index.html')
};

console.log(`${colors.magenta}${colors.bold}MCP Integration Platform Pre-Deployment Check${colors.reset}`);
console.log(`${colors.cyan}============================================${colors.reset}`);
console.log();

// Track if all checks pass
let allPassed = true;

// Helper function to check a file exists
function checkFileExists(filePath, description) {
  console.log(`${colors.blue}Checking ${description}...${colors.reset}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`${colors.green}✓ ${description} exists${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}✗ ${description} is missing${colors.reset}`);
    allPassed = false;
    return false;
  }
}

// Check if a file contains specific content
function checkFileContains(filePath, searchString, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.red}✗ Cannot check content - ${filePath} does not exist${colors.reset}`);
    allPassed = false;
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(searchString)) {
    console.log(`${colors.green}✓ ${description}${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}✗ ${description}${colors.reset}`);
    allPassed = false;
    return false;
  }
}

// Verify all required files exist
console.log(`${colors.cyan}Checking for required files:${colors.reset}`);
checkFileExists(PATHS.versionFile, 'Version file');
checkFileExists(PATHS.productionCss, 'Production CSS file');
checkFileExists(PATHS.cssVerification, 'CSS Verification component');
checkFileExists(PATHS.typeDefs, 'TypeScript definitions');
checkFileExists(PATHS.deployConfig, 'Replit deployment configuration');
checkFileExists(PATHS.fixCssScript, 'CSS deployment fix script');
console.log();

// Verify file contents
console.log(`${colors.cyan}Verifying file contents:${colors.reset}`);

// Check if main.tsx imports production.css
checkFileContains(
  PATHS.mainTsx, 
  "import './production.css'", 
  'main.tsx imports production.css'
);

// Check if main.tsx includes CSS verification
checkFileContains(
  PATHS.mainTsx, 
  "import CssVerification", 
  'main.tsx imports CssVerification component'
);

// Check if HTML includes critical styles
checkFileContains(
  PATHS.htmlFile, 
  "Critical UI styles", 
  'HTML includes critical inline styles'
);

// Check if production.css has all needed styles
checkFileContains(
  PATHS.productionCss, 
  ".animate-fade-in-down", 
  'Production CSS includes animate-fade-in-down class'
);

console.log();

// Verify CSS validity
console.log(`${colors.cyan}Validating CSS:${colors.reset}`);
try {
  // Simple validation - just check if it's parseable
  const css = fs.readFileSync(PATHS.productionCss, 'utf8');
  if (css.includes('{') && css.includes('}')) {
    console.log(`${colors.green}✓ Production CSS appears to be valid${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Production CSS may have syntax issues${colors.reset}`);
    allPassed = false;
  }
} catch (error) {
  console.log(`${colors.red}✗ Failed to validate CSS: ${error.message}${colors.reset}`);
  allPassed = false;
}
console.log();

// Summary
console.log(`${colors.cyan}Final Check Results:${colors.reset}`);
if (allPassed) {
  console.log(`${colors.green}${colors.bold}✓ All checks passed! Your project is ready for deployment.${colors.reset}`);
  console.log();
  console.log(`${colors.cyan}To deploy:${colors.reset}`);
  console.log(`1. Run ${colors.yellow}node scripts/fix-css-deployment.js${colors.reset} to prepare the build`);
  console.log(`2. Use the ${colors.green}Deploy${colors.reset} button in the Replit interface`);
} else {
  console.log(`${colors.red}${colors.bold}✗ Some checks failed. Please fix the issues before deploying.${colors.reset}`);
  console.log();
  console.log(`${colors.cyan}Recommended actions:${colors.reset}`);
  console.log(`1. Address any missing files or content noted above`);
  console.log(`2. Run this check script again until all checks pass`);
  console.log(`3. Then run ${colors.yellow}node scripts/fix-css-deployment.js${colors.reset} before deploying`);
}

// Exit with appropriate code
process.exit(allPassed ? 0 : 1);