const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('2. Setting up tarot reading...');
    
    // Enter a question
    await page.fill('textarea[placeholder*="질문"]', '카드 간격 테스트용 질문입니다');
    
    // Select Trinity View spread
    await page.click('text=스프레드 선택');
    await page.waitForTimeout(500);
    await page.click('text=Trinity View - 3 cards');
    
    // Click deck to shuffle
    console.log('3. Shuffling deck...');
    await page.click('.card-back');
    await page.waitForTimeout(1000);
    
    // Click spread button
    console.log('4. Revealing spread...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);

    // Take full screenshot
    await page.screenshot({ 
      path: 'card-spread-full.png',
      fullPage: false 
    });
    console.log('Full screenshot saved: card-spread-full.png');

    // Get card container info
    const spreadContainer = await page.locator('.spread-cards').first();
    
    // Get all card elements
    const cards = await page.locator('.spread-cards .card-container');
    const cardCount = await cards.count();
    console.log(`\n5. Found ${cardCount} cards in spread`);

    // Measure each card
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const box = await card.boundingBox();
      const styles = await card.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          marginLeft: computed.marginLeft,
          width: computed.width,
          transform: computed.transform,
          position: computed.position
        };
      });
      
      console.log(`\nCard ${i + 1}:`);
      console.log(`  Position: x=${box.x}, y=${box.y}`);
      console.log(`  Size: ${box.width}x${box.height}`);
      console.log(`  Styles:`, styles);
    }

    // Calculate actual spacing
    if (cardCount >= 2) {
      const card1Box = await cards.nth(0).boundingBox();
      const card2Box = await cards.nth(1).boundingBox();
      
      const actualSpacing = card2Box.x - card1Box.x;
      const visibleWidth = actualSpacing;
      const overlap = card1Box.width - actualSpacing;
      
      console.log('\n6. Card Spacing Analysis:');
      console.log(`  Card width: ${card1Box.width}px`);
      console.log(`  Distance between card edges: ${actualSpacing}px`);
      console.log(`  Overlap amount: ${overlap}px`);
      console.log(`  Visible portion of each card: ${visibleWidth}px`);
    }

    // Take close-up screenshot of overlap area
    const firstCard = await cards.nth(0).boundingBox();
    const closeupArea = {
      x: firstCard.x,
      y: firstCard.y - 50,
      width: Math.min(800, firstCard.width * 3),
      height: firstCard.height + 100
    };
    
    await page.screenshot({ 
      path: 'card-overlap-closeup.png',
      clip: closeupArea
    });
    console.log('\nClose-up screenshot saved: card-overlap-closeup.png');

    // Open DevTools and inspect
    console.log('\n7. Opening DevTools for manual inspection...');
    console.log('Please use DevTools to verify the measurements.');
    console.log('The browser will remain open for 30 seconds...');
    
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();