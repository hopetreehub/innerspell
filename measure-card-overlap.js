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
    await page.fill('textarea[placeholder*="카드"]', '카드 간격 테스트용 질문입니다');
    
    // The dropdown might already be open, so first try to click outside to close it
    await page.click('body', { position: { x: 100, y: 100 } });
    await page.waitForTimeout(500);
    
    // Now click on the dropdown to open it
    const dropdownButton = page.locator('button[role="combobox"]').first();
    await dropdownButton.click();
    await page.waitForTimeout(500);
    
    // Select Trinity View from the dropdown
    await page.click('text=삼위일체 조망 (Trinity View) (3장)');
    await page.waitForTimeout(500);
    
    console.log('3. Shuffling deck...');
    // Click the card to shuffle
    await page.click('.relative.cursor-pointer img');
    await page.waitForTimeout(1000);
    
    console.log('4. Revealing spread...');
    // Click the spread button
    await page.click('button:has-text("카드 펼치기")');
    
    // Wait for animation to complete
    await page.waitForTimeout(3000);
    
    // Wait for cards to appear
    await page.waitForSelector('.relative.transition-all[style*="margin-left"]', { timeout: 5000 });

    // Take full screenshot
    await page.screenshot({ 
      path: 'card-spread-final.png',
      fullPage: false 
    });
    console.log('Screenshot saved: card-spread-final.png');

    // Get all cards with margin-left style
    const cards = await page.locator('.relative.transition-all[style*="margin-left"]').all();
    console.log(`\n5. Found ${cards.length} cards with margin-left`);

    if (cards.length === 0) {
      // Try alternative selector
      const altCards = await page.locator('.relative.transition-all').all();
      console.log(`Found ${altCards.length} cards total`);
      cards.push(...altCards.slice(0, 3));
    }

    const measurements = [];
    
    // Measure each card
    for (let i = 0; i < Math.min(cards.length, 3); i++) {
      const card = cards[i];
      const box = await card.boundingBox();
      
      // Get inline styles and computed styles
      const styles = await card.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          inlineStyle: el.getAttribute('style'),
          marginLeft: computed.marginLeft,
          width: computed.width,
          transform: computed.transform,
          position: computed.position,
          boundingRect: {
            left: rect.left,
            width: rect.width,
            right: rect.right
          }
        };
      });
      
      measurements.push({ box, styles, index: i });
      
      console.log(`\nCard ${i + 1}:`);
      console.log(`  Inline style: ${styles.inlineStyle}`);
      console.log(`  Computed marginLeft: ${styles.marginLeft}`);
      console.log(`  Bounding box: x=${box?.x.toFixed(2)}, width=${box?.width.toFixed(2)}`);
    }

    // Calculate actual spacing
    if (measurements.length >= 2) {
      const card1 = measurements[0];
      const card2 = measurements[1];
      
      if (card1.box && card2.box) {
        const card1Left = card1.box.x;
        const card1Right = card1.box.x + card1.box.width;
        const card2Left = card2.box.x;
        
        const distanceBetweenLeftEdges = card2Left - card1Left;
        const overlap = card1Right - card2Left;
        const visibleWidth = distanceBetweenLeftEdges;
        
        console.log('\n========== FINAL CARD SPACING ANALYSIS ==========');
        console.log(`Card 1 position: left=${card1Left.toFixed(2)}px, right=${card1Right.toFixed(2)}px`);
        console.log(`Card 2 position: left=${card2Left.toFixed(2)}px`);
        console.log(`Card width: ${card1.box.width.toFixed(2)}px`);
        console.log(`Distance between card left edges: ${distanceBetweenLeftEdges.toFixed(2)}px`);
        console.log(`Overlap amount: ${overlap.toFixed(2)}px`);
        console.log(`Visible portion of each card: ${visibleWidth.toFixed(2)}px`);
        console.log(`\nWith marginLeft of ${card2.styles.marginLeft}:`);
        console.log(`  Expected visible: ~12px (200px card - 188px margin)`);
        console.log(`  Actual visible: ${visibleWidth.toFixed(2)}px`);
        console.log('================================================');
      }
    }

    // Take close-up of card overlap
    if (measurements.length > 0 && measurements[0].box) {
      const firstCard = measurements[0].box;
      await page.screenshot({ 
        path: 'card-overlap-detail.png',
        clip: {
          x: firstCard.x,
          y: firstCard.y - 10,
          width: Math.min(600, 800),
          height: firstCard.height + 20
        }
      });
      console.log('\nClose-up screenshot saved: card-overlap-detail.png');
    }

    console.log('\nBrowser will remain open for 20 seconds for manual inspection...');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'error-final.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();