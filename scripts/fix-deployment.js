#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.bright}${colors.magenta}🚀 MCP Platform Deployment Enhancer${colors.reset}`);
console.log(`${colors.cyan}==================================${colors.reset}\n`);

// Step 1: Clean any previous build artifacts
try {
  console.log(`${colors.blue}Step 1: Cleaning previous build...${colors.reset}`);
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist');
    console.log(`   ${colors.green}✓ Previous build files removed${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✓ No previous build to clean${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}✖ Error cleaning previous build: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step 2: Update critical CSS
try {
  console.log(`\n${colors.blue}Step 2: Ensuring critical CSS is properly included...${colors.reset}`);
  
  // Check index.css and make sure our critical styles are included
  const indexCssPath = path.resolve('client/src/index.css');
  const cssContent = fs.readFileSync(indexCssPath, 'utf8');

  // Make sure CSS is correctly defined and not commented out
  const essentialClasses = [
    '.bg-grid-gray-100',
    '.bg-blob-gradient',
    '.feature-card',
    '.animate-fade-in-down'
  ];

  let cssUpdated = false;
  let missingClasses = [];

  for (const className of essentialClasses) {
    if (!cssContent.includes(className)) {
      missingClasses.push(className);
    }
  }

  if (missingClasses.length > 0) {
    console.log(`   ${colors.red}✖ Missing CSS classes: ${missingClasses.join(', ')}${colors.reset}`);
    console.log(`   ${colors.cyan}ℹ Fixing missing styles...${colors.reset}`);
    
    // Add any missing classes - this is just a failsafe
    let updatedCss = cssContent;
    
    if (!cssContent.includes('.bg-grid-gray-100')) {
      updatedCss += `\n/* Custom grid background for hero sections */
.bg-grid-gray-100 {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}\n`;
    }
    
    if (!cssContent.includes('.bg-blob-gradient')) {
      updatedCss += `\n/* Subtle shape for decorative purposes */
.bg-blob-gradient {
  background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 75%);
  filter: blur(50px);
}\n`;
    }
    
    if (!cssContent.includes('.feature-card')) {
      updatedCss += `\n/* Modern cards with hover effects */
.feature-card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-purple-200 hover:translate-y-[-2px];
}\n`;
    }
    
    if (!cssContent.includes('.animate-fade-in-down')) {
      updatedCss += `\n/* Animation keyframes */
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
}\n`;
    }
    
    fs.writeFileSync(indexCssPath, updatedCss);
    cssUpdated = true;
    console.log(`   ${colors.green}✓ Missing CSS classes added${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✓ All essential CSS classes are present${colors.reset}`);
  }

  // Step 2.1: Update tailwind.config.ts to safelist our classes
  console.log(`   ${colors.cyan}ℹ Ensuring tailwind config has safelist...${colors.reset}`);
  const tailwindConfigPath = path.resolve('tailwind.config.ts');
  let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
  
  if (!tailwindConfig.includes('safelist')) {
    // Add safelist to config
    tailwindConfig = tailwindConfig.replace(
      /content: \[.*?\],/s,
      `content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
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
  ],`
    );
    
    fs.writeFileSync(tailwindConfigPath, tailwindConfig);
    console.log(`   ${colors.green}✓ Added safelist to tailwind config${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✓ Tailwind config already has safelist${colors.reset}`);
  }
  
  // Step 2.2: Add critical styles to index.html 
  console.log(`   ${colors.cyan}ℹ Adding inline critical styles to HTML...${colors.reset}`);
  const indexHtmlPath = path.resolve('client/index.html');
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  if (!indexHtml.includes('Critical UI styles for production')) {
    // Add critical inline styles
    indexHtml = indexHtml.replace(
      /<head>[\s\S]*?<style>/,
      `<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>MCP Integration Platform</title>
    <!-- Critical UI styles to ensure they're always loaded in production -->
    <style>
      /* Critical UI styles for production - v2.5 - DO NOT REMOVE */
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
    <style>`
    );
    
    fs.writeFileSync(indexHtmlPath, indexHtml);
    console.log(`   ${colors.green}✓ Added critical inline styles to HTML${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✓ Critical inline styles already present in HTML${colors.reset}`);
  }
  
} catch (error) {
  console.error(`${colors.red}✖ Error updating CSS: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step 3: Update cookie settings for deployment
try {
  console.log(`\n${colors.blue}Step 3: Updating cookie settings for deployment...${colors.reset}`);
  
  const authPath = path.resolve('server/auth.ts');
  let authContent = fs.readFileSync(authPath, 'utf8');
  
  // Fix cookie settings for production
  if (authContent.includes('secure: false') || authContent.includes("sameSite: 'none'")) {
    console.log(`   ${colors.cyan}ℹ Updating cookie settings...${colors.reset}`);
    
    // Update cookie settings for better compatibility
    const updatedAuthContent = authContent.replace(
      /cookie: {[^}]*}/s,
      `cookie: {
      // Use secure cookies in production, allow HTTP in development
      secure: process.env.NODE_ENV === 'production',
      // Use lax SameSite in production for better compatibility
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
      // Allow cookies to work across subdomains in production
      domain: process.env.NODE_ENV === 'production' ? undefined : undefined,
      path: '/',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }`
    );
    
    fs.writeFileSync(authPath, updatedAuthContent);
    console.log(`   ${colors.green}✓ Updated cookie settings for better deployment compatibility${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✓ Cookie settings already optimized for deployment${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}✖ Error updating cookie settings: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step 4: Add browser cache control for deployed assets
try {
  console.log(`\n${colors.blue}Step 4: Adding cache control for deployed assets...${colors.reset}`);
  
  const routesPath = path.resolve('server/routes.ts');
  let routesContent = fs.readFileSync(routesPath, 'utf8');
  
  if (!routesContent.includes('Cache-Control')) {
    console.log(`   ${colors.cyan}ℹ Adding cache control middleware...${colors.reset}`);
    
    // Add cache control middleware after the imports
    const importSection = routesContent.match(/^(import[^;]*;(\s*\/\/[^\n]*\n|\s*\n)*)*\s*/m)[0];
    const updatedRoutesContent = routesContent.replace(
      importSection,
      `${importSection}
// Cache control middleware for production static assets
const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  // Add cache busting for CSS and JS files in production
  if (process.env.NODE_ENV === 'production') {
    if (req.path.endsWith('.css') || req.path.endsWith('.js')) {
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
  next();
};

`
    );
    
    // Add the middleware usage before the other app.use lines
    const updatedRoutesWithMiddleware = updatedRoutesWithMiddleware = updatedRoutesContent.replace(
      /export async function registerRoutes\(app: Express\): Promise<Server> {/,
      `export async function registerRoutes(app: Express): Promise<Server> {
  // Apply cache control middleware
  app.use(cacheControl);`
    );
    
    fs.writeFileSync(routesPath, updatedRoutesWithMiddleware);
    console.log(`   ${colors.green}✓ Added cache control middleware${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✓ Cache control middleware already present${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}✖ Error adding cache control: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step 5: Create version marker file to force refresh on changes
try {
  console.log(`\n${colors.blue}Step 5: Creating version marker file...${colors.reset}`);
  
  // Create a timestamp file that will be included in the build
  const versionTimestamp = Date.now();
  const versionContent = `export const VERSION = "2.5.${versionTimestamp}";\n`;
  
  // Create version file
  const versionPath = path.resolve('client/src/version.ts');
  fs.writeFileSync(versionPath, versionContent);
  console.log(`   ${colors.green}✓ Created version marker file: version.ts${colors.reset}`);
  
  // Create a small script to import this version in the application
  const mainTsxPath = path.resolve('client/src/main.tsx');
  let mainTsxContent = fs.readFileSync(mainTsxPath, 'utf8');
  
  if (!mainTsxContent.includes('version.ts')) {
    // Add version import near the top of the file
    const updatedMainTsx = mainTsxContent.replace(
      /import (.*?) from (.*?);(\s*)/,
      `import $1 from $2;$3
import { VERSION } from './version';
// Log version on startup to verify the correct version is deployed
console.log(\`MCP Integration Platform v\${VERSION}\`);$3`
    );
    
    fs.writeFileSync(mainTsxPath, updatedMainTsx);
    console.log(`   ${colors.green}✓ Added version logging to main.tsx${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✓ Version import already added to main.tsx${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}✖ Error creating version marker: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step A: Update routes to serve the latest static files
try {
  console.log(`\n${colors.blue}Final Step: Running production build...${colors.reset}`);
  // Run the build script with NODE_ENV=production to ensure production settings
  execSync('NODE_ENV=production npm run build', { stdio: 'inherit' });
  console.log(`\n${colors.green}${colors.bright}✅ Deployment preparation completed successfully!${colors.reset}`);
  console.log(`\n${colors.cyan}Deploy your application now using the Replit Deploy button.${colors.reset}`);
  console.log(`\n${colors.magenta}After deployment, if UI still appears outdated:${colors.reset}`);
  console.log(`   ${colors.cyan}- Try visiting the URL with a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)${colors.reset}`);
  console.log(`   ${colors.cyan}- Add ?v=${Date.now()} to the URL to bypass browser cache${colors.reset}`);
  console.log(`   ${colors.cyan}- Clear your browser's cache completely if issues persist${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}✖ Error running build: ${error.message}${colors.reset}`);
  process.exit(1);
}