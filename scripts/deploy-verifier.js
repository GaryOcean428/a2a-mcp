#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const timestamp = Date.now();
console.log(`${colors.bright}${colors.magenta}⚡ MCP Platform v2.5 Deployment Verifier (${timestamp})${colors.reset}`);
console.log(`${colors.cyan}================================================${colors.reset}\n`);

// Check for problems with the deployment
const problems = [];

// Step 1: Verify tailwind config has safelist
try {
  console.log(`${colors.blue}Checking tailwind configuration...${colors.reset}`);
  const tailwindConfig = fs.readFileSync('tailwind.config.ts', 'utf8');
  
  if (!tailwindConfig.includes('safelist')) {
    problems.push('Tailwind config is missing safelist - UI elements may be missing in production');
    console.log(`${colors.red}✖ No safelist found in tailwind.config.ts${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Tailwind config has safelist${colors.reset}`);
  }
} catch (error) {
  problems.push(`Error checking tailwind config: ${error.message}`);
  console.log(`${colors.red}✖ Error checking tailwind config: ${error.message}${colors.reset}`);
}

// Step 2: Verify CSS files have necessary classes
try {
  console.log(`\n${colors.blue}Checking CSS files...${colors.reset}`);
  const indexCss = fs.readFileSync('client/src/index.css', 'utf8');
  
  const requiredClasses = [
    '.bg-grid-gray-100',
    '.bg-blob-gradient',
    '.feature-card',
    '.animate-fade-in-down'
  ];
  
  const missingClasses = [];
  for (const className of requiredClasses) {
    if (!indexCss.includes(className)) {
      missingClasses.push(className);
    }
  }
  
  if (missingClasses.length > 0) {
    problems.push(`Missing CSS classes: ${missingClasses.join(', ')}`);
    console.log(`${colors.red}✖ Missing CSS classes: ${missingClasses.join(', ')}${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ All required CSS classes present${colors.reset}`);
  }
} catch (error) {
  problems.push(`Error checking CSS: ${error.message}`);
  console.log(`${colors.red}✖ Error checking CSS: ${error.message}${colors.reset}`);
}

// Step 3: Verify HTML has critical inline styles
try {
  console.log(`\n${colors.blue}Checking critical inline styles in HTML...${colors.reset}`);
  const indexHtml = fs.readFileSync('client/index.html', 'utf8');
  
  if (!indexHtml.includes('Critical UI styles for production')) {
    problems.push('HTML is missing critical inline styles');
    console.log(`${colors.red}✖ HTML is missing critical inline styles${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ HTML has critical inline styles${colors.reset}`);
  }
} catch (error) {
  problems.push(`Error checking HTML: ${error.message}`);
  console.log(`${colors.red}✖ Error checking HTML: ${error.message}${colors.reset}`);
}

// Step 4: Verify version tracking is in place
try {
  console.log(`\n${colors.blue}Checking version tracking...${colors.reset}`);
  
  if (!fs.existsSync('client/src/version.ts')) {
    problems.push('Version file is missing');
    console.log(`${colors.red}✖ Version file is missing${colors.reset}`);
  } else {
    const versionContent = fs.readFileSync('client/src/version.ts', 'utf8');
    if (!versionContent.includes('VERSION')) {
      problems.push('Version file does not contain VERSION constant');
      console.log(`${colors.red}✖ Version file does not contain VERSION constant${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Version file is present${colors.reset}`);
    }
  }
  
  const mainContent = fs.readFileSync('client/src/main.tsx', 'utf8');
  if (!mainContent.includes('import { VERSION }')) {
    problems.push('main.tsx is not importing the VERSION constant');
    console.log(`${colors.red}✖ main.tsx is not importing the VERSION constant${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ main.tsx imports VERSION constant${colors.reset}`);
  }
} catch (error) {
  problems.push(`Error checking version tracking: ${error.message}`);
  console.log(`${colors.red}✖ Error checking version tracking: ${error.message}${colors.reset}`);
}

// Step 5: Check cookie settings
try {
  console.log(`\n${colors.blue}Checking cookie settings...${colors.reset}`);
  const authContent = fs.readFileSync('server/auth.ts', 'utf8');
  
  if (authContent.includes('secure: false')) {
    problems.push('Cookie settings have secure: false which may cause issues in production');
    console.log(`${colors.yellow}⚠ Cookie settings have secure: false${colors.reset}`);
  } else if (authContent.includes("secure: process.env.NODE_ENV === 'production'")) {
    console.log(`${colors.green}✓ Cookie security settings are environment-aware${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Unable to verify cookie security settings${colors.reset}`);
  }
  
  if (authContent.includes("sameSite: 'none'")) {
    problems.push("Cookie settings have sameSite: 'none' which may cause issues in production");
    console.log(`${colors.yellow}⚠ Cookie settings have sameSite: 'none'${colors.reset}`);
  } else if (authContent.includes("sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none'")) {
    console.log(`${colors.green}✓ Cookie sameSite settings are environment-aware${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Unable to verify cookie sameSite settings${colors.reset}`);
  }
} catch (error) {
  problems.push(`Error checking cookie settings: ${error.message}`);
  console.log(`${colors.red}✖ Error checking cookie settings: ${error.message}${colors.reset}`);
}

// Step 6: Check cache control middleware
try {
  console.log(`\n${colors.blue}Checking cache control middleware...${colors.reset}`);
  const routesContent = fs.readFileSync('server/routes.ts', 'utf8');
  
  if (!routesContent.includes('Cache-Control')) {
    problems.push('No cache control middleware found');
    console.log(`${colors.red}✖ No cache control middleware found${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Cache control middleware is present${colors.reset}`);
  }
  
  if (!routesContent.includes('app.use(cacheControl)')) {
    problems.push('Cache control middleware is not being used');
    console.log(`${colors.red}✖ Cache control middleware is not being used${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Cache control middleware is being used${colors.reset}`);
  }
} catch (error) {
  problems.push(`Error checking cache control: ${error.message}`);
  console.log(`${colors.red}✖ Error checking cache control: ${error.message}${colors.reset}`);
}

// Create a package.json script to run this verification
try {
  console.log(`\n${colors.blue}Setting up deployment script...${colors.reset}`);
  
  // Create a simple bash script to run before deployment
  const deployScriptPath = 'scripts/predeploy.sh';
  const deployScriptContent = `#!/bin/bash
set -e

# Display banner
echo "====================================="
echo "MCP Platform v2.5 Deployment Process"
echo "====================================="

# 1. Run version updater
echo "Updating version timestamp..."
TIMESTAMP=$(date +%s)
echo "export const VERSION = \\"2.5.$TIMESTAMP\\";" > client/src/version.ts
echo "Version updated: 2.5.$TIMESTAMP"

# 2. Verify deployment readiness
echo "Verifying deployment readiness..."
node scripts/deploy-verifier.js

# 3. Run production build
echo "Building for production..."
NODE_ENV=production npm run build

# 4. Clear browser caches
echo "Add this query parameter to force cache refresh: ?v=$TIMESTAMP"

echo "====================================="
echo "Deployment preparation complete!"
echo "Use the Replit Deploy button to deploy."
echo "====================================="
`;

  fs.writeFileSync(deployScriptPath, deployScriptContent);
  fs.chmodSync(deployScriptPath, '755');
  console.log(`${colors.green}✓ Created deployment script at ${deployScriptPath}${colors.reset}`);
} catch (error) {
  problems.push(`Error creating deployment script: ${error.message}`);
  console.log(`${colors.red}✖ Error creating deployment script: ${error.message}${colors.reset}`);
}

// Output summary
console.log(`\n${colors.cyan}${colors.bright}Deployment Verification Summary:${colors.reset}`);
if (problems.length === 0) {
  console.log(`${colors.green}✓ No issues detected!${colors.reset}`);
} else {
  console.log(`${colors.red}${problems.length} issue(s) detected:${colors.reset}`);
  problems.forEach((problem, index) => {
    console.log(`${colors.red}  ${index + 1}. ${problem}${colors.reset}`);
  });
}

// Instructions
console.log(`\n${colors.cyan}${colors.bright}Deployment Instructions:${colors.reset}`);
console.log(`${colors.reset}1. Run the deployment preparation script:${colors.reset}`);
console.log(`${colors.cyan}   chmod +x scripts/predeploy.sh${colors.reset}`);
console.log(`${colors.cyan}   ./scripts/predeploy.sh${colors.reset}`);
console.log(`${colors.reset}2. Use the Replit Deploy button${colors.reset}`);
console.log(`${colors.reset}3. After deployment, visit your site with cache bypass:${colors.reset}`);
console.log(`${colors.cyan}   https://your-app.replit.app/?v=${timestamp}${colors.reset}`);
console.log(`${colors.reset}4. Clear your browser cache if issues persist${colors.reset}`);

console.log(`\n${colors.magenta}${colors.bright}Happy Deploying!${colors.reset}`);