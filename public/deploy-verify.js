/**
 * MCP Integration Platform - CSS Verification and Recovery
 * This script verifies that all critical CSS classes are properly loaded
 * and recovers them if necessary.
 * 
 * Version: 2.5.1745966037321
 */

(function() {
  console.log('[CSS Verify] Running verification...');
  
  // Check if critical inline styles are present
  const hasInlineStyles = document.querySelector('style') !== null;
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
    'via-indigo-50',
    'to-white',
    'bg-gradient-to-r'
  ];
  
  // Create test element - but only if document.body exists
  let testDiv;
  
  // Wait for the document to be ready before trying to append to body
  if (document.body) {
    testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    testDiv.style.pointerEvents = 'none';
    testDiv.style.left = '-9999px';
    document.body.appendChild(testDiv);
  } else {
    // If document.body doesn't exist yet, wait for it
    console.log("[CSS Verify] Document body not ready, deferring test");
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        // The actual verification will happen in main.tsx
        console.log("[CSS Verify] Document ready, verification will run later");
      }, 500);
    });
    return; // Exit early
  }
  
  // Check each class
  console.log("[CSS Verify] Testing critical CSS classes:");
  const missingClasses = [];
  
  criticalClasses.forEach(className => {
    testDiv.className = className;
    const style = window.getComputedStyle(testDiv);
    
    // Simple detection logic for each class
    let isStyled = false;
    switch (className) {
      case 'feature-card':
        isStyled = style.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                  style.boxShadow !== 'none' ||
                  style.transition !== 'all 0s ease 0s';
        break;
      case 'animate-fade-in-down':
        isStyled = style.animationName !== 'none' && style.animationName !== 'initial';
        break;
      case 'bg-gradient-to-r':
        isStyled = style.backgroundImage.includes('linear-gradient');
        break;
      case 'bg-grid-gray-100':
        isStyled = style.backgroundImage.includes('linear-gradient');
        break;
      case 'bg-blob-gradient':
        isStyled = style.backgroundImage.includes('radial-gradient');
        break;
      case 'from-purple-50':
      case 'via-indigo-50':
      case 'to-white':
        isStyled = style.getPropertyValue('--tw-gradient-from') !== '' || 
                 style.getPropertyValue('--tw-gradient-to') !== '' ||
                 style.getPropertyValue('--tw-gradient-stops') !== '';
        break;
      default:
        isStyled = style.color !== 'rgb(0, 0, 0)' ||
                  style.backgroundColor !== 'rgba(0, 0, 0, 0)';
    }
    
    console.log("[CSS Verify] -", className + ":", isStyled ? "OK" : "MISSING");
    
    if (!isStyled) {
      missingClasses.push(className);
    }
  });
  
  // Clean up test element if it exists and was appended
  if (testDiv && testDiv.parentNode) {
    testDiv.parentNode.removeChild(testDiv);
  }
  
  // Apply fixes for missing classes
  missingClasses.forEach(className => {
    switch(className) {
      case 'bg-grid-gray-100':
        console.log("[CSS Verify] Fixing missing grid styles");
        break;
      case 'bg-blob-gradient':
        console.log("[CSS Verify] Fixing missing blob gradient");
        break;
      case 'feature-card':
        console.log("[CSS Verify] Fixing missing feature card styles");
        break;
      case 'animate-fade-in-down':
        console.log("[CSS Verify] Fixing missing animations");
        break;
    }
  });
  
  // Load the CSS recovery if we have missing classes
  if (missingClasses.length > 0) {
    // Add the CSS recovery
    loadCssRecovery();
  }
  
  console.log("[CSS Verify] Verification complete");
  
  function loadCssRecovery() {
    // Check if we've already attempted recovery
    if (document.getElementById('mcp-css-recovery')) {
      return;
    }
    
    // First try to load using a link element
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.id = 'mcp-css-recovery-link';
    linkEl.href = '/production.css?v=2.5.1745966037321';
    document.head.appendChild(linkEl);
    
    // Then also inject emergency styles directly
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
  }
})();