// Comprehensive AI Model Fix Verification
const { chromium } = require('playwright');

async function verifyAIFix() {
  console.log('🔧 AI Model Fix Complete Verification');
  console.log('=====================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  // Monitor console for errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('NOT_FOUND') || msg.text().includes('gpt-3.5-turbo')) {
      consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
        time: new Date().toISOString()
      });
      console.log(`[CONSOLE ${msg.type().toUpperCase()}]`, msg.text());
    }
  });
  
  // Monitor API responses
  page.on('response', async response => {
    if (response.url().includes('/api/') && response.url().includes('tarot')) {
      try {
        const body = await response.text();
        if (body.includes('NOT_FOUND') || body.includes('gpt-3.5-turbo')) {
          console.log(`[API ERROR] ${response.status()} ${response.url()}`);
          console.log('[RESPONSE]', body);
        }
      } catch (e) {}
    }
  });
  
  try {
    console.log('1. Testing on Vercel deployment...');
    await page.goto('https://tarotap.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Test 1: Basic tarot reading
    console.log('\n2. Starting tarot reading test...');
    
    // Click tarot reading button
    await page.click('text="무료 타로 카드 뽑기"');
    await page.waitForTimeout(2000);
    
    // Enter question
    await page.fill('textarea[placeholder*="질문"]', '오늘의 운세를 알려주세요.');
    
    // Select spread
    await page.click('text="1장 뽑기"');
    await page.waitForTimeout(1000);
    
    // Select card
    await page.click('.card-back');
    await page.waitForTimeout(1000);
    
    // Request AI interpretation
    console.log('3. Requesting AI interpretation...');
    await page.click('text="AI 해석 요청"');
    
    // Wait for response
    console.log('4. Waiting for AI response...');
    
    // Check for success or error
    let success = false;
    let errorFound = false;
    let errorMessage = '';
    
    // Wait up to 30 seconds for response
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      
      // Check for error messages
      const errorSelectors = [
        'text=/NOT_FOUND.*gpt-3.5-turbo/i',
        'text=/Model.*not found/i',
        'text=/AI 해석 오류/i'
      ];
      
      for (const selector of errorSelectors) {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 100 }).catch(() => false)) {
          errorFound = true;
          errorMessage = await element.textContent();
          break;
        }
      }
      
      // Check for success (interpretation content)
      const interpretationContent = await page.locator('text=/서론|본론|해석/').first();
      if (await interpretationContent.isVisible({ timeout: 100 }).catch(() => false)) {
        success = true;
        break;
      }
      
      if (errorFound) break;
    }
    
    // Record results
    results.tests.push({
      test: 'Tarot AI Interpretation',
      success: success && !errorFound,
      errorFound,
      errorMessage,
      consoleErrors: [...consoleErrors]
    });
    
    // Test summary
    console.log('\n===== TEST RESULTS =====');
    console.log(`Success: ${success}`);
    console.log(`Error Found: ${errorFound}`);
    if (errorMessage) {
      console.log(`Error Message: ${errorMessage}`);
    }
    console.log(`Console Errors: ${consoleErrors.length}`);
    
    if (success && !errorFound) {
      console.log('\n✅ AI MODEL FIX VERIFIED SUCCESSFULLY!');
      console.log('The gpt-3.5-turbo error has been resolved.');
    } else {
      console.log('\n❌ AI MODEL ERROR STILL PRESENT');
      console.log('The issue persists. Further investigation needed.');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: `ai-fix-verification-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Save results
    const fs = require('fs');
    fs.writeFileSync('ai-fix-verification-results.json', JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  }
  
  console.log('\n🔍 Keep browser open for manual verification.');
  console.log('Press Ctrl+C to exit when done.');
  
  // Keep browser open
  await new Promise(() => {});
}

verifyAIFix().catch(console.error);