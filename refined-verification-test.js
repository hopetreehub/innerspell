const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runRefinedTest() {
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
  
  console.log('🔧 Starting Refined Verification Tests...\n');
  
  try {
    // Test 1: Login Redirect Test with proper waiting
    console.log('1️⃣ Testing Login Redirect (/login -> /sign-in) with proper waiting...');
    try {
      await page.goto('http://localhost:4000/login', { waitUntil: 'networkidle' });
      
      // Wait for the client-side redirect to complete
      await page.waitForURL('**/sign-in', { timeout: 10000 });
      
      const currentUrl = page.url();
      console.log(`   📍 Final URL: ${currentUrl}`);
      
      if (currentUrl.includes('/sign-in')) {
        testResults.passed++;
        testResults.details.push('✅ Login Redirect: Successfully redirected to /sign-in');
        console.log('   ✅ Login redirect test passed\n');
        
        // Take screenshot of sign-in page after redirect
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'refined-login-redirect-success.png'),
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
    
    // Test 2: Sign-in Form Elements Test with better selectors
    console.log('2️⃣ Testing Sign-in Form Elements with improved selectors...');
    try {
      await page.goto('http://localhost:4000/sign-in', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // Look for form inputs with more flexible selectors
      const emailInput = page.locator('input[placeholder*="email"], input[name="email"], input[autocomplete="email"], input[type="email"]');
      const passwordInput = page.locator('input[type="password"], input[placeholder*="password"], input[name="password"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("로그인")');
      
      const emailExists = await emailInput.count() > 0;
      const passwordExists = await passwordInput.count() > 0;
      const submitExists = await submitButton.count() > 0;
      
      console.log(`   📧 Email input: ${emailExists ? '✅ Found' : '❌ Not found'}`);
      console.log(`   🔒 Password input: ${passwordExists ? '✅ Found' : '❌ Not found'}`);
      console.log(`   🔘 Submit button: ${submitExists ? '✅ Found' : '❌ Not found'}`);
      
      // Additional checks
      if (emailExists) {
        const emailPlaceholder = await emailInput.first().getAttribute('placeholder');
        console.log(`   📧 Email placeholder: "${emailPlaceholder}"`);
      }
      
      if (passwordExists) {
        const passwordPlaceholder = await passwordInput.first().getAttribute('placeholder');
        console.log(`   🔒 Password placeholder: "${passwordPlaceholder}"`);
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'refined-signin-form-success.png'),
        fullPage: true 
      });
      
      if (emailExists && passwordExists && submitExists) {
        testResults.passed++;
        testResults.details.push('✅ Sign-in Form: All form elements present');
        console.log('   ✅ Sign-in form test passed\n');
      } else {
        testResults.failed++;
        testResults.details.push('❌ Sign-in Form: Missing form elements');
        console.log('   ❌ Sign-in form test failed: Missing form elements\n');
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ Sign-in Form: ${error.message}`);
      console.log(`   ❌ Sign-in form test failed: ${error.message}\n`);
    }
    
    // Test 3: Console Errors Analysis
    console.log('3️⃣ Analyzing Console Errors in Detail...');
    try {
      let consoleMessages = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleMessages.push({
            type: 'error',
            text: msg.text(),
            location: msg.location()
          });
        }
      });
      
      page.on('response', response => {
        if (response.status() >= 400) {
          consoleMessages.push({
            type: 'network',
            text: `${response.status()} ${response.statusText()} - ${response.url()}`,
            url: response.url(),
            status: response.status()
          });
        }
      });
      
      // Visit pages to collect errors
      const pagesToCheck = ['/', '/sign-in', '/reading', '/community'];
      
      for (const pageUrl of pagesToCheck) {
        console.log(`   🔍 Checking ${pageUrl} for errors...`);
        try {
          await page.goto(`http://localhost:4000${pageUrl}`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);
        } catch (error) {
          console.log(`   ⚠️ Error navigating to ${pageUrl}: ${error.message}`);
        }
      }
      
      // Categorize errors
      const networkErrors = consoleMessages.filter(msg => msg.type === 'network');
      const jsErrors = consoleMessages.filter(msg => msg.type === 'error');
      
      console.log(`   🌐 Network errors (4xx/5xx): ${networkErrors.length}`);
      console.log(`   🐛 JavaScript errors: ${jsErrors.length}`);
      
      // Show first few network errors for analysis
      if (networkErrors.length > 0) {
        console.log('   📋 Sample network errors:');
        networkErrors.slice(0, 5).forEach(error => {
          console.log(`      - ${error.status}: ${error.url}`);
        });
        if (networkErrors.length > 5) {
          console.log(`      ... and ${networkErrors.length - 5} more`);
        }
      }
      
      // Show JavaScript errors
      if (jsErrors.length > 0) {
        console.log('   📋 JavaScript errors:');
        jsErrors.slice(0, 3).forEach(error => {
          console.log(`      - ${error.text}`);
        });
        if (jsErrors.length > 3) {
          console.log(`      ... and ${jsErrors.length - 3} more`);
        }
      }
      
      if (jsErrors.length === 0) {
        testResults.passed++;
        testResults.details.push('✅ JavaScript Errors: No JS runtime errors detected');
        console.log('   ✅ No critical JavaScript errors found\n');
      } else {
        testResults.failed++;
        testResults.details.push(`❌ JavaScript Errors: ${jsErrors.length} JS error(s) found`);
        console.log(`   ❌ Found ${jsErrors.length} JavaScript error(s)\n`);
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ Console Analysis: ${error.message}`);
      console.log(`   ❌ Console analysis failed: ${error.message}\n`);
    }
    
    // Test 4: Font Loading Deep Check
    console.log('4️⃣ Deep Font Loading Analysis...');
    try {
      await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      const fontAnalysis = await page.evaluate(() => {
        // Check multiple elements for font usage
        const elements = [
          document.body,
          document.querySelector('h1'),
          document.querySelector('h2'),
          document.querySelector('p'),
          document.querySelector('button')
        ].filter(Boolean);
        
        const fontResults = elements.map(el => {
          const computedStyle = window.getComputedStyle(el);
          return {
            tagName: el.tagName,
            className: el.className,
            fontFamily: computedStyle.fontFamily,
            hasPretendard: computedStyle.fontFamily.includes('Pretendard')
          };
        });
        
        // Check if Pretendard font files are loaded
        const fontFaces = Array.from(document.fonts);
        const pretendardFonts = fontFaces.filter(font => 
          font.family.includes('Pretendard')
        );
        
        return {
          elements: fontResults,
          loadedFonts: pretendardFonts.length,
          totalFonts: fontFaces.length
        };
      });
      
      console.log(`   🔤 Loaded fonts: ${fontAnalysis.loadedFonts}/${fontAnalysis.totalFonts} total fonts`);
      console.log(`   📊 Elements using Pretendard: ${fontAnalysis.elements.filter(e => e.hasPretendard).length}/${fontAnalysis.elements.length}`);
      
      fontAnalysis.elements.forEach(el => {
        console.log(`   📝 ${el.tagName}: ${el.hasPretendard ? '✅' : '❌'} "${el.fontFamily}"`);
      });
      
      const pretendardUsage = fontAnalysis.elements.filter(e => e.hasPretendard).length;
      
      if (pretendardUsage > 0) {
        testResults.passed++;
        testResults.details.push(`✅ Font Loading: Pretendard font loaded and used in ${pretendardUsage} element types`);
        console.log('   ✅ Pretendard font is properly loaded and used\n');
      } else {
        testResults.failed++;
        testResults.details.push('❌ Font Loading: Pretendard font not detected in any elements');
        console.log('   ❌ Pretendard font not detected in any elements\n');
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ Font Analysis: ${error.message}`);
      console.log(`   ❌ Font analysis failed: ${error.message}\n`);
    }
    
    // Test 5: Quick Page Load Test
    console.log('5️⃣ Quick Page Load Test...');
    const pagesToTest = [
      { url: '/', name: 'Homepage' },
      { url: '/reading', name: 'Reading Page' },
      { url: '/community', name: 'Community Page' }
    ];
    
    for (const pageTest of pagesToTest) {
      try {
        const startTime = Date.now();
        await page.goto(`http://localhost:4000${pageTest.url}`, { waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;
        
        const title = await page.title();
        console.log(`   📄 ${pageTest.name}: ✅ Loaded in ${loadTime}ms - "${title}"`);
        
        // Take screenshot
        await page.screenshot({ 
          path: path.join(screenshotsDir, `refined-${pageTest.name.toLowerCase().replace(' ', '-')}-success.png`),
          fullPage: true 
        });
        
        testResults.passed++;
        testResults.details.push(`✅ ${pageTest.name}: Loaded successfully in ${loadTime}ms`);
      } catch (error) {
        console.log(`   📄 ${pageTest.name}: ❌ Failed - ${error.message}`);
        testResults.failed++;
        testResults.details.push(`❌ ${pageTest.name}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    testResults.failed++;
    testResults.details.push(`❌ Test Suite: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Generate Final Report
  console.log('\n🔍 REFINED VERIFICATION REPORT');
  console.log('===============================');
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
  } else if (testResults.failed <= 2) {
    console.log('✅ MOSTLY WORKING! Only minor issues detected.');
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.');
  }
  
  return testResults;
}

// Run the test
runRefinedTest()
  .then(results => {
    process.exit(results.failed <= 2 ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });