#!/usr/bin/env node

/**
 * This script adds cache busting query parameters to all HTML file references
 * in the deployment, ensuring browsers download fresh assets after deployment.
 */

import fs from 'fs';
import path from 'path';

const timestamp = Date.now();
console.log(`Running cache buster with timestamp: ${timestamp}`);

// Path to the production HTML
const htmlPath = path.join(process.cwd(), 'dist', 'public', 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error(`Error: HTML file not found at ${htmlPath}`);
  console.log('Make sure to run "npm run build" first!');
  process.exit(1);
}

try {
  // Read the HTML file
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Add timestamp to JS and CSS imports
  html = html.replace(/(href=["'])([^"']+\.css)(["'])/g, `$1$2?v=${timestamp}$3`);
  html = html.replace(/(src=["'])([^"']+\.js)(["'])/g, `$1$2?v=${timestamp}$3`);
  
  // Add meta tag for cache control
  if (!html.includes('<meta http-equiv="Cache-Control"')) {
    html = html.replace('</head>', `  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
</head>`);
  }
  
  // Add version comment near the beginning
  html = html.replace('<!DOCTYPE html>', `<!DOCTYPE html>
<!-- MCP Platform v2.5 (${timestamp}) -->`);
  
  // Write the modified HTML back
  fs.writeFileSync(htmlPath, html);
  console.log(`✅ Successfully added cache busting to ${htmlPath}`);
  
  // Try to add version to manifest.json if it exists
  const manifestPath = path.join(process.cwd(), 'dist', 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifest.version = `2.5.${timestamp}`;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`✅ Updated version in manifest.json`);
    } catch (manifestErr) {
      console.log(`⚠️ Could not update manifest.json: ${manifestErr.message}`);
    }
  }
  
  console.log('');
  console.log('🔄 Cache busting complete!');
  console.log('');
  console.log('To force a complete reload on your deployed site:');
  console.log(`Visit: https://[your-app].replit.app/?v=${timestamp}`);
  
} catch (error) {
  console.error(`Error processing HTML: ${error}`);
  process.exit(1);
}