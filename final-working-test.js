const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('=== FINAL WORKING CARD SPREAD TEST ===\n');
    
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('1. Entering question...');
    await page.fill('textarea', '최종 작동 테스트');
    
    console.log('2. Shuffling cards...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(10000);
    
    console.log('3. Spreading cards...');
    const spreadBtn = await page.locator('button:has-text("카드 펼치기")');
    const isVisible = await spreadBtn.isVisible();
    const isDisabled = await spreadBtn.isDisabled();
    
    console.log(`   - Button visible: ${isVisible}`);
    console.log(`   - Button disabled: ${isDisabled}`);
    
    if (isVisible && !isDisabled) {
      await spreadBtn.click();
      await page.waitForTimeout(3000);
      
      const cards = await page.locator('[role="button"][tabIndex="0"]').count();
      console.log(`\n✅ SUCCESS: ${cards} cards spread!`);
      
      if (cards === 78) {
        console.log('🎉 PERFECT: All 78 cards are spread correctly!');
      }
      
      await page.screenshot({ path: 'working-card-spread.png', fullPage: true });
      console.log('📸 Screenshot saved: working-card-spread.png');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();