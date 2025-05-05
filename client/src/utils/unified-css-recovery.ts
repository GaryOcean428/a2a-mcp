/**
 * MCP Integration Platform - Unified CSS Recovery System
 * 
 * This utility consolidates multiple CSS recovery mechanisms into a single, comprehensive solution
 * to ensure proper rendering of UI components in both development and production environments.
 * 
 * Features:
 * 1. Critical CSS class verification
 * 2. Direct DOM style injection
 * 3. External CSS fallback loading
 * 4. Periodic style verification
 * 5. Visual state monitoring
 */

import { logger } from './logger';

// Configuration
const RECOVERY_CSS_PATH = '/assets/css/recovery-critical.css';
const CSS_VERSION = new Date().getTime(); // Cache busting
const VERIFICATION_INTERVAL = 5000; // Check every 5 seconds
const RECOVERY_MODE = process.env.NODE_ENV === 'production' || import.meta.env.PROD;

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
  'duration-300',
  'from-purple-50',
  'to-white',
  'bg-grid-gray-100',
  'bg-blob-gradient',
];

/**
 * CSS Recovery Manager Class
 */
export class UnifiedCssRecovery {
  private static instance: UnifiedCssRecovery;
  private recoveryStylesInjected = false;
  private directStylesApplied = false;
  private initialized = false;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): UnifiedCssRecovery {
    if (!UnifiedCssRecovery.instance) {
      UnifiedCssRecovery.instance = new UnifiedCssRecovery();
    }
    return UnifiedCssRecovery.instance;
  }
  
  /**
   * Initialize the CSS recovery system
   */
  public initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    
    logger.info('[CSS Recovery] Initializing unified CSS recovery system');
    
    // Apply direct critical styles immediately
    this.injectDirectStyles();
    
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
    }, VERIFICATION_INTERVAL);
    
    // Check after DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.verifyAndRecoverCss();
    });
    
    // Check when visibility changes (tab focus)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.verifyAndRecoverCss();
      }
    });
    
    // Check after any CSS loads
    document.addEventListener('load', (event) => {
      if (event.target instanceof HTMLLinkElement && event.target.rel === 'stylesheet') {
        this.verifyAndRecoverCss();
      }
    }, true);
    
    // Set up DOM mutation observer to track stylistic changes
    this.setupMutationObserver();
  }
  
  /**
   * Set up mutation observer to detect DOM changes that might affect styling
   */
  private setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      let needsCheck = false;
      
      // Check if these mutations might affect styling
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' || 
          (mutation.type === 'childList' && mutation.addedNodes.length > 0)
        ) {
          needsCheck = true;
          break;
        }
      }
      
      if (needsCheck) {
        console.log('[StyleFixer] DOM changed, reapplying CSS fixes...');
        this.applyDirectStyleFixes();
      }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
      attributes: true, 
      childList: true, 
      subtree: true,
      attributeFilter: ['class', 'style'] 
    });
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
        style.textContent?.includes('.text-transparent')
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
      // Apply both recovery strategies
      this.injectRecoveryCss(true);
      this.applyDirectStyleFixes();
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
   * Inject direct critical CSS styles to the DOM
   */
  private injectDirectStyles(): void {
    // Check if already exists
    if (document.getElementById('mcp-critical-direct-fix')) {
      return;
    }
    
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
  }
  
  /**
   * Apply direct style fixes to specific elements
   */
  private applyDirectStyleFixes(): void {
    console.log('[StyleFixer] Applying direct CSS fixes...');
    
    // Make sure direct styles are injected first
    if (!this.directStylesApplied) {
      this.injectDirectStyles();
      this.directStylesApplied = true;
    }
    
    // Apply direct styles to gradient headers
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
    
    console.log('[StyleFixer] Finished applying direct CSS fixes.');
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
export const unifiedCssRecovery = UnifiedCssRecovery.getInstance();

// Auto-initialize when imported
unifiedCssRecovery.initialize();

export default unifiedCssRecovery;
