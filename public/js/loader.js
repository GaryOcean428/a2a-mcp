/**
 * MCP Integration Platform - Asset Loader
 * 
 * This script loads all critical resources for the application
 * in the correct order to ensure proper rendering.
 * 
 * Version: 1.0.0
 */

(function() {
  // Configuration
  const ASSETS = {
    css: [
      { path: '/css/unified-critical.css', id: 'unified-critical-css', critical: true }
    ],
    js: [
      { path: '/js/css-recovery.js', id: 'css-recovery-script', critical: true }
    ]
  };
  
  // Track loaded assets
  const loadedAssets = {
    css: {},
    js: {}
  };
  
  /**
   * Initialize the loader
   */
  function initialize() {
    console.log('[Loader] Initializing resource loader');
    
    // Start by loading critical CSS
    ASSETS.css
      .filter(asset => asset.critical)
      .forEach(asset => loadCSS(asset.path, asset.id));
      
    // Then load critical JS
    ASSETS.js
      .filter(asset => asset.critical)
      .forEach(asset => loadScript(asset.path, asset.id));
  }
  
  /**
   * Load a CSS file
   */
  function loadCSS(path, id) {
    // Check if already loaded
    if (document.getElementById(id)) {
      console.log(`[Loader] CSS already loaded: ${path}`);
      loadedAssets.css[id] = true;
      return;
    }
    
    // Create link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${path}?v=${new Date().getTime()}`; // Cache busting
    link.id = id;
    
    // Handle load events
    link.onload = () => {
      console.log(`[Loader] CSS loaded: ${path}`);
      loadedAssets.css[id] = true;
    };
    
    link.onerror = (error) => {
      console.error(`[Loader] Failed to load CSS: ${path}`, error);
      loadedAssets.css[id] = false;
    };
    
    // Add to document
    document.head.appendChild(link);
  }
  
  /**
   * Load a JavaScript file
   */
  function loadScript(path, id) {
    // Check if already loaded
    if (document.getElementById(id)) {
      console.log(`[Loader] Script already loaded: ${path}`);
      loadedAssets.js[id] = true;
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = `${path}?v=${new Date().getTime()}`; // Cache busting
    script.id = id;
    script.async = true;
    
    // Handle load events
    script.onload = () => {
      console.log(`[Loader] Script loaded: ${path}`);
      loadedAssets.js[id] = true;
    };
    
    script.onerror = (error) => {
      console.error(`[Loader] Failed to load script: ${path}`, error);
      loadedAssets.js[id] = false;
    };
    
    // Add to document
    document.body.appendChild(script);
  }
  
  /**
   * Check if all critical resources are loaded
   */
  function allCriticalResourcesLoaded() {
    // Check critical CSS
    const cssLoaded = ASSETS.css
      .filter(asset => asset.critical)
      .every(asset => loadedAssets.css[asset.id]);
      
    // Check critical JS
    const jsLoaded = ASSETS.js
      .filter(asset => asset.critical)
      .every(asset => loadedAssets.js[asset.id]);
      
    return cssLoaded && jsLoaded;
  }
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // Already loaded
    initialize();
  }
  
  // Expose to window for debugging
  window.mcpAssetLoader = {
    loadCSS,
    loadScript,
    getLoadedAssets: () => loadedAssets,
    allCriticalResourcesLoaded
  };
})();
