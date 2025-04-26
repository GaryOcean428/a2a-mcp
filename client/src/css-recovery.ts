/**
 * MCP Integration Platform - CSS Recovery System
 * 
 * This module provides runtime recovery for critical CSS classes
 * that might be missing in production due to aggressive purging.
 * 
 * It works by:
 * 1. Checking if critical CSS classes are properly applied
 * 2. Immediately injecting missing styles when detected
 * 3. Serving as a fallback mechanism in production
 */

/**
 * Immediately Invoked Function Expression for CSS recovery
 * This runs as soon as the script is loaded, without waiting for React
 */
(function() {
  // List of critical styles that must be preserved
  const CRITICAL_STYLES: {[key: string]: string} = {
    // Grid and background styles
    'bg-grid-gray-100': `
      .bg-grid-gray-100 {
        background-image: 
          linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        background-size: 24px 24px;
      }
    `,
    
    'bg-blob-gradient': `
      .bg-blob-gradient {
        background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
        filter: blur(50px);
      }
    `,
    
    // Card styles
    'feature-card': `
      .feature-card {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(229, 231, 235);
        transition: all 0.3s;
      }
      
      .feature-card:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        border-color: rgba(167, 139, 250, 0.4);
        transform: translateY(-2px);
      }
    `,
    
    // Animation styles
    'animate-fade-in-down': `
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
        animation: fadeInDown 0.5s ease-out;
      }
    `,
    
    // Gradient backgrounds
    'from-purple-50': `
      .from-purple-50 {
        --tw-gradient-from: #faf5ff;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
      }
    `,
    
    'via-indigo-50': `
      .via-indigo-50 {
        --tw-gradient-via: #eef2ff;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to);
      }
    `,
    
    'to-white': `
      .to-white {
        --tw-gradient-to: #ffffff;
      }
    `,
    
    // Group hover effects
    'group-hover:scale-110': `
      .group-hover\\:scale-110 {
        transition: transform 0.3s ease-out;
      }
      .group:hover .group-hover\\:scale-110 {
        transform: scale(1.1);
      }
    `,
    
    'group-hover:opacity-100': `
      .group-hover\\:opacity-100 {
        transition: opacity 0.3s ease-out;
      }
      .group:hover .group-hover\\:opacity-100 {
        opacity: 1;
      }
    `,
    
    // Hover effects
    'hover:shadow-lg': `
      .hover\\:shadow-lg:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
    `,
    
    'hover:border-purple-200': `
      .hover\\:border-purple-200:hover {
        border-color: rgba(221, 214, 254, 1);
      }
    `,
    
    'hover:translate-y-[-2px]': `
      .hover\\:translate-y-\\[-2px\\]:hover {
        transform: translateY(-2px);
      }
    `,
    
    // Text colors on hover
    'group-hover:text-purple-700': `
      .group-hover\\:text-purple-700 {
        transition: color 0.3s ease-out;
      }
      .group:hover .group-hover\\:text-purple-700 {
        color: rgba(126, 34, 206, 1);
      }
    `,
    
    'group-hover:text-indigo-700': `
      .group-hover\\:text-indigo-700 {
        transition: color 0.3s ease-out;
      }
      .group:hover .group-hover\\:text-indigo-700 {
        color: rgba(67, 56, 202, 1);
      }
    `,
    
    'group-hover:text-violet-700': `
      .group-hover\\:text-violet-700 {
        transition: color 0.3s ease-out;
      }
      .group:hover .group-hover\\:text-violet-700 {
        color: rgba(109, 40, 217, 1);
      }
    `,
  };

  // Check if a CSS class is properly applied
  function testClass(className: string): boolean {
    try {
      // Create a test div with the class
      const testDiv = document.createElement('div');
      document.body.appendChild(testDiv);
      testDiv.className = className;
      
      // Get computed style
      const computedStyle = window.getComputedStyle(testDiv);
      
      // Different classes need different tests
      let result = false;
      
      // Each class type needs a specific test
      if (className === 'bg-grid-gray-100') {
        result = computedStyle.backgroundImage.includes('linear-gradient');
      } else if (className === 'bg-blob-gradient') {
        result = computedStyle.backgroundImage.includes('radial-gradient');
      } else if (className === 'feature-card') {
        result = computedStyle.transition.includes('all') || computedStyle.boxShadow !== 'none';
      } else if (className === 'animate-fade-in-down') {
        result = computedStyle.animation.includes('fadeInDown') || computedStyle.animation !== 'none';
      } else if (className.startsWith('from-') || className.startsWith('via-') || className.startsWith('to-')) {
        // @ts-ignore - We're handling CSS custom properties
        result = computedStyle.getPropertyValue('--tw-gradient-from') !== '' || 
                // @ts-ignore - We're handling CSS custom properties
                computedStyle.getPropertyValue('--tw-gradient-via') !== '' ||
                // @ts-ignore - We're handling CSS custom properties
                computedStyle.getPropertyValue('--tw-gradient-to') !== '';
      } else if (className.includes('hover:') || className.includes('group-hover:')) {
        // We can't fully test these dynamic styles - just check if transition is set
        result = computedStyle.transition !== 'none' && computedStyle.transition !== '';
      } else {
        // Default test for any class - just check if it's parsed by seeing if it affects the element
        const defaultDiv = document.createElement('div');
        document.body.appendChild(defaultDiv);
        const defaultStyle = window.getComputedStyle(defaultDiv);
        
        result = false;
        for (let prop in computedStyle) {
          if (
            typeof prop === 'string' && 
            !prop.startsWith('webkit') && 
            computedStyle[prop as any] !== defaultStyle[prop as any]
          ) {
            result = true;
            break;
          }
        }
        
        document.body.removeChild(defaultDiv);
      }
      
      // Clean up
      document.body.removeChild(testDiv);
      return result;
    } catch (error) {
      console.error('[CSS Recovery] Error testing class', className, error);
      return false;
    }
  }

  // Inject missing styles
  function injectStyles(styles: string): void {
    const styleEl = document.createElement('style');
    styleEl.id = 'mcp-css-recovery';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    console.log('[CSS Recovery] Injected missing styles');
  }

  // Check for missing styles and inject them
  function recoverMissingStyles(): void {
    console.log('[CSS Recovery] Checking for missing styles...');
    
    // Get classes that need to be tested
    const classesToTest = Object.keys(CRITICAL_STYLES);
    
    // Test each class
    const missingClasses = classesToTest.filter(cls => !testClass(cls));
    
    // If any classes are missing, inject their styles
    if (missingClasses.length > 0) {
      console.warn('[CSS Recovery] Missing critical CSS classes:', missingClasses);
      
      // Combine all missing styles
      const styles = missingClasses.map(cls => CRITICAL_STYLES[cls]).join('\n');
      
      // Inject styles
      injectStyles(styles);
      
      // Log with a visible marker
      console.log('%c[CSS Recovery] Fixed missing styles', 'background: #4c1d95; color: white; padding: 2px 4px; border-radius: 2px;');
    } else {
      console.log('[CSS Recovery] All critical styles verified ✓');
    }
  }

  // Always run - it's critical to have consistent UI everywhere
  // If in development mode, only run verification without fixing unless explicitly requested
  const shouldFix = process.env.NODE_ENV === 'production' || 
                   window.location.search.includes('fix-css=true') ||
                   window.location.hostname.includes('replit.app');

  // Run immediately for fastest possible recovery
  // Check if document is already loaded
  if (document.readyState === 'complete') {
    if (shouldFix) {
      recoverMissingStyles();
    } else {
      // In development, just verify but don't fix automatically
      console.log('[CSS Recovery] Development mode - only verifying styles');
      const missingClasses = Object.keys(CRITICAL_STYLES).filter(cls => !testClass(cls));
      if (missingClasses.length > 0) {
        console.warn('[CSS Recovery] Found missing styles in development:', missingClasses);
        console.log('[CSS Recovery] Add ?fix-css=true to URL to auto-fix');
      } else {
        console.log('[CSS Recovery] All styles verified in development ✓');
      }
    }
  } else {
    // Otherwise wait for the document to load
    window.addEventListener('load', () => {
      // Small delay to ensure all styles are loaded
      setTimeout(() => {
        if (shouldFix) {
          recoverMissingStyles();
        } else {
          // In development, just verify
          console.log('[CSS Recovery] Development mode - only verifying styles');
          const missingClasses = Object.keys(CRITICAL_STYLES).filter(cls => !testClass(cls));
          if (missingClasses.length > 0) {
            console.warn('[CSS Recovery] Found missing styles in development:', missingClasses);
            console.log('[CSS Recovery] Add ?fix-css=true to URL to auto-fix');
          } else {
            console.log('[CSS Recovery] All styles verified in development ✓');
          }
        }
      }, 100);
    });
  }
  
  // Expose the recovery function globally for manual triggering
  (window as any).recoverMissingStyles = recoverMissingStyles;
})();