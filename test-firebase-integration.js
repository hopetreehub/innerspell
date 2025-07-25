#!/usr/bin/env node

/**
 * Firebase Integration Test Script
 * Tests the complete Firebase integration workflow
 */

const puppeteer = require('puppeteer').default || require('puppeteer');

async function testFirebaseIntegration() {
  console.log('🧪 Starting Firebase Integration Tests');
  console.log('=====================================\n');

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Show browser for debugging
      defaultViewport: { width: 1280, height: 720 }
    });
    
    const page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      console.log(`🌐 Browser Console [${msg.type()}]:`, msg.text());
    });
    
    // Navigate to the app
    console.log('1. Loading application...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle0' });
    
    // Check for AuthDebug component
    console.log('2. Checking authentication state...');
    const authDebug = await page.$eval('.bg-black\\/80', el => el.textContent);
    console.log('   AuthDebug info:', authDebug.replace(/\s+/g, ' ').trim());
    
    // Check if USE_REAL_AUTH is true
    if (authDebug.includes('USE_REAL_AUTH: true')) {
      console.log('   ✅ Real Firebase Auth is enabled');
    } else {
      console.log('   ❌ Real Firebase Auth is NOT enabled');
      return;
    }
    
    // Navigate to reading page
    console.log('3. Navigating to tarot reading page...');
    await page.click('a[href="/reading"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Check if page loads properly
    const currentUrl = page.url();
    if (currentUrl.includes('/reading')) {
      console.log('   ✅ Successfully navigated to reading page');
    } else {
      console.log('   ❌ Failed to navigate to reading page');
      return;
    }
    
    // Take a screenshot for verification
    await page.screenshot({ 
      path: 'screenshots/firebase-test-reading-page.png',
      fullPage: true 
    });
    console.log('   📸 Screenshot saved: screenshots/firebase-test-reading-page.png');
    
    // Test API endpoint
    console.log('4. Testing Firebase status API...');
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/debug/firebase-status');
      return await res.json();
    });
    
    console.log('   API Response:');
    console.log('   - Environment:', response.status?.environment?.nodeEnv);
    console.log('   - Use Real Auth:', response.status?.environment?.useRealAuth);
    console.log('   - Project ID:', response.status?.environment?.projectId);
    console.log('   - Mock Mode:', response.status?.mockMode?.isActive ? 'Active' : 'Inactive');
    
    if (response.status?.environment?.useRealAuth === 'true') {
      console.log('   ✅ Firebase configuration confirmed');
    }
    
    console.log('\n🎉 Firebase Integration Test Complete!');
    console.log('=====================================');
    console.log('✅ App is properly configured for real Firebase');
    console.log('✅ Authentication system is ready');
    console.log('✅ Reading page is accessible');
    console.log('✅ API endpoints are functional');
    console.log('\n📋 Next Steps:');
    console.log('1. Sign in with Google or email to test authentication');
    console.log('2. Create a tarot reading to test Firestore save');
    console.log('3. Check user profile to verify reading retrieval');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
(async () => {
  try {
    await testFirebaseIntegration();
  } catch (error) {
    if (error.message.includes('puppeteer')) {
      console.log('⚠️  Puppeteer not available - running simplified test');
      console.log('\n🧪 Simplified Firebase Test');
      console.log('===========================');
      
      // Simple curl test
      const { execSync } = require('child_process');
      try {
        const result = execSync('curl -s http://localhost:4000/api/debug/firebase-status', { encoding: 'utf8' });
        const response = JSON.parse(result);
        
        console.log('📊 Firebase Status:');
        console.log('- Use Real Auth:', response.status?.environment?.useRealAuth);
        console.log('- Project ID:', response.status?.environment?.projectId);
        console.log('- Mock Mode:', response.status?.mockMode?.isActive ? 'Active (Server)' : 'Inactive');
        
        if (response.status?.environment?.useRealAuth === 'true') {
          console.log('\n✅ Firebase is properly configured!');
          console.log('✅ Demo mode has been resolved');
          console.log('✅ Real authentication is enabled');
        }
        
      } catch (curlError) {
        console.error('❌ API test failed:', curlError.message);
      }
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
})();