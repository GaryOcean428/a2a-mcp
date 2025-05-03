/**
 * MCP Integration Platform - CSS Recovery System
 * 
 * This system ensures that critical CSS classes are applied correctly
 * even when the main stylesheets fail to load or are incorrectly purged.
 * It provides runtime verification and automatic recovery.
 * 
 * Version: 1.0.0
 */

(function() {
  // Configuration
  const CRITICAL_CLASSES = [
    'bg-gradient-to-r',
    'text-transparent',
    'bg-clip-text',
    'feature-card',
    'animate-fade-in-down'
  ];
  
  // Emergency CSS to inject if styles are missing
  const EMERGENCY_CSS = `
    /* Emergency styles for critical classes */
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
    
    .animate-fade-in-down {
      animation: fadeInDownRecovery 0.5s ease-out !important;
    }
    
    @keyframes fadeInDownRecovery {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Gradient text styles */
    span.bg-gradient-to-r.text-transparent.bg-clip-text,
    h1.bg-gradient-to-r.text-transparent.bg-clip-text,
    h2.bg-gradient-to-r.text-transparent.bg-clip-text,
    h3.bg-gradient-to-r.text-transparent.bg-clip-text {
      background-image: linear-gradient(to right, #9333ea, #4f46e5) !important;
      color: transparent !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    
    /* From-To Colors */
    .from-purple-600 {
      --tw-gradient-from: #9333ea !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0)) !important;
    }
    
    .to-indigo-600 {
      --tw-gradient-to: #4f46e5 !important;
    }
  `;
  
  // State tracking
  let recoveryApplied = false;
  let inlineStylesVerified = false;
  
  /**
   * Initialize the recovery system
   */
  function initialize() {
    // Start checking for styles
    console.log('%c[CSS Recovery] Initializing CSS recovery system', 'color: green');
    
    // Check and verify styles
    checkAndVerify();
    
    // Set up periodic checks
    setInterval(checkAndVerify, 5000);
    
    // Also check when DOM changes
    observeDomChanges();
  }
  
  /**
   * Check critical CSS and verify styles
   */
  function checkAndVerify() {
    // First check if inline styles are present
    inlineStylesVerified = checkInlineStyles();
    console.debug('[CSS Recovery] Verifying styles...');
    console.debug('[CSS Recovery] Critical inline styles present:', inlineStylesVerified);
    
    // Then verify all critical classes
    verifyAndFixStyles();
  }
  
  /**
   * Check if critical inline styles are present in the document
   */
  function checkInlineStyles() {
    const criticalStyleTags = document.querySelectorAll('style#mcp-critical-css, style#critical-css, style#emergency-critical-css');
    return criticalStyleTags.length > 0;
  }
  
  /**
   * Verify critical CSS classes and fix if needed
   */
  function verifyAndFixStyles() {
    // Create test element to check styles
    const testEl = document.createElement('div');
    testEl.style.position = 'absolute';
    testEl.style.visibility = 'hidden';
    document.body.appendChild(testEl);
    
    // Check each critical class
    const missingClasses = [];
    
    CRITICAL_CLASSES.forEach(className => {
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
    
    // Clean up test element
    document.body.removeChild(testEl);
    
    // If there are missing classes, apply the recovery
    if (missingClasses.length > 0) {
      console.warn('[CSS Recovery] Missing critical styles:', missingClasses.join(', '));
      injectRecoveryCss();
      applyDirectStyleFixes();
      console.info('[CSS Recovery] Critical styles injected ✓');
    }
  }
  
  /**
   * Inject recovery CSS directly into the document
   */
  function injectRecoveryCss() {
    // Don't inject multiple times
    if (recoveryApplied && document.getElementById('mcp-recovery-css')) {
      return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'mcp-recovery-css';
    style.textContent = EMERGENCY_CSS;
    
    // Add to head
    document.head.appendChild(style);
    recoveryApplied = true;
    
    console.debug('%c[CSS Recovery] Injecting critical styles', 'color: blue');
  }
  
  /**
   * Apply direct style fixes to elements
   */
  function applyDirectStyleFixes() {
    console.log('[StyleFixer] DOM changed, reapplying CSS fixes...');
    console.log('[StyleFixer] Applying direct CSS fixes...');
    
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
      el.style.padding = '1.5rem';
      el.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
      el.style.border = '1px solid rgba(229, 231, 235)';
      el.style.transition = 'all 0.3s ease';
    });
    
    console.log('[StyleFixer] Finished applying direct CSS fixes.');
  }
  
  /**
   * Observe DOM changes to apply styles to new elements
   */
  function observeDomChanges() {
    // Create an observer to watch for DOM changes
    const observer = new MutationObserver(mutations => {
      // Only apply fixes if we needed recovery
      if (recoveryApplied) {
        applyDirectStyleFixes();
      }
    });
    
    // Start observing the document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // Already loaded
    initialize();
  }
  
  // Also initialize on window load to catch late styles
  window.addEventListener('load', () => {
    // Second check after everything is loaded
    setTimeout(checkAndVerify, 500);
  });
  
  // Expose API for direct use
  window.mcpCssRecovery = {
    checkAndVerify,
    injectRecoveryCss,
    applyDirectStyleFixes
  };
})();
