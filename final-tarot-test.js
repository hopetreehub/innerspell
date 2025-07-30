const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Track API responses
  let apiResponseCount = 0;
  let interpretationFound = false;
  let interpretationLength = 0;
  
  // Console logging (filtered)
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('API') || text.includes('Error') || text.includes('error') || text.includes('🔍') || text.includes('✅') || text.includes('❌')) {
      console.log(`CONSOLE: ${text}`);
    }
  });
  
  // Network monitoring focused on tarot APIs
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('api/generate-tarot') || url.includes('api/tarot') || url.includes('api/debug')) {
      apiResponseCount++;
      console.log(`\n🎯 TAROT API RESPONSE #${apiResponseCount}: ${status} ${url}`);
      
      try {
        const body = await response.text();
        console.log(`📏 Response size: ${body.length} characters`);
        
        if (body.length > 100) {
          console.log(`📄 Response preview: ${body.substring(0, 300)}...`);
          
          try {
            const data = JSON.parse(body);
            
            if (data.interpretation) {
              interpretationLength = data.interpretation.length;
              interpretationFound = true;
              
              console.log(`\n🎊 INTERPRETATION FOUND!`);
              console.log(`📏 Length: ${interpretationLength} characters`);
              
              if (interpretationLength > 800) {
                console.log(`✅ RICH INTERPRETATION CONFIRMED! (${interpretationLength} chars)`);
              } else {
                console.log(`⚠️ Shorter interpretation: ${interpretationLength} chars`);
              }
              
              console.log(`📖 First 400 chars: ${data.interpretation.substring(0, 400)}...`);
            }
            
            if (data.guidelines && data.guidelines.length > 0) {
              console.log(`\n📋 GUIDELINES MATCHED: ${data.guidelines.length} guidelines`);
              data.guidelines.forEach((g, i) => {
                console.log(`   ${i+1}. ${g.title || g.name || 'Guideline'}`);
              });
            }
            
            if (data.cards && data.cards.length > 0) {
              console.log(`\n🃏 CARDS: ${data.cards.length} cards drawn`);
              data.cards.forEach((card, i) => {
                console.log(`   ${i+1}. ${card.name} (${card.orientation || 'upright'})`);
              });
            }
            
          } catch (e) {
            console.log(`❌ JSON parsing failed: ${e.message}`);
          }
        }
      } catch (e) {
        console.log(`❌ Could not read response: ${e.message}`);
      }
    }
  });
  
  try {
    console.log('🎴 === FINAL TAROT READING TEST ===\n');
    
    // Navigate to the reading page
    console.log('🌐 Loading http://localhost:4000/reading...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);
    
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: 'success-01-loaded.png', fullPage: true });
    
    // Enter the question
    console.log('\n📝 Entering the tarot question...');
    const questionInput = page.locator('textarea').first();
    await questionInput.fill('삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
    console.log('✅ Question entered');
    
    await page.waitForTimeout(2000);
    
    // Click the draw cards button (left button)
    console.log('\n🎴 Looking for "카드 뽑기" button...');
    
    // Try multiple selectors for the draw button
    const drawButtonSelectors = [
      'button:has-text("카드 뽑기")',
      'text="카드 뽑기"',
      '.bg-primary:has-text("카드 뽑기")',
      'button[class*="bg-primary"]:has-text("카드")'
    ];
    
    let drawButton = null;
    for (let selector of drawButtonSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.count() > 0 && await btn.isVisible()) {
          drawButton = btn;
          console.log(`✅ Found draw button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!drawButton) {
      // Try finding by text content
      console.log('🔍 Searching for button by text content...');
      const allButtons = await page.locator('button').all();
      
      for (let btn of allButtons) {
        const text = await btn.textContent().catch(() => '');
        const isVisible = await btn.isVisible().catch(() => false);
        
        if (text.includes('카드 뽑기') && isVisible) {
          drawButton = btn;
          console.log(`✅ Found draw button by text: "${text}"`);
          break;
        }
      }
    }
    
    if (drawButton) {
      console.log('🚀 Clicking the draw cards button...');
      await drawButton.click();
      
      console.log('\n⏳ Waiting for tarot reading to process...');
      console.log('🔄 Monitoring API calls for 60 seconds...');
      
      // Wait and monitor for results
      await page.waitForTimeout(60000);
      
      console.log('\n📸 Taking final screenshot...');
      await page.screenshot({ path: 'success-final.png', fullPage: true });
      
      // Check for results on the page
      console.log('\n🔍 Checking page content for results...');
      const pageText = await page.locator('body').textContent();
      
      const hasInterpretation = pageText.includes('해석') || pageText.includes('의미') || pageText.includes('카드가');
      const hasError = pageText.includes('Error') || pageText.includes('오류') || pageText.includes('실패');
      
      console.log(`📊 Page analysis:`);
      console.log(`   - Page text length: ${pageText.length} chars`);
      console.log(`   - Contains interpretation content: ${hasInterpretation}`);
      console.log(`   - Contains error messages: ${hasError}`);
      
      if (hasInterpretation) {
        console.log(`✅ Interpretation content found on page`);
      }
      
    } else {
      console.log('❌ Could not find the draw cards button');
      
      // Debug: show all visible buttons
      const allButtons = await page.locator('button').all();
      console.log(`\n🔍 DEBUG: Found ${allButtons.length} buttons:`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const btn = allButtons[i];
        const text = await btn.textContent().catch(() => '');
        const isVisible = await btn.isVisible().catch(() => false);
        
        if (isVisible && text) {
          console.log(`   ${i+1}. "${text}" (visible: ${isVisible})`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'success-error.png', fullPage: true });
  }
  
  // Final summary
  console.log('\n🏁 === TEST SUMMARY ===');
  console.log(`📊 API responses captured: ${apiResponseCount}`);
  console.log(`✨ Interpretation found: ${interpretationFound}`);
  
  if (interpretationFound) {
    console.log(`📏 Interpretation length: ${interpretationLength} characters`);
    
    if (interpretationLength > 800) {
      console.log(`🎉 SUCCESS: Rich interpretation generated (${interpretationLength} chars)!`);
    } else {
      console.log(`⚠️ WARNING: Interpretation shorter than expected (${interpretationLength} chars)`);
    }
  } else {
    console.log(`❌ No interpretation detected in API responses`);
  }
  
  console.log('\n📋 Key Points for Analysis:');
  console.log('1. Check if API calls were made to /api/generate-tarot-interpretation');
  console.log('2. Verify guideline matching occurred');
  console.log('3. Confirm interpretation length meets >800 char requirement');
  console.log('4. Review any error messages or debugging info');
  
  console.log('\n⏱️ Browser staying open for 2 minutes for manual inspection...');
  await page.waitForTimeout(120000);
  
  await browser.close();
  console.log('\n✅ Test completed!');
})();