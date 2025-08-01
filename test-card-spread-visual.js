const { chromium } = require('playwright');

async function testCardSpreadVisual() {
  console.log('🎯 Starting visual card spread test...');
  console.log('⏳ Waiting 5 seconds for hot reload to apply changes...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Navigate to the app
    console.log('📍 Navigating to localhost:4000/reading...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Fill in question quickly
    console.log('✍️ Quick setup...');
    await page.fill('textarea#question', 'Test card spread spacing');
    
    // Shuffle cards
    console.log('🔀 Shuffling...');
    await page.click('div[aria-label*="카드 덱"]');
    await page.waitForTimeout(3000);
    
    // Spread cards
    console.log('🃏 Spreading cards...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'card-spread-fixed-test.png', 
      fullPage: true,
      animations: 'disabled'
    });
    
    // Try to analyze the spread
    const spreadContainer = await page.locator('div[role="group"][aria-labelledby="spread-instruction"]');
    const isVisible = await spreadContainer.isVisible();
    console.log(`Spread container visible: ${isVisible}`);
    
    if (isVisible) {
      const bounds = await spreadContainer.boundingBox();
      console.log('Container bounds:', bounds);
      
      // Count visible cards
      const cards = await page.locator('div[role="button"][aria-label*="펼쳐진"]').count();
      console.log(`Number of spread cards: ${cards}`);
      
      // Try clicking on a few cards without hover
      if (cards > 0) {
        console.log('🖱️ Clicking first card...');
        await page.locator('div[role="button"][aria-label*="펼쳐진"]').first().click();
        await page.waitForTimeout(1000);
        
        console.log('🖱️ Clicking middle card...');
        await page.locator('div[role="button"][aria-label*="펼쳐진"]').nth(Math.floor(cards/2)).click();
        await page.waitForTimeout(1000);
        
        console.log('🖱️ Clicking last card...');
        await page.locator('div[role="button"][aria-label*="펼쳐진"]').last().click();
        await page.waitForTimeout(1000);
        
        // Check selected cards
        const selectedCount = await page.locator('text=/선택된 카드.*[0-9]\\/[0-9]+/').textContent();
        console.log(`Selected cards indicator: ${selectedCount}`);
      }
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'card-spread-fixed-final.png', 
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log('\n✅ Test completed!');
    console.log('📸 Check card-spread-fixed-test.png and card-spread-fixed-final.png');
    
    // Keep browser open for manual inspection
    console.log('\n👀 Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testCardSpreadVisual().catch(console.error);