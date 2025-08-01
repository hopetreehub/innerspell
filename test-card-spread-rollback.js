const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('1. Navigating to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('2. Entering question...');
    const questionTextarea = await page.locator('textarea').first();
    await questionTextarea.fill('카드 펼치기가 정상적으로 작동하는지 테스트합니다');
    
    console.log('3. Clicking shuffle button...');
    await page.click('button:has-text("카드 섞기")');
    
    console.log('4. Waiting for shuffle animation (10 seconds)...');
    await page.waitForTimeout(10000);
    
    console.log('5. Taking screenshot after shuffle...');
    await page.screenshot({ path: 'after-shuffle-rollback.png', fullPage: true });
    
    console.log('6. Looking for spread button...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    const isVisible = await spreadButton.isVisible();
    const isDisabled = await spreadButton.isDisabled();
    
    console.log(`   - Spread button visible: ${isVisible}`);
    console.log(`   - Spread button disabled: ${isDisabled}`);
    
    if (isVisible && !isDisabled) {
      console.log('7. Clicking spread button...');
      await spreadButton.click();
      await page.waitForTimeout(3000);
      
      console.log('8. Taking screenshot after spread...');
      await page.screenshot({ path: 'after-spread-rollback.png', fullPage: true });
      
      // Check spread cards
      const spreadContainer = await page.locator('[role="group"]').first();
      const spreadCards = await spreadContainer.locator('.shrink-0').count();
      console.log(`   - Number of cards in spread: ${spreadCards}`);
      
      // Check card layout
      if (spreadCards > 0) {
        const firstCard = await spreadContainer.locator('.shrink-0').first();
        const cardBox = await firstCard.boundingBox();
        console.log(`   - First card position:`, cardBox);
        
        // Try clicking a card
        console.log('9. Clicking first card...');
        await firstCard.click();
        await page.waitForTimeout(1000);
        
        const selectedStatus = await page.locator('text=/선택됨/').textContent();
        console.log(`   - Selection status: ${selectedStatus}`);
      }
      
      // Check if cards are using flex layout (not absolute)
      const containerClass = await spreadContainer.locator('div').first().getAttribute('class');
      console.log(`   - Container class: ${containerClass}`);
      const hasFlexClass = containerClass && containerClass.includes('flex');
      console.log(`   - Using flex layout: ${hasFlexClass}`);
      
    } else {
      console.log('ERROR: Spread button not available!');
    }
    
    console.log('\nTest completed. Check screenshots for visual confirmation.');
    
  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'error-state-rollback.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();