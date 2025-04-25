// Production Deployment Script
// This script builds the project and prepares it for deployment

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment build process...');

try {
  // 1. Build the application
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Verify the build
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
  
  console.log(`📊 Build stats:`);
  console.log(`CSS files: ${cssFiles.length} (${cssFiles.join(', ')})`);
  console.log(`JS files: ${jsFiles.length} (${jsFiles.join(', ')})`);
  
  // For each file, show the size
  cssFiles.forEach(file => {
    const stats = fs.statSync(path.join(assetsPath, file));
    console.log(`${file}: ${(stats.size / 1024).toFixed(2)} KB`);
  });
  
  jsFiles.forEach(file => {
    const stats = fs.statSync(path.join(assetsPath, file));
    console.log(`${file}: ${(stats.size / 1024).toFixed(2)} KB`);
  });
  
  console.log('🎉 Build verification complete! Your application is ready for deployment.');
  console.log('');
  console.log('To deploy:');
  console.log('1. Use the "Deploy" button in the Replit interface');
  console.log('2. Your MCP Integration Platform will be available at your .replit.app domain');
  
} catch (error) {
  console.error('❌ Deployment build failed:', error);
  process.exit(1);
}