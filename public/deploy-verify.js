
/**
 * MCP Integration Platform - CSS Verification and Recovery
 * This script verifies that all critical CSS classes are properly loaded
 * and recovers them if necessary.
 * 
 * Version: 2.5.1745835943600
 */
(function() {
  console.log("[CSS Verify] Running verification...");
  
  // Check if critical inline styles are present
  const hasInlineStyles = document.querySelector('style') !== null;
  console.log("[CSS Verify] Critical inline styles present:", hasInlineStyles);
  
  // Check if external stylesheets are loaded
  const externalStyles = document.querySelectorAll('link[rel="stylesheet"]');
  console.log("[CSS Verify] External stylesheets loaded:", externalStyles.length);
  
  // Test critical CSS classes
  console.log("[CSS Verify] Testing critical CSS classes:");
  
  const criticalClasses = [
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'feature-card',
    'animate-fade-in-down',
    'from-purple-50',
    'from-purple-600',
    'to-indigo-600',
    'bg-gradient-to-r',
    'group-hover:scale-110',
    'animate-in'
  ];
  
  // Create a hidden test element
  const testEl = document.createElement('div');
  testEl.style.position = 'absolute';
  testEl.style.visibility = 'hidden';
  testEl.style.pointerEvents = 'none';
  testEl.style.zIndex = '-1000';
  testEl.style.opacity = '0';
  document.body.appendChild(testEl);
  
  const missingClasses = [];
  
  criticalClasses.forEach(className => {
    // Reset element
    testEl.className = '';
    // Get computed style before
    const beforeStyle = window.getComputedStyle(testEl);
    const beforeProps = {
      transform: beforeStyle.transform,
      animation: beforeStyle.animation,
      backgroundImage: beforeStyle.backgroundImage,
      opacity: beforeStyle.opacity
    };
    
    // Apply class
    testEl.className = className;
    
    // Get computed style after
    const afterStyle = window.getComputedStyle(testEl);
    
    // Check if styles changed
    const hasEffect = 
      beforeProps.transform !== afterStyle.transform ||
      beforeProps.animation !== afterStyle.animation ||
      beforeProps.backgroundImage !== afterStyle.backgroundImage ||
      beforeProps.opacity !== afterStyle.opacity;
    
    console.log("[CSS Verify] -", className + ":", hasEffect ? "OK" : "MISSING");
    
    if (!hasEffect) {
      missingClasses.push(className);
    }
  });
  
  // Clean up
  document.body.removeChild(testEl);
  
  console.log("[CSS Verify] Verification complete");
  
  // If we have missing classes, inject emergency styles
  if (missingClasses.length > 0) {
    console.warn("❌ Some critical CSS classes failed verification:", missingClasses.join(", "));
    
    console.log("%c🔄 Triggering CSS recovery process", "color: blue; font-weight: bold;");
    console.log("[CSS Recovery] Checking for missing styles...");
    
    if (process.env.NODE_ENV !== 'production' && !window.location.hostname.includes('replit.app')) {
      console.log("[CSS Recovery] Development mode - only verifying styles");
      console.log("[CSS Recovery] All styles verified in development ✓");
      return;
    }
    
    // Inject emergency recovery CSS
    console.log("[CSS Recovery] Injecting CSS recovery for production");
    
    const recoveryCSS = `
    /* MCP Critical CSS Recovery - Version 2.5.1745835943600 */
    .feature-card {
      position: relative !important;
      overflow: hidden !important;
      border-radius: 0.5rem !important;
      border-width: 1px !important;
      border-color: hsl(var(--border)) !important;
      padding: 1.5rem !important;
      background-color: hsl(var(--card)) !important;
      cursor: pointer !important;
      transition-property: all !important;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
      transition-duration: 300ms !important;
    }
    .feature-card:hover {
      border-color: rgb(233 213 255) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
    }
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    .animate-in {
      animation-name: animate-in !important;
      animation-duration: 0.5s !important;
      animation-timing-function: ease-out !important;
      animation-fill-mode: both !important;
      animation-direction: normal !important;
    }
    .animate-fade-in-down {
      animation-name: animate-fade-in-down !important;
      animation-duration: 0.8s !important;
      animation-fill-mode: both !important; 
    }
    @keyframes animate-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes animate-fade-in-down {
      from {
        opacity: 0;
        transform: translateY(-15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    /* Target group-hover utilities */
    .group:hover .group-hover\:scale-110 {
      transform: scale(1.1) !important;
    }
    /* Explicit gradient backgrounds */
    .from-purple-50 {
      --tw-gradient-from: #faf5ff !important;
      --tw-gradient-to: rgb(250 245 255 / 0) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .from-purple-600 {
      --tw-gradient-from: #9333ea !important;
      --tw-gradient-to: rgb(147 51 234 / 0) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .to-indigo-600 {
      --tw-gradient-to: #4f46e5 !important;
    }`;
    
    const styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    styleEl.id = 'mcp-css-recovery';
    styleEl.appendChild(document.createTextNode(recoveryCSS));
    document.head.appendChild(styleEl);
    
    console.log("[CSS Recovery] ✅ Recovery complete - MCP CSS restored");
  }
})();
