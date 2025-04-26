/**
 * MCP Platform Production CSS Verification Script
 * 
 * This script runs automatically in production to verify and fix any CSS issues
 */

// Wait for the page to be fully loaded
window.addEventListener('load', function() {
  console.log('[CSS Verify] Running verification...');
  
  // Check if critical style element exists
  const hasCriticalStyles = document.getElementById('critical-styles') !== null;
  console.log('[CSS Verify] Critical inline styles present:', hasCriticalStyles);
  
  // Count loaded stylesheets
  const stylesheets = Array.from(document.styleSheets).filter(sheet => 
    sheet.href && sheet.href.includes('.css')
  );
  
  console.log('[CSS Verify] External stylesheets loaded:', stylesheets.length);
  stylesheets.forEach(sheet => {
    console.log('[CSS Verify] - ' + sheet.href);
  });
  
  // Test if our critical classes have styles
  const testElement = document.createElement('div');
  document.body.appendChild(testElement);
  
  // Test classes
  const testClasses = [
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'feature-card',
    'animate-fade-in-down'
  ];
  
  console.log('[CSS Verify] Testing critical CSS classes:');
  testClasses.forEach(className => {
    testElement.className = className;
    const style = window.getComputedStyle(testElement);
    const hasStyles = style.backgroundImage !== 'none' || 
                      style.boxShadow !== 'none' ||
                      style.padding !== '0px';
    console.log(`[CSS Verify] - ${className}: ${hasStyles ? 'OK' : 'MISSING'}`);
    
    // If styles are missing, try to apply them inline
    if (!hasStyles && className === 'bg-grid-gray-100') {
      console.log('[CSS Verify] Fixing missing grid styles');
      const fixStyle = document.createElement('style');
      fixStyle.textContent = `.bg-grid-gray-100 {
        background-image: linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        background-size: 24px 24px;
      }`;
      document.head.appendChild(fixStyle);
    }
    
    if (!hasStyles && className === 'bg-blob-gradient') {
      console.log('[CSS Verify] Fixing missing blob gradient');
      const fixStyle = document.createElement('style');
      fixStyle.textContent = `.bg-blob-gradient {
        background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
        filter: blur(50px);
      }`;
      document.head.appendChild(fixStyle);
    }
    
    if (!hasStyles && className === 'feature-card') {
      console.log('[CSS Verify] Fixing missing feature card styles');
      const fixStyle = document.createElement('style');
      fixStyle.textContent = `.feature-card {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(229, 231, 235);
        transition: all 0.3s;
      }`;
      document.head.appendChild(fixStyle);
    }
  });
  
  document.body.removeChild(testElement);
  
  console.log('[CSS Verify] Verification complete');
});
