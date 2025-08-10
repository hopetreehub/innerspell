const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const page = await browser.newPage();

  try {
    console.log('1. Going to reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);

    console.log('2. Filling question...');
    await page.fill('textarea', 'Test question for card spacing');
    
    console.log('3. Clicking card deck...');
    // Click the card image to shuffle
    await page.click('img[alt*="카드"]');
    await page.waitForTimeout(1000);
    
    console.log('4. Clicking spread button...');
    // Click spread button
    await page.click('button:has-text("카드 펼치기")');
    
    // Wait longer for cards to appear
    await page.waitForTimeout(5000);
    
    console.log('5. Taking screenshot...');
    await page.screenshot({ 
      path: 'cards-revealed.png',
      fullPage: true 
    });
    
    // Look for any elements that might be cards
    console.log('\n6. Looking for card elements...');
    
    const selectors = [
      '.relative.transition-all',
      '[class*="card"]',
      'img[src*="tarot"]',
      '.flex > .relative',
      '[style*="margin"]'
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`Found ${count} elements with selector: ${selector}`);
        
        // Get first few elements
        const elements = await page.locator(selector).all();
        for (let i = 0; i < Math.min(3, elements.length); i++) {
          const box = await elements[i].boundingBox();
          const attrs = await elements[i].evaluate(el => ({
            className: el.className,
            style: el.getAttribute('style'),
            tagName: el.tagName,
            src: el.src || null
          }));
          console.log(`  Element ${i}:`, attrs);
          if (box) {
            console.log(`    Position: x=${box.x.toFixed(2)}, width=${box.width.toFixed(2)}`);
          }
        }
      }
    }
    
    // Specifically look for cards with images
    const cardImages = await page.locator('img[src*="/cards/"]').all();
    console.log(`\n7. Found ${cardImages.length} card images`);
    
    if (cardImages.length >= 2) {
      const measurements = [];
      
      for (let i = 0; i < Math.min(3, cardImages.length); i++) {
        const img = cardImages[i];
        const parent = await img.evaluateHandle(el => el.parentElement);
        const box = await parent.boundingBox();
        const styles = await parent.evaluate(el => ({
          style: el.getAttribute('style'),
          className: el.className,
          computedMarginLeft: window.getComputedStyle(el).marginLeft
        }));
        
        measurements.push({ box, styles });
        
        console.log(`\nCard ${i + 1}:`);
        console.log(`  Style attribute: ${styles.style}`);
        console.log(`  Computed marginLeft: ${styles.computedMarginLeft}`);
        console.log(`  Position: x=${box?.x.toFixed(2)}, width=${box?.width.toFixed(2)}`);
      }
      
      // Calculate spacing
      if (measurements.length >= 2 && measurements[0].box && measurements[1].box) {
        const spacing = measurements[1].box.x - measurements[0].box.x;
        const overlap = measurements[0].box.width - spacing;
        
        console.log('\n========== CARD SPACING RESULTS ==========');
        console.log(`Card width: ${measurements[0].box.width.toFixed(2)}px`);
        console.log(`Distance between cards: ${spacing.toFixed(2)}px`);
        console.log(`Overlap: ${overlap.toFixed(2)}px`);
        console.log(`Visible portion: ${spacing.toFixed(2)}px`);
        console.log('=========================================');
      }
    }
    
    console.log('\nKeeping browser open for 20 seconds...');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();