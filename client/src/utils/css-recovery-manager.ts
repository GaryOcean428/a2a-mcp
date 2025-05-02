/**
 * MCP Integration Platform - CSS Recovery Manager
 * 
 * This utility handles critical CSS recovery in case of rendering issues.
 * It ensures critical CSS classes and styles are available even when TailwindCSS purges them.
 */

import { logger } from './logger';

// Critical CSS recovery settings
const RECOVERY_CSS_PATH = '/assets/css/recovery-critical.css';
const CSS_VERSION = new Date().getTime(); // Use timestamp for cache busting

// Critical CSS classes that must be present for proper rendering
const CRITICAL_CSS_CLASSES = [
  'bg-gradient-to-r',
  'from-purple-600',
  'to-indigo-600',
  'text-transparent',
  'bg-clip-text',
  'animate-fade-in-down',
  'feature-card',
  'group-hover:scale-110',
  'animate-in',
  'duration-300'
];

/**
 * CSS Recovery Manager Class
 */
export class CssRecoveryManager {
  private static instance: CssRecoveryManager;
  private recoveryStylesInjected = false;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): CssRecoveryManager {
    if (!CssRecoveryManager.instance) {
      CssRecoveryManager.instance = new CssRecoveryManager();
    }
    return CssRecoveryManager.instance;
  }
  
  /**
   * Initialize the CSS recovery manager
   */
  public initialize(): void {
    logger.info('[CSS Recovery] Initializing CSS recovery manager');
    
    // Check if critical styles are present inline (best case)
    const hasCriticalInlineStyles = this.checkInlineStyles();
    
    if (!hasCriticalInlineStyles) {
      logger.warn('[CSS Recovery] Critical inline styles not found, will inject recovery CSS');
      this.injectRecoveryCss();
    } else {
      logger.info('[CSS Recovery] Critical inline styles found');
      
      // Still verify critical classes to be double-safe
      setTimeout(() => {
        this.verifyAndRecoverCss();
      }, 500);
    }
    
    // Setup periodic verification
    setInterval(() => {
      this.verifyAndRecoverCss();
    }, 5000);
  }
  
  /**
   * Check if inline critical styles are present in document head
   */
  private checkInlineStyles(): boolean {
    const styleElements = document.head.querySelectorAll('style');
    
    for (const style of Array.from(styleElements)) {
      // Check if critical styles are included
      if (
        style.textContent?.includes('.bg-gradient-to-r') &&
        style.textContent?.includes('.animate-fade-in-down')
      ) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Verify critical CSS classes and recover if needed
   */
  private verifyAndRecoverCss(): void {
    logger.debug('[CSS Recovery] Verifying styles...');
    
    // Check for critical inline styles first
    const hasCriticalInlineStyles = this.checkInlineStyles();
    logger.debug(`[CSS Recovery] Critical inline styles present: ${hasCriticalInlineStyles}`);
    
    // Verify critical CSS classes
    const missingClasses = this.verifyCriticalClasses();
    
    if (missingClasses.length > 0) {
      logger.warn(`[CSS Recovery] Missing critical styles: ${missingClasses.join(', ')}`);
      this.injectRecoveryCss(true);
    } else if (!hasCriticalInlineStyles && !this.recoveryStylesInjected) {
      // If no inline styles and recovery not yet injected
      logger.info('[CSS Recovery] Injecting critical styles');
      this.injectRecoveryCss();
    }
  }
  
  /**
   * Verify if critical CSS classes are available
   */
  private verifyCriticalClasses(): string[] {
    const missingClasses: string[] = [];
    
    // Create a test element to check computed styles
    const testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    testElement.style.opacity = '0';
    testElement.style.pointerEvents = 'none';
    document.body.appendChild(testElement);
    
    try {
      // Test each critical class
      for (const className of CRITICAL_CSS_CLASSES) {
        testElement.className = className;
        const computedStyle = window.getComputedStyle(testElement);
        
        // Different checks based on class type
        if (className === 'bg-gradient-to-r') {
          if (!computedStyle.backgroundImage.includes('gradient')) {
            missingClasses.push(className);
          }
        } else if (className === 'text-transparent') {
          if (computedStyle.color !== 'rgba(0, 0, 0, 0)' && computedStyle.color !== 'transparent') {
            missingClasses.push(className);
          }
        } else if (className === 'animate-fade-in-down') {
          if (!computedStyle.animationName || computedStyle.animationName === 'none') {
            missingClasses.push(className);
          }
        } else if (className === 'feature-card') {
          if (!computedStyle.transition || !computedStyle.transition.includes('transform')) {
            missingClasses.push(className);
          }
        } else {
          // Generic test for other classes (not comprehensive but helps catch issues)
          if (computedStyle.cssText === testElement.style.cssText) {
            missingClasses.push(className);
          }
        }
      }
    } finally {
      // Clean up test element
      document.body.removeChild(testElement);
    }
    
    return missingClasses;
  }
  
  /**
   * Inject recovery CSS stylesheet
   */
  private injectRecoveryCss(force: boolean = false): void {
    // Don't inject twice unless forced
    if (this.recoveryStylesInjected && !force) {
      return;
    }
    
    // Check if already injected
    const existingLink = document.head.querySelector(`link[href^="${RECOVERY_CSS_PATH}"]`);
    if (existingLink && !force) {
      this.recoveryStylesInjected = true;
      return;
    }
    
    // Create link element
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = `${RECOVERY_CSS_PATH}?v=${CSS_VERSION}`;
    linkElement.setAttribute('data-recovery', 'true');
    
    // Add to document head
    document.head.appendChild(linkElement);
    
    linkElement.onload = () => {
      logger.info('[CSS Recovery] Critical styles injected ✓');
      this.recoveryStylesInjected = true;
    };
    
    linkElement.onerror = () => {
      logger.error('[CSS Recovery] Failed to load recovery styles');
      // Try inline fallback if external file fails
      this.injectInlineCriticalCss();
    };
  }
  
  /**
   * Fallback method to inject critical CSS inline
   */
  private injectInlineCriticalCss(): void {
    // Minimal inline critical CSS as a last resort
    const criticalCss = `
      .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
      .from-purple-600 { --tw-gradient-from: rgb(147 51 234); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(147 51 234 / 0)); }
      .to-indigo-600 { --tw-gradient-to: rgb(79 70 229); }
      .text-transparent { color: transparent; }
      .bg-clip-text { -webkit-background-clip: text; background-clip: text; }
      .animate-fade-in-down { animation: fade-in-down 0.5s ease-in-out; }
      @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
      .feature-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
      .feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-recovery-inline', 'true');
    styleElement.textContent = criticalCss;
    document.head.appendChild(styleElement);
    
    logger.info('[CSS Recovery] Injected inline critical CSS as fallback');
    this.recoveryStylesInjected = true;
  }
}

// Create and export singleton instance
export const cssRecoveryManager = CssRecoveryManager.getInstance();

// Auto-initialize when imported
cssRecoveryManager.initialize();

export default cssRecoveryManager;