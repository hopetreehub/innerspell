const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to tarot reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('2. Setting up tarot reading...');
    const textarea = await page.waitForSelector('textarea#question', { timeout: 10000 });
    await textarea.fill('카드 간격 테스트용 질문입니다');

    console.log('3. Shuffling cards...');
    const shuffleButton = await page.waitForSelector('button:has-text("카드 섞기")', { timeout: 10000 });
    await shuffleButton.click();
    await page.waitForTimeout(2000);

    console.log('4. Taking screenshot before reveal...');
    await page.screenshot({ path: 'before-reveal.png', fullPage: true });

    console.log('5. Revealing spread...');
    const revealButton = await page.waitForSelector('button:has-text("카드 펼치기")', { timeout: 10000 });
    await revealButton.click();
    
    console.log('6. Waiting for cards to appear...');
    // Wait longer and take screenshots at intervals
    for (let i = 1; i <= 5; i++) {
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `after-reveal-${i}s.png`, fullPage: true });
      
      // Check for any card elements
      const cardElements = await page.$$('[class*="card"], .spread-container, .reading-cards, .tarot-spread');
      console.log(`After ${i}s: Found ${cardElements.length} potential card elements`);
      
      // Log visible elements
      const visibleElements = await page.evaluate(() => {
        const elements = [];
        document.querySelectorAll('*').forEach(el => {
          if (el.className && el.className.toString().includes('card') && 
              el.offsetHeight > 0 && el.offsetWidth > 0) {
            elements.push({
              class: el.className.toString(),
              tag: el.tagName,
              text: el.textContent?.substring(0, 50)
            });
          }
        });
        return elements;
      });
      
      if (visibleElements.length > 0) {
        console.log(`Visible card-related elements:`, visibleElements);
      }
    }
    
    // Check for any error messages
    const errorMessages = await page.$$('text=/error|failed|오류/i');
    if (errorMessages.length > 0) {
      console.log('Found error messages on page');
    }
    
    // Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    console.log('\nBrowser will remain open for inspection...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();