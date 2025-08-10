const { chromium } = require('playwright');
const path = require('path');

async function testSimpleReading() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    console.log('🔗 Navigating to reading page...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ 
      path: path.join(__dirname, 'reading-page-initial.png'),
      fullPage: true 
    });
    
    console.log('🔍 Checking page content...');
    const title = await page.title();
    console.log('Page title:', title);
    
    // Look for any interactive elements
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    const selects = await page.locator('select').count();
    
    console.log(`Found: ${buttons} buttons, ${inputs} inputs, ${selects} selects`);
    
    // Try to interact with elements
    if (inputs > 0) {
      console.log('📝 Trying to fill first input...');
      try {
        await page.locator('input').first().fill('Test question for overlap');
        console.log('✅ Input filled');
      } catch (e) {
        console.log('❌ Could not fill input:', e.message);
      }
    }
    
    if (buttons > 0) {
      console.log('🔘 Trying to click first button...');
      try {
        await page.locator('button').first().click();
        console.log('✅ Button clicked');
        await page.waitForTimeout(3000);
      } catch (e) {
        console.log('❌ Could not click button:', e.message);
      }
    }
    
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ 
      path: path.join(__dirname, 'reading-page-final.png'),
      fullPage: true 
    });
    
    // Check for card elements
    console.log('🎴 Looking for card elements...');
    const cardSelectors = [
      '.card',
      '.tarot-card', 
      '[class*="card"]',
      '[class*="Card"]',
      '.Card',
      '.playing-card'
    ];
    
    for (const selector of cardSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`Found ${count} elements with selector: ${selector}`);
        
        // Check styles of first few cards
        const cards = await page.locator(selector).all();
        for (let i = 0; i < Math.min(cards.length, 3); i++) {
          const marginLeft = await cards[i].evaluate(el => el.style.marginLeft);
          const zIndex = await cards[i].evaluate(el => el.style.zIndex);
          console.log(`Card ${i + 1}: marginLeft="${marginLeft}", zIndex="${zIndex}"`);
        }
      }
    }
    
    console.log('✅ Test completed - check screenshots');
    
    // Keep browser open for 30 seconds
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSimpleReading().catch(console.error);