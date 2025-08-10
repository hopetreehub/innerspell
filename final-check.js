const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  try {
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);
    
    // Fill question
    await page.fill('textarea#question', 'Testing card spread animation');
    
    // Select spread - use keyboard navigation
    await page.click('#spread-type');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Shuffle and reveal
    await page.click('text=카드 섞기');
    await page.waitForTimeout(2000);
    await page.click('text=카드 펼치기');
    await page.waitForTimeout(3000);
    
    // Check styles on a few cards
    const cards = await page.$$('[role="button"][aria-label*="펼쳐진"]');
    console.log(`Found ${cards.length} cards`);
    
    if (cards.length > 5) {
      for (let i = 0; i < 5; i++) {
        const card = cards[i];
        const styles = await card.evaluate((el, idx) => {
          const s = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            card: idx + 1,
            marginLeft: s.marginLeft,
            transform: s.transform,
            y: rect.y
          };
        }, i);
        console.log(styles);
      }
    }
    
    await page.screenshot({ path: 'final-spread-check.png', fullPage: true });
    console.log('Screenshot saved: final-spread-check.png');
    
  } finally {
    await browser.close();
  }
})();