const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    console.log(`[Browser Console] ${text}`);
  });

  try {
    console.log('1. Navigating to localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    console.log('2. Going to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    console.log('3. Entering question...');
    const questionInput = await page.locator('textarea[placeholder*="질문"]').first();
    await questionInput.fill('카드 펼치기가 작동하는지 테스트합니다');
    
    console.log('4. Selecting Trinity View...');
    const spreadSelect = await page.locator('button[role="combobox"]').filter({ hasText: /스프레드|Trinity/ });
    await spreadSelect.click();
    await page.locator('text=Trinity View').click();
    
    console.log('5. Clicking shuffle button...');
    const shuffleButton = await page.locator('button').filter({ hasText: '카드 섞기' });
    await shuffleButton.click();
    
    console.log('6. Waiting for shuffle animation (10 seconds)...');
    await page.waitForTimeout(10000);
    
    console.log('7. Checking if spread button exists and is enabled...');
    const spreadButton = await page.locator('button').filter({ hasText: '카드 펼치기' });
    const isVisible = await spreadButton.isVisible();
    const isDisabled = await spreadButton.isDisabled();
    
    console.log(`   - Spread button visible: ${isVisible}`);
    console.log(`   - Spread button disabled: ${isDisabled}`);
    
    // Take screenshot
    await page.screenshot({ path: 'after-shuffle-state.png', fullPage: true });
    
    if (isVisible && !isDisabled) {
      console.log('8. Clicking spread button...');
      await spreadButton.click();
      await page.waitForTimeout(2000);
      
      // Check if cards spread
      const spreadCards = await page.locator('[role="group"] .absolute').count();
      console.log(`   - Number of spread cards: ${spreadCards}`);
      
      await page.screenshot({ path: 'after-spread-state.png', fullPage: true });
    } else {
      console.log('8. Spread button is not clickable!');
      
      // Try to understand why
      const pageContent = await page.content();
      const hasSpreadSection = pageContent.includes('펼쳐진 카드');
      console.log(`   - Has spread section: ${hasSpreadSection}`);
    }
    
    console.log('\nConsole logs from browser:');
    consoleLogs.forEach(log => console.log(log));
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();