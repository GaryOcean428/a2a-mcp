import React, { useEffect } from 'react';

/**
 * StyleFixer Component
 * 
 * A dedicated component that directly fixes critical CSS styles for UI elements that
 * may have lost their styles due to purging or other issues. This component runs after
 * the UI is rendered to ensure proper appearance.
 */
export const StyleFixer: React.FC = () => {
  useEffect(() => {
    // Function to apply critical styles directly to DOM elements
    const fixCriticalStyles = () => {
      console.log('[StyleFixer] Applying direct CSS fixes...');
      
      // Fix gradient text elements
      const gradientTexts = document.querySelectorAll(
        '.bg-gradient-to-r.text-transparent, [class*="bg-gradient"][class*="text-transparent"]'
      );
      
      gradientTexts.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.color = 'transparent';
          element.style.webkitBackgroundClip = 'text';
          element.style.backgroundClip = 'text';
          
          // Only set background image if it's a purple-to-indigo gradient
          if (element.classList.contains('from-purple-600') && 
              element.classList.contains('to-indigo-600')) {
            element.style.backgroundImage = 'linear-gradient(to right, #9333ea, #4f46e5)';
          }
        }
      });
      
      // Fix feature cards
      const featureCards = document.querySelectorAll('.feature-card');
      featureCards.forEach((card) => {
        if (card instanceof HTMLElement) {
          card.style.backgroundColor = 'white';
          card.style.padding = '1.5rem';
          card.style.borderRadius = '0.5rem';
          card.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
          card.style.border = '1px solid rgba(229, 231, 235)';
          card.style.transition = 'all 0.3s ease';
          
          // Add hover effect with JavaScript
          card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            card.style.borderColor = 'rgba(167, 139, 250, 0.4)';
            card.style.transform = 'translateY(-5px)';
          });
          
          card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            card.style.borderColor = 'rgba(229, 231, 235)';
            card.style.transform = 'translateY(0)';
          });
        }
      });
      
      console.log('[StyleFixer] Finished applying direct CSS fixes.');
    };
    
    // Run immediately
    fixCriticalStyles();
    
    // Also run after a short delay to catch elements that might be loaded later
    const timeoutId = setTimeout(fixCriticalStyles, 500);
    
    // Also run when the DOM changes (using MutationObserver)
    const observer = new MutationObserver((mutations) => {
      // Check if any interesting elements were added
      const shouldFix = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          if (node instanceof HTMLElement) {
            // Check if the node or its children might have critical classes
            return (
              node.classList?.contains('bg-gradient-to-r') ||
              node.classList?.contains('text-transparent') ||
              node.classList?.contains('feature-card') ||
              node.querySelector('.bg-gradient-to-r') ||
              node.querySelector('.text-transparent') ||
              node.querySelector('.feature-card')
            );
          }
          return false;
        });
      });
      
      if (shouldFix) {
        console.log('[StyleFixer] DOM changed, reapplying CSS fixes...');
        fixCriticalStyles();
      }
    });
    
    // Start observing the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default StyleFixer;
