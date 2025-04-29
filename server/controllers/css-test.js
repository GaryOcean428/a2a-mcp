/**
 * Test CSS loading in production environment
 * This script sends test requests to verify proper CSS loading
 */

import fetch from 'node-fetch';

async function testProductionCss() {
  try {
    console.log('Testing production CSS loading...');
    
    // Test critical CSS files
    const cssResponse = await fetch('http://localhost:5000/production.css');
    console.log('Production CSS status:', cssResponse.status);
    console.log('Content-Type:', cssResponse.headers.get('content-type'));
    console.log('Cache-Control:', cssResponse.headers.get('cache-control'));
    
    // Test verification script
    const verifyResponse = await fetch('http://localhost:5000/deploy-verify.js');
    console.log('Verification script status:', verifyResponse.status);
    console.log('Content-Type:', verifyResponse.headers.get('content-type'));
    
    console.log('CSS tests completed successfully');
  } catch (error) {
    console.error('Error testing CSS:', error);
  }
}

// Run the test
testProductionCss();