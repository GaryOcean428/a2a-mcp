/**
 * MCP Integration Platform - Replit Deployment Configuration
 * 
 * This script is executed automatically by Replit before deployment.
 * It ensures consistent UI between development and production environments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 MCP Platform Deployment Configuration');
console.log('=======================================');

// Generate a deployment version based on timestamp
const VERSION = `2.5.${Date.now()}`;
console.log(`Setting version: ${VERSION}`);

// Update version file
fs.writeFileSync(
  path.join(__dirname, 'client/src/version.ts'),
  `export const VERSION = "${VERSION}";`
);

// Run our CSS deployment fix script
console.log('Running CSS deployment fix...');
try {
  execSync('node scripts/fix-css-deployment.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  console.log('✅ CSS deployment fix completed');
} catch (error) {
  console.error('❌ CSS deployment fix failed:', error);
  process.exit(1);
}

// Build the application for production
console.log('Building application for production...');
try {
  execSync('npm run build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  console.log('✅ Build completed');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Verify the production build has the necessary files
const requiredFiles = [
  'dist/public/index.html',
  'dist/public/assets/production.css',
  'dist/index.js'
];

let allFilesPresent = true;
console.log('Verifying build files...');

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file missing: ${file}`);
    allFilesPresent = false;
  } else {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
  }
}

if (!allFilesPresent) {
  console.error('❌ Build verification failed. Some required files are missing.');
  process.exit(1);
}

// Tag HTML with deployment timestamp
const htmlPath = path.join(__dirname, 'dist/public/index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/<!-- MCP Deployment:.* -->/, '');
  html = html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n<!-- MCP Deployment: ${VERSION} ${new Date().toISOString()} -->`);
  fs.writeFileSync(htmlPath, html);
  console.log('✅ Added deployment tag to HTML');
}

// Create a deployment manifest
const manifest = {
  version: VERSION,
  timestamp: new Date().toISOString(),
  environment: 'production',
  assets: {}
};

// Collect information about built assets
if (fs.existsSync(path.join(__dirname, 'dist/public/assets'))) {
  const assets = fs.readdirSync(path.join(__dirname, 'dist/public/assets'));
  for (const asset of assets) {
    const stats = fs.statSync(path.join(__dirname, 'dist/public/assets', asset));
    manifest.assets[asset] = {
      size: stats.size,
      modified: stats.mtime
    };
  }
}

// Write the manifest
fs.writeFileSync(
  path.join(__dirname, 'dist/public/deployment-manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✅ Created deployment manifest');

// Create a production-ready .env file if needed
if (fs.existsSync(path.join(__dirname, '.env'))) {
  const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const prodEnv = env
    .split('\n')
    .map(line => {
      // Set appropriate environment variables for production
      if (line.startsWith('NODE_ENV=')) {
        return 'NODE_ENV=production';
      }
      return line;
    })
    .join('\n');
  
  fs.writeFileSync(path.join(__dirname, 'dist/.env'), prodEnv);
  console.log('✅ Created production environment variables');
}

console.log('');
console.log('✨ Deployment configuration complete! Your application is ready for deployment.');
console.log('===============================================================================');