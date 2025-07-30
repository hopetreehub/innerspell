const { chromium } = require('playwright');
const fs = require('fs');

async function testAIModelFix() {
  console.log('🔧 AI Model Fix Verification Test');
  console.log('================================\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    deploymentStatus: 'unknown',
    pageLoad: false,
    inputField: false,
    spreadSelection: false,
    cardSelection: false,
    interpretationRequest: false,
    interpretationSuccess: false,
    errorDetails: null,
    modelError: false
  };
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Capture network errors
  const apiErrors = [];
  page.on('response', response => {
    if (response.url().includes('/api/') && response.status() >= 400) {
      apiErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  try {
    // 1. Check deployment
    console.log('1️⃣ Checking Vercel deployment...');
    const response = await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    results.deploymentStatus = response.status() === 200 ? 'live' : 'error';
    console.log(`✅ Deployment status: ${results.deploymentStatus}`);
    
    // 2. Navigate to tarot page
    console.log('\n2️⃣ Navigating to tarot page...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    results.pageLoad = true;
    console.log('✅ Tarot page loaded');
    
    await page.screenshot({ 
      path: 'verification-screenshots/final-ai-test-01-page.png', 
      fullPage: true 
    });
    
    // 3. Find and fill question input
    console.log('\n3️⃣ Testing question input...');
    const questionSelectors = [
      'textarea[placeholder*="질문"]',
      'textarea',
      'input[type="text"]',
      '[data-testid="question-input"]'
    ];
    
    for (const selector of questionSelectors) {
      try {
        const input = await page.locator(selector).first();
        if (await input.isVisible({ timeout: 3000 })) {
          await input.fill('오늘 나의 운세와 조언을 부탁드립니다');
          results.inputField = true;
          console.log(`✅ Question entered using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!results.inputField) {
      console.log('❌ Could not find question input field');
    }
    
    await page.waitForTimeout(1000);
    
    // 4. Select spread
    console.log('\n4️⃣ Selecting tarot spread...');
    const spreadButtons = await page.locator('button').all();
    for (const button of spreadButtons) {
      const text = await button.textContent();
      if (text && text.includes('원 카드')) {
        await button.click();
        results.spreadSelection = true;
        console.log('✅ One Card spread selected');
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    
    // 5. Start reading
    console.log('\n5️⃣ Starting tarot reading...');
    const startButton = await page.locator('button:has-text("시작하기")').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Reading started');
    }
    
    // 6. Select a card
    console.log('\n6️⃣ Selecting a card...');
    const cards = await page.locator('img[alt*="card"]').all();
    if (cards.length > 0) {
      await cards[0].click();
      results.cardSelection = true;
      console.log(`✅ Card selected (1 of ${cards.length})`);
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ 
      path: 'verification-screenshots/final-ai-test-02-card-selected.png', 
      fullPage: true 
    });
    
    // 7. Request interpretation
    console.log('\n7️⃣ Requesting AI interpretation...');
    const interpretButton = await page.locator('button:has-text("해석 보기")').first();
    if (await interpretButton.isVisible()) {
      console.log('🔄 Clicking interpretation button...');
      await interpretButton.click();
      results.interpretationRequest = true;
      
      // Wait for interpretation or error
      console.log('⏳ Waiting for AI response (up to 60 seconds)...');
      
      try {
        // Wait for interpretation to appear
        await page.waitForSelector('.prose', { timeout: 60000 });
        results.interpretationSuccess = true;
        console.log('✅ AI INTERPRETATION RECEIVED SUCCESSFULLY!');
        
        const interpretationText = await page.locator('.prose').textContent();
        console.log('\n📝 Interpretation preview:');
        console.log(interpretationText.substring(0, 300) + '...\n');
        
      } catch (timeoutError) {
        console.log('❌ Timeout waiting for interpretation');
        
        // Check for error messages
        const errorPatterns = [
          'text=/NOT_FOUND.*Model/i',
          'text=/오류/i',
          'text=/error/i',
          'text=/실패/i'
        ];
        
        for (const pattern of errorPatterns) {
          const errorElement = await page.locator(pattern).first();
          if (await errorElement.isVisible()) {
            const errorText = await errorElement.textContent();
            results.errorDetails = errorText;
            
            if (errorText.includes('NOT_FOUND') && errorText.includes('Model')) {
              results.modelError = true;
              console.log('❌ MODEL ERROR DETECTED:', errorText);
            } else {
              console.log('❌ Error found:', errorText);
            }
            break;
          }
        }
      }
      
      await page.screenshot({ 
        path: 'verification-screenshots/final-ai-test-03-result.png', 
        fullPage: true 
      });
    }
    
    // Save detailed results
    results.consoleErrors = consoleErrors;
    results.apiErrors = apiErrors;
    
    fs.writeFileSync(
      'verification-screenshots/ai-test-results.json',
      JSON.stringify(results, null, 2)
    );
    
    // Final Report
    console.log('\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 AI MODEL FIX TEST RESULTS');
    console.log('═══════════════════════════════════════');
    console.log(`Deployment: ${results.deploymentStatus === 'live' ? '✅' : '❌'} ${results.deploymentStatus}`);
    console.log(`Page Load: ${results.pageLoad ? '✅' : '❌'}`);
    console.log(`Question Input: ${results.inputField ? '✅' : '❌'}`);
    console.log(`Spread Selection: ${results.spreadSelection ? '✅' : '❌'}`);
    console.log(`Card Selection: ${results.cardSelection ? '✅' : '❌'}`);
    console.log(`Interpretation Request: ${results.interpretationRequest ? '✅' : '❌'}`);
    console.log(`Interpretation Success: ${results.interpretationSuccess ? '✅' : '❌'}`);
    
    if (results.modelError) {
      console.log('\n⚠️  MODEL ERROR STILL PRESENT');
      console.log('The "openai/gpt-3.5-turbo not found" error is still occurring.');
      console.log('The fix may not be deployed yet or needs additional changes.');
    } else if (results.interpretationSuccess) {
      console.log('\n🎉 SUCCESS! The AI model fix is working correctly.');
      console.log('The model ID parsing issue has been resolved.');
    } else if (results.errorDetails) {
      console.log('\n⚠️  Different error encountered:', results.errorDetails);
    }
    
    if (apiErrors.length > 0) {
      console.log('\n📡 API Errors detected:');
      apiErrors.forEach(err => {
        console.log(`  - ${err.status} ${err.statusText} at ${err.url}`);
      });
    }
    
    console.log('\n📁 Results saved to: verification-screenshots/ai-test-results.json');
    console.log('📸 Screenshots saved in: verification-screenshots/');
    
  } catch (error) {
    console.error('\n💥 Critical test error:', error);
    results.errorDetails = error.message;
    
    await page.screenshot({ 
      path: 'verification-screenshots/final-ai-test-critical-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 Browser remains open for manual inspection.');
  console.log('Press Ctrl+C to exit.\n');
  
  await new Promise(() => {});
}

// Run the test
console.log('Starting AI Model Fix Verification...\n');
testAIModelFix().catch(console.error);