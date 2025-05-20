#!/usr/bin/env node

/**
 * Complete Deployment Fix
 * Ensures the UI is rebuilt with critical CSS and all
 * deployment scripts are executed in order.
 */
const { execSync } = require('child_process');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

try {
  console.log('Rebuilding UI with critical CSS...');
  run('node rebuild-ui.js');

  console.log('Verifying UI consistency...');
  run('node deploy-consistency.js');

  console.log('Applying deployment fixes...');
  run('node deploy-fix.cjs');

  console.log('Deployment fix complete');
} catch (err) {
  console.error('Deployment fix failed:', err);
  process.exit(1);
}
