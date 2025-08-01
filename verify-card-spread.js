const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('1. Going to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('2. Entering question...');
    await page.fill('textarea[placeholder*="질문"]', '테스트 질문입니다');
    
    console.log('3. Clicking shuffle...');
    await page.click('button:has-text("카드 섞기")');
    
    console.log('4. Waiting for shuffle animation...');
    await page.waitForTimeout(10000);
    
    console.log('5. Looking for spread button...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    const isVisible = await spreadButton.isVisible();
    
    if (isVisible) {
      console.log('6. Clicking spread button...');
      await spreadButton.click();
      await page.waitForTimeout(2000);
      
      // Check for spread cards section
      const spreadSection = await page.locator('text=펼쳐진 카드').isVisible();
      console.log('   - Spread section visible:', spreadSection);
      
      // Count actual spread cards
      const spreadCards = await page.locator('[role="group"] .absolute').count();
      console.log('   - Number of cards in spread:', spreadCards);
      
      // Scroll to spread section if it exists
      if (spreadSection) {
        await page.locator('text=펼쳐진 카드').scrollIntoViewIfNeeded();
        console.log('   - Scrolled to spread section');
      }
      
      await page.screenshot({ path: 'card-spread-result.png', fullPage: true });
      console.log('7. Screenshot saved as card-spread-result.png');
      
      // Try clicking a card
      if (spreadCards > 0) {
        console.log('8. Trying to click first card...');
        await page.locator('[role="group"] .absolute').first().click();
        await page.waitForTimeout(1000);
        
        const selectedCount = await page.locator('text=/선택됨/').textContent();
        console.log('   - Selection status:', selectedCount);
      }
    } else {
      console.log('ERROR: Spread button not visible after shuffle!');
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    console.log('\nPress Ctrl+C to close browser...');
    await page.waitForTimeout(30000); // Keep browser open for manual inspection
  }
})();