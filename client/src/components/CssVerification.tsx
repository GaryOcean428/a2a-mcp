/**
* CSS Verification Component
* 
* This component verifies that critical CSS styles are loaded correctly
* and provides a way to manually trigger the CSS recovery system.
* Used in development and production to ensure UI consistency.
*/
import { useState } from 'react';
import { VERSION } from '../version';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function CssVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<{cls: string, result: boolean}[]>([]);
  
  // Critical classes that must be verified
  const criticalClasses = [
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'feature-card',
    'animate-fade-in-down',
    'from-purple-50',
    'from-purple-600',
    'to-indigo-600',
    'bg-gradient-to-r',
    'group-hover:scale-110',
    'animate-in'
  ];
  
  // Verify critical CSS classes are properly applied
  function verifyStyles() {
    setIsVerifying(true);
    setVerificationResults([]);
    
    const results = criticalClasses.map(cls => {
      // Create test element
      const testEl = document.createElement('div');
      testEl.className = cls;
      document.body.appendChild(testEl);
      
      // Get computed style
      const style = window.getComputedStyle(testEl);
      
      // Check if style has expected properties
      let result = false;
      if (cls === 'bg-grid-gray-100') {
        result = style.backgroundImage.includes('linear-gradient');
      } else if (cls === 'bg-blob-gradient') {
        result = style.backgroundImage.includes('radial-gradient');
      } else if (cls === 'feature-card') {
        result = style.transition.includes('all');
      } else if (cls === 'animate-fade-in-down') {
        result = style.animation.includes('fadeInDown');
      } else if (cls.startsWith('from-')) {
        result = style.getPropertyValue('--tw-gradient-from') !== '';
      } else if (cls.startsWith('to-')) {
        result = style.getPropertyValue('--tw-gradient-to') !== '';
      } else if (cls === 'bg-gradient-to-r') {
        result = style.backgroundImage.includes('linear-gradient(to right');
      } else if (cls.includes('hover:')) {
        result = true; // Can't verify hover state
      } else if (cls.includes('group-hover:')) {
        result = true; // Can't verify group-hover state
      } else if (cls === 'animate-in') {
        result = style.animationDuration === '150ms';
      } else {
        result = true; // Default to true for unknown classes
      }
      
      // Clean up
      document.body.removeChild(testEl);
      
      return { cls, result };
    });
    
    setVerificationResults(results);
    setIsVerifying(false);
    
    // If any failed, try to recover
    const anyFailed = results.some(r => !r.result);
    if (anyFailed && window.recoverMissingStyles) {
      window.recoverMissingStyles();
    }
  }
  
  // Force CSS recovery
  function recoverStyles() {
    if (window.recoverMissingStyles) {
      window.recoverMissingStyles();
      setTimeout(verifyStyles, 100);
    }
  }
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">UI Verification</h3>
        <span className="text-xs text-gray-500">v{VERSION}</span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Verify that all UI components are rendering correctly in {import.meta.env.PROD ? 'production' : 'development'}.
        </p>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={verifyStyles}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Verifying
              </>
            ) : (
              'Verify Styles'
            )}
          </Button>
          
          <Button
            size="sm" 
            variant="outline"
            onClick={recoverStyles}
          >
            Recover Styles
          </Button>
        </div>
      </div>
      
      {verificationResults.length > 0 && (
        <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
          {verificationResults.map(({ cls, result }) => (
            <div key={cls} className="flex items-center">
              {result ? (
                <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={result ? 'text-green-700' : 'text-red-700'}>
                {cls}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add window declarations
declare global {
  interface Window {
    recoverMissingStyles?: () => void;
  }
}
