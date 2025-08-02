const { chromium } = require('playwright');

async function testDreamInterpretationPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    testResults: []
  };

  try {
    console.log('🚀 Starting Dream Interpretation Page QA Test');
    console.log('URL: https://test-studio-firebase.vercel.app/dream-interpretation');
    
    // Test 1: Navigate to dream interpretation page
    console.log('\n📍 Test 1: Page Navigation and Loading');
    await page.goto('https://test-studio-firebase.vercel.app/dream-interpretation');
    await page.waitForTimeout(3000);
    
    const pageTitle = await page.title();
    console.log(`✅ Page title: ${pageTitle}`);
    results.testResults.push({
      test: 'Page Navigation',
      status: 'PASS',
      details: `Title: ${pageTitle}`
    });
    
    // Take initial screenshot
    await page.screenshot({ path: 'dream-qa-01-initial.png', fullPage: true });
    
    // Test 2: Check main heading
    console.log('\n📍 Test 2: Main Content Elements');
    const mainHeading = await page.locator('h1, h2').first();
    const isHeadingVisible = await mainHeading.isVisible().catch(() => false);
    
    if (isHeadingVisible) {
      const headingText = await mainHeading.textContent();
      console.log(`✅ Main heading found: "${headingText}"`);
      results.testResults.push({
        test: 'Main Heading',
        status: 'PASS',
        details: `Text: ${headingText}`
      });
    } else {
      console.log('❌ Main heading not found');
      results.testResults.push({
        test: 'Main Heading',
        status: 'FAIL',
        details: 'Main heading element not visible'
      });
    }
    
    // Test 3: Check for dream input field
    console.log('\n📍 Test 3: Dream Input Field');
    const dreamTextarea = page.locator('textarea');
    const textareaCount = await dreamTextarea.count();
    
    if (textareaCount > 0) {
      const isTextareaVisible = await dreamTextarea.first().isVisible();
      console.log(`✅ Dream input textarea found and visible: ${isTextareaVisible}`);
      
      // Test input functionality
      const testDream = "I had a vivid dream about walking through a mystical forest with glowing trees and talking animals.";
      await dreamTextarea.first().fill(testDream);
      await page.waitForTimeout(1000);
      
      const enteredText = await dreamTextarea.first().inputValue();
      const inputWorking = enteredText === testDream;
      console.log(`✅ Text input functionality: ${inputWorking ? 'Working' : 'Failed'}`);
      
      results.testResults.push({
        test: 'Dream Input Field',
        status: inputWorking ? 'PASS' : 'FAIL',
        details: `Textarea visible: ${isTextareaVisible}, Input working: ${inputWorking}`
      });
      
      // Take screenshot with input
      await page.screenshot({ path: 'dream-qa-02-with-input.png', fullPage: true });
      
    } else {
      console.log('❌ Dream input textarea not found');
      results.testResults.push({
        test: 'Dream Input Field',
        status: 'FAIL',
        details: 'No textarea element found'
      });
    }
    
    // Test 4: Check for submit button
    console.log('\n📍 Test 4: Submit Button Functionality');
    const submitButtons = await page.locator('button[type="submit"], button:has-text("다음 단계"), button:has-text("해석"), button:has-text("분석")').all();
    
    if (submitButtons.length > 0) {
      const submitButton = submitButtons[0];
      const isButtonVisible = await submitButton.isVisible();
      const buttonText = await submitButton.textContent();
      console.log(`✅ Submit button found: "${buttonText}" (visible: ${isButtonVisible})`);
      
      if (isButtonVisible && textareaCount > 0) {
        console.log('🔄 Testing form submission...');
        await submitButton.click();
        await page.waitForTimeout(5000); // Wait for potential response
        
        // Take screenshot after submission
        await page.screenshot({ path: 'dream-qa-03-after-submit.png', fullPage: true });
        
        // Check for any response or changes
        const bodyText = await page.locator('body').textContent();
        const hasResponse = bodyText.includes('해석') || bodyText.includes('분석') || bodyText.includes('결과');
        
        console.log(`✅ Form submission completed. Response detected: ${hasResponse}`);
        results.testResults.push({
          test: 'Form Submission',
          status: 'PASS',
          details: `Button: "${buttonText}", Response detected: ${hasResponse}`
        });
      } else {
        results.testResults.push({
          test: 'Form Submission',
          status: 'PARTIAL',
          details: `Button found but not clickable or no input field`
        });
      }
    } else {
      console.log('❌ No submit button found');
      results.testResults.push({
        test: 'Submit Button',
        status: 'FAIL',
        details: 'No submit button found'
      });
    }
    
    // Test 5: Check for JavaScript errors
    console.log('\n📍 Test 5: JavaScript Console Errors');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload to catch any initial errors
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length === 0) {
      console.log('✅ No JavaScript console errors detected');
      results.testResults.push({
        test: 'JavaScript Errors',
        status: 'PASS',
        details: 'No console errors found'
      });
    } else {
      console.log(`❌ JavaScript errors found: ${consoleErrors.length}`);
      consoleErrors.forEach(error => console.log(`   - ${error}`));
      results.testResults.push({
        test: 'JavaScript Errors',
        status: 'FAIL',
        details: `Errors: ${consoleErrors.join(', ')}`
      });
    }
    
    // Test 6: Network requests check
    console.log('\n📍 Test 6: Network Issues');
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (networkErrors.length === 0) {
      console.log('✅ No network errors detected');
      results.testResults.push({
        test: 'Network Issues',
        status: 'PASS',
        details: 'No network errors found'
      });
    } else {
      console.log(`❌ Network errors found: ${networkErrors.length}`);
      networkErrors.forEach(error => console.log(`   - ${error}`));
      results.testResults.push({
        test: 'Network Issues',
        status: 'FAIL',
        details: `Network errors: ${networkErrors.join(', ')}`
      });
    }
    
    // Test 7: Mobile responsiveness
    console.log('\n📍 Test 7: Mobile Responsiveness');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    
    // Check if main elements are still visible on mobile
    const mobileHeadingVisible = await page.locator('h1, h2').first().isVisible().catch(() => false);
    const mobileTextareaVisible = await page.locator('textarea').first().isVisible().catch(() => false);
    
    await page.screenshot({ path: 'dream-qa-04-mobile.png', fullPage: true });
    
    const mobileWorking = mobileHeadingVisible && mobileTextareaVisible;
    console.log(`✅ Mobile responsiveness: ${mobileWorking ? 'Good' : 'Issues detected'}`);
    
    results.testResults.push({
      test: 'Mobile Responsiveness',
      status: mobileWorking ? 'PASS' : 'FAIL',
      details: `Heading visible: ${mobileHeadingVisible}, Input visible: ${mobileTextareaVisible}`
    });
    
    // Final screenshot
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: 'dream-qa-05-final.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
    results.testResults.push({
      test: 'Test Execution',
      status: 'ERROR',
      details: error.message
    });
    
    await page.screenshot({ path: 'dream-qa-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
  
  // Generate test report
  console.log('\n📊 QA TEST SUMMARY');
  console.log('===================');
  
  const passCount = results.testResults.filter(r => r.status === 'PASS').length;
  const failCount = results.testResults.filter(r => r.status === 'FAIL').length;
  const partialCount = results.testResults.filter(r => r.status === 'PARTIAL').length;
  const errorCount = results.testResults.filter(r => r.status === 'ERROR').length;
  
  console.log(`✅ PASSED: ${passCount}`);
  console.log(`❌ FAILED: ${failCount}`);
  console.log(`⚠️  PARTIAL: ${partialCount}`);
  console.log(`🚫 ERRORS: ${errorCount}`);
  
  results.testResults.forEach(result => {
    const icon = {
      'PASS': '✅',
      'FAIL': '❌',
      'PARTIAL': '⚠️',
      'ERROR': '🚫'
    }[result.status];
    
    console.log(`${icon} ${result.test}: ${result.status}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  });
  
  // Save detailed report
  require('fs').writeFileSync('dream-interpretation-qa-report.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Detailed report saved to: dream-interpretation-qa-report.json');
  
  return results;
}

testDreamInterpretationPage().catch(console.error);