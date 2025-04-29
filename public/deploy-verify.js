/**
 * MCP Integration Platform - CSS Verification and Recovery
 * This script ensures critical CSS classes are properly loaded in production
 * 
 * Version: 2.5.1745966444403
 */

(function() {
  // Defer execution until the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVerification);
  } else {
    initializeVerification();
  }
  
  function initializeVerification() {
    console.log('[CSS Verify] Starting verification...');
    
    // Wait a bit to ensure stylesheets are loaded
    setTimeout(function() {
      runVerification();
    }, 100);
  }
  
  function runVerification() {
    console.log('[CSS Verify] Running verification...');
    
    // Check if critical inline styles are present
    const hasInlineStyles = document.querySelector('style#critical-css') !== null;
    console.log("[CSS Verify] Critical inline styles present:", hasInlineStyles);
    
    // Check if external stylesheets are loaded
    const externalStyles = document.querySelectorAll('link[rel="stylesheet"]');
    console.log("[CSS Verify] External stylesheets loaded:", externalStyles.length);
    
    for (let i = 0; i < externalStyles.length; i++) {
      console.log("[CSS Verify] -", externalStyles[i].href);
    }
    
    // List of critical CSS classes to verify
    const criticalClasses = [
      'bg-grid-gray-100',
      'bg-blob-gradient',
      'feature-card',
      'animate-fade-in-down',
      'from-purple-50',
      'to-white',
      'bg-gradient-to-r'
    ];
    
    // Early recovery if we don't have inline styles or external stylesheet
    if (!hasInlineStyles || externalStyles.length === 0) {
      console.log("[CSS Verify] Missing critical styles, applying recovery immediately");
      loadCssRecovery();
      return;
    }
    
    // Only try to create a test div if the body exists
    if (!document.body) {
      console.log("[CSS Verify] Document body not available yet, applying recovery as precaution");
      loadCssRecovery();
      return;
    }
    
    // Create test element
    const testDiv = document.createElement('div');
    testDiv.id = 'css-test-element';
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    testDiv.style.pointerEvents = 'none';
    testDiv.style.left = '-9999px';
    document.body.appendChild(testDiv);
    
    try {
      // Check each class
      console.log("[CSS Verify] Testing critical CSS classes:");
      const missingClasses = [];
      
      criticalClasses.forEach(className => {
        testDiv.className = className;
        const style = window.getComputedStyle(testDiv);
        
        // Simplified detection - just check for any applied style
        const isStyled = (
          style.backgroundImage !== 'none' || 
          style.animation !== 'none' ||
          style.boxShadow !== 'none' ||
          style.getPropertyValue('--tw-gradient-from') !== ''
        );
        
        console.log("[CSS Verify] -", className + ":", isStyled ? "OK" : "MISSING");
        
        if (!isStyled) {
          missingClasses.push(className);
        }
      });
      
      // Clean up
      document.body.removeChild(testDiv);
      
      // Load CSS recovery if needed
      if (missingClasses.length > 0) {
        console.log("[CSS Verify] Missing classes detected:", missingClasses);
        loadCssRecovery();
      } else {
        console.log("[CSS Verify] All critical CSS classes verified ✓");
      }
    } catch (error) {
      // If any errors occur during testing, apply recovery as a precaution
      console.error("[CSS Verify] Error during verification:", error);
      
      // Clean up if possible
      if (testDiv.parentNode) {
        testDiv.parentNode.removeChild(testDiv);
      }
      
      loadCssRecovery();
    }
  }
  
  function loadCssRecovery() {
    console.log("[CSS Verify] Loading CSS recovery...");
    
    // Don't apply recovery twice
    if (document.getElementById('mcp-css-recovery')) {
      console.log("[CSS Verify] Recovery already applied");
      return;
    }
    
    try {
      // Add reference to production CSS if not already present
      if (document.querySelector('link[href*="production.css"]') === null) {
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.id = 'mcp-css-recovery-link';
        linkEl.href = '/production.css?v=2.5.1745966444403';
        document.head.appendChild(linkEl);
        console.log("[CSS Verify] Added production.css link");
      }
      
      // Add critical inline styles
      const styleEl = document.createElement('style');
      styleEl.id = 'mcp-css-recovery';
      styleEl.textContent = `
      /* MCP Emergency CSS Recovery */
      .feature-card {
        background-color: white !important;
        padding: 1.5rem !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        border: 1px solid #f3f4f6 !important;
        transition: all 0.3s ease !important;
      }
      
      .feature-card:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        border-color: #e9d5ff !important;
        transform: translateY(-2px) !important;
      }
      
      @keyframes mcp-fade-in-down {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fade-in-down {
        animation: mcp-fade-in-down 0.5s ease-out !important;
      }
      
      .bg-gradient-to-r {
        background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
      }
      
      .bg-grid-gray-100 {
        background-image: 
          linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px) !important;
        background-size: 24px 24px !important;
      }
      
      .bg-blob-gradient {
        background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%) !important;
        filter: blur(50px) !important;
      }
      
      .from-purple-50 {
        --tw-gradient-from: #faf5ff !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0)) !important;
      }
      
      .via-indigo-50 {
        --tw-gradient-via: #eef2ff !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to, rgba(238, 242, 255, 0)) !important;
      }
      
      .to-white {
        --tw-gradient-to: #ffffff !important;
      }
      `;
      
      document.head.appendChild(styleEl);
      console.log("[CSS Verify] Added emergency CSS recovery styles");
      
    } catch (error) {
      console.error("[CSS Verify] Error during recovery:", error);
    }
  }
})();