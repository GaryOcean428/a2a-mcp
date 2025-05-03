/**
 * MCP Integration Platform - Critical CSS Verification Module
 * 
 * This module ensures that critical CSS is properly loaded and applied.
 * If styles are missing, it applies fallback styles directly.
 */

(function() {
  // Constants
  const VERIFICATION_INTERVAL = 3000; // Check every 3 seconds
  const CRITICAL_SELECTORS = [
    'bg-gradient-to-r',
    'text-transparent',
    'bg-clip-text',
    'feature-card',
    'from-purple-600',
    'to-indigo-600'
  ];

  // Start verification process
  function initVerification() {
    console.debug('[CSS Verify] Starting CSS verification module');
    
    // Check existing stylesheets
    logLoadedStylesheets();
    
    // Verify critical styles immediately
    verifyAndFixStyles();
    
    // Set up periodic verification
    setInterval(verifyAndFixStyles, VERIFICATION_INTERVAL);
  }

  // Log all loaded stylesheets for debugging
  function logLoadedStylesheets() {
    const sheets = document.styleSheets;
    console.debug(`[CSS Verify] Found ${sheets.length} stylesheets:`);
    
    for (let i = 0; i < sheets.length; i++) {
      try {
        console.debug(`[CSS Verify] - ${sheets[i].href || 'Inline style'}`);
      } catch (e) {
        console.debug(`[CSS Verify] - Could not access stylesheet ${i}`);
      }
    }
  }

  // Verify critical CSS and fix if needed
  function verifyAndFixStyles() {
    const missingSelectors = [];
    
    console.debug('[CSS Verify] Testing critical CSS classes:');
    
    // Check each critical selector
    CRITICAL_SELECTORS.forEach(selector => {
      const testElement = document.createElement('div');
      testElement.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
      testElement.className = selector;
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      let hasStyles = false;
      
      // Different checks for different selectors
      if (selector === 'bg-gradient-to-r') {
        hasStyles = computedStyle.backgroundImage.includes('linear-gradient');
      } else if (selector === 'text-transparent') {
        hasStyles = computedStyle.color === 'rgba(0, 0, 0, 0)' || computedStyle.color === 'transparent';
      } else if (selector === 'bg-clip-text') {
        hasStyles = computedStyle.webkitBackgroundClip === 'text' || computedStyle.backgroundClip === 'text';
      } else if (selector === 'feature-card') {
        hasStyles = computedStyle.borderRadius === '8px' || computedStyle.borderRadius === '0.5rem';
      } else if (selector.startsWith('from-') || selector.startsWith('to-')) {
        // Just check if any CSS variable related to gradients is set
        hasStyles = computedStyle.getPropertyValue('--tw-gradient-from') !== '' ||
                  computedStyle.getPropertyValue('--tw-gradient-to') !== '';
      }
      
      console.debug(`[CSS Verify] - ${selector}: ${hasStyles ? 'OK' : 'MISSING'}`);
      
      if (!hasStyles) {
        missingSelectors.push(selector);
      }
      
      document.body.removeChild(testElement);
    });
    
    // Apply fixes if needed
    if (missingSelectors.length > 0) {
      console.warn(`[CSS Verify] Some critical CSS classes are missing! [${missingSelectors.join(', ')}]`);
      applyFallbackStyles(missingSelectors);
    } else {
      console.debug('[CSS Verify] All critical CSS classes are properly loaded');
    }
  }

  // Apply fallback styles directly
  function applyFallbackStyles(missingSelectors) {
    console.log('[CSS Verify] Applying fallback styles for missing selectors:', missingSelectors);
    
    // Check if we already added the fallback styles
    if (document.getElementById('mcp-critical-fallback')) {
      console.debug('[CSS Verify] Fallback styles already applied');
      return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'mcp-critical-fallback';
    
    // Build fallback styles based on missing selectors
    let cssContent = '';
    
    if (missingSelectors.includes('bg-gradient-to-r')) {
      cssContent += `.bg-gradient-to-r {
        background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
      }
      `;
    }
    
    if (missingSelectors.includes('text-transparent')) {
      cssContent += `.text-transparent {
        color: transparent !important;
      }
      `;
    }
    
    if (missingSelectors.includes('bg-clip-text')) {
      cssContent += `.bg-clip-text {
        -webkit-background-clip: text !important;
        background-clip: text !important;
      }
      `;
    }
    
    if (missingSelectors.includes('feature-card')) {
      cssContent += `.feature-card {
        background-color: white !important;
        padding: 1.5rem !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        border: 1px solid rgba(229, 231, 235) !important;
        transition: all 0.3s ease !important;
      }
      
      .feature-card:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        border-color: rgba(167, 139, 250, 0.4) !important;
        transform: translateY(-5px) !important;
      }
      `;
    }
    
    if (missingSelectors.includes('from-purple-600')) {
      cssContent += `.from-purple-600 {
        --tw-gradient-from: #9333ea !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0)) !important;
      }
      `;
    }
    
    if (missingSelectors.includes('to-indigo-600')) {
      cssContent += `.to-indigo-600 {
        --tw-gradient-to: #4f46e5 !important;
      }
      `;
    }
    
    // Special direct fix for gradient text headings
    cssContent += `
    /* Direct fix for gradient headings */
    h1.bg-gradient-to-r.text-transparent.bg-clip-text,
    h2.bg-gradient-to-r.text-transparent.bg-clip-text,
    h3.bg-gradient-to-r.text-transparent.bg-clip-text,
    span.bg-gradient-to-r.text-transparent.bg-clip-text {
      background-image: linear-gradient(to right, #9333ea, #4f46e5) !important;
      color: transparent !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    `;
    
    style.textContent = cssContent;
    document.head.appendChild(style);
    
    console.log('[CSS Verify] Applied fallback styles successfully');
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVerification);
  } else {
    initVerification();
  }
})();
