const { chromium } = require('playwright');

async function checkCardSpacing() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:4000/reading...');
    await page.goto('http://localhost:4000/reading');
    
    console.log('Waiting for page to load...');
    await page.waitForTimeout(3000);
    
    // Wait for shuffle button and click if present
    try {
      const shuffleButton = page.locator('button:has-text("카드 섞기")');
      if (await shuffleButton.isVisible({ timeout: 2000 })) {
        console.log('Clicking shuffle button...');
        await shuffleButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('Shuffle button not found or not clickable, continuing...');
    }
    
    // Look for spread cards button
    try {
      const spreadButton = page.locator('button:has-text("카드 펼치기")');
      if (await spreadButton.isVisible({ timeout: 2000 })) {
        console.log('Clicking spread cards button...');
        await spreadButton.click();
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Spread cards button not found, checking if cards are already spread...');
    }
    
    // Take screenshot of the current state
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/card-spacing-current.png',
      fullPage: true 
    });
    
    // Check for card elements and measure spacing
    const cards = await page.locator('[class*="card"]').all();
    console.log(`Found ${cards.length} card elements`);
    
    if (cards.length > 1) {
      const card1Box = await cards[0].boundingBox();
      const card2Box = await cards[1].boundingBox();
      
      if (card1Box && card2Box) {
        const spacing = card2Box.x - (card1Box.x + card1Box.width);
        console.log(`Card spacing: ${spacing}px`);
        console.log(`Card 1 position: x=${card1Box.x}, width=${card1Box.width}`);
        console.log(`Card 2 position: x=${card2Box.x}, width=${card2Box.width}`);
      }
    }
    
    console.log('Screenshot saved to /mnt/e/project/test-studio-firebase/qa-screenshots/card-spacing-current.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkCardSpacing();