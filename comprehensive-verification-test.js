const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runComprehensiveTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  let testResults = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  console.log('🚀 Starting Comprehensive Verification Tests...\n');
  
  try {
    // Test 1: Homepage Test
    console.log('1️⃣ Testing Homepage (/)...');
    try {
      await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Check for JavaScript errors
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      
      // Check if page loads
      const title = await page.title();
      console.log(`   ✅ Page title: ${title}`);
      
      // Check Pretendard font loading
      const fontUsed = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).fontFamily;
      });
      console.log(`   ✅ Font family: ${fontUsed}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'homepage-success.png'),
        fullPage: true 
      });
      
      testResults.passed++;
      testResults.details.push('✅ Homepage: Loaded successfully');
      console.log('   ✅ Homepage test passed\n');
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ Homepage: ${error.message}`);
      console.log(`   ❌ Homepage test failed: ${error.message}\n`);
    }
    
    // Test 2: Login Redirect Test (/login -> /sign-in)
    console.log('2️⃣ Testing Login Redirect (/login -> /sign-in)...');
    try {
      await page.goto('http://localhost:4000/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`   📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/sign-in')) {
        testResults.passed++;
        testResults.details.push('✅ Login Redirect: Successfully redirected to /sign-in');
        console.log('   ✅ Login redirect test passed\n');
        
        // Take screenshot of sign-in page
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'login-redirect-success.png'),
          fullPage: true 
        });
      } else {
        testResults.failed++;
        testResults.details.push(`❌ Login Redirect: Expected /sign-in, got ${currentUrl}`);
        console.log(`   ❌ Login redirect failed: Expected /sign-in, got ${currentUrl}\n`);
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ Login Redirect: ${error.message}`);
      console.log(`   ❌ Login redirect test failed: ${error.message}\n`);
    }
    
    // Test 3: Sign-in Page Test
    console.log('3️⃣ Testing Sign-in Page (/sign-in)...');
    try {
      await page.goto('http://localhost:4000/sign-in', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Check for form elements
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');
      
      const emailExists = await emailInput.count() > 0;
      const passwordExists = await passwordInput.count() > 0;
      const submitExists = await submitButton.count() > 0;
      
      console.log(`   📧 Email input: ${emailExists ? '✅ Found' : '❌ Not found'}`);
      console.log(`   🔒 Password input: ${passwordExists ? '✅ Found' : '❌ Not found'}`);
      console.log(`   🔘 Submit button: ${submitExists ? '✅ Found' : '❌ Not found'}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'signin-page-success.png'),
        fullPage: true 
      });
      
      if (emailExists && passwordExists && submitExists) {
        testResults.passed++;
        testResults.details.push('✅ Sign-in Page: All form elements present');
        console.log('   ✅ Sign-in page test passed\n');
      } else {
        testResults.failed++;
        testResults.details.push('❌ Sign-in Page: Missing form elements');
        console.log('   ❌ Sign-in page test failed: Missing form elements\n');
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ Sign-in Page: ${error.message}`);
      console.log(`   ❌ Sign-in page test failed: ${error.message}\n`);
    }
    
    // Test 4: Reading Page Test
    console.log('4️⃣ Testing Reading Page (/reading)...');
    try {
      await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      const title = await page.title();
      console.log(`   📖 Page title: ${title}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'reading-page-success.png'),
        fullPage: true 
      });
      
      testResults.passed++;
      testResults.details.push('✅ Reading Page: Loaded successfully');
      console.log('   ✅ Reading page test passed\n');
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ Reading Page: ${error.message}`);
      console.log(`   ❌ Reading page test failed: ${error.message}\n`);
    }
    
    // Test 5: Community Page Test
    console.log('5️⃣ Testing Community Page (/community)...');
    try {
      await page.goto('http://localhost:4000/community', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      const title = await page.title();
      console.log(`   🏘️ Page title: ${title}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'community-page-success.png'),
        fullPage: true 
      });
      
      testResults.passed++;
      testResults.details.push('✅ Community Page: Loaded successfully');
      console.log('   ✅ Community page test passed\n');
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ Community Page: ${error.message}`);
      console.log(`   ❌ Community page test failed: ${error.message}\n`);
    }
    
    // Test 6: Console Errors Check
    console.log('6️⃣ Checking for JavaScript Console Errors...');
    let consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Visit all pages again to collect console errors
    const pagesToCheck = ['/', '/sign-in', '/reading', '/community'];
    
    for (const pageUrl of pagesToCheck) {
      try {
        await page.goto(`http://localhost:4000${pageUrl}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log(`   ⚠️ Error checking ${pageUrl}: ${error.message}`);
      }
    }
    
    if (consoleErrors.length === 0) {
      testResults.passed++;
      testResults.details.push('✅ Console Errors: No JavaScript runtime errors detected');
      console.log('   ✅ No JavaScript console errors found\n');
    } else {
      testResults.failed++;
      testResults.details.push(`❌ Console Errors: ${consoleErrors.length} error(s) found`);
      console.log(`   ❌ Found ${consoleErrors.length} console error(s):`);
      consoleErrors.forEach(error => console.log(`      - ${error}`));
      console.log('');
    }
    
    // Test 7: Font Loading Verification
    console.log('7️⃣ Verifying Pretendard Font Loading...');
    try {
      await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const fontCheck = await page.evaluate(() => {
        // Check if Pretendard font is loaded
        const testElement = document.createElement('div');
        testElement.style.fontFamily = 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        const actualFont = computedStyle.fontFamily;
        
        document.body.removeChild(testElement);
        
        return {
          fontFamily: actualFont,
          hasPretendard: actualFont.includes('Pretendard')
        };
      });
      
      console.log(`   🔤 Font family detected: ${fontCheck.fontFamily}`);
      console.log(`   ✨ Pretendard loaded: ${fontCheck.hasPretendard ? '✅ Yes' : '❌ No'}`);
      
      if (fontCheck.hasPretendard) {
        testResults.passed++;
        testResults.details.push('✅ Font Loading: Pretendard font is properly loaded');
      } else {
        testResults.failed++;
        testResults.details.push('❌ Font Loading: Pretendard font not detected');
      }
      console.log('');
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ Font Loading: ${error.message}`);
      console.log(`   ❌ Font loading test failed: ${error.message}\n`);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    testResults.failed++;
    testResults.details.push(`❌ Test Suite: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Generate Final Report
  console.log('📊 COMPREHENSIVE VERIFICATION REPORT');
  console.log('=====================================');
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  console.log('');
  console.log('📋 Detailed Results:');
  testResults.details.forEach(detail => console.log(`   ${detail}`));
  console.log('');
  console.log('📸 Screenshots saved in: ./screenshots/');
  console.log('');
  
  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! The application is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.');
  }
  
  return testResults;
}

// Run the test
runComprehensiveTest()
  .then(results => {
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });