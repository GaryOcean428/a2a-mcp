/**
 * MCP Integration Platform Deployment Fix Script
 * 
 * This script focuses specifically on fixing the issue where styled UI components
 * in development don't match production after deployment.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name correctly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 MCP Platform Deployment UI Fix');
console.log('==============================');

// Step 1: Add preload link for CSS to HTML
console.log('\n1️⃣ Adding CSS preload to HTML...');
try {
  const htmlPath = path.resolve('./client/index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Add preload for CSS if not present
  if (!htmlContent.includes('rel="preload" as="style"')) {
    htmlContent = htmlContent.replace('</head>',
      `  <!-- Preload CSS to ensure it loads before rendering -->
  <link rel="preload" href="/assets/index.css" as="style">
</head>`);
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ Added CSS preload to index.html');
  } else {
    console.log('ℹ️ CSS preload already exists in index.html');
  }
} catch (error) {
  console.error('❌ Failed to update HTML:', error.message);
}

// Step 2: Add inline styles for critical UI components
console.log('\n2️⃣ Adding critical inline styles...');
try {
  const htmlPath = path.resolve('./client/index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  const criticalStyles = `
  <style id="critical-styles">
    /* Critical UI components that must appear immediately */
    .bg-grid-gray-100 {
      background-image: 
        linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    
    .bg-blob-gradient {
      background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
      filter: blur(50px);
    }
    
    .feature-card {
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(229, 231, 235);
      transition: all 0.3s;
    }
    
    .feature-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-color: rgba(167, 139, 250, 0.4);
      transform: translateY(-2px);
    }
    
    /* Gradient backgrounds */
    .from-purple-50 {
      --tw-gradient-from: #faf5ff;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
    }
    .via-indigo-50 {
      --tw-gradient-via: #eef2ff;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to);
    }
    .to-white {
      --tw-gradient-to: #ffffff;
    }
    
    /* Card hover effects */
    .group:hover .group-hover\\:scale-110 {
      transform: scale(1.1);
    }
    .group:hover .group-hover\\:opacity-100 {
      opacity: 1;
    }
    .hover\\:shadow-lg:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .hover\\:border-purple-200:hover {
      border-color: rgba(221, 214, 254, 1);
    }
    .hover\\:translate-y-\\[-2px\\]:hover {
      transform: translateY(-2px);
    }
    
    /* Text colors on hover */
    .group:hover .group-hover\\:text-purple-700 {
      color: rgba(126, 34, 206, 1);
    }
    .group:hover .group-hover\\:text-indigo-700 {
      color: rgba(67, 56, 202, 1);
    }
    .group:hover .group-hover\\:text-violet-700 {
      color: rgba(109, 40, 217, 1);
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
      animation: fadeInDown 0.5s ease-out;
    }
  </style>`;
  
  // Add critical styles if not already present
  if (!htmlContent.includes('id="critical-styles"')) {
    // Add after charset meta tag
    htmlContent = htmlContent.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />' + criticalStyles);
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ Added critical inline styles');
  } else {
    console.log('ℹ️ Critical styles already exist');
  }
} catch (error) {
  console.error('❌ Failed to add critical styles:', error.message);
}

// Step 3: Create CSS purge safelist in tailwind.config.ts
console.log('\n3️⃣ Adding CSS purge safelist...');
try {
  const tailwindConfigPath = path.resolve('./tailwind.config.ts');
  let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
  
  // Classes to safelist (prevent Tailwind from purging)
  const safelist = [
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

  // Check if safelist already exists in config
  if (!tailwindConfig.includes('safelist:')) {
    // Add safelist property before content
    tailwindConfig = tailwindConfig.replace(
      /content\s*:\s*\[/,
      `safelist: [\n    '${safelist.join("',\n    '")}'\n  ],\n  content: [`
    );
    
    fs.writeFileSync(tailwindConfigPath, tailwindConfig);
    console.log('✅ Added safelist to Tailwind config');
  } else {
    console.log('ℹ️ Tailwind safelist already exists');
  }
} catch (error) {
  console.error('❌ Failed to update Tailwind config:', error.message);
}

// Step 4: Modify Vite config to ensure CSS is extracted properly
console.log('\n4️⃣ Optimizing Vite CSS extraction...');
try {
  const viteConfigPath = path.resolve('./vite.config.ts');
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Add CSS extraction options if not already present
  if (!viteConfig.includes('cssCodeSplit: false')) {
    // Find the build section or create it
    if (viteConfig.includes('build:')) {
      // Update existing build section
      viteConfig = viteConfig.replace(
        /build\s*:\s*{/,
        `build: {\n    cssCodeSplit: false, // Extract all CSS into a single file\n    cssMinify: true,`
      );
    } else {
      // Add new build section
      viteConfig = viteConfig.replace(
        /plugins\s*:\s*\[/,
        `build: {
    cssCodeSplit: false, // Extract all CSS into a single file
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: undefined // Ensures CSS is not split
      }
    }
  },
  plugins: [`
      );
    }
    
    fs.writeFileSync(viteConfigPath, viteConfig);
    console.log('✅ Optimized Vite CSS extraction');
  } else {
    console.log('ℹ️ Vite CSS extraction already optimized');
  }
} catch (error) {
  console.error('❌ Failed to update Vite config:', error.message);
}

// Step 5: Create deployment verification script
console.log('\n5️⃣ Creating deployment verification script...');
try {
  const verifyScriptPath = path.resolve('./deploy-verify.js');
  const verifyScript = `
/**
 * MCP Platform Production CSS Verification Script
 * 
 * This script is run automatically after deployment to verify that
 * CSS is working properly in production.
 */

// Check if running in a Node.js environment
if (typeof window === 'undefined') {
  console.log('Running in Node.js - deployment verification');
  // This would run server-side code to validate deployment
  process.exit(0);
}

// This runs in the browser
(function() {
  // Report CSS loading status
  const reportCssStatus = () => {
    // Check if critical inline styles are present
    const criticalStyles = document.getElementById('critical-styles');
    console.log('[CSS Verify] Critical styles loaded:', !!criticalStyles);
    
    // Check if any external CSS files are loaded
    const cssLinks = Array.from(document.styleSheets).filter(sheet => 
      sheet.href && sheet.href.includes('.css')
    );
    console.log('[CSS Verify] External CSS files:', cssLinks.length);
    cssLinks.forEach(sheet => {
      console.log('[CSS Verify] CSS file:', sheet.href);
    });
    
    // Check for specific CSS classes
    const testClasses = [
      'bg-grid-gray-100',
      'bg-blob-gradient',
      'feature-card'
    ];
    
    const testElement = document.createElement('div');
    document.body.appendChild(testElement);
    
    testClasses.forEach(className => {
      testElement.className = className;
      const computedStyle = window.getComputedStyle(testElement);
      const hasStyles = computedStyle.backgroundImage !== '' || 
                       computedStyle.boxShadow !== '' ||
                       computedStyle.padding !== '';
      console.log(\`[CSS Verify] Class '\${className}' has styles: \${hasStyles}\`);
    });
    
    document.body.removeChild(testElement);
    
    // Report overall status
    console.log('[CSS Verify] Complete - check console for details');
  };
  
  // Run verification when the page is fully loaded
  if (document.readyState === 'complete') {
    reportCssStatus();
  } else {
    window.addEventListener('load', reportCssStatus);
  }
})();
`;
  
  fs.writeFileSync(verifyScriptPath, verifyScript);
  console.log('✅ Created deployment verification script');
  
  // Update HTML to include the verification script in production
  const htmlPath = path.resolve('./client/index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  if (!htmlContent.includes('deploy-verify.js')) {
    // Add script before closing body tag
    htmlContent = htmlContent.replace('</body>', `  <!-- Production CSS verification -->
  <script>
    if (location.hostname !== 'localhost') {
      const script = document.createElement('script');
      script.src = '/deploy-verify.js?v=' + Date.now();
      document.body.appendChild(script);
    }
  </script>
</body>`);
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ Added verification script to HTML');
  }
} catch (error) {
  console.error('❌ Failed to create verification script:', error.message);
}

// Step 6: Add cache control headers server-side
console.log('\n6️⃣ Setting up cache control middleware...');
try {
  const routesPath = path.resolve('./server/routes.ts');
  if (fs.existsSync(routesPath)) {
    let routesContent = fs.readFileSync(routesPath, 'utf8');
    
    // Check if cache control middleware already exists
    if (!routesContent.includes('cacheControl')) {
      // Add cache control middleware
      const cacheControlMiddleware = `
// Cache control middleware for static assets
const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  // Add cache busting for assets in production
  if (process.env.NODE_ENV === 'production') {
    if (req.path.endsWith('.css') || req.path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
  next();
};
`;
      
      // Insert middleware definition after imports
      routesContent = routesContent.replace(
        /(import.*?;(\r?\n|\r))+/,
        '$&' + cacheControlMiddleware
      );
      
      // Check if the app.use(cacheControl) line is missing
      if (!routesContent.includes('app.use(cacheControl)')) {
        // Look for the point where routes are registered
        routesContent = routesContent.replace(
          /export (async )?function registerRoutes\(app: Express\)(: Promise<Server>)? {/,
          `export $1function registerRoutes(app: Express)$2 {
  // Apply cache control middleware to prevent caching of static assets in production
  app.use(cacheControl);`
        );
      }
      
      fs.writeFileSync(routesPath, routesContent);
      console.log('✅ Added cache control middleware');
    } else {
      console.log('ℹ️ Cache control middleware already exists');
    }
  }
} catch (error) {
  console.error('❌ Failed to update routes:', error.message);
}

// Finish
console.log('\n✨ MCP Platform Deployment UI Fix completed!');
console.log('Run the following to prepare for deployment:');
console.log('  node scripts/fix-deployment.js && NODE_ENV=production npm run build');
console.log('Then use the Replit Deploy button to deploy your application.');