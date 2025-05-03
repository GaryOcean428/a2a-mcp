/**
 * MCP Integration Platform - Fix for Vite HMR WebSocket
 * 
 * This script fixes the HMR WebSocket connection issues in the Replit environment.
 * It modifies the Vite configuration to ensure proper WebSocket connections 
 * for Hot Module Replacement (HMR).
 */

const fs = require('fs');
const path = require('path');

function fixViteConfig() {
  const viteConfigPath = path.resolve('./vite.config.ts');
  
  if (!fs.existsSync(viteConfigPath)) {
    console.error('vite.config.ts not found!');
    return;
  }
  
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Check if hmr configuration already exists
  if (viteConfig.includes('hmr:')) {
    console.log('HMR configuration already exists. Updating...');
    
    // Replace existing hmr config
    viteConfig = viteConfig.replace(
      /hmr:\s*\{[^}]*\}/s,
      `hmr: {
      clientPort: null,
      port: 443,
      host: '',
      protocol: 'wss'
    }`
    );
  } else {
    console.log('Adding HMR configuration...');
    
    // Find position to inject hmr config
    const serverConfigPos = viteConfig.indexOf('server:');
    if (serverConfigPos !== -1) {
      // Find where server config block ends
      const serverConfigBlockStart = viteConfig.indexOf('{', serverConfigPos);
      const serverConfigBlockEnd = findClosingBrace(viteConfig, serverConfigBlockStart);
      
      if (serverConfigBlockStart !== -1 && serverConfigBlockEnd !== -1) {
        // Insert hmr config before the server config block ends
        viteConfig = viteConfig.slice(0, serverConfigBlockEnd) + 
          ',\n    hmr: {\n      clientPort: null,\n      port: 443,\n      host: \'\',' + 
          '\n      protocol: \'wss\'\n    }' + 
          viteConfig.slice(serverConfigBlockEnd);
      } else {
        // Fallback: replace entire server config
        viteConfig = viteConfig.replace(
          /server:\s*\{[^}]*\}/s,
          `server: {
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: null,
      port: 443,
      host: '',
      protocol: 'wss'
    }
  }`
        );
      }
    } else {
      // If no server config, add it
      const defineConfigPos = viteConfig.indexOf('defineConfig');
      if (defineConfigPos !== -1) {
        const configObjectStart = viteConfig.indexOf('{', defineConfigPos);
        if (configObjectStart !== -1) {
          viteConfig = viteConfig.slice(0, configObjectStart + 1) + 
            '\n  server: {\n    host: \'0.0.0.0\',\n    strictPort: true,' + 
            '\n    hmr: {\n      clientPort: null,\n      port: 443,\n      host: \'\',' + 
            '\n      protocol: \'wss\'\n    }\n  },' + 
            viteConfig.slice(configObjectStart + 1);
        }
      }
    }
  }
  
  // Write the updated config back to the file
  fs.writeFileSync(viteConfigPath, viteConfig, 'utf8');
  console.log('Vite HMR configuration updated successfully!');
}

// Helper function to find the position of a closing brace
function findClosingBrace(text, openBracePos) {
  let braceCount = 1;
  for (let i = openBracePos + 1; i < text.length; i++) {
    if (text[i] === '{') {
      braceCount++;
    } else if (text[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        return i;
      }
    }
  }
  return -1;
}

// Execute the fix
fixViteConfig();
console.log('✅ HMR WebSocket fix applied!');
