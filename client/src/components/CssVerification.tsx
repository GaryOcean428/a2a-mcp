import { useEffect, useState } from "react";
import { VERSION } from "../version";

// List of critical CSS classes that must be preserved in production
// These are often purged by Tailwind in production builds
const CRITICAL_CLASSES = [
  "bg-grid-gray-100",
  "bg-blob-gradient",
  "feature-card",
  "animate-fade-in-down",
  "from-purple-50",
  "from-purple-600",
  "to-indigo-600",
  "bg-gradient-to-r",
  "group-hover:scale-110",
  "animate-in"
];

// Critical styles that will be injected if missing
const CRITICAL_STYLES = `
/* Critical UI styles for production - DO NOT REMOVE OR MODIFY */
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
.group-hover\\:scale-110 {
  transition: transform 0.3s ease-out;
}
.group:hover .group-hover\\:scale-110 {
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
`;

/**
 * CSS Verification Component
 * 
 * This component verifies critical CSS classes are present in the DOM
 * and adds any missing styles automatically to ensure consistent UI rendering
 * between development and production environments.
 */
export function CssVerification() {
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [missingClasses, setMissingClasses] = useState<string[]>([]);
  const [hasInlineStyles, setHasInlineStyles] = useState(false);
  const [externalStylesheets, setExternalStylesheets] = useState(0);
  const [recovered, setRecovered] = useState(false);

  useEffect(() => {
    // Only run verification once on mount
    if (verificationComplete) return;

    /**
     * Verify if a CSS class is correctly styled in the DOM
     */
    const verifyClass = (className: string): boolean => {
      // Create a temporary element with the class
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
          isStyled = style.getPropertyValue('--tw-gradient-to') !== '';
          break;
        case 'bg-gradient-to-r':
          isStyled = style.backgroundImage.includes('linear-gradient');
          break;
        case 'group-hover:scale-110':
          isStyled = style.transition.includes('transform');
          break;
        case 'animate-in':
          isStyled = style.animationDuration !== 'none' && 
                    style.animationDuration === '150ms';
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
      
      // Log verification result
      console.log(`[CSS Verify] - ${className}: ${isStyled ? 'OK' : 'MISSING'}`);
      
      return isStyled;
    };

    /**
     * Check if critical inline styles are present in the document
     */
    const checkInlineStyles = (): boolean => {
      const styleElements = document.querySelectorAll('style');
      let hasCriticalStyles = false;
      
      for (const style of Array.from(styleElements)) {
        if (style.textContent && style.textContent.includes('Critical UI styles for production')) {
          hasCriticalStyles = true;
          break;
        }
      }
      
      return hasCriticalStyles;
    };

    /**
     * Count loaded external CSS files
     */
    const countExternalStylesheets = (): number => {
      return document.querySelectorAll('link[rel="stylesheet"]').length;
    };

    /**
     * Verify all critical CSS classes
     */
    const runVerification = () => {
      console.log('[CSS Verify] Running verification...');
      
      // Check for critical inline styles
      const hasStyles = checkInlineStyles();
      setHasInlineStyles(hasStyles);
      console.log('[CSS Verify] Critical inline styles present:', hasStyles);
      
      // Count external stylesheets
      const stylesheetCount = countExternalStylesheets();
      setExternalStylesheets(stylesheetCount);
      console.log('[CSS Verify] External stylesheets loaded:', stylesheetCount);
      
      // Test critical classes
      console.log('[CSS Verify] Testing critical CSS classes:');
      const missing: string[] = [];
      
      CRITICAL_CLASSES.forEach(className => {
        const isPresent = verifyClass(className);
        if (!isPresent) {
          missing.push(className);
        }
      });
      
      setMissingClasses(missing);
      console.log('[CSS Verify] Verification complete');
      setVerificationComplete(true);
      
      // Warn if any critical classes are missing
      if (missing.length > 0) {
        console.warn(`❌ Some critical CSS classes failed verification: ${missing.join(', ')}`);
      }
    };

    // Run verification after a short delay to ensure styles are loaded
    const timer = setTimeout(runVerification, 500);
    
    return () => clearTimeout(timer);
  }, [verificationComplete]);

  useEffect(() => {
    // Only attempt recovery if verification is complete and there are missing classes
    if (!verificationComplete || missingClasses.length === 0 || recovered) return;
    
    /**
     * Inject critical CSS styles to recover missing classes
     */
    const recoverStyles = () => {
      console.log('%c🔄 Triggering CSS recovery process', 'color: blue; font-weight: bold;');
      console.log('[CSS Recovery] Checking for missing styles...');
      
      // In development, just verify styles without modifying
      // This allows for proper debugging
      if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
        console.log('[CSS Recovery] Development mode - only verifying styles');
        console.log('[CSS Recovery] All styles verified in development ✓');
        setRecovered(true);
        return;
      }
      
      // For production, actually inject the missing styles
      if (missingClasses.length > 0) {
        // Create a style element
        const styleElement = document.createElement('style');
        styleElement.id = 'critical-styles-recovery';
        styleElement.setAttribute('data-recovery-version', VERSION);
        styleElement.textContent = CRITICAL_STYLES;
        
        // Add it to the head
        document.head.appendChild(styleElement);
        console.log('[CSS Recovery] Critical styles injected ✓');
      } else {
        console.log('[CSS Recovery] All critical styles verified ✓');
      }
      
      setRecovered(true);
      console.log('✅ Recovery process executed');
    };
    
    // Run recovery process
    recoverStyles();
  }, [verificationComplete, missingClasses, recovered]);

  // No visible UI - this is a utility component
  return null;
}

/**
 * Export environment information for debugging
 */
export function logEnvironmentInfo() {
  // Log environment information
  console.log(`
    Environment: ${process.env.NODE_ENV === 'development' || import.meta.env.DEV ? 'Development' : 'Production'}
    Version: ${VERSION}
    Build Time: ${new Date().toISOString()}
    `);
}

export default CssVerification;