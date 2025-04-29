/**
 * CSS Recovery System
 * 
 * This module provides a runtime recovery mechanism for CSS styles
 * that might be missing in production due to Tailwind's purge process.
 * 
 * It's imported first in main.tsx to ensure it's available before any
 * components are rendered.
 */
import { VERSION } from './version';

/**
 * Inject critical CSS in production environments
 */
export function injectCriticalCss() {
  console.log(`[CSS Recovery] Initializing for MCP version ${VERSION}`);
  
  // Only run in production environments
  if (import.meta.env.PROD) {
    console.log('[CSS Recovery] Production environment detected, loading critical CSS');
    
    // Create link element for production.css
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/production.css?v=${VERSION}`;
    link.id = 'mcp-production-css';
    document.head.appendChild(link);
    
    // Add inline styles for immediate rendering
    const style = document.createElement('style');
    style.id = 'mcp-critical-inline-css';
    style.textContent = `
    /* Critical MCP styles for production */
    .feature-card {
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid #f3f4f6;
      transition: all 0.3s ease;
    }
    
    .animate-fade-in-down {
      animation: fadeInDown 0.5s ease-out;
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
    
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops));
    }
    `;
    document.head.appendChild(style);
    
    console.log('[CSS Recovery] Critical CSS injected');
  }
}

/**
 * Verify critical CSS classes are available and recover if needed
 */
export function verifyCssClasses() {
  // Wait for DOM to be ready
  setTimeout(() => {
    // Only run in production
    if (!import.meta.env.PROD) return;
    
    console.log('[CSS Recovery] Verifying critical CSS classes');
    
    // Test element for CSS class verification
    const testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.classList.add('feature-card', 'animate-fade-in-down', 'bg-gradient-to-r');
    document.body.appendChild(testElement);
    
    // Get computed style
    const computedStyle = window.getComputedStyle(testElement);
    
    // Check if critical styles are applied
    const hasBackgroundColor = computedStyle.backgroundColor === 'rgb(255, 255, 255)';
    const hasAnimation = computedStyle.animationName !== 'none';
    
    if (!hasBackgroundColor || !hasAnimation) {
      console.warn('[CSS Recovery] Critical CSS classes missing, applying recovery styles');
      
      // Apply emergency recovery styles
      const recoveryStyle = document.createElement('style');
      recoveryStyle.id = 'mcp-emergency-css';
      recoveryStyle.textContent = `
      /* MCP Emergency CSS Recovery */
      .feature-card {
        background-color: white !important;
        padding: 1.5rem !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        border: 1px solid #f3f4f6 !important;
      }
      .feature-card:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        border-color: #e9d5ff !important;
        transform: translateY(-2px) !important;
      }
      .animate-fade-in-down {
        animation: mcp-fade-in-down 0.5s ease-out !important;
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
      .bg-gradient-to-r {
        background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
      }
      .from-purple-50 {
        --tw-gradient-from: #faf5ff !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0)) !important;
      }
      .from-purple-600 {
        --tw-gradient-from: #9333ea !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0)) !important;
      }
      .to-indigo-600 {
        --tw-gradient-to: #4f46e5 !important;
      }
      `;
      document.head.appendChild(recoveryStyle);
      
      console.log('[CSS Recovery] Emergency recovery styles applied');
    } else {
      console.log('[CSS Recovery] All critical CSS classes verified');
    }
    
    // Clean up test element
    document.body.removeChild(testElement);
  }, 1000);
}

// Auto-initialize in production
if (import.meta.env.PROD) {
  injectCriticalCss();
  
  // Wait for document to be ready before verifying CSS
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verifyCssClasses);
  } else {
    verifyCssClasses();
  }
}

export default { injectCriticalCss, verifyCssClasses };