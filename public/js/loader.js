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
      { path: '/css/unified-critical.css', id: 'unified-critical-css', critical: true },
      { path: '/critical-base.css', id: 'critical-base-css', critical: true },
      { path: '/failsafe.css', id: 'failsafe-css', critical: true },
      { path: '/assets/css/recovery-critical.css', id: 'recovery-critical-css', critical: true }
    ],
    js: [
      { path: '/js/css-recovery.js', id: 'css-recovery-script', critical: true }
    ]
  };
  
  // Emergency CSS styles for direct injection
  const EMERGENCY_CSS = `
    /* Emergency Styles */
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    .text-transparent {
      color: transparent !important;
    }
    .bg-clip-text {
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    .feature-card {
      display: flex !important;
      flex-direction: column !important;
      background-color: white !important;
      border-radius: 0.5rem !important;
      overflow: hidden !important;
      border: 1px solid rgba(0, 0, 0, 0.05) !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      transition: transform 0.3s ease, box-shadow 0.3s ease !important;
    }
    .animate-fade-in-down {
      animation: fadeInDownEmergency 0.5s ease-in-out !important;
    }
    @keyframes fadeInDownEmergency {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  
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
   * Inject emergency CSS styles directly
   */
  function injectEmergencyCSS() {
    console.log('[Loader] Injecting emergency CSS');
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'emergency-critical-css';
    style.textContent = EMERGENCY_CSS;
    
    // Add to document
    document.head.appendChild(style);
    
    console.log('[Loader] Emergency CSS injected');
    
    // Also apply direct style fixes
    applyDirectStyleFixes();
  }
  
  /**
   * Apply direct style fixes to elements
   */
  function applyDirectStyleFixes() {
    console.log('[Loader] Applying direct style fixes');
    
    // Wait for DOM to be ready
    setTimeout(() => {
      // Fix gradient text elements
      const gradientTexts = document.querySelectorAll('.bg-gradient-to-r.text-transparent.bg-clip-text');
      gradientTexts.forEach(el => {
        el.style.backgroundImage = 'linear-gradient(to right, rgb(124 58 237), rgb(79 70 229))';
        el.style.color = 'transparent';
        el.style.webkitBackgroundClip = 'text';
        el.style.backgroundClip = 'text';
      });
      
      // Fix feature cards
      const featureCards = document.querySelectorAll('.feature-card');
      featureCards.forEach(el => {
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.backgroundColor = 'white';
        el.style.borderRadius = '0.5rem';
        el.style.overflow = 'hidden';
        el.style.border = '1px solid rgba(0, 0, 0, 0.05)';
        el.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        el.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
      });
      
      console.log('[Loader] Direct style fixes applied');
    }, 300);
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
  
  /**
   * Verify critical CSS presence and fix if needed
   */
  function verifyCriticalCSS() {
    console.log('[Loader] Verifying critical CSS classes');
    
    // Create test element to check styles
    const testEl = document.createElement('div');
    testEl.style.position = 'absolute';
    testEl.style.visibility = 'hidden';
    document.body.appendChild(testEl);
    
    // Check critical classes
    const criticalClasses = ['bg-gradient-to-r', 'feature-card', 'text-transparent', 'bg-clip-text', 'animate-fade-in-down'];
    const missingClasses = [];
    
    criticalClasses.forEach(className => {
      testEl.className = className;
      const styles = window.getComputedStyle(testEl);
      
      // Simple heuristic to check if class is applied
      let isApplied = false;
      
      if (className === 'bg-gradient-to-r') {
        isApplied = styles.backgroundImage.includes('gradient');
      } else if (className === 'feature-card') {
        isApplied = styles.display === 'flex';
      } else if (className === 'text-transparent') {
        isApplied = styles.color === 'transparent' || styles.color === 'rgba(0, 0, 0, 0)';
      } else if (className === 'bg-clip-text') {
        isApplied = styles.backgroundClip === 'text' || styles.webkitBackgroundClip === 'text';
      } else if (className === 'animate-fade-in-down') {
        isApplied = styles.animationName !== 'none';
      }
      
      if (!isApplied) {
        missingClasses.push(className);
      }
    });
    
    // Clean up
    document.body.removeChild(testEl);
    
    // Fix if there are missing classes
    if (missingClasses.length > 0) {
      console.warn(`[Loader] Missing critical classes: ${missingClasses.join(', ')}`);
      injectEmergencyCSS();
      return false;
    }
    
    console.log('[Loader] All critical CSS classes verified');
    return true;
  }
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initialize();
      // Verify critical CSS after a delay to ensure all styles are loaded
      setTimeout(verifyCriticalCSS, 500);
    });
  } else {
    // Already loaded
    initialize();
    setTimeout(verifyCriticalCSS, 500);
  }
  
  // Also verify again when the document is fully loaded
  window.addEventListener('load', () => {
    setTimeout(verifyCriticalCSS, 1000);
    // Apply direct fixes for immediate visual appeal
    applyDirectStyleFixes();
  });
  
  // Expose to window for debugging and direct access
  window.mcpAssetLoader = {
    loadCSS,
    loadScript,
    injectEmergencyCSS,
    applyDirectStyleFixes,
    verifyCriticalCSS,
    getLoadedAssets: () => loadedAssets,
    allCriticalResourcesLoaded
  };
})();
