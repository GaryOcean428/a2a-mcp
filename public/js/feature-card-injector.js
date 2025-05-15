/**
 * Feature Card CSS Injector
 * This script directly injects critical feature-card CSS
 */
(function() {
  console.log('[Feature Card Injector] Starting...');
  
  const featureCardCSS = `
/* Emergency fix for feature-card class */
.feature-card {
  display: flex !important;
  flex-direction: column !important;
  background-color: white !important;
  border-radius: 0.5rem !important;
  padding: 1.5rem !important;
  margin-bottom: 1rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.feature-card h3 {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  margin-bottom: 0.75rem !important;
}

.feature-card p {
  color: #6b7280 !important;
  margin-bottom: 1rem !important;
}

/* Fix gradient text issues */
.bg-gradient-to-r.text-transparent.bg-clip-text {
  background-image: linear-gradient(to right, rgb(124 58 237), rgb(79 70 229)) !important;
  color: transparent !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
}
`;

  function injectCSS() {
    if (document.getElementById('feature-card-fix-css')) {
      console.log('[Feature Card Injector] CSS already injected, skipping');
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'feature-card-fix-css';
    style.textContent = featureCardCSS;
    document.head.appendChild(style);
    console.log('[Feature Card Injector] CSS injected');
  }

  // Inject CSS as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCSS);
  } else {
    injectCSS();
  }
  
  // Periodically check and re-inject if needed
  setInterval(function() {
    if (!document.getElementById('feature-card-fix-css')) {
      console.log('[Feature Card Injector] Styles missing, re-injecting');
      injectCSS();
    }
  }, 1000);
})();