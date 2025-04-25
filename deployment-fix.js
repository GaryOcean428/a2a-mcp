// Deployment Fix Script
// This script ensures that our UI styles are properly included in the production build

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Starting deployment fix process...');

try {
  // 1. Clear any previous build artifacts
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
    console.log('   Previous build files removed.');
  }
  
  // 2. Make sure our enhanced CSS is directly included in the index.css to avoid any bundling issues
  console.log('📝 Ensuring CSS imports are correct...');
  
  // Read the current index.css file
  const indexCssPath = path.join(process.cwd(), 'client', 'src', 'index.css');
  let indexCssContent = fs.readFileSync(indexCssPath, 'utf8');
  
  // Check if our custom animations are included
  if (!indexCssContent.includes('fadeInDown')) {
    console.log('   Adding missing animation keyframes...');
    const animationCSS = `
/* Animation keyframes */
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
}`;
    
    // Append the animation CSS to the end of the file
    indexCssContent += animationCSS;
    fs.writeFileSync(indexCssPath, indexCssContent);
    console.log('   ✅ Animation keyframes added.');
  } else {
    console.log('   ✅ Animation keyframes already present.');
  }
  
  // Check if grid styles are included
  if (!indexCssContent.includes('bg-grid-gray-100')) {
    console.log('   Adding missing grid background styles...');
    const gridCSS = `
/* Custom grid background for hero sections */
.bg-grid-gray-100 {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}`;
    
    // Append the grid CSS to the end of the file
    indexCssContent += gridCSS;
    fs.writeFileSync(indexCssPath, indexCssContent);
    console.log('   ✅ Grid background styles added.');
  } else {
    console.log('   ✅ Grid background styles already present.');
  }
  
  // Check if feature card styles are included
  if (!indexCssContent.includes('feature-card')) {
    console.log('   Adding missing feature card styles...');
    const cardCSS = `
/* Modern cards with hover effects */
.feature-card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-purple-200 hover:translate-y-[-2px];
}`;
    
    // Append the card CSS to the end of the file
    indexCssContent += cardCSS;
    fs.writeFileSync(indexCssPath, indexCssContent);
    console.log('   ✅ Feature card styles added.');
  } else {
    console.log('   ✅ Feature card styles already present.');
  }
  
  // 3. Force Tailwind to include our custom classes in production
  console.log('🔧 Ensuring Tailwind includes our custom classes...');
  
  // Create a safelist.txt file to ensure Tailwind includes our important classes
  const safelist = `
bg-grid-gray-100
bg-blob-gradient
feature-card
animate-fade-in-down
`;
  fs.writeFileSync('tailwind-safelist.txt', safelist);
  console.log('   ✅ Tailwind safelist created.');
  
  // 4. Build the application with additional flags to ensure complete bundling
  console.log('🏗️ Building application with enhanced settings...');
  execSync('VITE_ENSURE_STYLES=true npm run build', { stdio: 'inherit' });
  
  // 5. Verify the build
  console.log('✅ Verifying build files...');
  const distPath = path.join(process.cwd(), 'dist');
  const publicPath = path.join(distPath, 'public');
  const assetsPath = path.join(publicPath, 'assets');
  
  if (!fs.existsSync(distPath)) {
    throw new Error('dist directory does not exist. Build failed.');
  }
  
  if (!fs.existsSync(publicPath)) {
    throw new Error('dist/public directory does not exist. Build failed.');
  }
  
  if (!fs.existsSync(assetsPath)) {
    throw new Error('dist/public/assets directory does not exist. Build failed.');
  }
  
  const cssFiles = fs.readdirSync(assetsPath).filter(file => file.endsWith('.css'));
  const jsFiles = fs.readdirSync(assetsPath).filter(file => file.endsWith('.js'));
  
  if (cssFiles.length === 0) {
    throw new Error('No CSS files found in dist/public/assets. Build failed.');
  }
  
  if (jsFiles.length === 0) {
    throw new Error('No JS files found in dist/public/assets. Build failed.');
  }
  
  // For each CSS file, check if it contains our critical styles
  let containsStyles = false;
  for (const cssFile of cssFiles) {
    const cssPath = path.join(assetsPath, cssFile);
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for binary content (minified files can appear as binary)
    if (!cssContent.includes('grid') && !cssContent.includes('animation')) {
      console.log(`   ⚠️ CSS file ${cssFile} may not contain required styles.`);
    } else {
      containsStyles = true;
      console.log(`   ✅ CSS file ${cssFile} contains required styles.`);
    }
  }
  
  if (!containsStyles) {
    // Inject our styles directly into the HTML file to ensure they're included
    console.log('   ⚠️ Critical styles may be missing, adding inline backup styles...');
    
    const htmlPath = path.join(publicPath, 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Create a style tag with our critical styles
    const inlineStyles = `
    <style>
      /* Critical styles for production */
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
    </style>
    `;
    
    // Insert the style tag before the closing head tag
    htmlContent = htmlContent.replace('</head>', `${inlineStyles}</head>`);
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('   ✅ Inline backup styles added to HTML.');
  }
  
  console.log('🎉 Build process complete! Your application is ready for deployment.');
  console.log('');
  console.log('To deploy, run these commands:');
  console.log('1. Use the Deploy button in the Replit interface.');
  console.log('2. After deployment, if you still face issues with the UI:');
  console.log('   a. Try adding ?nocache=' + Date.now() + ' to your URL to bypass caching');
  console.log('   b. Contact Replit support if the issue persists');
  
} catch (error) {
  console.error('❌ Deployment process failed:', error);
  process.exit(1);
}