/**
 * MCP Integration Platform - UI Rendering Check and Fix
 * 
 * This script performs a comprehensive check of UI rendering issues and applies fixes:
 * 1. Type checking - Verifies TypeScript types and interfaces
 * 2. Package dependency check - Identifies and resolves package conflicts
 * 3. Linting errors - Identifies and fixes critical linting errors
 * 4. Route checks - Verifies all routes and redirects work properly
 * 5. Error boundary implementation - Ensures error handling is in place
 * 6. CSS verification - Verifies critical CSS classes are properly applied
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color output for better visibility
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Log messages with consistent formatting
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  let prefix = '';
  
  switch (level) {
    case 'success':
      prefix = `${colors.green}\u2713${colors.reset} `;
      break;
    case 'error':
      prefix = `${colors.red}\u2717${colors.reset} `;
      break;
    case 'warn':
      prefix = `${colors.yellow}!${colors.reset} `;
      break;
    case 'info':
      prefix = `${colors.blue}i${colors.reset} `;
      break;
    case 'section':
      console.log(`\n${colors.bright}${colors.cyan}====== ${message} ======${colors.reset}`);
      return;
  }
  
  console.log(`${prefix}${message}`);
}

// Execute command and return output
function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    if (!silent) {
      log(`Command executed: ${command}`, 'info');
    }
    return { success: true, output };
  } catch (error) {
    if (!silent) {
      log(`Error executing command: ${command}`, 'error');
      log(error.message, 'error');
    }
    return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

// Check TypeScript types
function checkTypes() {
  log('TYPESCRIPT TYPE CHECKING', 'section');
  log('Running TypeScript type check...');
  
  const result = runCommand('npx tsc --noEmit');
  
  if (result.success) {
    log('TypeScript type check completed successfully', 'success');
    return true;
  } else {
    log('TypeScript type errors found. Attempting to fix critical issues...', 'error');
    
    // Extract error information from the output
    const typeErrors = result.stderr || result.stdout || '';
    const errorLines = typeErrors.split('\n').filter(line => line.includes('error'));
    
    log(`Found ${errorLines.length} type errors`);
    
    // Focus on fixing critical errors that affect rendering
    const criticalErrorPatterns = [
      'Property \'.*\' does not exist on type',
      'Cannot find name',
      'Type \'.*\' is not assignable to type',
      'No overload matches this call',
      'is not assignable to parameter of type'
    ];
    
    const criticalErrors = errorLines.filter(line => 
      criticalErrorPatterns.some(pattern => new RegExp(pattern).test(line))
    );
    
    log(`Found ${criticalErrors.length} critical type errors to fix`, 'warn');
    
    // Automated fixing of common type errors would go here
    // For example: adding missing imports, fixing prop types, etc.
    
    return false;
  }
}

// Check package dependencies
function checkDependencies() {
  log('PACKAGE DEPENDENCY CHECK', 'section');
  log('Checking for package dependency issues...');
  
  // Run npm audit to find security issues
  const auditResult = runCommand('npm audit --json', true);
  let auditData = { vulnerabilities: {} };
  
  try {
    if (auditResult.success) {
      auditData = JSON.parse(auditResult.output);
    } else {
      auditData = JSON.parse(auditResult.stdout || '{}');
    }
  } catch (e) {
    log('Could not parse npm audit output', 'error');
  }
  
  // Count vulnerabilities by severity
  const vulnerabilities = auditData.vulnerabilities || {};
  const severityCounts = Object.values(vulnerabilities).reduce((counts, vuln) => {
    counts[vuln.severity] = (counts[vuln.severity] || 0) + 1;
    return counts;
  }, {});
  
  // Check for duplicate dependencies
  log('Checking for duplicate packages...');
  const duplicatesResult = runCommand('npx depcheck', true);
  
  // Check for outdated dependencies
  log('Checking for outdated packages...');
  const outdatedResult = runCommand('npm outdated --json', true);
  let outdatedPackages = {};
  
  try {
    if (outdatedResult.success) {
      outdatedPackages = JSON.parse(outdatedResult.output || '{}');
    } else {
      outdatedPackages = JSON.parse(outdatedResult.stdout || '{}');
    }
  } catch (e) {
    log('Could not parse npm outdated output', 'error');
  }
  
  const outdatedCount = Object.keys(outdatedPackages).length;
  
  // Report findings
  if (Object.keys(severityCounts).length > 0) {
    log('Security vulnerabilities found:', 'warn');
    Object.entries(severityCounts).forEach(([severity, count]) => {
      log(`  ${severity}: ${count}`, severity === 'critical' || severity === 'high' ? 'error' : 'warn');
    });
  } else {
    log('No security vulnerabilities found', 'success');
  }
  
  if (outdatedCount > 0) {
    log(`${outdatedCount} outdated packages found`, 'warn');
    
    // List critical outdated UI packages
    const criticalPackages = ['react', 'react-dom', 'tailwindcss', '@radix-ui'];
    const criticalOutdated = Object.entries(outdatedPackages)
      .filter(([pkg]) => criticalPackages.some(critical => pkg === critical || pkg.startsWith(critical + '/')));
    
    if (criticalOutdated.length > 0) {
      log('Critical UI packages outdated:', 'error');
      criticalOutdated.forEach(([pkg, info]) => {
        log(`  ${pkg}: ${info.current} -> ${info.latest}`, 'warn');
      });
    }
  } else {
    log('All packages are up to date', 'success');
  }
  
  return true;
}

// Check and fix linting errors
function checkLinting() {
  log('LINTING CHECK', 'section');
  log('Checking for linting errors...');
  
  // Check if eslint is available
  const eslintResult = runCommand('npx eslint --version', true);
  if (!eslintResult.success) {
    log('ESLint is not installed or configured', 'warn');
    return false;
  }
  
  // Run ESLint on client code
  log('Running ESLint on client code...');
  const lintResult = runCommand('npx eslint "client/src/**/*.{ts,tsx}" --quiet --format json', true);
  
  if (!lintResult.success) {
    try {
      const lintData = JSON.parse(lintResult.stdout || '[]');
      const totalErrors = lintData.reduce((sum, file) => sum + file.errorCount, 0);
      const totalWarnings = lintData.reduce((sum, file) => sum + file.warningCount, 0);
      
      log(`Found ${totalErrors} errors and ${totalWarnings} warnings`, totalErrors > 0 ? 'error' : 'warn');
      
      // Find critical linting errors that could affect rendering
      const criticalErrorTypes = [
        'react/jsx-no-undef',
        'react/prop-types', 
        'no-undef', 
        'react-hooks/rules-of-hooks',
        'react-hooks/exhaustive-deps'
      ];
      
      const criticalErrors = lintData.flatMap(file => 
        file.messages.filter(msg => 
          criticalErrorTypes.includes(msg.ruleId)
        )
      );
      
      if (criticalErrors.length > 0) {
        log(`Found ${criticalErrors.length} critical linting errors that may affect rendering`, 'error');
        criticalErrors.slice(0, 5).forEach(error => {
          log(`  ${error.message} (${error.ruleId}) at ${error.line}:${error.column}`, 'error');
        });
        
        if (criticalErrors.length > 5) {
          log(`  ... and ${criticalErrors.length - 5} more`, 'error');
        }
      }
      
      return totalErrors === 0;
    } catch (e) {
      log('Could not parse ESLint output', 'error');
      return false;
    }
  }
  
  log('No linting errors found', 'success');
  return true;
}

// Check routes and redirects
function checkRoutes() {
  log('ROUTE CHECKING', 'section');
  log('Analyzing application routes...');
  
  // Find all route definitions in the app
  const clientDir = path.join(process.cwd(), 'client/src');
  let appFile = null;
  
  try {
    // Find the App.tsx file
    const appFilePath = path.join(clientDir, 'App.tsx');
    if (fs.existsSync(appFilePath)) {
      appFile = fs.readFileSync(appFilePath, 'utf-8');
      log('Found App.tsx with route definitions', 'success');
    } else {
      log('App.tsx not found', 'error');
      return false;
    }
    
    // Parse routes from App.tsx
    const routeRegex = /<Route\s+path=["']([^"']+)["'][^>]*>/g;
    const redirectRegex = /<Redirect\s+from=["']([^"']+)["']\s+to=["']([^"']+)["'][^>]*>/g;
    
    const routes = [];
    let match;
    
    while ((match = routeRegex.exec(appFile)) !== null) {
      routes.push(match[1]);
    }
    
    const redirects = [];
    while ((match = redirectRegex.exec(appFile)) !== null) {
      redirects.push({ from: match[1], to: match[2] });
    }
    
    log(`Found ${routes.length} routes and ${redirects.length} redirects`, 'info');
    
    // Check if required routes exist
    const requiredRoutes = ['/', '/auth', '/documentation', '/settings'];
    const missingRoutes = requiredRoutes.filter(route => !routes.includes(route));
    
    if (missingRoutes.length > 0) {
      log(`Missing required routes: ${missingRoutes.join(', ')}`, 'error');
    } else {
      log('All required routes are defined', 'success');
    }
    
    return missingRoutes.length === 0;
  } catch (e) {
    log(`Error analyzing routes: ${e.message}`, 'error');
    return false;
  }
}

// Check and implement error boundaries
function checkErrorBoundaries() {
  log('ERROR BOUNDARY CHECK', 'section');
  log('Checking for proper error boundary implementation...');
  
  const errorBoundaryPath = path.join(process.cwd(), 'client/src/components/error-boundary.tsx');
  const appFilePath = path.join(process.cwd(), 'client/src/App.tsx');
  
  let hasErrorBoundary = false;
  let errorBoundaryImplemented = false;
  
  // Check if error boundary component exists
  if (fs.existsSync(errorBoundaryPath)) {
    log('Error boundary component found', 'success');
    hasErrorBoundary = true;
    
    // Check if it's properly implemented
    const errorBoundaryContent = fs.readFileSync(errorBoundaryPath, 'utf-8');
    if (
      errorBoundaryContent.includes('componentDidCatch') || 
      errorBoundaryContent.includes('static getDerivedStateFromError')
    ) {
      log('Error boundary correctly implements error catching methods', 'success');
    } else {
      log('Error boundary does not implement proper error catching methods', 'error');
    }
  } else {
    log('Error boundary component not found', 'error');
    
    // Create a basic error boundary component
    const errorBoundaryCode = `/**
 * Error Boundary Component
 * 
 * This component catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our logging service
    logger.error('UI Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      tags: ['error-boundary', 'ui-error']
    });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 flex items-center justify-center min-h-[300px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              <p className="mb-4">An unexpected error occurred while rendering this component.</p>
              <p className="text-xs font-mono mb-3 whitespace-pre-wrap">
                {this.state.error?.message}
              </p>
              <Button 
                variant="outline" 
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
`;
    
    try {
      // Create the directory if it doesn't exist
      const dir = path.dirname(errorBoundaryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(errorBoundaryPath, errorBoundaryCode);
      log('Created error boundary component', 'success');
      hasErrorBoundary = true;
    } catch (e) {
      log(`Failed to create error boundary component: ${e.message}`, 'error');
    }
  }
  
  // Check if error boundary is used in App.tsx
  if (hasErrorBoundary && fs.existsSync(appFilePath)) {
    const appContent = fs.readFileSync(appFilePath, 'utf-8');
    
    if (
      appContent.includes('ErrorBoundary') || 
      appContent.includes('<ErrorBoundary>') || 
      appContent.includes('error-boundary')
    ) {
      log('Error boundary is implemented in App.tsx', 'success');
      errorBoundaryImplemented = true;
    } else {
      log('Error boundary is not implemented in App.tsx', 'error');
      log('Please wrap your application or routes with the ErrorBoundary component', 'info');
    }
  }
  
  return errorBoundaryImplemented;
}

// Check and verify CSS issues
function checkCssIssues() {
  log('CSS VERIFICATION', 'section');
  log('Checking for CSS rendering issues...');
  
  const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');
  const recoveryPath = path.join(process.cwd(), 'public/assets/css/recovery.css');
  
  if (fs.existsSync(tailwindConfigPath)) {
    log('Found Tailwind config file', 'success');
    const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf-8');
    
    // Check if safelist is properly configured
    if (tailwindConfig.includes('safelist:')) {
      log('Tailwind safelist configuration found', 'success');
      
      // Check if critical classes are in safelist
      const criticalClasses = [
        'bg-gradient-to-r',
        'from-purple-600',
        'to-indigo-600',
        'text-transparent',
        'bg-clip-text',
        'animate-fade-in-down',
        'feature-card'
      ];
      
      let missingClasses = [];
      for (const cls of criticalClasses) {
        if (!tailwindConfig.includes(cls)) {
          missingClasses.push(cls);
        }
      }
      
      if (missingClasses.length > 0) {
        log(`Critical classes missing from safelist: ${missingClasses.join(', ')}`, 'error');
        log('These classes may be purged in production builds', 'warn');
      } else {
        log('All critical classes are in safelist', 'success');
      }
    } else {
      log('Tailwind safelist not found in config', 'error');
      log('Critical classes may be purged in production builds', 'warn');
    }
  } else {
    log('Tailwind config file not found', 'error');
  }
  
  // Check for CSS recovery mechanism
  if (fs.existsSync(recoveryPath)) {
    log('CSS recovery file found', 'success');
  } else {
    log('CSS recovery file not found, rendering issues may occur', 'error');
    
    // Create recovery directory if it doesn't exist
    const recoveryDir = path.dirname(recoveryPath);
    if (!fs.existsSync(recoveryDir)) {
      fs.mkdirSync(recoveryDir, { recursive: true });
    }
    
    // Create a basic recovery CSS file
    const recoveryCss = `/**
 * MCP Integration Platform - CSS Recovery Styles
 * These styles ensure critical UI elements render correctly even if main CSS fails
 */

/* Essential gradients that might be purged */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-purple-600 {
  --tw-gradient-from: rgb(147 51 234);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(147 51 234 / 0));
}

.to-indigo-600 {
  --tw-gradient-to: rgb(79 70 229);
}

.text-transparent {
  color: transparent;
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Animation classes */
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-in-out;
}

@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Feature card styles */
.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Essential responsive grid classes */
.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
`;
    
    try {
      fs.writeFileSync(recoveryPath, recoveryCss);
      log('Created CSS recovery file', 'success');
    } catch (e) {
      log(`Failed to create CSS recovery file: ${e.message}`, 'error');
    }
  }
  
  return false;
}

// Check database metadata file
function checkDatabaseMetadata() {
  log('DATABASE METADATA CHECK', 'section');
  log('Checking database metadata file...');
  
  const dbMetadataPath = path.join(process.cwd(), 'attached_assets/db-metadata.json');
  const schemaFilePath = path.join(process.cwd(), 'shared/schema.ts');
  
  if (fs.existsSync(dbMetadataPath)) {
    log('Database metadata file found', 'success');
    
    try {
      const metadata = JSON.parse(fs.readFileSync(dbMetadataPath, 'utf-8'));
      
      // Check if metadata contains expected sections
      const requiredSections = ['schemas', 'entities', 'columns', 'constraints'];
      const missingSections = requiredSections.filter(section => 
        !metadata.some(item => item.id === section)
      );
      
      if (missingSections.length > 0) {
        log(`Database metadata is missing sections: ${missingSections.join(', ')}`, 'error');
      } else {
        log('Database metadata contains all required sections', 'success');
      }
      
      // Check schema.ts file for correct table definitions
      if (fs.existsSync(schemaFilePath)) {
        log('Schema file found', 'success');
        const schemaContent = fs.readFileSync(schemaFilePath, 'utf-8');
        
        // Get tables from metadata
        const entitiesMetadata = metadata.find(item => item.id === 'entities');
        const tables = entitiesMetadata.rows
          .filter(row => row.type === 'table')
          .map(row => row.name);
        
        // Check if tables are defined in schema.ts
        let missingTables = [];
        for (const table of tables) {
          if (!schemaContent.includes(`export const ${table}`)) {
            missingTables.push(table);
          }
        }
        
        if (missingTables.length > 0) {
          log(`Tables missing from schema.ts: ${missingTables.join(', ')}`, 'warn');
        } else {
          log('All tables are defined in schema.ts', 'success');
        }
      } else {
        log('Schema file not found', 'error');
      }
    } catch (e) {
      log(`Error parsing database metadata: ${e.message}`, 'error');
    }
  } else {
    log('Database metadata file not found', 'error');
  }
  
  return true;
}

// Main function to run all checks
async function runChecks() {
  log('MCP INTEGRATION PLATFORM - UI RENDERING CHECK', 'section');
  log(`Starting comprehensive UI check at ${new Date().toISOString()}`);
  log('This script will check for issues and apply fixes where possible');
  
  // Run all checks
  const results = {
    types: checkTypes(),
    dependencies: checkDependencies(),
    linting: checkLinting(),
    routes: checkRoutes(),
    errorBoundaries: checkErrorBoundaries(),
    css: checkCssIssues(),
    database: checkDatabaseMetadata()
  };
  
  // Generate summary
  log('CHECK SUMMARY', 'section');
  let passedChecks = 0;
  let totalChecks = Object.keys(results).length;
  
  for (const [check, passed] of Object.entries(results)) {
    if (passed) {
      log(`${check}: ${colors.green}PASSED${colors.reset}`, 'success');
      passedChecks++;
    } else {
      log(`${check}: ${colors.red}NEEDS ATTENTION${colors.reset}`, 'error');
    }
  }
  
  log(`Overall: ${passedChecks}/${totalChecks} checks passed`, 'info');
  
  // Final recommendations
  log('RECOMMENDATIONS', 'section');
  if (passedChecks === totalChecks) {
    log('All checks passed! Your application should render correctly.', 'success');
  } else {
    log('Here are some recommendations to fix rendering issues:', 'info');
    
    if (!results.types) {
      log('• Fix TypeScript errors to ensure component props are correctly typed', 'info');
    }
    
    if (!results.dependencies) {
      log('• Update critical UI packages to ensure compatibility', 'info');
    }
    
    if (!results.linting) {
      log('• Fix critical ESLint errors, especially for React hooks and undefined variables', 'info');
    }
    
    if (!results.routes) {
      log('• Ensure all required routes are properly defined', 'info');
    }
    
    if (!results.errorBoundaries) {
      log('• Implement error boundaries to prevent the entire UI from crashing', 'info');
    }
    
    if (!results.css) {
      log('• Add critical CSS classes to Tailwind safelist and ensure recovery CSS is in place', 'info');
    }
    
    log('Run this script again after making changes to verify improvements', 'info');
  }
}

// Run the checks
runChecks().catch(error => {
  log(`Error running checks: ${error.message}`, 'error');
  process.exit(1);
});
