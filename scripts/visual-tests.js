/**
 * Visual Regression Testing Script for MCP Integration Platform
 * 
 * This script captures screenshots of key UI components in both development and production
 * environments, then compares them to detect visual regressions that would impact user experience.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Define the pages and components to test
const testCases = [
  { name: 'login-page', path: '/auth', selector: 'body' },
  { name: 'dashboard', path: '/', selector: 'body', authenticate: true },
  { name: 'web-search-tool', path: '/tools/web-search', selector: '.tool-container', authenticate: true },
  { name: 'vector-storage-tool', path: '/tools/vector-storage', selector: '.tool-container', authenticate: true },
  { name: 'form-automation-tool', path: '/tools/form-automation', selector: '.tool-container', authenticate: true },
];

// URLs for development and production environments
const environments = {
  dev: 'http://localhost:5000',
  prod: process.env.PRODUCTION_URL || 'http://localhost:5000' // Default to localhost for testing
};

async function takeScreenshots() {
  console.log('Starting visual regression tests...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    // Take screenshots for each environment
    for (const [envName, baseUrl] of Object.entries(environments)) {
      console.log(`Testing ${envName} environment: ${baseUrl}`);
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      
      // Login if needed for authenticated tests
      let isAuthenticated = false;
      
      for (const testCase of testCases) {
        if (testCase.authenticate && !isAuthenticated) {
          // Perform login
          await page.goto(`${baseUrl}/auth`);
          await page.waitForSelector('form', { timeout: 5000 });
          
          // Fill in test user credentials
          await page.type('input[name="username"]', 'testuser');
          await page.type('input[name="password"]', 'password123');
          
          // Submit the form
          await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
          ]);
          
          isAuthenticated = true;
          console.log('Logged in successfully');
        }
        
        // Navigate to page and take screenshot
        await page.goto(`${baseUrl}${testCase.path}`, { waitUntil: 'networkidle0' });
        
        // Wait for the specific element to be visible
        await page.waitForSelector(testCase.selector, { visible: true, timeout: 10000 });
        
        // Take screenshot of the specific element
        const element = await page.$(testCase.selector);
        const screenshotPath = path.join(screenshotsDir, `${testCase.name}-${envName}.png`);
        
        // Take the screenshot
        if (element) {
          await element.screenshot({ path: screenshotPath });
        } else {
          // Fallback to full page screenshot if element not found
          await page.screenshot({ path: screenshotPath });
        }
        
        console.log(`Captured screenshot: ${screenshotPath}`);
      }
      
      // Logout after taking all screenshots for this environment
      if (isAuthenticated) {
        await page.goto(`${baseUrl}/auth/logout`);
        console.log('Logged out successfully');
      }
      
      await page.close();
    }
    
    // Compare screenshots between environments
    await compareScreenshots();
    
  } catch (error) {
    console.error('Error during visual testing:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

async function compareScreenshots() {
  console.log('\nComparing screenshots between environments...');
  
  let hasFailures = false;
  
  for (const testCase of testCases) {
    const img1Path = path.join(screenshotsDir, `${testCase.name}-dev.png`);
    const img2Path = path.join(screenshotsDir, `${testCase.name}-prod.png`);
    const diffPath = path.join(screenshotsDir, `${testCase.name}-diff.png`);
    
    if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path)) {
      console.log(`Skipping comparison for ${testCase.name} - missing screenshots`);
      continue;
    }
    
    const img1 = PNG.sync.read(fs.readFileSync(img1Path));
    const img2 = PNG.sync.read(fs.readFileSync(img2Path));
    
    // Images must have the same dimensions for comparison
    if (img1.width !== img2.width || img1.height !== img2.height) {
      console.error(`❌ FAIL: ${testCase.name} - image dimensions don't match`);
      hasFailures = true;
      continue;
    }
    
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    // Compare images
    const mismatchedPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 } // Adjust threshold as needed
    );
    
    // Save diff image
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    
    // Calculate percentage difference
    const diffPercentage = (mismatchedPixels / (width * height)) * 100;
    
    if (diffPercentage > 1) { // Allow 1% difference to account for minor rendering variations
      console.error(`❌ FAIL: ${testCase.name} - ${diffPercentage.toFixed(2)}% difference`);
      hasFailures = true;
    } else {
      console.log(`✅ PASS: ${testCase.name} - ${diffPercentage.toFixed(2)}% difference`);
    }
  }
  
  if (hasFailures) {
    console.error('\n❌ Visual regression tests failed! Check the diff images for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All visual regression tests passed!');
  }
}

// Run the tests
takeScreenshots().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
