/**
 * MCP Integration Platform - CSS Recovery System
 * 
 * This system ensures that critical CSS classes are available even when TailwindCSS
 * purges them in production builds. It detects missing styles and applies fixes automatically.
 * 
 * Version: 1.0.0
 */

(function() {
  // Configuration
  const VERSION = '1.0.0';
  const RECOVERY_CSS_PATH = '/css/unified-critical.css';
  const VERIFICATION_INTERVAL = 5000; // 5 seconds
  
  // Critical CSS classes that must be present
  const CRITICAL_CLASSES = [
    'bg-gradient-to-r',
    'text-transparent',
    'bg-clip-text',
    'animate-fade-in-down',
    'feature-card',
    'from-purple-50',
    'to-white',
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'animate-in',
    'duration-300'
  ];
  
  // Initialize the recovery system
  function initialize() {
    console.log(`[CSS Recovery] Initializing (v${VERSION})`);
    
    // Check if critical styles are present inline (best case)
    const hasCriticalInlineStyles = checkInlineStyles();
    console.log(`[CSS Recovery] Critical inline styles present: ${hasCriticalInlineStyles}`);
    
    // Verify critical classes are available
    verifyAndFixStyles();
    
    // Setup periodic verification
    setInterval(() => {
      verifyAndFixStyles();
    }, VERIFICATION_INTERVAL);
  }
  
  // Check if inline critical styles are present in document head
  function checkInlineStyles() {
    const styleElements = document.head.querySelectorAll('style');
    
    for (const style of Array.from(styleElements)) {
      // Check for critical style markers
      if (style.textContent.includes('/* === Critical CSS === */') ||
          style.textContent.includes('bg-gradient-to-r') ||
          style.textContent.includes('feature-card')) {
        return true;
      }
    }
    
    return false;
  }
  
  // Verify all critical CSS classes and fix any issues
  function verifyAndFixStyles() {
    console.log('[CSS Recovery] Verifying styles...');
    
    // Create a test element to verify styles
    const testEl = document.createElement('div');
    testEl.style.position = 'absolute';
    testEl.style.visibility = 'hidden';
    testEl.style.pointerEvents = 'none';
    document.body.appendChild(testEl);
    
    // Check each critical class
    const missingClasses = [];
    
    for (const className of CRITICAL_CLASSES) {
      testEl.className = className;
      
      // Get computed styles
      const computedStyle = window.getComputedStyle(testEl);
      
      // Check if the class is properly applied by testing specific properties
      // This is a simple heuristic - may need to be improved for specific classes
      let isApplied = false;
      
      if (className.startsWith('bg-gradient')) {
        isApplied = computedStyle.backgroundImage.includes('linear-gradient') || 
                   computedStyle.backgroundImage.includes('radial-gradient');
      } else if (className === 'text-transparent') {
        isApplied = computedStyle.color === 'rgba(0, 0, 0, 0)' || 
                   computedStyle.color === 'transparent';
      } else if (className === 'bg-clip-text') {
        isApplied = computedStyle.webkitBackgroundClip === 'text' || 
                   computedStyle.backgroundClip === 'text';
      } else if (className === 'feature-card') {
        isApplied = computedStyle.display === 'flex' && 
                   computedStyle.flexDirection === 'column';
      } else if (className.startsWith('animate-')) {
        isApplied = computedStyle.animationName !== 'none' && 
                   computedStyle.animationName !== '';
      } else if (className.startsWith('duration-')) {
        isApplied = computedStyle.transitionDuration !== '0s' && 
                   computedStyle.transitionDuration !== '';
      } else {
        // For other classes, assume they're applied if any non-default style is set
        isApplied = (computedStyle.color !== '' && computedStyle.color !== 'rgb(0, 0, 0)') || 
                   (computedStyle.backgroundColor !== '' && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') || 
                   (computedStyle.borderWidth !== '' && computedStyle.borderWidth !== '0px');
      }
      
      if (!isApplied) {
        missingClasses.push(className);
      }
    }
    
    // Clean up test element
    document.body.removeChild(testEl);
    
    // If there are missing classes, load the recovery CSS
    if (missingClasses.length > 0) {
      console.warn(`[CSS Recovery] Missing critical styles: ${missingClasses.join(', ')}`);
      injectRecoveryCss();
    }
  }
  
  // Inject the recovery CSS if needed
  function injectRecoveryCss() {
    // Check if the recovery CSS is already loaded
    const existingLink = document.querySelector(`link[href*="${RECOVERY_CSS_PATH}"]`);
    if (existingLink) {
      // Already loaded, no need to add it again
      console.info('[CSS Recovery] Critical styles injected ✓');
      return;
    }
    
    try {
      // Add the recovery CSS
      const recoveryLink = document.createElement('link');
      recoveryLink.rel = 'stylesheet';
      recoveryLink.href = `${RECOVERY_CSS_PATH}?v=${VERSION}-${Date.now()}`;
      recoveryLink.setAttribute('data-recovery', 'true');
      document.head.appendChild(recoveryLink);
      
      console.info('[CSS Recovery] Critical styles injected ✓');
      
      // Apply direct CSS fixes for immediate effect
      applyDirectStyleFixes();
    } catch (err) {
      console.error('[CSS Recovery] Failed to load recovery styles', err);
      
      // As a fallback, inject inline styles
      injectInlineRecoveryStyles();
    }
  }
  
  // Apply direct style fixes to elements for immediate effect
  function applyDirectStyleFixes() {
    console.log('[StyleFixer] Applying direct CSS fixes...');
    
    // Fix gradient text elements
    const gradientTextElements = document.querySelectorAll('.bg-gradient-to-r.text-transparent.bg-clip-text');
    gradientTextElements.forEach(el => {
      el.style.backgroundImage = 'linear-gradient(to right, rgb(124 58 237), rgb(79 70 229))';
      el.style.color = 'transparent';
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
    });
    
    // Fix feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(el => {
      el.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.backgroundColor = 'white';
      el.style.borderRadius = '0.5rem';
      el.style.overflow = 'hidden';
      el.style.border = '1px solid rgba(0, 0, 0, 0.05)';
      el.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    });
    
    console.log('[StyleFixer] Finished applying direct CSS fixes.');
  }
  
  // Inject critical styles inline as a last resort
  function injectInlineRecoveryStyles() {
    const style = document.createElement('style');
    style.setAttribute('id', 'critical-inline-recovery');
    style.setAttribute('data-recovery', 'inline');
    
    // Minimal set of critical styles
    style.textContent = `
    /* === Critical CSS === */
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops));
    }
    .text-transparent {
      color: transparent;
    }
    .bg-clip-text {
      -webkit-background-clip: text;
      background-clip: text;
    }
    .feature-card {
      display: flex;
      flex-direction: column;
      background-color: white;
      border-radius: 0.5rem;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .animate-fade-in-down {
      animation: fadeInDown 0.5s ease-in-out forwards;
    }
    @keyframes fadeInDown {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-in {
      animation-duration: 150ms;
      animation-timing-function: cubic-bezier(0.1, 0.99, 0.1, 0.99);
      animation-fill-mode: both;
    }
    .duration-300 {
      transition-duration: 300ms;
    }
    `;
    
    document.head.appendChild(style);
    console.info('[CSS Recovery] Injected inline critical CSS as fallback');
  }
  
  // Expose the recovery system to the global scope
  window.cssRecoverySystem = {
    VERSION,
    verifyAndFixStyles,
    injectRecoveryCss,
    applyDirectStyleFixes
  };
  
  // Initialize on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // Already loaded
    initialize();
  }
})();
