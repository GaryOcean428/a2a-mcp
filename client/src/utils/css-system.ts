/**
 * Unified CSS Recovery System
 * 
 * This module provides a comprehensive CSS recovery system that ensures
 * critical styles are properly applied in both development and production environments.
 * It combines the functionality of multiple previous approaches into a single,
 * maintainable system.
 */

// Configuration
const CSS_DEBUG = false;
const CRITICAL_STYLES = ['bg-gradient-to-r', 'feature-card'];

/**
 * CSS Recovery Manager
 * Provides a centralized system for handling CSS recovery and verification
 */
export class CssRecoveryManager {
  private static instance: CssRecoveryManager;
  private initialized = false;
  private criticalStylesVerified = false;
  private recoveryApplied = false;
  
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
   * Initialize the CSS recovery system
   */
  public initialize(): void {
    if (this.initialized) return;
    
    // Check if we need to perform recovery
    this.log('debug', 'Verifying styles...');
    
    const needsRecovery = this.verifyCriticalStyles();
    if (needsRecovery) {
      this.applyRecovery();
    }
    
    // Setup mutation observer to monitor DOM changes
    this.setupMutationObserver();
    
    this.initialized = true;
  }
  
  /**
   * Verify that critical CSS classes are properly applied
   */
  private verifyCriticalStyles(): boolean {
    // Check if inline styles are present
    const hasInlineStyles = document.head.querySelector('style[data-critical="true"]') !== null;
    this.log('debug', `Critical inline styles present: ${hasInlineStyles}`);
    
    // Check for missing critical classes
    const missingStyles = this.findMissingStyles();
    
    if (missingStyles.length > 0) {
      this.log('warn', `Missing critical styles: ${missingStyles.join(', ')}`);
      return true;
    }
    
    this.criticalStylesVerified = true;
    return false;
  }
  
  /**
   * Find missing critical styles
   */
  private findMissingStyles(): string[] {
    const styleSheets = Array.from(document.styleSheets);
    const missingStyles: string[] = [];
    
    // Check each critical style to see if it's defined
    for (const style of CRITICAL_STYLES) {
      let found = false;
      
      try {
        for (const sheet of styleSheets) {
          // Skip cross-origin style sheets
          if (sheet.href && sheet.href.startsWith('http') && 
              !sheet.href.includes(window.location.host)) {
            continue;
          }
          
          try {
            // Find rules that match the style
            const rules = Array.from(sheet.cssRules);
            for (const rule of rules) {
              if (rule instanceof CSSStyleRule && 
                  rule.selectorText && 
                  rule.selectorText.includes(`.${style}`)) {
                found = true;
                break;
              }
            }
            
            if (found) break;
          } catch (e) {
            // Cross-origin stylesheet - can't access rules
            continue;
          }
        }
      } catch (e) {
        // If we can't check, assume it's missing
        found = false;
      }
      
      if (!found) {
        missingStyles.push(style);
      }
    }
    
    return missingStyles;
  }
  
  /**
   * Apply CSS recovery - inject critical styles directly
   */
  private applyRecovery(): void {
    if (this.recoveryApplied) return;
    
    // Create a style element for critical CSS
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-critical', 'true');
    styleEl.setAttribute('data-recovery', 'true');
    
    // Define critical styles
    styleEl.textContent = `
      /* Critical CSS Recovery - Auto-injected */
      .bg-gradient-to-r {
        background-image: linear-gradient(to right, var(--tw-gradient-stops));
      }
      
      .feature-card {
        border-radius: 0.5rem;
        border: 1px solid rgba(var(--card-border-rgb), 0.25);
        padding: 1.5rem;
        transition: all 0.2s ease;
      }
      
      .feature-card:hover {
        border-color: rgba(var(--card-border-rgb), 0.5);
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
    `;
    
    // Append to head
    document.head.appendChild(styleEl);
    
    this.recoveryApplied = true;
    this.log('info', 'Critical styles injected ✓');
  }
  
  /**
   * Set up mutation observer to handle DOM changes
   */
  private setupMutationObserver(): void {
    // Create mutation observer
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check if our critical styles element was removed
          const criticalStyleEl = document.head.querySelector('style[data-critical="true"]');
          if (!criticalStyleEl && this.recoveryApplied) {
            this.recoveryApplied = false;
            this.applyRecovery();
          }
        }
      }
    });
    
    // Start observing
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Log a message with appropriate styling
   */
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string): void {
    if (!CSS_DEBUG && level === 'debug') return;
    
    const prefix = '[CSS Recovery]';
    
    switch (level) {
      case 'info':
        console.info(`${prefix} ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`);
        break;
      case 'error':
        console.error(`${prefix} ${message}`);
        break;
      case 'debug':
        console.debug(`${prefix} ${message}`);
        break;
    }
  }
}

/**
 * Style fixer component that applies direct CSS fixes
 * for specific elements that need customized styling.
 */
export class StyleFixer {
  private static instance: StyleFixer;
  private initialized = false;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): StyleFixer {
    if (!StyleFixer.instance) {
      StyleFixer.instance = new StyleFixer();
    }
    return StyleFixer.instance;
  }
  
  /**
   * Initialize the style fixer
   */
  public initialize(): void {
    if (this.initialized) return;
    
    // Apply CSS fixes for specific elements
    this.applyDirectCssFixes();
    
    // Set up mutation observer to handle DOM changes
    this.setupMutationObserver();
    
    this.initialized = true;
  }
  
  /**
   * Apply direct CSS fixes to elements that need custom styling
   */
  private applyDirectCssFixes(): void {
    console.log('[StyleFixer] Applying direct CSS fixes...');
    
    // Fix gradients on hero sections
    document.querySelectorAll('.hero-gradient').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.backgroundImage = 'linear-gradient(to right, var(--primary-500), var(--primary-700))';
      }
    });
    
    // Fix feature cards
    document.querySelectorAll('.feature-card').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.borderRadius = '0.5rem';
        el.style.border = '1px solid rgba(var(--card-border-rgb), 0.25)';
        el.style.padding = '1.5rem';
        el.style.transition = 'all 0.2s ease';
      }
    });
    
    console.log('[StyleFixer] Finished applying direct CSS fixes.');
  }
  
  /**
   * Set up mutation observer to handle DOM changes
   */
  private setupMutationObserver(): void {
    // Create mutation observer
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          console.log('[StyleFixer] DOM changed, reapplying CSS fixes...');
          this.applyDirectCssFixes();
          break;
        }
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

/**
 * Initialize the CSS recovery system
 */
export function initializeCssSystem(): void {
  // Initialize CSS recovery manager
  CssRecoveryManager.getInstance().initialize();
  
  // Initialize style fixer
  StyleFixer.getInstance().initialize();
  
  // Add emergency CSS fix to window object for global access
  (window as any).applyCssEmergencyFix = () => {
    console.log('Emergency CSS fix applied');
    CssRecoveryManager.getInstance().initialize();
    StyleFixer.getInstance().initialize();
  };
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM content to be loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeCssSystem();
    });
  } else {
    // DOM already loaded
    initializeCssSystem();
  }
}
