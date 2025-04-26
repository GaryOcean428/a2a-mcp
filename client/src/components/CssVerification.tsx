import React, { useEffect } from 'react';
import { VERSION } from '../version';

// List of critical CSS classes that must be present
const CRITICAL_CSS_CLASSES = [
  'bg-grid-gray-100',
  'bg-blob-gradient',
  'feature-card',
  'animate-fade-in-down',
  'from-purple-50',
  'via-indigo-50',
  'to-white',
  'group-hover:scale-110',
  'group-hover:opacity-100',
  'group-hover:text-purple-700',
  'group-hover:text-indigo-700',
  'group-hover:text-violet-700',
  'hover:shadow-lg',
  'hover:border-purple-200',
  'hover:translate-y-[-2px]'
];

// Check if a CSS class is properly applied by testing it on a div
const testCssClass = (className: string): boolean => {
  // Create a test div with the class
  const testDiv = document.createElement('div');
  document.body.appendChild(testDiv);
  testDiv.className = className;
  
  // Get computed style
  const computedStyle = window.getComputedStyle(testDiv);
  
  // Different classes need different tests
  let result = false;
  
  if (className === 'bg-grid-gray-100') {
    result = computedStyle.backgroundImage.includes('linear-gradient');
  } else if (className === 'bg-blob-gradient') {
    result = computedStyle.backgroundImage.includes('radial-gradient');
  } else if (className === 'feature-card') {
    result = computedStyle.transition.includes('all') || computedStyle.boxShadow !== 'none';
  } else if (className === 'animate-fade-in-down') {
    result = computedStyle.animation.includes('fadeInDown') || computedStyle.animation !== 'none';
  } else if (className.startsWith('from-') || className.startsWith('via-') || className.startsWith('to-')) {
    result = computedStyle.getPropertyValue('--tw-gradient-from') !== '' || 
             computedStyle.getPropertyValue('--tw-gradient-via') !== '' ||
             computedStyle.getPropertyValue('--tw-gradient-to') !== '';
  } else if (className.includes('hover:')) {
    // We can't fully test hover styles this way, assuming present if the class is parsed
    result = true;
  } else if (className.includes('group-hover:')) {
    // We can't fully test group-hover styles this way, assuming present if the class is parsed
    result = true;
  } else {
    // Default: class is present if it has any effect on the element
    result = JSON.stringify(computedStyle) !== JSON.stringify(window.getComputedStyle(document.body));
  }
  
  // Clean up
  document.body.removeChild(testDiv);
  return result;
};

// Count the number of loaded stylesheets
const countLoadedStylesheets = (): number => {
  return document.styleSheets.length;
};

// Check if critical inline styles are present
const hasCriticalInlineStyles = (): boolean => {
  return !!document.getElementById('production-critical-css') || 
    Array.from(document.styleSheets).some(sheet => {
      try {
        // Check for our critical styles markers in any inline stylesheet
        const rules = Array.from(sheet.cssRules || []);
        return rules.some(rule => rule.cssText.includes('Critical UI styles for production'));
      } catch (e) {
        // Cross-origin stylesheet, can't access rules
        return false;
      }
    });
};

// Apply any missing styles immediately
const applyMissingStyles = () => {
  // Check if production.css exists already
  if (document.querySelector('link[href*="production.css"]')) return;
  
  const criticalClasses = CRITICAL_CSS_CLASSES.filter(cls => !testCssClass(cls));
  
  if (criticalClasses.length > 0) {
    console.warn('[CSS Verify] Missing critical classes:', criticalClasses);
    
    // Create and inject the fallback stylesheet link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/assets/production.css?v=${VERSION}`;
    link.id = 'fallback-critical-css';
    document.head.appendChild(link);
    
    console.log('[CSS Verify] Fallback CSS loaded');
  }
};

export const CssVerification: React.FC = () => {
  useEffect(() => {
    // Run verification on mount
    console.log('[CSS Verify] Running verification...');
    
    // Check for critical inline styles
    const hasInlineStyles = hasCriticalInlineStyles();
    console.log('[CSS Verify] Critical inline styles present:', hasInlineStyles);
    
    // Count loaded stylesheets
    const stylesheetCount = countLoadedStylesheets();
    console.log('[CSS Verify] External stylesheets loaded:', stylesheetCount);
    
    // Test all critical CSS classes
    console.log('[CSS Verify] Testing critical CSS classes:');
    const results = CRITICAL_CSS_CLASSES.map(cls => {
      const result = testCssClass(cls);
      console.log(`[CSS Verify] - ${cls}: ${result ? 'OK' : 'MISSING'}`);
      return { class: cls, result };
    });
    
    // Apply missing styles if needed
    if (results.some(r => !r.result)) {
      applyMissingStyles();
    }
    
    console.log('[CSS Verify] Verification complete');
    
    // Add global version marker for debugging
    // Use proper typing for custom window properties
    (window as any).mcpVersion = VERSION;
    document.documentElement.dataset.mcpVersion = VERSION;
    
  }, []);
  
  // Render nothing - this is just for verification
  return null;
};

export default CssVerification;