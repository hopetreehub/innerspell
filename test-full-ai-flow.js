const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  try {
    console.log('1. Opening reading page...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'ai-test-1-reading-page.png' });

    console.log('2. Entering question...');
    // The input has a specific placeholder
    const questionInput = await page.locator('textarea[placeholder*="카드에게 무엇을 묻고 싶나요"]');
    await questionInput.fill('나의 미래는 어떻게 될까요? 특히 경력과 성장 측면에서 알고 싶습니다.');
    await page.screenshot({ path: 'ai-test-2-question-entered.png' });

    console.log('3. Spread is already selected (Trinity View)...');
    // Trinity View (3장) is already selected by default

    console.log('4. Clicking shuffle button...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ai-test-3-cards-shuffled.png' });

    console.log('5. Selecting 3 cards...');
    // Wait for cards to be visible
    await page.waitForSelector('[class*="card"]', { timeout: 10000 });
    
    // Click on first 3 cards - they should be clickable divs or images
    const cards = await page.locator('[class*="card"]').all();
    console.log(`Found ${cards.length} cards`);
    
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      await page.waitForTimeout(1000);
      console.log(`Selected card ${i + 1}`);
    }
    await page.screenshot({ path: 'ai-test-4-cards-selected.png' });

    console.log('6. Clicking interpretation button...');
    // Look for the spread/interpretation button
    const interpretButton = await page.locator('button:has-text("카드 펼치기")').first();
    await interpretButton.click();
    
    console.log('7. Waiting for AI interpretation...');
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'ai-test-5-interpretation-loading.png', fullPage: true });
    
    // Wait for potential loading to complete
    await page.waitForTimeout(10000);
    
    // Take final screenshot
    await page.screenshot({ path: 'ai-test-6-interpretation-result.png', fullPage: true });
    
    // Look for interpretation content
    const pageText = await page.evaluate(() => document.body.innerText);
    
    // Check for AI interpretation markers
    if (pageText.includes('AI 해석') || pageText.includes('해석')) {
      console.log('\n✅ Found interpretation section');
      
      // Look for actual interpretation content
      const interpretationSections = await page.locator('div').all();
      for (const section of interpretationSections) {
        const text = await section.textContent();
        if (text && text.length > 200 && !text.includes('카드 섞기')) {
          console.log('\n=== Interpretation Content ===');
          console.log(`Length: ${text.length} characters`);
          console.log(`Preview: ${text.substring(0, 400)}...`);
          
          if (text.includes('과거') || text.includes('현재') || text.includes('미래') || 
              text.includes('Past') || text.includes('Present') || text.includes('Future')) {
            console.log('\n✅ SUCCESS: Found card position interpretations!');
          }
          
          if (text.includes('기본 해석') || text.includes('mock')) {
            console.log('⚠️  This appears to be a basic/mock interpretation');
          } else if (text.length > 500) {
            console.log('✅ This appears to be a real AI interpretation!');
          }
        }
      }
    }
    
    // Check for errors
    if (pageText.includes('error') || pageText.includes('오류') || pageText.includes('실패')) {
      console.log('\n❌ Found error messages on page');
      const errors = pageText.match(/.*(?:error|오류|실패).*/gi);
      if (errors) {
        console.log('Error messages:', errors);
      }
    }
    
    console.log('\n✅ Test completed. Check screenshots for results.');
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'ai-test-error.png', fullPage: true });
  } finally {
    // Keep browser open for 10 seconds to observe
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();