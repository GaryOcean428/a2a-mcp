/**
 * MCP Integration Platform - Force CSS Recovery
 * 
 * This script forces CSS recovery for sites with rendering issues
 */

(function() {
  console.log('[CSS Force Recovery] Initializing...');
  
  // Force load critical CSS
  function forceCssRecovery() {
    console.log('[CSS Force Recovery] Loading critical CSS...');
    
    // Create link to recovery CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/recovery-critical.css?v=' + Date.now(); // Cache busting
    document.head.appendChild(link);
    
    // Add inline styles for absolute critical elements
    const style = document.createElement('style');
    style.textContent = `
      .bg-gradient-to-r {
        background-image: linear-gradient(to right, rgb(124 58 237), rgb(79 70 229)) !important;
      }
      
      .text-transparent {
        color: transparent !important;
      }
      
      .bg-clip-text {
        -webkit-background-clip: text !important;
        background-clip: text !important;
      }
      
      .feature-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        display: flex !important;
        flex-direction: column !important;
        background-color: white !important;
        border-radius: 0.5rem !important;
        overflow: hidden !important;
        border: 1px solid rgba(0, 0, 0, 0.05) !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('[CSS Force Recovery] CSS recovery applied!');
    return true;
  }
  
  // Force reload if triggered by URL parameter
  if (window.location.search.includes('force-recovery')) {
    forceCssRecovery();
  }
  
  // Expose the function globally
  window.forceCssRecovery = forceCssRecovery;
})();