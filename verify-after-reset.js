const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('=== CARD SPREAD VERIFICATION AFTER RESET ===\n');
    
    console.log('1. Going to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('2. Filling question...');
    await page.fill('textarea', '리셋 후 카드 펼치기 테스트');
    
    console.log('3. Clicking shuffle...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(10000);
    
    console.log('4. Clicking spread...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    
    console.log('5. Analyzing results...');
    
    // Count cards
    const cards = await page.locator('[role="button"][tabIndex="0"]').count();
    console.log(`   ✓ Total cards spread: ${cards}`);
    
    // Check spread width
    if (cards > 0) {
      const first = await page.locator('[role="button"][tabIndex="0"]').first().boundingBox();
      const last = await page.locator('[role="button"][tabIndex="0"]').last().boundingBox();
      
      if (first && last) {
        const width = last.x - first.x;
        console.log(`   ✓ Spread width: ${width}px`);
        console.log(`   ✓ Cards properly spread: ${width > 500 ? 'YES' : 'NO'}`);
      }
    }
    
    // Click a card
    if (cards > 0) {
      console.log('6. Testing card selection...');
      await page.locator('[role="button"][tabIndex="0"]').first().click();
      await page.waitForTimeout(1000);
      
      const selected = await page.locator('text=/선택됨/').textContent();
      console.log(`   ✓ Selection status: ${selected}`);
    }
    
    await page.screenshot({ path: 'reset-verification.png', fullPage: true });
    console.log('\n✅ Screenshot saved: reset-verification.png');
    console.log('\n=== VERIFICATION COMPLETE ===');
    
    if (cards === 78) {
      console.log('\n🎉 SUCCESS: Card spread is working properly!');
    } else {
      console.log(`\n❌ ISSUE: Expected 78 cards, found ${cards}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();