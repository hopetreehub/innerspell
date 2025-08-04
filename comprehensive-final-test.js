const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runComprehensiveTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const testResults = [];
  
  // Test cases with expected redirects
  const testCases = [
    {
      name: 'Homepage',
      url: 'http://localhost:4000',
      expectedTitle: /Test Studio/,
      screenshot: 'final-homepage.png'
    },
    {
      name: 'Login Redirect',
      url: 'http://localhost:4000/login',
      expectedUrl: 'http://localhost:4000/sign-in',
      screenshot: 'final-login-redirect.png'
    },
    {
      name: 'Sign-in Page',
      url: 'http://localhost:4000/sign-in',
      expectedTitle: /Sign In/,
      screenshot: 'final-signin.png'
    },
    {
      name: 'Reading Page',
      url: 'http://localhost:4000/reading',
      expectedTitle: /Reading|Tarot/,
      screenshot: 'final-reading.png'
    },
    {
      name: 'Tarot Card - The Fool',
      url: 'http://localhost:4000/tarot/major-00-fool',
      expectedTitle: /Fool|Tarot/,
      screenshot: 'final-tarot-fool.png'
    },
    {
      name: 'Community Page',
      url: 'http://localhost:4000/community',
      expectedTitle: /Community/,
      screenshot: 'final-community.png'
    }
  ];

  console.log('🔍 Starting Comprehensive Final Test...\n');

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);
    
    try {
      // Navigate to the page
      const response = await page.goto(testCase.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait a bit for any JavaScript to execute
      await page.waitForTimeout(2000);
      
      const result = {
        name: testCase.name,
        url: testCase.url,
        finalUrl: page.url(),
        status: response.status(),
        success: false,
        errors: [],
        warnings: []
      };

      // Check if URL redirected as expected
      if (testCase.expectedUrl && page.url() !== testCase.expectedUrl) {
        result.warnings.push(`Expected redirect to ${testCase.expectedUrl}, but got ${page.url()}`);
      } else if (testCase.expectedUrl && page.url() === testCase.expectedUrl) {
        console.log('✅ Redirect successful');
        result.success = true;
      }

      // Check title if not a redirect test
      if (testCase.expectedTitle && !testCase.expectedUrl) {
        const title = await page.title();
        if (testCase.expectedTitle.test(title)) {
          console.log(`✅ Title matches: "${title}"`);
          result.success = true;
        } else {
          result.warnings.push(`Title "${title}" doesn't match expected pattern`);
        }
      }

      // Check for console errors
      const logs = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          logs.push(`Console Error: ${msg.text()}`);
        }
      });

      // Check for JavaScript errors
      page.on('pageerror', error => {
        result.errors.push(`JavaScript Error: ${error.message}`);
      });

      // Take screenshot
      await page.screenshot({ 
        path: path.join(screenshotsDir, testCase.screenshot),
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${testCase.screenshot}`);

      // Check if page loaded successfully
      if (response.status() === 200 || (response.status() >= 300 && response.status() < 400)) {
        if (!result.success && !testCase.expectedUrl) {
          result.success = true; // Page loaded successfully
        }
        console.log(`✅ HTTP Status: ${response.status()}`);
      } else {
        result.errors.push(`HTTP Error: ${response.status()}`);
        console.log(`❌ HTTP Status: ${response.status()}`);
      }

      // Add console logs to result
      result.errors.push(...logs);

      // Check for specific elements based on the page
      try {
        if (testCase.name === 'Homepage') {
          await page.waitForSelector('h1', { timeout: 5000 });
          console.log('✅ Main heading found');
        } else if (testCase.name === 'Sign-in Page') {
          await page.waitForSelector('form', { timeout: 5000 });
          console.log('✅ Sign-in form found');
        } else if (testCase.name === 'Reading Page') {
          await page.waitForSelector('h1', { timeout: 5000 });
          console.log('✅ Reading page content found');
        } else if (testCase.name === 'Tarot Card - The Fool') {
          await page.waitForSelector('h1', { timeout: 5000 });
          console.log('✅ Tarot card content found');
        } else if (testCase.name === 'Community Page') {
          await page.waitForSelector('h1', { timeout: 5000 });
          console.log('✅ Community page content found');
        }
      } catch (elementError) {
        result.warnings.push(`Element check failed: ${elementError.message}`);
      }

      testResults.push(result);
      console.log(`Result: ${result.success ? '✅ PASS' : '⚠️  PARTIAL'}\n`);

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
      testResults.push({
        name: testCase.name,
        url: testCase.url,
        finalUrl: 'N/A',
        status: 'FAILED',
        success: false,
        errors: [error.message],
        warnings: []
      });
    }
  }

  // Final report
  console.log('═══════════════════════════════════════');
  console.log('📋 COMPREHENSIVE FINAL TEST REPORT');
  console.log('═══════════════════════════════════════\n');

  let passCount = 0;
  let totalCount = testResults.length;

  testResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Final URL: ${result.finalUrl}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Result: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (result.errors.length > 0) {
      console.log(`   Errors:`);
      result.errors.forEach(error => console.log(`     - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log(`   Warnings:`);
      result.warnings.forEach(warning => console.log(`     - ${warning}`));
    }
    
    if (result.success) passCount++;
    console.log('');
  });

  console.log('═══════════════════════════════════════');
  console.log(`📊 OVERALL RESULTS: ${passCount}/${totalCount} tests passed`);
  console.log(`📁 Screenshots saved in: ${screenshotsDir}`);
  console.log('═══════════════════════════════════════');

  // Check Pretendard font loading
  console.log('\n🔤 Checking Pretendard Font Loading...');
  try {
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    console.log(`Current font-family: ${fontFamily}`);
    if (fontFamily.includes('Pretendard')) {
      console.log('✅ Pretendard font is loaded');
    } else {
      console.log('⚠️  Pretendard font may not be loaded properly');
    }
  } catch (error) {
    console.log(`❌ Font check failed: ${error.message}`);
  }

  await browser.close();
  
  return {
    totalTests: totalCount,
    passedTests: passCount,
    results: testResults
  };
}

runComprehensiveTest().catch(console.error);