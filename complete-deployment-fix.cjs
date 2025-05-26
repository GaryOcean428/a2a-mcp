#!/usr/bin/env node

/**
 * Complete Deployment Fix
 * Ensures the UI is rebuilt with critical CSS and all
 * deployment scripts are executed in order.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

/**
 * Ensure CSS recovery is properly set up
 */
function fixCssRecovery() {
  console.log('Ensuring CSS recovery is set up...');
  
  // Create public/assets/css directory if it doesn't exist
  const cssDir = path.join(process.cwd(), 'public/assets/css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  // Check for the recovery CSS file
  const recoveryPath = path.join(cssDir, 'recovery-critical.css');
  if (!fs.existsSync(recoveryPath)) {
    console.log('Creating recovery CSS file...');
    const sampleCss = `/**
* MCP Integration Platform - Recovery Critical CSS
* Auto-generated for production CSS recovery
*/

/* Basic UI elements */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.text-transparent {
  color: transparent;
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}`;
    
    fs.writeFileSync(recoveryPath, sampleCss);
  }
  
  return true;
}

try {
  console.log('Rebuilding UI with critical CSS...');
  run('node rebuild-ui.mjs');

  // Add CSS recovery before verification
  fixCssRecovery();

  console.log('Verifying UI consistency...');
  run('node deploy-consistency.js');

  console.log('Applying deployment fixes...');
  run('node deploy-fix.cjs');

  console.log('Deployment fix complete');
} catch (err) {
  console.error('Deployment fix failed:', err);
  process.exit(1);
}
