/**
 * MCP Integration Platform - CSS Verification and Recovery
 * This script verifies that all critical CSS classes are properly loaded
 * and recovers them if necessary.
 * 
 * Version: 2.5.1745892181115
 */

(function() {
  // Only run in production
  if (window.location.hostname.includes('localhost') || window.location.hostname.includes('.replit.dev')) {
    console.log('[Deploy Verify] Development environment detected, verification not needed');
    return;
  }

  console.log('[Deploy Verify] Production environment detected, verifying CSS');

  // List of critical CSS classes to verify
  const criticalClasses = [
    'feature-card',
    'animate-fade-in-down',
    'bg-gradient-to-r',
    'bg-grid-gray-100',
    'bg-blob-gradient'
  ];

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(verifyCss, 500);
  });

  function verifyCss() {
    console.log('[Deploy Verify] Checking critical CSS classes');
    
    // Create test element
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    testDiv.style.pointerEvents = 'none';
    testDiv.style.left = '-9999px';
    document.body.appendChild(testDiv);
    
    // Check each class
    const missingClasses = [];
    
    criticalClasses.forEach(className => {
      testDiv.className = className;
      const style = window.getComputedStyle(testDiv);
      
      // Simple detection logic for each class
      let isStyled = false;
      switch (className) {
        case 'feature-card':
          isStyled = style.backgroundColor === 'rgb(255, 255, 255)' &&
                    style.borderRadius !== '0px';
          break;
        case 'animate-fade-in-down':
          isStyled = style.animationName !== 'none';
          break;
        case 'bg-gradient-to-r':
          isStyled = style.backgroundImage.includes('linear-gradient');
          break;
        case 'bg-grid-gray-100':
        case 'bg-blob-gradient':
          isStyled = style.backgroundImage !== 'none';
          break;
        default:
          isStyled = style.color !== 'rgb(0, 0, 0)' ||
                    style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      }
      
      if (!isStyled) {
        missingClasses.push(className);
      }
    });
    
    // Clean up test element
    document.body.removeChild(testDiv);
    
    // Report results
    if (missingClasses.length > 0) {
      console.warn('[Deploy Verify] Missing CSS classes:', missingClasses);
      recoverCss(missingClasses);
    } else {
      console.log('[Deploy Verify] All critical CSS classes verified ✓');
    }
  }

  function recoverCss(missingClasses) {
    console.log('[Deploy Verify] Recovering missing CSS classes');
    
    // Only inject if we have missing classes
    if (missingClasses.length === 0) return;
    
    // Create emergency styles
    const style = document.createElement('style');
    style.id = 'mcp-emergency-css';
    style.textContent = `
    /* MCP Emergency CSS Recovery - Version 2.5.1745892181115 */
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
    `;
    
    document.head.appendChild(style);
    console.log('[Deploy Verify] Emergency CSS recovery applied ✓');
  }
})();