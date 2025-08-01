const { chromium } = require('playwright');

async function quickCardTest() {
  console.log('🎯 Quick card spread test...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--window-size=1920,1080']
  });

  try {
    const page = await browser.newContext().then(ctx => ctx.newPage());
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Go directly to reading page
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Quick setup
    await page.fill('textarea#question', 'Test spacing');
    await page.click('div[aria-label*="카드 덱"]');
    await page.waitForTimeout(3000);
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'card-spread-current-state.png', fullPage: true });
    
    // Get container info
    const container = await page.locator('div[role="group"][aria-labelledby="spread-instruction"]');
    if (await container.isVisible()) {
      const bounds = await container.boundingBox();
      console.log('Container bounds:', bounds);
      
      // Check inline styles
      const containerStyle = await container.getAttribute('style');
      console.log('Container inline style:', containerStyle);
      
      // Check inner div
      const innerDiv = await container.locator('> div').first();
      const innerStyle = await innerDiv.getAttribute('style');
      console.log('Inner div style:', innerStyle);
      
      // Count cards and check first few positions
      const cards = await page.locator('div[role="button"][aria-label*="펼쳐진"]').all();
      console.log(`Total cards: ${cards.length}`);
      
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        const cardStyle = await cards[i].getAttribute('style');
        console.log(`Card ${i + 1} style:`, cardStyle);
      }
    }
    
    console.log('\n✅ Screenshot saved as: card-spread-current-state.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

quickCardTest().catch(console.error);