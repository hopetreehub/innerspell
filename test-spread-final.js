const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => console.log(`[Browser] ${msg.text()}`));

  try {
    console.log('=== CARD SPREAD TEST FINAL ===\n');
    
    console.log('1. Navigating to localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('2. Going to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-1-initial-page.png', fullPage: true });
    console.log('   ✓ Screenshot: test-1-initial-page.png');
    
    console.log('3. Entering question...');
    // Try different selector strategies
    const questionInput = await page.locator('textarea').filter({ hasText: '' }).first();
    await questionInput.fill('카드 펼치기 최종 테스트');
    await page.waitForTimeout(500);
    
    console.log('4. Selecting Trinity View...');
    // Check if already selected
    const trinityText = await page.locator('text=Trinity View').count();
    console.log(`   - Trinity View mentions found: ${trinityText}`);
    
    console.log('5. Clicking shuffle button...');
    const shuffleButton = await page.locator('button').filter({ hasText: '카드 섞기' });
    const shuffleVisible = await shuffleButton.isVisible();
    console.log(`   - Shuffle button visible: ${shuffleVisible}`);
    
    if (shuffleVisible) {
      await shuffleButton.click();
      console.log('   ✓ Shuffle clicked');
      
      console.log('6. Waiting for shuffle animation (10 seconds)...');
      await page.waitForTimeout(10000);
      
      // Take screenshot after shuffle
      await page.screenshot({ path: 'test-2-after-shuffle.png', fullPage: true });
      console.log('   ✓ Screenshot: test-2-after-shuffle.png');
      
      console.log('7. Looking for spread button...');
      const spreadButton = await page.locator('button').filter({ hasText: '카드 펼치기' });
      const spreadVisible = await spreadButton.isVisible();
      const spreadDisabled = await spreadButton.isDisabled();
      
      console.log(`   - Spread button visible: ${spreadVisible}`);
      console.log(`   - Spread button disabled: ${spreadDisabled}`);
      
      if (spreadVisible && !spreadDisabled) {
        console.log('8. Clicking spread button...');
        await spreadButton.click();
        await page.waitForTimeout(3000);
        
        // Take screenshot after spread
        await page.screenshot({ path: 'test-3-after-spread.png', fullPage: true });
        console.log('   ✓ Screenshot: test-3-after-spread.png');
        
        console.log('9. Analyzing spread results...');
        
        // Check for spread section
        const spreadSection = await page.locator('text=펼쳐진 카드').isVisible();
        console.log(`   - Spread section visible: ${spreadSection}`);
        
        // Count cards using various selectors
        const cards1 = await page.locator('.shrink-0').count();
        const cards2 = await page.locator('[role="group"] > div > div').count();
        const cards3 = await page.locator('img[alt*="카드"]').count();
        
        console.log(`   - Cards with .shrink-0: ${cards1}`);
        console.log(`   - Cards in role=group: ${cards2}`);
        console.log(`   - Card images: ${cards3}`);
        
        // Check container styles
        const container = await page.locator('[role="group"] > div').first();
        const containerClass = await container.getAttribute('class');
        const containerStyle = await container.getAttribute('style');
        
        console.log(`   - Container class: ${containerClass}`);
        console.log(`   - Container style: ${containerStyle}`);
        
        // Try to interact with a card
        if (cards1 > 0) {
          console.log('10. Trying to click first card...');
          const firstCard = await page.locator('.shrink-0').first();
          await firstCard.click();
          await page.waitForTimeout(1000);
          
          // Check selection status
          const selectedText = await page.locator('text=/선택됨/').textContent();
          console.log(`   - Selection status: ${selectedText}`);
          
          await page.screenshot({ path: 'test-4-card-selected.png', fullPage: true });
          console.log('   ✓ Screenshot: test-4-card-selected.png');
        }
        
      } else {
        console.log('\n❌ ERROR: Spread button not available!');
        console.log('   This indicates the shuffle → spread transition is broken');
        
        // Debug info
        const buttons = await page.locator('button').allTextContents();
        console.log('\n   Available buttons:', buttons);
      }
      
    } else {
      console.log('\n❌ ERROR: Shuffle button not found!');
    }
    
    console.log('\n=== TEST COMPLETE ===');
    console.log('Check the screenshot files for visual confirmation.');
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
    await page.screenshot({ path: 'test-error-state.png', fullPage: true });
  } finally {
    await page.waitForTimeout(5000); // Keep open for manual check
    await browser.close();
  }
})();