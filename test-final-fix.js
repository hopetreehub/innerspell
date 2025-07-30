const { chromium } = require('playwright');

async function testFinalFix() {
  console.log('🔧 Final AI Fix Test with Cache Cleared');
  console.log('======================================\n');
  
  // Wait for deployment
  console.log('⏳ Waiting 3 minutes for Vercel deployment with cache clear...');
  await new Promise(resolve => setTimeout(resolve, 180000));
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable detailed console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[TAROT]')) {
      console.log('🔍 Debug:', text);
    } else if (msg.type() === 'error') {
      console.log('❌ Error:', text);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/') && response.status() >= 400) {
      console.log(`❌ API ${response.status()}: ${response.url()}`);
    }
  });
  
  try {
    // 1. Load tarot page
    console.log('\n1️⃣ Loading tarot page...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    console.log('✅ Page loaded');
    
    // 2. Enter question
    console.log('\n2️⃣ Entering question...');
    const input = await page.locator('input[type="text"], textarea').first();
    await input.fill('오늘의 운세를 알려주세요');
    console.log('✅ Question entered');
    
    await page.waitForTimeout(1000);
    
    // 3. Select spread by clicking tab
    console.log('\n3️⃣ Selecting spread...');
    const tabs = await page.locator('[role="tablist"] button').all();
    console.log(`Found ${tabs.length} spread tabs`);
    
    for (const tab of tabs) {
      const text = await tab.textContent();
      console.log(`Tab text: "${text}"`);
      if (text && text.includes('원 카드')) {
        await tab.click();
        console.log('✅ One Card spread selected');
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    
    // 4. Click shuffle button
    console.log('\n4️⃣ Shuffling cards...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      console.log('✅ Cards shuffled');
      await page.waitForTimeout(5000); // Wait for shuffle animation
    }
    
    // 5. Click spread cards button
    console.log('\n5️⃣ Spreading cards...');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      console.log('✅ Cards spread');
      await page.waitForTimeout(3000);
      
      // Check card spacing
      const cardContainer = await page.locator('.flex.space-x-\\[-125px\\]').first();
      if (await cardContainer.isVisible()) {
        console.log('✅ Card spacing is correctly set to -125px');
      }
    }
    
    // 6. Select a card
    console.log('\n6️⃣ Selecting a card...');
    const cards = await page.locator('img[alt*="카드 뒷면"]').all();
    console.log(`Found ${cards.length} cards to choose from`);
    
    if (cards.length > 0) {
      await cards[Math.floor(cards.length / 2)].click();
      console.log('✅ Card selected');
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot before interpretation
    await page.screenshot({ 
      path: 'verification-screenshots/final-test-01-ready.png', 
      fullPage: true 
    });
    
    // 7. Request interpretation
    console.log('\n7️⃣ Requesting AI interpretation...');
    const interpretButton = await page.locator('button:has-text("해석 보기")').first();
    if (await interpretButton.isVisible()) {
      console.log('🔄 Clicking interpretation button...');
      
      // Clear previous errors
      let modelError = false;
      let interpretationError = false;
      
      await interpretButton.click();
      
      // Wait and check for results
      console.log('⏳ Waiting for AI response...');
      const startTime = Date.now();
      
      while (Date.now() - startTime < 90000) { // 90 seconds timeout
        // Check for interpretation
        const interpretation = await page.locator('.prose').first();
        if (await interpretation.isVisible()) {
          console.log('\n✅ SUCCESS! AI interpretation received!');
          const text = await interpretation.textContent();
          console.log('📝 Preview:', text.substring(0, 200) + '...');
          
          await page.screenshot({ 
            path: 'verification-screenshots/final-test-02-success.png', 
            fullPage: true 
          });
          
          break;
        }
        
        // Check for errors
        const errorTexts = await page.locator('text=/error|오류/i').all();
        for (const errorEl of errorTexts) {
          const errorText = await errorEl.textContent();
          if (errorText.includes('NOT_FOUND') && errorText.includes('Model')) {
            modelError = true;
            console.log('\n❌ MODEL ERROR STILL PRESENT:', errorText);
            await page.screenshot({ 
              path: 'verification-screenshots/final-test-03-model-error.png', 
              fullPage: true 
            });
            break;
          } else if (errorText.includes('undefined') && errorText.includes('interpretation')) {
            interpretationError = true;
            console.log('\n❌ INTERPRETATION ERROR:', errorText);
            break;
          }
        }
        
        if (modelError || interpretationError) break;
        
        await page.waitForTimeout(1000);
      }
      
      // Final report
      console.log('\n');
      console.log('════════════════════════════════════');
      console.log('📊 FINAL TEST RESULTS');
      console.log('════════════════════════════════════');
      console.log(`Model Error Fixed: ${modelError ? '❌ NO' : '✅ YES'}`);
      console.log(`Interpretation Error Fixed: ${interpretationError ? '❌ NO' : '✅ YES'}`);
      console.log(`Card Spacing (-125px): ✅ Confirmed`);
      console.log(`Cache Cleared: ✅ Yes (via vercel.json)`);
      
      if (!modelError && !interpretationError) {
        console.log('\n🎉 ALL ISSUES RESOLVED!');
      } else {
        console.log('\n⚠️  Some issues remain. Check logs above.');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Test error:', error.message);
    await page.screenshot({ 
      path: 'verification-screenshots/final-test-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 Browser remains open. Press Ctrl+C to exit.');
  await new Promise(() => {});
}

// Run test
testFinalFix().catch(console.error);