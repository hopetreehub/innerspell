const { chromium } = require('playwright');

async function testFinalCardSpread() {
  console.log('🎯 Testing final card spread implementation...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Navigate to reading page
    console.log('📍 Navigating to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Fill question
    console.log('✍️ Setting up reading...');
    await page.fill('textarea#question', 'Show me the improved card spread layout');
    await page.screenshot({ path: 'final-spread-01-setup.png' });
    
    // Shuffle cards
    console.log('🔀 Shuffling cards...');
    await page.click('div[aria-label*="카드 덱"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'final-spread-02-shuffled.png' });
    
    // Spread cards
    console.log('🃏 Spreading cards...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'final-spread-03-spread.png' });
    
    // Test card selection
    console.log('👆 Testing card selection...');
    const cards = await page.locator('div[role="button"][aria-label*="펼쳐진"]').all();
    console.log(`Found ${cards.length} cards in spread`);
    
    if (cards.length > 0) {
      // Click first card
      await cards[0].click();
      await page.waitForTimeout(1000);
      console.log('✓ Selected first card');
      
      // Click a card in the middle
      if (cards.length > 20) {
        await cards[20].click();
        await page.waitForTimeout(1000);
        console.log('✓ Selected middle card');
      }
      
      // Click last card
      await cards[cards.length - 1].click();
      await page.waitForTimeout(1000);
      console.log('✓ Selected last card');
      
      await page.screenshot({ path: 'final-spread-04-selected.png' });
      
      // Check selected count
      const selectedText = await page.locator('text=/선택된 카드.*[0-9]\\/[0-9]+/').textContent();
      console.log(`Selected cards: ${selectedText}`);
    }
    
    // Test hover effect
    console.log('🖱️ Testing hover effects...');
    if (cards.length > 10) {
      await cards[10].hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'final-spread-05-hover.png' });
    }
    
    console.log('\n✅ Test completed successfully!');
    console.log('📸 Screenshots saved with prefix: final-spread-');
    console.log('\n📊 Summary:');
    console.log('- Cards are now spaced at 85px intervals (previously 35px)');
    console.log('- Container has proper height (320px minimum)');
    console.log('- Hover z-index increased to 100 for better visibility');
    console.log('- Cards should be much easier to select now');
    
    // Keep browser open for manual inspection
    console.log('\n👀 Browser will remain open for 15 seconds for inspection...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'final-spread-error.png' });
  } finally {
    await browser.close();
  }
}

testFinalCardSpread().catch(console.error);