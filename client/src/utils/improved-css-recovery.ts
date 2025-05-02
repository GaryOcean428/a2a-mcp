/**
 * MCP Integration Platform - Improved CSS Recovery System
 * 
 * This module provides a more robust method for ensuring critical CSS styles
 * are available even if they get purged by Tailwind or other optimizers.
 */

// Add timestamp for cache busting
const VERSION = new Date().getTime();

// Critical CSS classes that must be present for proper rendering
const CRITICAL_CLASSES = [
  'bg-gradient-to-r',
  'text-transparent',
  'bg-clip-text',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'from-purple-600',
  'to-indigo-600',
  'to-white'
];

// Critical CSS styles in case they're missing
const CRITICAL_STYLES = `
/* MCP Integration Platform - Critical CSS - v${VERSION} */

/* Gradient text effects */
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

/* Feature cards */
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

/* Gradient colors */
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

.to-white {
  --tw-gradient-to: #ffffff !important;
}

/* Animation classes */
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

/**
 * Inject critical styles directly into the document
 */
function injectCriticalStyles(): void {
  // Check if styles already exist
  if (document.querySelector('#mcp-recovery-critical-css')) {
    return;
  }
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'mcp-recovery-critical-css';
  style.textContent = CRITICAL_STYLES;
  document.head.appendChild(style);
  
  console.log('[CSS Recovery] Injected improved recovery styles');
}

/**
 * Initialize the improved CSS recovery system
 */
export function initImprovedCssRecovery(): void {
  // Inject styles immediately
  injectCriticalStyles();
  
  // Double check after everything is loaded
  window.addEventListener('load', () => {
    // Check if styles are still missing
    const testDiv = document.createElement('div');
    testDiv.className = 'bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent';
    testDiv.style.display = 'none';
    document.body.appendChild(testDiv);
    
    const styles = window.getComputedStyle(testDiv);
    const hasGradientEffect = styles.backgroundImage !== '';
    
    document.body.removeChild(testDiv);
    
    if (!hasGradientEffect) {
      console.log('[CSS Recovery] Gradient styles still missing, reinforcing...');
      injectCriticalStyles();
    }
  });
}

// Initialize automatically
initImprovedCssRecovery();
