/**
 * MCP Integration Platform - CSS Verification and Recovery System
 * 
 * This unified script ensures proper CSS rendering in both development and production environments.
 * It detects missing styles and automatically applies fixes when needed, making the UI resilient
 * against CSS issues.
 * 
 * Version: 1.0.0-${Date.now()}
 */

(function() {
  // Current version for cache-busting
  const VERSION = '1.0.0-' + Date.now();
  
  // Configuration
  const CONFIG = {
    debugMode: true,                   // Set to false in production
    autoFix: true,                     // Automatically fix CSS issues
    checkWebSockets: true,             // Test WebSocket connectivity
    cssRecoveryPath: '/assets/css/recovery.css', // Path to recovery CSS
    maxRetries: 3                      // Maximum retries for verification
  };
  
  // List of critical CSS classes that must be available
  const CRITICAL_CLASSES = [
    // Layout and background patterns
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'mcp-grid-pattern',
    'mcp-blob-gradient',
    'mcp-hero-gradient',
    
    // Component classes
    'feature-card',
    'mcp-card',
    'mcp-responsive-width',
    'mcp-container-responsive',
    'sidebar-fixed',
    'content-with-sidebar',
    
    // Animation and transition classes
    'animate-fade-in-down',
    'optimized-card-transition',
    'optimized-hover-transition',
    'mcp-optimized-transition',
    
    // Gradient classes
    'from-purple-50',
    'from-purple-600',
    'to-white',
    'to-indigo-600',
    'bg-gradient-to-r'
  ];

  // CSS to inject for recovery if critical classes are missing
  const RECOVERY_CSS = `
  /* MCP Emergency CSS Recovery (v${VERSION}) */
  
  /* Layout and structure */
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
  
  /* Component styles */
  .feature-card, .mcp-card {
    background-color: white !important;
    padding: 1.5rem !important;
    border-radius: 0.5rem !important;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
    overflow: hidden !important;
    position: relative !important;
    border: 1px solid rgba(229, 231, 235) !important;
    transition-property: transform, box-shadow, border-color !important;
    transition-duration: 300ms !important;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .feature-card:hover, .mcp-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    border-color: rgba(167, 139, 250, 0.4) !important;
    transform: translateY(-2px) !important;
  }
  
  /* Transition optimizations */
  .optimized-card-transition {
    transition-property: transform, box-shadow, border-color !important;
    transition-duration: 300ms !important;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .optimized-hover-transition {
    transition-property: color, background-color, opacity !important;
    transition-duration: 300ms !important;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .mcp-optimized-transition {
    transition-property: transform, box-shadow, border-color, color, background-color, opacity !important;
    transition-duration: 300ms !important;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  /* Backgrounds and patterns */
  .bg-grid-gray-100, .mcp-grid-pattern {
    background-image: 
      linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px) !important;
    background-size: 24px 24px !important;
  }
  
  .bg-blob-gradient, .mcp-blob-gradient {
    background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%) !important;
    filter: blur(50px) !important;
  }
  
  .mcp-hero-gradient {
    background-image: linear-gradient(to right, #a78bfa, #818cf8) !important;
    background-size: 200% 200% !important;
    animation: gradient-shift 15s ease infinite !important;
  }
  
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  /* Animations */
  @keyframes fadeInDown {
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
    animation: fadeInDown 0.5s ease-out !important;
  }
  
  /* Gradient utilities */
  .bg-gradient-to-r {
    background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
  }
  
  .from-purple-50 {
    --tw-gradient-from: #faf5ff !important;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0)) !important;
  }
  
  .from-purple-600 {
    --tw-gradient-from: #9333ea !important;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0)) !important;
  }
  
  .to-indigo-600 {
    --tw-gradient-to: #4f46e5 !important;
  }
  
  .to-white {
    --tw-gradient-to: #ffffff !important;
  }
  
  /* Responsive containers */
  .mcp-container-responsive {
    width: 100% !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
  
  @media (min-width: 640px) {
    .mcp-container-responsive {
      max-width: 640px !important;
      padding-left: 1.5rem !important;
      padding-right: 1.5rem !important;
    }
  }
  
  @media (min-width: 768px) {
    .mcp-container-responsive {
      max-width: 768px !important;
    }
  }
  
  @media (min-width: 1024px) {
    .mcp-container-responsive {
      max-width: 1024px !important;
      padding-left: 2rem !important;
      padding-right: 2rem !important;
    }
  }
  
  @media (min-width: 1280px) {
    .mcp-container-responsive {
      max-width: 1280px !important;
    }
  }
  
  /* Width utilities */
  .mcp-responsive-width {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  @media (min-width: 640px) {
    .mcp-responsive-width {
      max-width: 600px !important;
    }
  }
  
  @media (min-width: 768px) {
    .mcp-responsive-width {
      max-width: 720px !important;
    }
  }
  
  @media (min-width: 1024px) {
    .mcp-responsive-width {
      max-width: 980px !important;
    }
  }
  
  @media (min-width: 1280px) {
    .mcp-responsive-width {
      max-width: 1200px !important;
    }
  }
  `;

  // Defer execution until the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVerification);
  } else {
    initializeVerification();
  }
  
  /**
   * Initialize verification process
   */
  function initializeVerification() {
    logMessage('Starting CSS verification system', 'info');
    
    // Wait a bit to ensure stylesheets are loaded
    setTimeout(() => {
      runVerification();
      
      // Test WebSocket connectivity if enabled
      if (CONFIG.checkWebSockets) {
        testWebSocketConnection();
      }
    }, 500);
  }
  
  /**
   * Run the CSS verification process
   */
  function runVerification() {
    logMessage('Running CSS verification', 'info');
    
    // Check if critical inline styles are present
    const hasInlineStyles = checkInlineStyles();
    logMessage(`Critical inline styles present: ${hasInlineStyles}`, 'info');
    
    // Check if external stylesheets are loaded
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    logMessage(`External stylesheets loaded: ${stylesheets.length}`, 'info');
    
    Array.from(stylesheets).forEach(sheet => {
      logMessage(`- ${sheet.getAttribute('href')}`, 'info');
    });
    
    // Only try to create a test div if the body exists
    if (!document.body) {
      logMessage('Document body not available yet, will apply recovery', 'warn');
      if (CONFIG.autoFix) {
        applyRecoveryStyles();
      }
      return;
    }
    
    // Verify critical CSS classes
    const missingClasses = verifyCriticalClasses();
    
    // Apply recovery if needed
    if (missingClasses.length > 0) {
      logMessage(`Missing CSS classes: ${missingClasses.join(', ')}`, 'warn');
      if (CONFIG.autoFix) {
        applyRecoveryStyles();
      }
    } else {
      logMessage('All critical CSS classes verified ✓', 'success');
    }
    
    // Set up a retry mechanism for extra resilience
    if (CONFIG.autoFix) {
      // Check again after 2 seconds to ensure styles are applied
      setTimeout(() => {
        const stillMissingClasses = verifyCriticalClasses();
        if (stillMissingClasses.length > 0) {
          logMessage(`Still missing some CSS classes after recovery. Re-applying styles.`, 'warn');
          applyRecoveryStyles(true); // Force reapply
        }
      }, 2000);
    }
  }
  
  /**
   * Verify if critical CSS classes are properly applied
   * @returns {string[]} Array of missing class names
   */
  function verifyCriticalClasses() {
    // Create test element
    const testDiv = document.createElement('div');
    testDiv.id = 'mcp-css-test-element';
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    testDiv.style.pointerEvents = 'none';
    testDiv.style.left = '-9999px';
    document.body.appendChild(testDiv);
    
    const missingClasses = [];
    
    try {
      logMessage('Testing critical CSS classes:', 'info');
      
      CRITICAL_CLASSES.forEach(className => {
        testDiv.className = className;
        const style = window.getComputedStyle(testDiv);
        
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
          case 'from-purple-50':
          case 'from-purple-600':
            isStyled = style.getPropertyValue('--tw-gradient-from') !== '';
            break;
          case 'to-indigo-600':
          case 'to-white':
            isStyled = style.getPropertyValue('--tw-gradient-to') !== '';
            break;
          case 'bg-gradient-to-r':
            isStyled = style.backgroundImage.includes('linear-gradient');
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
        
        // Log the result
        logMessage(`- ${className}: ${isStyled ? 'OK' : 'MISSING'}`, isStyled ? 'info' : 'warn');
        
        if (!isStyled) {
          missingClasses.push(className);
        }
      });
    } catch (error) {
      logMessage(`Error during class verification: ${error.message}`, 'error');
    } finally {
      // Clean up
      if (testDiv.parentNode) {
        testDiv.parentNode.removeChild(testDiv);
      }
    }
    
    return missingClasses;
  }
  
  /**
   * Check if critical inline styles are present
   * @returns {boolean}
   */
  function checkInlineStyles() {
    const styleElements = document.querySelectorAll('style');
    
    for (const style of Array.from(styleElements)) {
      if (style.textContent && (
          style.textContent.includes('Critical styles for immediate rendering') ||
          style.textContent.includes('MCP Critical CSS') ||
          style.id === 'critical-css' ||
          style.id === 'mcp-critical-css'
      )) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Apply recovery CSS styles
   * @param {boolean} force - Force reapplication even if already present
   */
  function applyRecoveryStyles(force = false) {
    const existingRecovery = document.getElementById('mcp-css-recovery');
    
    if (existingRecovery && !force) {
      logMessage('Recovery styles already applied', 'info');
      return;
    }
    
    if (existingRecovery && force) {
      existingRecovery.parentNode.removeChild(existingRecovery);
    }
    
    try {
      // Add recovery CSS styles
      const styleElement = document.createElement('style');
      styleElement.id = 'mcp-css-recovery';
      styleElement.setAttribute('data-version', VERSION);
      styleElement.textContent = RECOVERY_CSS;
      document.head.appendChild(styleElement);
      
      logMessage('Applied CSS recovery styles', 'success');
      
      // Mark body with a data attribute to indicate recovery has been applied
      document.body.setAttribute('data-mcp-css-recovery', 'applied');
    } catch (error) {
      logMessage(`Error applying recovery styles: ${error.message}`, 'error');
    }
  }
  
  /**
   * Test WebSocket connection to ensure real-time functionality works
   */
  function testWebSocketConnection() {
    try {
      // Get the host from the current URL
      const host = window.location.host;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${host}/mcp-ws`;
      
      logMessage(`Testing WebSocket connection to ${wsUrl}`, 'info');
      
      const ws = new WebSocket(wsUrl);
      const timeoutId = setTimeout(() => {
        logMessage('WebSocket connection timed out after 5 seconds', 'warn');
        try { ws.close(); } catch (e) {}
      }, 5000);
      
      ws.onopen = function() {
        clearTimeout(timeoutId);
        logMessage('WebSocket connection successful', 'success');
        
        // Send a ping message
        try {
          ws.send(JSON.stringify({
            type: 'ping',
            data: { timestamp: Date.now() }
          }));
        } catch (e) {
          logMessage(`Error sending ping: ${e.message}`, 'error');
        }
        
        // Close the connection after 1 second
        setTimeout(() => {
          try { ws.close(); } catch (e) {}
        }, 1000);
      };
      
      ws.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          logMessage(`Received WebSocket message: ${data.type || 'unknown'}`, 'info');
        } catch (e) {
          logMessage(`Error parsing WebSocket message: ${e.message}`, 'error');
        }
      };
      
      ws.onerror = function(error) {
        clearTimeout(timeoutId);
        logMessage('WebSocket connection error', 'error');
      };
      
      ws.onclose = function(event) {
        clearTimeout(timeoutId);
        logMessage(`WebSocket connection closed: ${event.code} ${event.reason}`, 'info');
      };
    } catch (error) {
      logMessage(`Error setting up WebSocket test: ${error.message}`, 'error');
    }
  }
  
  /**
   * Log a message with consistent formatting
   * @param {string} message - The message to log
   * @param {string} level - Log level (info, warn, error, success)
   */
  function logMessage(message, level = 'info') {
    if (!CONFIG.debugMode && level === 'info') {
      return; // Skip info messages in non-debug mode
    }
    
    const prefix = '[CSS Verification]';
    
    switch (level) {
      case 'warn':
        console.warn(`${prefix} ${message}`);
        break;
      case 'error':
        console.error(`${prefix} ${message}`);
        break;
      case 'success':
        console.log(`%c${prefix} ${message}`, 'color: green; font-weight: bold;');
        break;
      case 'info':
      default:
        console.log(`${prefix} ${message}`);
    }
  }
})();
