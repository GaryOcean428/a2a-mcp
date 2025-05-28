/**
 * MCP Integration Platform - Production Bundle Verification
 * 
 * This script verifies that the production bundle contains all necessary
 * CSS styles and components for proper rendering.
 * 
 * Version: 1.0.0-1748254178808
 */

(function() {
  console.log('[Bundle Verify] Starting production bundle verification...');
  
  // Critical CSS classes to verify
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
  
  // Verify function to check CSS
  function verifyProductionCSS() {
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
      
      // Custom checks for each class type
      if (className === 'bg-gradient-to-r') {
        isApplied = styles.backgroundImage.includes('gradient');
      } else if (className === 'text-transparent') {
        isApplied = styles.color === 'transparent' || styles.color === 'rgba(0, 0, 0, 0)';
      } else if (className === 'bg-clip-text') {
        isApplied = styles.webkitBackgroundClip === 'text' || styles.backgroundClip === 'text';
      } else if (className === 'feature-card') {
        isApplied = styles.display === 'flex';
      } else if (className === 'animate-fade-in-down') {
        isApplied = styles.animation !== 'none';
      } else {
        // Default check - see if any CSS property changed from default
        const defaultEl = document.createElement('div');
        document.body.appendChild(defaultEl);
        const defaultStyles = window.getComputedStyle(defaultEl);
        
        // Compare some key properties
        isApplied = (
          styles.color !== defaultStyles.color ||
          styles.backgroundColor !== defaultStyles.backgroundColor ||
          styles.backgroundImage !== defaultStyles.backgroundImage
        );
        
        document.body.removeChild(defaultEl);
      }
      
      if (!isApplied) {
        missingClasses.push(className);
      }
    });
    
    // Clean up test element
    document.body.removeChild(testEl);
    
    // Report results
    if (missingClasses.length > 0) {
      console.error('[Bundle Verify] Missing critical CSS classes in production build:', missingClasses.join(', '));
      document.documentElement.setAttribute('data-mcp-verify-status', 'failed');
      document.documentElement.setAttribute('data-mcp-missing-classes', missingClasses.join(','));
      injectEmergencyCSS(missingClasses);
      return false;
    } else {
      console.log('[Bundle Verify] All critical CSS classes verified in production build ✓');
      document.documentElement.setAttribute('data-mcp-verify-status', 'passed');
      return true;
    }
  }
  
  // Inject emergency CSS if needed
  function injectEmergencyCSS(missingClasses) {
    console.warn('[Bundle Verify] Injecting emergency CSS for missing classes:', missingClasses.join(', '));
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'mcp-emergency-css';
    
    // Build CSS content based on missing classes
    let cssContent = '/* MCP Emergency CSS Fix */\n';
    
    missingClasses.forEach(function(className) {
      switch(className) {
        case 'bg-gradient-to-r':
          cssContent += '.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important; }\n';
          break;
        case 'text-transparent':
          cssContent += '.text-transparent { color: transparent !important; }\n';
          break;
        case 'bg-clip-text':
          cssContent += '.bg-clip-text { -webkit-background-clip: text !important; background-clip: text !important; }\n';
          break;
        case 'feature-card':
          cssContent += '.feature-card { display: flex !important; flex-direction: column !important; background-color: white !important; border-radius: 0.5rem !important; overflow: hidden !important; border: 1px solid rgba(0, 0, 0, 0.05) !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; }\n';
          break;
        case 'animate-fade-in-down':
          cssContent += '@keyframes fadeInDown { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }\n';
          cssContent += '.animate-fade-in-down { animation: fadeInDown 0.5s ease-out !important; }\n';
          break;
        case 'from-purple-50':
          cssContent += '.from-purple-50 { --tw-gradient-from: rgb(250 245 255) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(250 245 255 / 0)) !important; }\n';
          break;
        case 'to-white':
          cssContent += '.to-white { --tw-gradient-to: rgb(255 255 255) !important; }\n';
          break;
        case 'bg-grid-gray-100':
          cssContent += '.bg-grid-gray-100 { background-image: linear-gradient(to right, rgb(243 244 246 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(243 244 246 / 0.1) 1px, transparent 1px) !important; background-size: 24px 24px !important; }\n';
          break;
        case 'bg-blob-gradient':
          cssContent += '.bg-blob-gradient { background-image: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0) 70%) !important; }\n';
          break;
      }
    });
    
    // Add combined classes
    cssContent += '/* Combined classes */\n';
    cssContent += '.bg-gradient-to-r.text-transparent.bg-clip-text { background-image: linear-gradient(to right, rgb(124 58 237), rgb(79 70 229)) !important; color: transparent !important; -webkit-background-clip: text !important; background-clip: text !important; }\n';
    
    style.textContent = cssContent;
    document.head.appendChild(style);
    
    console.log('[Bundle Verify] Emergency CSS injected');
  }
  
  // Run verification when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verifyProductionCSS);
  } else {
    verifyProductionCSS();
  }
  
  // Also run verification when the page is fully loaded
  window.addEventListener('load', verifyProductionCSS);
})();
