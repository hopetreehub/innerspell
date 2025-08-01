const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('=== FINAL CARD SPREAD VERIFICATION ===\n');
    
    // Wait for server to be ready
    console.log('Waiting for server...');
    await page.waitForTimeout(5000);
    
    console.log('1. Going to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('2. Entering question...');
    await page.fill('textarea', '최종 카드 펼치기 테스트');
    
    console.log('3. Clicking shuffle...');
    await page.click('button:has-text("카드 섞기")');
    
    console.log('4. Waiting for shuffle (10s)...');
    await page.waitForTimeout(10000);
    
    console.log('5. Clicking spread button...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(3000);
    
    console.log('6. Checking spread results...');
    
    // Check container structure
    const container = await page.locator('[role="group"] > div').first();
    const containerHTML = await container.innerHTML();
    const hasFlexClass = containerHTML.includes('flex space-x-[-125px]');
    
    console.log(`   - Has correct flex layout: ${hasFlexClass}`);
    
    // Count cards with different methods
    const cardCount = await page.locator('[role="button"][tabIndex="0"]').count();
    console.log(`   - Cards with role=button: ${cardCount}`);
    
    // Check if cards are spread properly
    const firstCard = await page.locator('[role="button"][tabIndex="0"]').first();
    const lastCard = await page.locator('[role="button"][tabIndex="0"]').last();
    
    const firstBox = await firstCard.boundingBox();
    const lastBox = await lastCard.boundingBox();
    
    if (firstBox && lastBox) {
      const spreadWidth = lastBox.x - firstBox.x;
      console.log(`   - Spread width: ${spreadWidth}px`);
      console.log(`   - Cards are spread: ${spreadWidth > 100 ? 'YES' : 'NO'}`);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'final-spread-verification.png', fullPage: true });
    console.log('\n✅ Screenshot saved: final-spread-verification.png');
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();