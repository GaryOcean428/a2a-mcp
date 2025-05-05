/**
 * MCP Integration Platform Deployment Fix Script
 * 
 * This script automatically fixes module compatibility issues, particularly
 * between ESM and CommonJS modules for smoother deployment.
 */

const fs = require('fs');
const path = require('path');

// Check if start.cjs exists and create it if not
function ensureStartCJS() {
  const startJsPath = path.join(__dirname, 'start.js');
  const startCjsPath = path.join(__dirname, 'start.cjs');
  
  if (!fs.existsSync(startCjsPath) && fs.existsSync(startJsPath)) {
    console.log('Creating CommonJS version of start.js...');
    
    // Read the ESM version
    const esmContent = fs.readFileSync(startJsPath, 'utf8');
    
    // Transform to CommonJS
    const cjsContent = esmContent
      .replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"](.*)['"];?/g, 'const { $1 } = require("$2");')
      .replace(/import\s+([^\s]+)\s+from\s+['"](.*)['"];?/g, 'const $1 = require("$2");')
      .replace(/const\s+__filename\s+=\s+fileURLToPath\(import\.meta\.url\);/g, '// CommonJS already has __filename')
      .replace(/const\s+__dirname\s+=\s+path\.dirname\(__filename\);/g, '// CommonJS already has __dirname')
      .replace(/export\s+\{\s*([^}]+)\s*\};?/g, 'module.exports = { $1 };')
      .replace(/export\s+default\s+([^;\s]+);?/g, 'module.exports = $1;');
      
    // Write the CommonJS version
    fs.writeFileSync(startCjsPath, cjsContent, 'utf8');
    console.log('Created start.cjs - CommonJS version of start script');
    return true;
  } else if (fs.existsSync(startCjsPath)) {
    console.log('start.cjs already exists');
    return true;
  }
  
  return false;
}

// Ensure server files are accessible in both module formats
function checkServerFiles() {
  const jsServerPath = path.join(__dirname, 'server/prod-server.js');
  const cjsServerPath = path.join(__dirname, 'server/prod-server.cjs');
  
  if (fs.existsSync(jsServerPath) && !fs.existsSync(cjsServerPath)) {
    console.log('Creating CommonJS version of server production file...');
    
    // Copy the file for now - a more sophisticated approach would be to convert it
    fs.copyFileSync(jsServerPath, cjsServerPath);
    console.log('Created server/prod-server.cjs');
  }
}

// Apply all deployment fixes
function applyDeploymentFixes() {
  console.log('Applying MCP Integration Platform deployment fixes...');
  
  const fixes = [
    ensureStartCJS,
    checkServerFiles
  ];
  
  let successCount = 0;
  
  fixes.forEach(fix => {
    try {
      const result = fix();
      if (result) successCount++;
    } catch (err) {
      console.error(`Error applying fix ${fix.name}:`, err);
    }
  });
  
  console.log(`Applied ${successCount}/${fixes.length} deployment fixes successfully.`);
}

// Run the fixes
applyDeploymentFixes();
