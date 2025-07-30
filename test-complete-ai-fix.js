const { chromium } = require('playwright');

async function waitForDeployment() {
  console.log('⏳ Waiting 3 minutes for Vercel deployment...');
  for (let i = 0; i < 18; i++) {
    process.stdout.write(`\r⏳ ${180 - i*10} seconds remaining...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  console.log('\n✅ Deployment wait complete');
}

async function testCompleteAIFix() {
  console.log('🧪 Complete AI Fix Verification Test');
  console.log('====================================\n');
  
  // Wait for deployment
  await waitForDeployment();
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture all errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console error:', msg.text());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/') && response.status() >= 400) {
      console.log(`🔴 API Error: ${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    // 1. Navigate to tarot page
    console.log('1️⃣ Loading tarot page...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    console.log('✅ Page loaded successfully');
    
    // 2. Enter question
    console.log('\n2️⃣ Entering question...');
    // Try multiple selectors
    let questionEntered = false;
    const selectors = ['textarea', 'input[type="text"]', '[placeholder*="질문"]'];
    
    for (const selector of selectors) {
      try {
        const input = await page.locator(selector).first();
        if (await input.isVisible({ timeout: 2000 })) {
          await input.fill('오늘의 운세와 조언을 알려주세요');
          questionEntered = true;
          console.log(`✅ Question entered using: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue with next selector
      }
    }
    
    if (!questionEntered) {
      throw new Error('Could not find question input');
    }
    
    await page.waitForTimeout(1000);
    
    // 3. Select spread - click on the spread tab/button
    console.log('\n3️⃣ Selecting One Card spread...');
    // First click on spread selection area
    const spreadTabs = await page.locator('[role="tablist"] button, .tab-button').all();
    for (const tab of spreadTabs) {
      const text = await tab.textContent();
      if (text && text.includes('원 카드')) {
        await tab.click();
        console.log('✅ One Card spread selected');
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    
    // 4. Start reading
    console.log('\n4️⃣ Starting reading...');
    const startButton = await page.locator('button:has-text("시작하기"), button:has-text("카드 뽑기")').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      console.log('✅ Reading started');
      await page.waitForTimeout(3000);
    }
    
    // 5. Select a card
    console.log('\n5️⃣ Selecting a card...');
    // Look for card images
    const cards = await page.locator('img[alt*="card"], .card-image, [data-card]').all();
    if (cards.length > 0) {
      console.log(`Found ${cards.length} cards`);
      await cards[Math.floor(cards.length / 2)].click();
      console.log('✅ Card selected');
      await page.waitForTimeout(3000);
    } else {
      throw new Error('No cards found to select');
    }
    
    // Take screenshot before interpretation
    await page.screenshot({ 
      path: 'verification-screenshots/complete-test-01-before-interpretation.png', 
      fullPage: true 
    });
    
    // 6. Request interpretation
    console.log('\n6️⃣ Requesting AI interpretation...');
    const interpretButton = await page.locator('button:has-text("해석 보기"), button:has-text("해석 받기")').first();
    if (await interpretButton.isVisible()) {
      console.log('🔄 Clicking interpretation button...');
      await interpretButton.click();
      
      // Wait for interpretation
      console.log('⏳ Waiting for AI response (max 90 seconds)...');
      
      let interpretationFound = false;
      let errorFound = false;
      let startTime = Date.now();
      
      while (!interpretationFound && !errorFound && (Date.now() - startTime < 90000)) {
        // Check for interpretation
        const interpretation = await page.locator('.prose, [class*="interpretation"], .markdown').first();
        if (await interpretation.isVisible()) {
          interpretationFound = true;
          const text = await interpretation.textContent();
          console.log('\n✅ AI INTERPRETATION RECEIVED!');
          console.log('📝 Preview:', text.substring(0, 200) + '...');
          break;
        }
        
        // Check for errors
        const errorPatterns = [
          'text=/NOT_FOUND.*Model/i',
          'text=/Cannot read properties.*undefined.*interpretation/i',
          'text=/오류|에러|실패/i'
        ];
        
        for (const pattern of errorPatterns) {
          const error = await page.locator(pattern).first();
          if (await error.isVisible()) {
            errorFound = true;
            const errorText = await error.textContent();
            console.log('\n❌ ERROR FOUND:', errorText);
            
            if (errorText.includes('NOT_FOUND') && errorText.includes('Model')) {
              console.log('🔴 Model ID error still present!');
            } else if (errorText.includes('undefined') && errorText.includes('interpretation')) {
              console.log('🔴 Undefined interpretation error still present!');
            }
            break;
          }
        }
        
        await page.waitForTimeout(1000);
      }
      
      if (!interpretationFound && !errorFound) {
        console.log('⏱️ Timeout waiting for interpretation');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'verification-screenshots/complete-test-02-final-result.png', 
      fullPage: true 
    });
    
    // Final Report
    console.log('\n');
    console.log('════════════════════════════════════════');
    console.log('📊 COMPLETE AI FIX TEST RESULTS');
    console.log('════════════════════════════════════════');
    console.log(`Console Errors: ${errors.length > 0 ? '❌ ' + errors.length + ' errors' : '✅ None'}`);
    
    // Check specific error patterns
    const hasModelError = errors.some(e => e.includes('NOT_FOUND') && e.includes('Model'));
    const hasUndefinedError = errors.some(e => e.includes('undefined') && e.includes('interpretation'));
    
    console.log(`Model ID Error Fixed: ${hasModelError ? '❌ NO' : '✅ YES'}`);
    console.log(`Undefined Error Fixed: ${hasUndefinedError ? '❌ NO' : '✅ YES'}`);
    
    if (!hasModelError && !hasUndefinedError) {
      console.log('\n🎉 SUCCESS! All AI errors have been fixed!');
    } else {
      console.log('\n⚠️  Some errors still remain. Check deployment status.');
    }
    
  } catch (error) {
    console.error('\n💥 Test error:', error.message);
    await page.screenshot({ 
      path: 'verification-screenshots/complete-test-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 Browser remains open. Press Ctrl+C to exit.');
  await new Promise(() => {});
}

// Run test
testCompleteAIFix().catch(console.error);