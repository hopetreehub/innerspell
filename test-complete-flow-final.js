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

    console.log('2. Entering question...');
    const questionInput = await page.locator('textarea[placeholder*="카드에게 무엇을 묻고 싶나요"]');
    await questionInput.fill('나의 미래는 어떻게 될까요? 특히 경력과 성장 측면에서 알고 싶습니다.');

    console.log('3. Clicking shuffle button...');
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(2000);

    console.log('4. Clicking spread button...');
    await page.locator('button:has-text("카드 펼치기")').click();
    await page.waitForTimeout(2000);
    
    console.log('5. Selecting cards from the spread...');
    // After spreading, we should see face-down cards to select
    // Look for clickable card elements
    const cardSelectors = [
      'img[alt*="card"]',
      'div[role="button"]',
      '[class*="cursor-pointer"]',
      'button:not(:has-text("카드"))',
      'div[class*="card"]:not([class*="selected"])'
    ];
    
    let cardsSelected = 0;
    for (const selector of cardSelectors) {
      if (cardsSelected >= 3) break;
      
      const cards = await page.locator(selector).all();
      console.log(`Found ${cards.length} elements with selector: ${selector}`);
      
      for (const card of cards) {
        if (cardsSelected >= 3) break;
        
        try {
          // Check if element is visible and clickable
          const isVisible = await card.isVisible();
          if (isVisible) {
            const boundingBox = await card.boundingBox();
            if (boundingBox && boundingBox.width > 50 && boundingBox.height > 50) {
              await card.click();
              cardsSelected++;
              console.log(`Selected card ${cardsSelected}`);
              await page.waitForTimeout(1000);
            }
          }
        } catch (e) {
          // Skip if not clickable
        }
      }
    }
    
    await page.screenshot({ path: 'complete-1-cards-selected.png', fullPage: true });
    
    console.log(`\nTotal cards selected: ${cardsSelected}`);
    
    if (cardsSelected < 3) {
      console.log('⚠️  Could not select 3 cards. Checking page state...');
      const pageText = await page.evaluate(() => document.body.innerText);
      if (pageText.includes('0/3 선택됨')) {
        console.log('Cards are not being selected properly');
      }
    }
    
    // Look for AI interpretation button or automatic interpretation
    console.log('\n6. Looking for interpretation...');
    
    // Check if there's an interpretation button to click
    const interpretButtonSelectors = [
      'button:has-text("해석")',
      'button:has-text("AI 해석")',
      'button:has-text("읽기")',
      'button[disabled]:has-text("해석")'
    ];
    
    for (const selector of interpretButtonSelectors) {
      const button = await page.locator(selector).first();
      if (await button.count() > 0) {
        const isDisabled = await button.isDisabled();
        if (!isDisabled) {
          console.log(`Clicking interpretation button: ${selector}`);
          await button.click();
          break;
        } else {
          console.log(`Found disabled button: ${selector}`);
        }
      }
    }
    
    // Wait for potential AI response
    console.log('\n7. Waiting for AI interpretation...');
    await page.waitForTimeout(10000);
    
    await page.screenshot({ path: 'complete-2-final-result.png', fullPage: true });
    
    // Check for interpretation content
    const pageContent = await page.evaluate(() => document.body.innerText);
    
    if (pageContent.includes('AI 해석 생성 중') || pageContent.includes('로딩')) {
      console.log('AI interpretation is being generated...');
      await page.waitForTimeout(15000);
      await page.screenshot({ path: 'complete-3-after-wait.png', fullPage: true });
    }
    
    // Final check for interpretation
    const finalContent = await page.evaluate(() => document.body.innerText);
    
    if (finalContent.includes('과거') && finalContent.includes('현재') && finalContent.includes('미래')) {
      console.log('\n✅ SUCCESS: Found past/present/future interpretation structure');
      
      // Look for actual interpretation text
      const interpretationDivs = await page.locator('div').all();
      for (const div of interpretationDivs) {
        const text = await div.textContent();
        if (text && text.length > 500 && text.includes('과거') && !text.includes('카드 섞기')) {
          console.log('\n=== AI Interpretation Found ===');
          console.log(`Length: ${text.length} characters`);
          console.log('Preview:', text.substring(0, 300) + '...');
          break;
        }
      }
    } else if (finalContent.includes('error') || finalContent.includes('오류')) {
      console.log('\n❌ ERROR: Found error in interpretation');
    } else {
      console.log('\n⚠️  No clear interpretation found');
    }
    
    console.log('\n✅ Test completed. Check screenshots.');
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'complete-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();