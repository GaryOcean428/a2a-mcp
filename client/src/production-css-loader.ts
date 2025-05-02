/**
 * Production CSS Loader
 * Ensures consistent styling in production environment
 */

// Only run in production environments
if (import.meta.env.PROD) {
  console.log('⚙️ Initializing production CSS loader');
  
  // Create link element for production.css
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/production.css?v=' + Date.now();
  document.head.appendChild(link);
  
  // Add critical inline styles
  const style = document.createElement('style');
  style.id = 'critical-css';
  style.textContent = `
  /* Critical styles for MCP Integration Platform */
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 263 70% 50%;
  }
  
  .feature-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    transition: all 0.3s ease;
  }
  
  .animate-fade-in-down {
    animation: fadeInDown 0.5s ease-out;
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

  /* New critical CSS classes */
  .group-hover\:scale-110 {
    transition: transform 0.3s ease-out;
  }
  .group:hover .group-hover\:scale-110 {
    transform: scale(1.1);
  }

  .from-purple-600 {
    --tw-gradient-from: #9333ea;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
  }
  .to-indigo-600 {
    --tw-gradient-to: #4f46e5;
  }

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

  .duration-300 {
    transition-duration: 300ms;
  }

  .ease-in-out {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  `;
  document.head.appendChild(style);
  
  console.log('✅ Production CSS loaded');
}

export default {};
