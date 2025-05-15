/**
 * MCP Integration Platform - CSS Injector
 * 
 * This script ensures critical CSS styles are properly applied in both development and production.
 * It checks for missing styles and injects them directly when needed.
 * 
 * Version: 1.0.0
 */

(function() {
  // Configuration
  const CONFIG = {
    criticalCssPath: '/assets/css/recovery-critical.css',
    version: new Date().getTime(),
    autoRetry: true,
    retryDelay: 1000,
    retryMax: 3
  };

  // Critical CSS classes that must always be available
  const CRITICAL_CLASSES = [
    'bg-gradient-to-r',
    'text-transparent',
    'bg-clip-text',
    'feature-card',
    'animate-fade-in-down',
    'from-purple-50',
    'to-white',
    'bg-grid-gray-100',
    'bg-blob-gradient'
  ];

  // Direct CSS injection - this will be used if the stylesheets fail
  const DIRECT_CSS = `
    /* Direct critical styles - no external dependencies */
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
      animation: cssInjector_fadeIn 0.5s ease-in-out !important;
    }
    
    @keyframes cssInjector_fadeIn {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    .from-purple-50 {
      --tw-gradient-from: rgb(250 245 255) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0)) !important;
    }
    
    .to-white {
      --tw-gradient-to: rgb(255 255 255) !important;
    }
    
    .from-purple-600 {
      --tw-gradient-from: rgb(147 51 234) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0)) !important;
    }
    
    .to-indigo-600 {
      --tw-gradient-to: rgb(79 70 229) !important;
    }
    
    /* Gradient text combo */
    .bg-gradient-to-r.text-transparent.bg-clip-text {
      background-image: linear-gradient(to right, rgb(124 58 237), rgb(79 70 229)) !important;
      color: transparent !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    
    /* Feature card hover */
    .feature-card:hover {
      transform: translateY(-5px) !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      border-color: rgba(124, 58, 237, 0.2) !important;
    }
    
    /* Background patterns */
    .bg-grid-gray-100 {
      background-image: linear-gradient(to right, rgb(243 244 246 / 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgb(243 244 246 / 0.1) 1px, transparent 1px) !important;
      background-size: 24px 24px !important;
    }
    
    .bg-blob-gradient {
      background-image: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0) 70%) !important;
    }
  `;

  // Initialize
  function init() {
    console.log('[CSS Injector] Initializing...');
    
    // First attempt to load the external stylesheet
    loadCriticalStylesheet();
    
    // Then verify critical styles after a delay
    setTimeout(verifyAndFixStyles, 500);
    
    // Add a DOM observer to catch dynamically added elements
    setupDomObserver();
    
    // Re-verify on full page load
    window.addEventListener('load', function() {
      setTimeout(verifyAndFixStyles, 1000);
    });
  }

  // Load critical CSS stylesheet
  function loadCriticalStylesheet() {
    // Check if it's already loaded
    if (document.querySelector(`link[href*="${CONFIG.criticalCssPath}"]`)) {
      console.log('[CSS Injector] Critical CSS already loaded');
      return;
    }
    
    // Create link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${CONFIG.criticalCssPath}?v=${CONFIG.version}`;
    link.id = 'mcp-critical-css-injector';
    
    // Add onerror handler to inject direct CSS if loading fails
    link.onerror = function() {
      console.warn('[CSS Injector] Failed to load critical CSS stylesheet, injecting directly');
      injectDirectStyles();
    };
    
    // Append to head
    document.head.appendChild(link);
    console.log('[CSS Injector] Critical CSS injected');
  }

  // Inject styles directly
  function injectDirectStyles() {
    // Check if already injected
    if (document.getElementById('mcp-direct-css-injector')) {
      return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'mcp-direct-css-injector';
    style.textContent = DIRECT_CSS;
    
    // Append to head
    document.head.appendChild(style);
    console.log('[CSS Injector] Direct CSS injected');
  }

  // Verify critical styles are applied
  function verifyAndFixStyles() {
    console.log('[CSS Injector] Verifying critical styles...');
    
    // Create test element
    const testEl = document.createElement('div');
    testEl.style.position = 'absolute';
    testEl.style.visibility = 'hidden';
    testEl.style.pointerEvents = 'none';
    document.body.appendChild(testEl);
    
    // Check each critical class
    const missingClasses = [];
    
    CRITICAL_CLASSES.forEach(function(className) {
      testEl.className = className;
      const styles = window.getComputedStyle(testEl);
      
      let isApplied = false;
      
      // Check specific properties based on class
      if (className === 'bg-gradient-to-r') {
        isApplied = styles.backgroundImage.includes('gradient');
      } else if (className === 'text-transparent') {
        isApplied = styles.color === 'transparent' || styles.color === 'rgba(0, 0, 0, 0)';
      } else if (className === 'bg-clip-text') {
        isApplied = styles.webkitBackgroundClip === 'text' || styles.backgroundClip === 'text';
      } else if (className === 'feature-card') {
        isApplied = styles.display === 'flex' && styles.flexDirection === 'column';
      } else if (className === 'animate-fade-in-down') {
        isApplied = styles.animation !== 'none' && styles.animation !== '';
      } else if (className === 'from-purple-50') {
        isApplied = styles.getPropertyValue('--tw-gradient-from') !== '';
      } else if (className === 'to-white') {
        isApplied = styles.getPropertyValue('--tw-gradient-to') !== '';
      } else if (className === 'bg-grid-gray-100') {
        isApplied = styles.backgroundImage.includes('linear-gradient') && styles.backgroundImage.includes('linear-gradient');
      } else if (className === 'bg-blob-gradient') {
        isApplied = styles.backgroundImage.includes('radial-gradient');
      }
      
      if (!isApplied) {
        missingClasses.push(className);
      }
    });
    
    // Clean up test element
    document.body.removeChild(testEl);
    
    // Fix any missing styles
    if (missingClasses.length > 0) {
      console.warn('[CSS Injector] Missing critical classes:', missingClasses.join(', '));
      injectDirectStyles();
      applyElementSpecificFixes();
      
      // Set a flag to indicate that manual fixes were needed
      window.mcpCssManualFixesNeeded = true;
      
      return false;
    } else {
      console.log('[CSS Injector] All critical styles verified ✓');
      return true;
    }
  }

  // Apply direct style fixes to existing elements
  function applyElementSpecificFixes() {
    console.log('[CSS Injector] Applying element-specific fixes...');
    
    // Fix gradient text elements
    const gradientTexts = document.querySelectorAll('.bg-gradient-to-r.text-transparent.bg-clip-text');
    gradientTexts.forEach(function(el) {
      el.style.backgroundImage = 'linear-gradient(to right, rgb(124 58 237), rgb(79 70 229))';
      el.style.color = 'transparent';
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
    });
    
    // Fix feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(function(el) {
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.backgroundColor = 'white';
      el.style.borderRadius = '0.5rem';
      el.style.overflow = 'hidden';
      el.style.border = '1px solid rgba(0, 0, 0, 0.05)';
      el.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      el.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
  }

  // Set up DOM observer to catch dynamically added elements
  function setupDomObserver() {
    // Skip if MutationObserver is not available
    if (!window.MutationObserver) return;
    
    // Create observer
    const observer = new MutationObserver(function(mutations) {
      let needsFixes = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any feature-card or gradient text elements were added
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              if (
                node.classList && 
                (node.classList.contains('feature-card') || 
                 (node.classList.contains('bg-gradient-to-r') && 
                  node.classList.contains('text-transparent')))
              ) {
                needsFixes = true;
              }
              
              // Also check child elements
              if (node.querySelectorAll) {
                const gradientElements = node.querySelectorAll('.bg-gradient-to-r.text-transparent.bg-clip-text');
                const featureCards = node.querySelectorAll('.feature-card');
                
                if (gradientElements.length > 0 || featureCards.length > 0) {
                  needsFixes = true;
                }
              }
            }
          });
        }
      });
      
      // Apply fixes if needed
      if (needsFixes && window.mcpCssManualFixesNeeded) {
        console.log('[CSS Injector] DOM changed, applying fixes to new elements');
        applyElementSpecificFixes();
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('[CSS Injector] DOM observer initialized');
  }

  // Initialize immediately
  init();
  
  // Export for debugging and direct access
  window.mcpCssInjector = {
    verifyAndFixStyles: verifyAndFixStyles,
    injectDirectStyles: injectDirectStyles,
    applyElementSpecificFixes: applyElementSpecificFixes
  };
})();