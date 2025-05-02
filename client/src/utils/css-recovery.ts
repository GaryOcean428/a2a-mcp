/**
 * CSS Recovery System
 * 
 * This utility ensures that critical CSS classes are properly rendered in both
 * development and production environments. It checks for missing styles and
 * injects them if needed.
 */

import { version } from '../version';

// List of critical CSS classes that must be preserved
const CRITICAL_CLASSES = [
  'bg-grid-gray-100',
  'bg-blob-gradient',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'from-purple-600',
  'to-indigo-600',
  'to-white',
  'bg-gradient-to-r',
  'group-hover:scale-110',
  'animate-in',
  'fade-in',
  'transition-all',
  'duration-300',
  'ease-in-out'
];

// Critical CSS to inject if classes are missing
const CRITICAL_CSS = `
/* MCP Recovery CSS (v${version}) */
.bg-grid-gray-100 {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}

.bg-blob-gradient {
  background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
  filter: blur(50px);
}

.feature-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(229, 231, 235);
  transition: all 0.3s;
}

.feature-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: rgba(167, 139, 250, 0.4);
  transform: translateY(-2px);
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

.animate-fade-in-down {
  animation: fadeInDown 0.5s ease-out;
}

/* Card hover effects */
.group-hover\:scale-110 {
  transition: transform 0.3s ease-out;
}
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Gradient backgrounds */
.from-purple-50 {
  --tw-gradient-from: #faf5ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-purple-600 {
  --tw-gradient-from: #9333ea;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.to-indigo-600 {
  --tw-gradient-to: #4f46e5;
}
.to-white {
  --tw-gradient-to: #ffffff;
}
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

/* Shadcn UI animation classes */
.animate-in {
  animation-duration: 150ms;
  animation-timing-function: cubic-bezier(0.1, 0.99, 0.1, 0.99);
  animation-fill-mode: both;
}

.fade-in {
  animation-name: fadeIn;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* New critical CSS classes */
.group-hover\:scale-110 {
  transition: transform 0.3s ease-out;
}
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.from-purple-600 {
  --tw-gradient-from: #9333ea;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.to-indigo-600 {
  --tw-gradient-to: #4f46e5;
}

.animate-in {
  animation-duration: 150ms;
  animation-timing-function: cubic-bezier(0.1, 0.99, 0.1, 0.99);
  animation-fill-mode: both;
}

.fade-in {
  animation-name: fadeIn;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.duration-300 {
  transition-duration: 300ms;
}

.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
`;

/**
 * Check if a specific CSS class is properly styled
 */
function verifyClass(className: string): boolean {
  // Create a test element with the class
  const testElement = document.createElement('div');
  testElement.className = className;
  testElement.style.position = 'absolute';
  testElement.style.visibility = 'hidden';
  testElement.style.pointerEvents = 'none';
  document.body.appendChild(testElement);
  
  // Get computed style
  const style = window.getComputedStyle(testElement);
  
  // Check if the class has any effect on the element
  let isStyled = false;
  
  // Class-specific checks
  switch (className) {
    case 'bg-grid-gray-100':
      isStyled = style.backgroundImage !== 'none';
      break;
    case 'bg-blob-gradient':
      isStyled = style.backgroundImage !== 'none' && style.filter !== 'none';
      break;
    case 'feature-card':
      isStyled = style.backgroundColor === 'rgb(255, 255, 255)' && 
                style.borderRadius === '0.5rem';
      break;
    case 'animate-fade-in-down':
      isStyled = style.animationName !== 'none';
      break;
    case 'from-purple-50':
    case 'from-purple-600':
      isStyled = style.getPropertyValue('--tw-gradient-from') !== '';
      break;
    case 'to-indigo-600':
    case 'to-white':
      isStyled = style.getPropertyValue('--tw-gradient-to') !== '';
      break;
    case 'bg-gradient-to-r':
      isStyled = style.backgroundImage.includes('linear-gradient');
      break;
    case 'group-hover:scale-110':
      isStyled = style.transition.includes('transform');
      break;
    case 'animate-in':
      isStyled = style.animationDuration === '150ms';
      break;
    case 'transition-all':
      isStyled = style.transitionProperty === 'all';
      break;
    case 'duration-300':
      isStyled = style.transitionDuration === '300ms';
      break;
    case 'ease-in-out':
      isStyled = style.transitionTimingFunction.includes('cubic-bezier');
      break;
    default:
      // Generic check for any styling effect
      isStyled = (
        style.color !== 'rgb(0, 0, 0)' ||
        style.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
        style.borderRadius !== '0px' ||
        style.margin !== '0px' ||
        style.padding !== '0px' ||
        style.transform !== 'none' ||
        style.opacity !== '1'
      );
  }
  
  // Clean up
  document.body.removeChild(testElement);
  
  return isStyled;
}

/**
 * Check if critical inline styles are present in the document
 */
function checkInlineStyles(): boolean {
  const styleElements = document.querySelectorAll('style');
  let hasCriticalStyles = false;
  
  for (const style of Array.from(styleElements)) {
    if (style.textContent && style.textContent.includes('Critical styles for immediate rendering')) {
      hasCriticalStyles = true;
      break;
    }
  }
  
  return hasCriticalStyles;
}

/**
 * Inject critical CSS styles
 */
function injectCriticalStyles() {
  console.log('%c[CSS Recovery] Injecting critical styles', 'color: blue');
  
  // Create style element
  const styleElement = document.createElement('style');
  styleElement.id = 'mcp-critical-styles-recovery';
  styleElement.setAttribute('data-version', version);
  styleElement.textContent = CRITICAL_CSS;
  
  // Add to head
  document.head.appendChild(styleElement);
  
  console.log('[CSS Recovery] Critical styles injected ✓');
}

/**
 * Verify all critical CSS classes and inject if needed
 */
function verifyCssStyles() {
  console.log('[CSS Recovery] Verifying styles...');
  
  // Check for critical inline styles
  const hasStyles = checkInlineStyles();
  console.log('[CSS Recovery] Critical inline styles present:', hasStyles);
  
  // Test critical classes
  const missing: string[] = [];
  
  CRITICAL_CLASSES.forEach(className => {
    const isPresent = verifyClass(className);
    if (!isPresent) {
      missing.push(className);
    }
  });
  
  // Inject styles if needed
  if (missing.length > 0) {
    console.warn('[CSS Recovery] Missing critical styles:', missing.join(', '));
    injectCriticalStyles();
  } else {
    console.log('[CSS Recovery] All critical styles verified ✓');
  }
}

// Make the recover function available globally
// This allows it to be called from the verification script
declare global {
  interface Window {
    recoverMissingStyles: () => void;
  }
}

// Add the recovery function to the window object
window.recoverMissingStyles = injectCriticalStyles;

// Initial verification (with a short delay to ensure CSS is loaded)
setTimeout(verifyCssStyles, 1000);
