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
    await page.screenshot({ path: 'direct-1-question.png' });

    console.log('3. Clicking shuffle button...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'direct-2-shuffled.png' });

    console.log('4. Clicking spread/interpret button directly...');
    const interpretButton = await page.locator('button:has-text("카드 펼치기")').first();
    await interpretButton.click();
    
    console.log('5. Waiting for AI interpretation to load...');
    await page.waitForTimeout(5000);
    
    // Check for loading indicators
    const loadingSelectors = [
      'text="AI 해석 생성 중..."',
      'text="처리 중..."',
      'text="로딩 중..."',
      '[class*="loading"]',
      '[class*="spinner"]',
      '.animate-pulse'
    ];
    
    let foundLoading = false;
    for (const selector of loadingSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`Found loading indicator: ${selector}`);
        foundLoading = true;
        break;
      }
    }
    
    if (foundLoading) {
      console.log('Waiting for loading to complete...');
      await page.waitForTimeout(20000); // Wait 20 seconds for AI response
    }
    
    await page.screenshot({ path: 'direct-3-result.png', fullPage: true });
    
    // Look for interpretation content
    console.log('\n6. Checking for AI interpretation...');
    
    // Check specific areas where interpretation might appear
    const interpretationSelectors = [
      '[class*="interpretation"]',
      '[class*="reading-result"]',
      '[class*="ai-result"]',
      '[class*="해석"]',
      'div:has-text("과거")',
      'div:has-text("현재")',
      'div:has-text("미래")',
      'section',
      'article',
      'div[class*="prose"]',
      'div[class*="content"]'
    ];
    
    let foundInterpretation = false;
    for (const selector of interpretationSelectors) {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        const text = await element.textContent();
        if (text && text.length > 300 && !text.includes('카드 섞기')) {
          console.log(`\n=== Found potential interpretation (${selector}) ===`);
          console.log(`Length: ${text.length} characters`);
          console.log(`Content preview: ${text.substring(0, 500)}...`);
          
          // Check for AI interpretation markers
          if (text.includes('과거') && text.includes('현재') && text.includes('미래')) {
            console.log('✅ Contains past/present/future structure');
            foundInterpretation = true;
          }
          
          if (text.includes('경력') || text.includes('성장')) {
            console.log('✅ Contains keywords from the question');
          }
          
          if (text.includes('AI') || text.includes('해석')) {
            console.log('✅ Contains AI interpretation markers');
          }
          
          if (text.includes('error') || text.includes('오류')) {
            console.log('❌ Contains error messages');
          }
        }
      }
    }
    
    if (!foundInterpretation) {
      console.log('\n❌ No AI interpretation found');
      
      // Check page text for errors
      const pageText = await page.evaluate(() => document.body.innerText);
      if (pageText.includes('error') || pageText.includes('오류')) {
        console.log('\nError messages found in page:');
        const lines = pageText.split('\n');
        lines.forEach(line => {
          if (line.toLowerCase().includes('error') || line.includes('오류')) {
            console.log(`- ${line}`);
          }
        });
      }
    }
    
    // Take one more screenshot after additional wait
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'direct-4-final.png', fullPage: true });
    
    console.log('\n✅ Test completed. Check screenshots for visual confirmation.');
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'direct-error.png', fullPage: true });
  } finally {
    // Keep browser open for observation
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();