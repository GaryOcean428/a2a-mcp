/**
 * MCP Integration Platform - CSS Verification and Recovery
 * 
 * This script runs a verification check for critical CSS classes
 * and automatically recovers missing styles if needed.
 */
(function() {
  // Version info for tracking
  const SCRIPT_VERSION = '1.0.0-' + Date.now();
  
  // List of critical CSS classes to verify
  const CRITICAL_CLASSES = [
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'feature-card',
    'animate-fade-in-down',
    'from-purple-50',
    'to-white',
    'bg-gradient-to-r',
    'mcp-card',
    'mcp-responsive-width',
    'mcp-container-responsive',
    'mcp-optimized-transition',
    'mcp-grid-pattern',
    'mcp-blob-gradient',
    'mcp-hero-gradient',
    'optimized-card-transition',
    'optimized-hover-transition',
    'sidebar-fixed',
    'content-with-sidebar'
  ];
  
  // Critical CSS to inject if verification fails
  const CRITICAL_CSS = `
    /* MCP Critical CSS Recovery (Version: ${SCRIPT_VERSION}) */
    .sidebar-fixed {
      width: 100%;
      max-width: 280px;
      flex-shrink: 0;
    }
    
    .content-with-sidebar {
      width: 100%;
      max-width: calc(100% - 280px);
      margin-left: auto;
    }
    
    @media (max-width: 768px) {
      .sidebar-fixed {
        max-width: 100%;
      }
      
      .content-with-sidebar {
        max-width: 100%;
      }
    }
    
    .mcp-card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      overflow: hidden;
      position: relative;
      transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
      border: 1px solid transparent;
    }
    
    .mcp-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
      border-color: rgba(124, 58, 237, 0.1);
    }
    
    .mcp-optimized-transition {
      transition-property: transform, box-shadow, border-color, color, background-color, opacity;
      transition-duration: 300ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .mcp-container-responsive {
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }
    
    .mcp-hero-gradient {
      background-image: linear-gradient(to right, #a78bfa, #818cf8);
      background-size: 200% 200%;
      animation: gradient-shift 15s ease infinite;
    }
    
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .mcp-grid-pattern {
      background-image: 
        linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    
    .mcp-blob-gradient {
      background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
      filter: blur(50px);
    }
  `;
  
  // Initialize verification on page load
  function initializeVerification() {
    console.log('[CSS Verify] Starting verification...');
    
    // Wait for styles to load
    setTimeout(runVerification, 1000);
    
    // Also run WebSocket connection test
    setTimeout(verifyWebSocketConnection, 2000);
  }
  
  // Test WebSocket connection
  function verifyWebSocketConnection() {
    try {
      // Get the host from the current URL
      const host = window.location.host;
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Create WebSocket connection to the /mcp-ws endpoint
      console.log(`[WebSocket Test] Testing connection to ${wsProtocol}//${host}/mcp-ws`);
      const ws = new WebSocket(`${wsProtocol}//${host}/mcp-ws`);
      
      // Set up event handlers
      ws.onopen = function() {
        console.log('[WebSocket Test] Connection test successful');
        setTimeout(() => {
          ws.close();
        }, 500);
      };
      
      ws.onerror = function(error) {
        console.error('[WebSocket Test] Connection failed:', error);
      };
    } catch (error) {
      console.error('[WebSocket Test] Error creating connection:', error);
    }
  }
  
  // Main verification function
  function runVerification() {
    console.log('[CSS Verify] Running verification...');
    
    // Check for inline critical styles
    const hasInlineStyles = checkInlineStyles();
    console.log('[CSS Verify] Critical inline styles present:', hasInlineStyles);
    
    // Check external stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    console.log('[CSS Verify] External stylesheets loaded:', stylesheets.length);
    Array.from(stylesheets).forEach(sheet => {
      console.log('[CSS Verify] -', sheet.getAttribute('href'));
    });
    
    // Test critical classes
    console.log('[CSS Verify] Testing critical CSS classes:');
    const missingClasses = [];
    
    CRITICAL_CLASSES.forEach(className => {
      const isPresent = verifyClass(className);
      console.log(`[CSS Verify] -`, `${className}:`, isPresent ? 'OK' : 'MISSING');
      
      if (!isPresent) {
        missingClasses.push(className);
      }
    });
    
    // Inject CSS if needed
    if (missingClasses.length > 0) {
      console.warn('[CSS Verify] Missing classes detected:', missingClasses.join(', '));
      injectCriticalCSS();
      console.log('[CSS Verify] Injected recovery CSS');
    } else {
      console.log('[CSS Verify] All critical CSS classes verified ✓');
    }
    
    // Run another check after a few seconds to ensure everything is still working
    setTimeout(() => {
      const recoverFunction = window.recoverMissingStyles;
      if (typeof recoverFunction === 'function') {
        recoverFunction();
      }
    }, 5000);
  }
  
  // Check if a specific CSS class is properly styled
  function verifyClass(className) {
    // Create a test element with the class
    const testElement = document.createElement('div');
    testElement.className = className;
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.pointerEvents = 'none';
    document.body.appendChild(testElement);
    
    // Get computed style
    const style = window.getComputedStyle(testElement);
    
    // Check if the class has any effect on the element
    let isStyled = false;
    
    // Class-specific checks
    switch (className) {
      case 'bg-grid-gray-100':
      case 'mcp-grid-pattern':
        isStyled = style.backgroundImage !== 'none';
        break;
      case 'bg-blob-gradient':
      case 'mcp-blob-gradient':
        isStyled = style.backgroundImage !== 'none' && style.filter !== 'none';
        break;
      case 'feature-card':
      case 'mcp-card':
        isStyled = style.backgroundColor === 'rgb(255, 255, 255)' || 
                  style.boxShadow !== 'none' || 
                  style.borderRadius !== '0px';
        break;
      case 'animate-fade-in-down':
        isStyled = style.animationName !== 'none';
        break;
      case 'sidebar-fixed':
        isStyled = style.flexShrink === '0';
        break;
      case 'content-with-sidebar':
        isStyled = style.marginLeft === 'auto';
        break;
      default:
        // Generic check for any styling effect
        isStyled = (
          style.color !== 'rgb(0, 0, 0)' ||
          style.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
          style.borderRadius !== '0px' ||
          style.margin !== '0px' ||
          style.padding !== '0px' ||
          style.transform !== 'none' ||
          style.opacity !== '1' ||
          style.backgroundImage !== 'none' ||
          style.boxShadow !== 'none' ||
          style.transition !== 'all 0s ease 0s'
        );
    }
    
    // Clean up
    document.body.removeChild(testElement);
    
    return isStyled;
  }
  
  // Check if critical inline styles are present in the document
  function checkInlineStyles() {
    const styleElements = document.querySelectorAll('style');
    let hasCriticalStyles = false;
    
    for (const style of Array.from(styleElements)) {
      if (style.textContent && (
          style.textContent.includes('MCP Critical CSS') ||
          style.textContent.includes('Critical styles for immediate rendering')
      )) {
        hasCriticalStyles = true;
        break;
      }
    }
    
    return hasCriticalStyles;
  }
  
  // Inject critical CSS as a fallback
  function injectCriticalCSS() {
    // Create style element for critical CSS
    const existingRecovery = document.getElementById('mcp-css-recovery');
    if (existingRecovery) {
      existingRecovery.remove();
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'mcp-css-recovery';
    styleElement.setAttribute('data-source', 'css-verify.js');
    styleElement.setAttribute('data-version', SCRIPT_VERSION);
    styleElement.textContent = CRITICAL_CSS;
    
    // Add to head
    document.head.appendChild(styleElement);
    
    console.log('[CSS Recovery] Critical styles injected at', new Date().toISOString());
  }
  
  // Export the recover function to the window object
  window.mcpVerifyCss = runVerification;
  window.mcpInjectCss = injectCriticalCSS;
  
  // Load CSS verification when the page is fully loaded
  if (document.readyState === 'complete') {
    initializeVerification();
  } else {
    window.addEventListener('load', initializeVerification);
  }
})();
