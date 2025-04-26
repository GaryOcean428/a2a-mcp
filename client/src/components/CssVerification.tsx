/**
 * MCP Integration Platform - CSS Verification Component
 * 
 * This component acts as a monitoring tool to verify that critical CSS classes
 * are properly loaded in both development and production environments.
 * 
 * It reports status to the console for debugging purposes but doesn't visibly
 * render anything to the user interface.
 */

import { useEffect, useState } from 'react';

function CssVerification() {
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  // List of critical CSS classes that must be available
  const CRITICAL_CLASSES = [
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
  
  useEffect(() => {
    if (verificationComplete) return;
    
    console.log('[CSS Verify] Running verification...');
    
    // Check for critical inline styles
    const hasInlineStyles = Array.from(document.head.querySelectorAll('style'))
      .some(el => el.textContent?.includes('.animate-fade-in-down') || 
                  el.textContent?.includes('fadeInDown'));
    
    console.log('[CSS Verify] Critical inline styles present:', hasInlineStyles);
    
    // Check for external stylesheets
    const externalStylesheets = document.head.querySelectorAll('link[rel="stylesheet"]');
    console.log('[CSS Verify] External stylesheets loaded:', externalStylesheets.length);
    
    // Test each critical class
    console.log('[CSS Verify] Testing critical CSS classes:');
    
    // Test if a class is available
    const testClass = (className: string): boolean => {
      const testDiv = document.createElement('div');
      document.body.appendChild(testDiv);
      testDiv.className = className;
      
      // Get computed style
      const computedStyle = window.getComputedStyle(testDiv);
      
      // Different classes need different tests
      let result = false;
      
      // Each class type needs a specific test
      if (className === 'bg-grid-gray-100') {
        result = computedStyle.backgroundImage.includes('linear-gradient');
      } else if (className === 'bg-blob-gradient') {
        result = computedStyle.backgroundImage.includes('radial-gradient');
      } else if (className === 'feature-card') {
        result = computedStyle.transition.includes('all') || computedStyle.boxShadow !== 'none';
      } else if (className === 'animate-fade-in-down') {
        result = computedStyle.animation.includes('fadeInDown') || computedStyle.animation !== 'none';
      } else if (className.startsWith('from-') || className.startsWith('via-') || className.startsWith('to-')) {
        // We're handling CSS custom properties
        const fromValue = computedStyle.getPropertyValue('--tw-gradient-from');
        const viaValue = computedStyle.getPropertyValue('--tw-gradient-via');
        const toValue = computedStyle.getPropertyValue('--tw-gradient-to');
        result = fromValue !== '' || viaValue !== '' || toValue !== '';
      } else if (className.includes('hover:') || className.includes('group-hover:')) {
        // We can't fully test these dynamic styles - just check if transition is set
        result = computedStyle.transition !== 'none' && computedStyle.transition !== '';
      } else {
        // Default test for any class - just check if it's parsed by seeing if it affects the element
        const defaultDiv = document.createElement('div');
        document.body.appendChild(defaultDiv);
        const defaultStyle = window.getComputedStyle(defaultDiv);
        
        result = false;
        for (let i = 0; i < computedStyle.length; i++) {
          const prop = computedStyle[i];
          if (
            typeof prop === 'string' && 
            !prop.startsWith('webkit') && 
            computedStyle.getPropertyValue(prop) !== defaultStyle.getPropertyValue(prop)
          ) {
            result = true;
            break;
          }
        }
        
        document.body.removeChild(defaultDiv);
      }
      
      // Clean up
      document.body.removeChild(testDiv);
      
      // Log result
      console.log(`[CSS Verify] - ${className}: ${result ? 'OK' : 'MISSING'}`);
      
      return result;
    };
    
    // Test all critical classes
    CRITICAL_CLASSES.forEach(testClass);
    
    console.log('[CSS Verify] Verification complete');
    setVerificationComplete(true);
    
    // Expose globally for debugging
    (window as any).verifyCss = () => {
      setVerificationComplete(false);
    };
    
  }, [verificationComplete]);

  // The component doesn't actually render anything visible
  return null;
}

export default CssVerification;