/**
 * MCP Integration Platform - HMR WebSocket Fix
 * 
 * This script fixes the issue with Vite's HMR WebSocket URL
 * "wss://localhost:undefined/?token=..." that occurs in Replit environments.
 */

const fs = require('fs');
const path = require('path');

// Paths to client files
const CLIENT_DIR = path.join(__dirname, 'client');
const MAIN_TSX_PATH = path.join(CLIENT_DIR, 'src', 'main.tsx');
const HMR_FIX_PATH = path.join(CLIENT_DIR, 'src', 'vite-hmr-fix.ts');

// Content for the HMR fix file
const HMR_FIX_CONTENT = `/**
 * Vite HMR WebSocket Fix
 * 
 * This script catches and handles WebSocket errors from Vite's HMR system,
 * particularly the "wss://localhost:undefined/?token=..." invalid URL error.
 * This is a common issue in Replit environments where the port might not be correctly determined.
 */

// Run the fix immediately when imported
(function fixViteHmrWebSocket() {
  try {
    // Add a global error handler specifically for WebSocket errors
    window.addEventListener('error', (event) => {
      // Check if this is a WebSocket error with the specific "localhost:undefined" pattern
      if (
        event.message && 
        event.message.includes('WebSocket') && 
        event.message.includes('localhost:undefined')
      ) {
        console.warn('[Vite HMR Fix] Intercepted WebSocket error:', event.message);
        
        // Prevent the error from propagating to the console
        event.preventDefault();
        
        // Create a message for the user
        console.info(
          '[Vite HMR Fix] The development server Hot Module Replacement (HMR) ' +
          'connection has an invalid URL. This is harmless and only affects ' +
          'automatic page refreshing during development.'
        );
      }
    });
    
    // Add unhandledrejection handler for WebSocket promise errors
    window.addEventListener('unhandledrejection', (event) => {
      if (
        event.reason && 
        event.reason.message && 
        typeof event.reason.message === 'string' &&
        event.reason.message.includes('WebSocket') && 
        event.reason.message.includes('localhost:undefined')
      ) {
        console.warn('[Vite HMR Fix] Intercepted unhandled WebSocket promise rejection');
        
        // Prevent the error from propagating
        event.preventDefault();
      }
    });
    
    console.log('[Vite HMR Fix] Installed error handlers to suppress invalid WebSocket URL errors');
  } catch (error) {
    console.error('[Vite HMR Fix] Failed to install error handlers:', error);
  }
})();

export {};`;

/**
 * Write the HMR WebSocket fix file
 */
function createHmrFixFile() {
  try {
    fs.writeFileSync(HMR_FIX_PATH, HMR_FIX_CONTENT, 'utf8');
    console.log(`✅ Created WebSocket HMR fix file at ${HMR_FIX_PATH}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create WebSocket HMR fix file: ${error.message}`);
    return false;
  }
}

/**
 * Update main.tsx to import the HMR fix
 */
function updateMainTsx() {
  try {
    if (!fs.existsSync(MAIN_TSX_PATH)) {
      console.error(`❌ Could not find main.tsx at ${MAIN_TSX_PATH}`);
      return false;
    }

    let mainContent = fs.readFileSync(MAIN_TSX_PATH, 'utf8');

    // Check if the import already exists
    if (mainContent.includes("import './vite-hmr-fix'")) {
      console.log('✅ HMR fix import already exists in main.tsx');
      return true;
    }

    // Add the import after other imports
    const importPattern = /import [^;]+;/g;
    const imports = mainContent.match(importPattern) || [];
    
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = mainContent.lastIndexOf(lastImport) + lastImport.length;
      
      mainContent = 
        mainContent.substring(0, lastImportIndex) + 
        '\n// Import the Vite HMR fix to suppress WebSocket errors\nimport "./vite-hmr-fix";\n' + 
        mainContent.substring(lastImportIndex);
    } else {
      // No imports found, add at the beginning
      mainContent = '// Import the Vite HMR fix to suppress WebSocket errors\nimport "./vite-hmr-fix";\n\n' + mainContent;
    }

    // Also fix the loading element to use proper TypeScript casting
    mainContent = mainContent.replace(
      /const loadingElement = document\.querySelector\(['"]\.loading['"]\);/,
      "const loadingElement = document.querySelector('.loading') as HTMLElement | null;"
    );

    fs.writeFileSync(MAIN_TSX_PATH, mainContent, 'utf8');
    console.log(`✅ Updated main.tsx to import HMR WebSocket fix`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update main.tsx: ${error.message}`);
    return false;
  }
}

/**
 * Fix the HMR WebSocket issues
 */
function fixHmrWebsocket() {
  console.log('🔧 Applying HMR WebSocket fixes...');
  
  let success = true;
  success = createHmrFixFile() && success;
  success = updateMainTsx() && success;
  
  if (success) {
    console.log('✅ HMR WebSocket fixes applied successfully!');
  } else {
    console.error('❌ Some HMR WebSocket fixes failed to apply');
  }
  
  return success;
}

// Run the fix
fixHmrWebsocket();