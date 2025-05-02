/**
 * MCP Integration Platform - Critical CSS Direct Fix
 * 
 * This module forcefully applies critical CSS styles directly to the DOM
 * to ensure proper rendering of all UI components regardless of any CSS loading issues.
 */

// Ensure styles are applied after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create direct style element with critical CSS
  const style = document.createElement('style');
  style.id = 'mcp-critical-direct-fix';
  style.innerHTML = `
    /* Critical fixes for gradient text and backgrounds */
    .text-transparent {
      color: transparent !important;
    }
    
    .bg-clip-text {
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    
    .bg-gradient-to-r {
      background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
    }
    
    /* Feature card styles */
    .feature-card {
      background-color: white !important;
      padding: 1.5rem !important;
      border-radius: 0.5rem !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      border: 1px solid rgba(229, 231, 235) !important;
      transition: all 0.3s ease !important;
    }
    
    .feature-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      border-color: rgba(167, 139, 250, 0.4) !important;
      transform: translateY(-5px) !important;
    }
    
    /* Gradient text for headers with combined classes */
    [class*="bg-gradient"][class*="text-transparent"] {
      color: transparent !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    
    /* Animations */
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
      animation: fadeInDown 0.5s ease-out !important;
    }
  `;
  
  // Append style element to head
  document.head.appendChild(style);
  console.log('[CSS Direct Fix] Critical styles applied directly');
  
  // Apply direct styles to gradient headers
  setTimeout(() => {
    const gradientElements = document.querySelectorAll('[class*="bg-gradient"][class*="text-transparent"]');
    gradientElements.forEach(element => {
      // Force the styles directly on the element
      const el = element as HTMLElement;
      el.style.color = 'transparent';
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
    });
    
    // Apply styles to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      const el = card as HTMLElement;
      el.style.transition = 'all 0.3s ease';
    });
    
    console.log('[CSS Direct Fix] Applied inline styles to critical elements');
  }, 500); // Delay to ensure elements are rendered
});

// Export a dummy function so the module is considered used
export function ensureCriticalStyles(): void {
  console.log('[CSS Direct Fix] Critical styles module loaded');
}

// Self-initialize
ensureCriticalStyles();
