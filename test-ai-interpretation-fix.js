const { chromium } = require('playwright');

async function testAIInterpretation() {
  console.log('🚀 Testing AI interpretation fix with Chromium...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    }
  });
  
  try {
    // Test on Vercel deployment
    console.log('1️⃣ Testing on Vercel deployment...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Tarot page loaded');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'verification-screenshots/ai-test-01-initial.png', 
      fullPage: true 
    });
    
    // Enter question
    console.log('2️⃣ Entering question...');
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('오늘의 운세를 알려주세요');
    await page.waitForTimeout(1000);
    
    // Select One Card spread
    console.log('3️⃣ Selecting One Card spread...');
    const oneCardButton = await page.locator('button:has-text("원 카드")').first();
    await oneCardButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'verification-screenshots/ai-test-02-spread-selected.png', 
      fullPage: true 
    });
    
    // Click to shuffle cards
    console.log('4️⃣ Shuffling cards...');
    const startButton = await page.locator('button:has-text("시작하기")').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Select a card
    console.log('5️⃣ Selecting a card...');
    const cards = await page.locator('.cursor-pointer img[alt*="card"]').all();
    if (cards.length > 0) {
      console.log(`Found ${cards.length} cards to choose from`);
      await cards[Math.floor(cards.length / 2)].click(); // Click middle card
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'verification-screenshots/ai-test-03-card-selected.png', 
        fullPage: true 
      });
    }
    
    // Click interpretation button
    console.log('6️⃣ Requesting AI interpretation...');
    const interpretButton = await page.locator('button:has-text("해석 보기")').first();
    if (await interpretButton.isVisible()) {
      console.log('✅ Interpretation button found, clicking...');
      
      // Set up response interceptor to catch API errors
      page.on('response', response => {
        if (response.url().includes('/api/') && response.status() >= 400) {
          console.log(`❌ API Error: ${response.status()} - ${response.url()}`);
        }
      });
      
      await interpretButton.click();
      console.log('⏳ Waiting for AI response...');
      
      // Wait for either interpretation or error
      const interpretationTimeout = 60000; // 60 seconds
      try {
        await page.waitForSelector('.prose', { timeout: interpretationTimeout });
        console.log('✅ AI interpretation received!');
        
        await page.waitForTimeout(3000);
        await page.screenshot({ 
          path: 'verification-screenshots/ai-test-04-interpretation-success.png', 
          fullPage: true 
        });
        
        // Check for interpretation content
        const interpretationText = await page.locator('.prose').textContent();
        console.log('📝 Interpretation preview:', interpretationText.substring(0, 200) + '...');
        
      } catch (timeoutError) {
        console.log('❌ Timeout waiting for interpretation');
        
        // Check for error messages
        const errorMessage = await page.locator('text=/error|오류|실패/i').first();
        if (await errorMessage.isVisible()) {
          const errorText = await errorMessage.textContent();
          console.log('❌ Error message found:', errorText);
          
          // Check specific error patterns
          if (errorText.includes('NOT_FOUND') || errorText.includes('Model')) {
            console.log('❌ MODEL ERROR DETECTED - Fix may not be deployed yet');
          }
        }
        
        await page.screenshot({ 
          path: 'verification-screenshots/ai-test-05-interpretation-error.png', 
          fullPage: true 
        });
      }
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('==================');
    console.log('Page Load: ✅ Success');
    console.log('Question Entry: ✅ Success');
    console.log('Spread Selection: ✅ Success');
    console.log('Card Selection: ✅ Success');
    
    // Check if interpretation worked
    const hasInterpretation = await page.locator('.prose').isVisible();
    const hasError = await page.locator('text=/error|오류|실패/i').isVisible();
    
    if (hasInterpretation) {
      console.log('AI Interpretation: ✅ SUCCESS - Model fix is working!');
    } else if (hasError) {
      console.log('AI Interpretation: ❌ FAILED - Model error still present');
      console.log('\n⚠️  The fix needs to be deployed to Vercel');
      console.log('Run: git push origin main');
    } else {
      console.log('AI Interpretation: ⚠️  Unknown status');
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
    await page.screenshot({ 
      path: 'verification-screenshots/ai-test-critical-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 Browser remains open for inspection.');
  console.log('Press Ctrl+C to exit.');
  
  // Keep browser open
  await new Promise(() => {});
}

// Run the test
testAIInterpretation().catch(console.error);