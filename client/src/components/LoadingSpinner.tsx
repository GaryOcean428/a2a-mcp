import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading spinner component used throughout the application
 */
export function LoadingSpinner({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  // Define sizes
  const sizes = {
    small: {
      width: '20px',
      height: '20px',
      border: '2px solid',
    },
    medium: {
      width: '40px',
      height: '40px',
      border: '3px solid',
    },
    large: {
      width: '60px',
      height: '60px',
      border: '4px solid',
    },
  };

  const spinnerStyle = {
    width: sizes[size].width,
    height: sizes[size].height,
    borderRadius: '50%',
    border: `${sizes[size].border} rgba(var(--color-primary-rgb), 0.2)`,
    borderTopColor: 'var(--color-primary)',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle = fullScreen
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column' as const,
        backgroundColor: 'var(--color-background)',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column' as const,
        padding: '1rem',
      };

  return (
    <div className="loading-container" style={containerStyle}>
      <div className="loading-spinner" style={spinnerStyle} aria-hidden="true"></div>
      {message && (
        <p className="loading-message" style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * CSS styles for the loading spinner
 */
export function injectSpinnerStyles() {
  if (typeof document !== 'undefined' && !document.getElementById('spinner-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'spinner-styles';
    styleEl.innerHTML = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleEl);
  }
}

// Auto-inject spinner styles when this component is imported
injectSpinnerStyles();