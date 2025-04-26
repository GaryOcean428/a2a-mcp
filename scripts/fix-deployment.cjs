/**
 * MCP Integration Platform Deployment Fix Script
 * 
 * This script focuses specifically on fixing the issue where styled UI components
 * in development don't match production after deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Step 4: Create direct CSS file for production to reference
console.log('\n4️⃣ Creating production-ready CSS file...');
try {
  // Create a dedicated CSS file with all the critical styles
  const cssPath = path.resolve('./client/src/production.css');
  const cssContent = `
/* MCP Integration Platform Production Critical CSS */
/* This file contains critical styles that are needed in production */

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
.group-hover\\:scale-110 {
  transition: transform 0.3s ease-out;
}
.group:hover .group-hover\\:scale-110 {
  transform: scale(1.1);
}

.group-hover\\:opacity-100 {
  transition: opacity 0.3s ease-out;
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
.group-hover\\:text-purple-700 {
  transition: color 0.3s ease-out;
}
.group:hover .group-hover\\:text-purple-700 {
  color: rgba(126, 34, 206, 1);
}
.group-hover\\:text-indigo-700 {
  transition: color 0.3s ease-out;
}
.group:hover .group-hover\\:text-indigo-700 {
  color: rgba(67, 56, 202, 1);
}
.group-hover\\:text-violet-700 {
  transition: color 0.3s ease-out;
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
`;
  
  fs.writeFileSync(cssPath, cssContent);
  console.log('✅ Created production CSS file');
  
  // Update main.tsx to import the CSS
  const mainPath = path.resolve('./client/src/main.tsx');
  if (fs.existsSync(mainPath)) {
    let mainContent = fs.readFileSync(mainPath, 'utf8');
    
    if (!mainContent.includes('production.css')) {
      mainContent = mainContent.replace(
        /import ['"]\.\/index\.css['"]/,
        `import './index.css';\nimport './production.css'; // Critical CSS for production`
      );
      
      fs.writeFileSync(mainPath, mainContent);
      console.log('✅ Updated main.tsx to import production CSS');
    }
  }
} catch (error) {
  console.error('❌ Failed to create production CSS:', error.message);
}

// Step 5: Create deploy-verify.js script for production verification
console.log('\n5️⃣ Creating deployment verification script...');
try {
  const verifyScriptPath = path.resolve('./client/public/deploy-verify.js');
  const verifyScript = `/**
 * MCP Platform Production CSS Verification Script
 * 
 * This script runs automatically in production to verify and fix any CSS issues
 */

// Wait for the page to be fully loaded
window.addEventListener('load', function() {
  console.log('[CSS Verify] Running verification...');
  
  // Check if critical style element exists
  const hasCriticalStyles = document.getElementById('critical-styles') !== null;
  console.log('[CSS Verify] Critical inline styles present:', hasCriticalStyles);
  
  // Count loaded stylesheets
  const stylesheets = Array.from(document.styleSheets).filter(sheet => 
    sheet.href && sheet.href.includes('.css')
  );
  
  console.log('[CSS Verify] External stylesheets loaded:', stylesheets.length);
  stylesheets.forEach(sheet => {
    console.log('[CSS Verify] - ' + sheet.href);
  });
  
  // Test if our critical classes have styles
  const testElement = document.createElement('div');
  document.body.appendChild(testElement);
  
  // Test classes
  const testClasses = [
    'bg-grid-gray-100',
    'bg-blob-gradient',
    'feature-card',
    'animate-fade-in-down'
  ];
  
  console.log('[CSS Verify] Testing critical CSS classes:');
  testClasses.forEach(className => {
    testElement.className = className;
    const style = window.getComputedStyle(testElement);
    const hasStyles = style.backgroundImage !== 'none' || 
                      style.boxShadow !== 'none' ||
                      style.padding !== '0px';
    console.log(\`[CSS Verify] - \${className}: \${hasStyles ? 'OK' : 'MISSING'}\`);
    
    // If styles are missing, try to apply them inline
    if (!hasStyles && className === 'bg-grid-gray-100') {
      console.log('[CSS Verify] Fixing missing grid styles');
      const fixStyle = document.createElement('style');
      fixStyle.textContent = \`.bg-grid-gray-100 {
        background-image: linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        background-size: 24px 24px;
      }\`;
      document.head.appendChild(fixStyle);
    }
    
    if (!hasStyles && className === 'bg-blob-gradient') {
      console.log('[CSS Verify] Fixing missing blob gradient');
      const fixStyle = document.createElement('style');
      fixStyle.textContent = \`.bg-blob-gradient {
        background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
        filter: blur(50px);
      }\`;
      document.head.appendChild(fixStyle);
    }
    
    if (!hasStyles && className === 'feature-card') {
      console.log('[CSS Verify] Fixing missing feature card styles');
      const fixStyle = document.createElement('style');
      fixStyle.textContent = \`.feature-card {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(229, 231, 235);
        transition: all 0.3s;
      }\`;
      document.head.appendChild(fixStyle);
    }
  });
  
  document.body.removeChild(testElement);
  
  console.log('[CSS Verify] Verification complete');
});
`;
  
  // Create public directory if it doesn't exist
  const publicDir = path.resolve('./client/public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(verifyScriptPath, verifyScript);
  console.log('✅ Created verification script');
  
  // Add script to index.html
  const htmlPath = path.resolve('./client/index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  if (!htmlContent.includes('deploy-verify.js')) {
    htmlContent = htmlContent.replace('</body>', 
      `  <!-- Verify and fix CSS in production -->
  <script>
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
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

// Step 6: Add version meta tag to HTML
console.log('\n6️⃣ Adding version meta tag...');
try {
  const htmlPath = path.resolve('./client/index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  const timestamp = Date.now();
  const version = `2.5.${timestamp}`;
  
  // Add meta tag if not present
  if (!htmlContent.includes('name="app-version"')) {
    htmlContent = htmlContent.replace('</head>',
      `  <meta name="app-version" content="${version}">
</head>`);
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ Added version meta tag: ${version}`);
    
    // Update version.ts
    const versionPath = path.resolve('./client/src/version.ts');
    fs.writeFileSync(versionPath, `export const VERSION = "${version}";`);
    console.log(`✅ Updated version.ts: ${version}`);
  }
} catch (error) {
  console.error('❌ Failed to add version meta tag:', error.message);
}

// Complete!
console.log('\n✅ MCP Platform CSS deployment fix complete!');
console.log('The following changes were made:');
console.log('1. Added critical inline styles to ensure UI works without external CSS');
console.log('2. Added CSS purge safelist to prevent Tailwind from removing critical classes');
console.log('3. Created production.css file with critical styles');
console.log('4. Added CSS validation and auto-fixing for production');
console.log('5. Updated version tracking');
console.log('\nTo deploy:');
console.log('1. Run: npm run build');
console.log('2. Use the Replit Deploy button');
console.log('3. After deployment, check browser console for CSS verification');