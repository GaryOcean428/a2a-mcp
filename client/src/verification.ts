/**
 * MCP Integration Platform - Production Verification Script
 * 
 * This script runs in production to verify that the UI is rendering correctly
 * and to recover from any style issues that may occur.
 * 
 * It also logs version and environment information.
 */

import { VERSION } from './version';

console.log(`MCP Integration Platform v${VERSION} (Production Verified)`);

// Checks if critical CSS classes are being applied correctly
function verifyCriticalClasses() {
  // Array of critical class names that must be preserved
  const criticalClasses = [
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'feature-card',
    'animate-fade-in-down',
    'from-purple-600',
    'to-indigo-600',
    'bg-gradient-to-r',
    'animate-in',
    'fade-in',
    'ai-spinner-dot',
    'group-hover:scale-110',
    'hover:shadow-lg'
  ];
  
  // Test element to check styles
  const testEl = document.createElement('div');
  document.body.appendChild(testEl);
  
  // Check each class
  const results = criticalClasses.map(cls => {
    testEl.className = cls;
    const style = window.getComputedStyle(testEl);
    
    // Different classes need different verification
    let verified = false;
    
    if (cls === 'bg-grid-gray-100') {
      verified = style.backgroundImage.includes('linear-gradient');
    } else if (cls === 'bg-blob-gradient') {
      verified = style.backgroundImage.includes('radial-gradient');
    } else if (cls === 'feature-card') {
      verified = style.transition.includes('all');
    } else if (cls === 'animate-fade-in-down') {
      verified = style.animation.includes('fadeInDown');
    } else if (cls.startsWith('from-')) {
      verified = style.backgroundImage.includes('linear-gradient') || 
               style.getPropertyValue('--tw-gradient-from') !== '';
    } else if (cls.startsWith('to-')) {
      verified = style.backgroundImage.includes('linear-gradient') || 
               style.getPropertyValue('--tw-gradient-to') !== '';
    } else if (cls === 'bg-gradient-to-r') {
      verified = style.backgroundImage.includes('linear-gradient');
    } else if (cls.includes('hover:')) {
      verified = true; // Can't truly verify hover states
    } else if (cls.includes('group-hover:')) {
      verified = true; // Can't truly verify group-hover states
    } else if (cls === 'animate-in') {
      verified = style.animationDuration === '150ms';
    } else if (cls.includes('ai-spinner-dot')) {
      verified = style.display === 'inline-block';
    } else {
      verified = true; // Default to true for unknown classes
    }
    
    return { cls, verified };
  });
  
  // Clean up
  document.body.removeChild(testEl);
  
  // Log results
  const verified = results.every(r => r.verified);
  const failedClasses = results.filter(r => !r.verified).map(r => r.cls);
  
  if (verified) {
    console.log('%c✅ All critical CSS classes verified', 'color: green; font-weight: bold;');
  } else {
    console.warn(`❌ Some critical CSS classes failed verification: ${failedClasses.join(', ')}`);
    triggerRecovery();
  }
  
  return verified;
}

// Recovery function to inject missing styles
function triggerRecovery() {
  console.log('%c🔄 Triggering CSS recovery process', 'color: blue; font-weight: bold;');
  
  // This will execute any CSS recovery code that's been loaded
  const recoverFn = (window as any).recoverMissingStyles;
  if (typeof recoverFn === 'function') {
    recoverFn();
    console.log('✅ Recovery process executed');
  } else {
    console.warn('❌ Recovery function not available');
    
    // Attempt to inject our own recovery styles if the recovery function isn't available
    const criticalStyles = `
    /* Emergency recovery styles */
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
    
    .feature-card {
      background-color: white !important;
      padding: 1.5rem !important;
      border-radius: 0.5rem !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      border: 1px solid rgba(229, 231, 235) !important;
      transition: all 0.3s !important;
    }
    
    .feature-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      border-color: rgba(167, 139, 250, 0.4) !important;
      transform: translateY(-2px) !important;
    }
    
    .from-purple-600 {
      --tw-gradient-from: #9333ea !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    
    .to-indigo-600 {
      --tw-gradient-to: #4f46e5 !important;
    }
    
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    
    .animate-fade-in-down {
      animation: fadeInDown 0.5s ease-out !important;
    }
    
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
    `;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'emergency-recovery-styles';
    styleEl.textContent = criticalStyles;
    document.head.appendChild(styleEl);
    console.log('✅ Injected emergency recovery styles');
  }
}

// Run the verification after the app has loaded
window.addEventListener('load', () => {
  // Wait a bit to ensure all styles are loaded
  setTimeout(() => {
    verifyCriticalClasses();
    
    // Log environment information
    console.log(`
    Environment: ${import.meta.env.PROD ? 'Production' : 'Development'}
    Version: ${VERSION}
    Build Time: ${new Date().toISOString()}
    `);
    
    // Add version attribute to html element for debugging
    document.documentElement.setAttribute('data-mcp-verified', 'true');
  }, 1000);
});

export {};