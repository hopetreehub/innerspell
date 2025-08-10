const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to tarot reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('2. Setting up tarot reading...');
    const textarea = await page.waitForSelector('textarea#question', { timeout: 10000 });
    await textarea.fill('카드 간격 테스트용 질문입니다');

    console.log('3. Shuffling cards...');
    const shuffleButton = await page.waitForSelector('button:has-text("카드 섞기")', { timeout: 10000 });
    await shuffleButton.click();
    await page.waitForTimeout(2000);

    console.log('4. Revealing spread...');
    const revealButton = await page.waitForSelector('button:has-text("카드 펼치기")', { timeout: 10000 });
    await revealButton.click();
    await page.waitForTimeout(2000);

    console.log('5. Selecting 3 cards from the spread...');
    // Wait for the spread cards to appear
    await page.waitForSelector('.card-wrapper', { timeout: 10000 });
    
    // Get all clickable cards
    const cards = await page.$$('.card-wrapper');
    console.log(`Found ${cards.length} cards in spread`);
    
    // Click on first 3 cards
    for (let i = 0; i < 3 && i < cards.length; i++) {
      console.log(`Clicking card ${i + 1}...`);
      await cards[i].click();
      await page.waitForTimeout(1000); // Wait for animation
    }
    
    // Wait for cards to be fully revealed
    await page.waitForTimeout(3000);
    
    // Take screenshot of the selected cards
    await page.screenshot({ 
      path: 'card-spacing-selected.png',
      fullPage: false 
    });

    console.log('6. Analyzing card spacing...');
    // Look for the selected cards in their final positions
    // They might have a different class or be in a different container after selection
    const selectedCards = await page.$$('.selected-card, .reading-card, .spread-card, [class*="selected"]');
    console.log(`Found ${selectedCards.length} selected cards`);
    
    // If no selected cards found, look for any visible card elements
    if (selectedCards.length === 0) {
      const allVisibleCards = await page.evaluate(() => {
        const elements = [];
        document.querySelectorAll('[class*="card"]').forEach(el => {
          if (el.offsetHeight > 50 && el.offsetWidth > 50) { // At least 50x50 px
            const rect = el.getBoundingClientRect();
            elements.push({
              class: el.className,
              width: rect.width,
              height: rect.height,
              left: rect.left,
              top: rect.top
            });
          }
        });
        return elements;
      });
      
      console.log('Visible card elements:', allVisibleCards);
    }
    
    // Try to find the Trinity spread container
    const trinityContainer = await page.$('[class*="trinity"], [class*="three-card"], [class*="spread-container"]');
    if (trinityContainer) {
      console.log('Found Trinity spread container');
      
      // Get all cards within this container
      const trinityCards = await trinityContainer.$$('.card-wrapper, [class*="card"]');
      console.log(`Found ${trinityCards.length} cards in Trinity container`);
      
      // Analyze spacing between cards
      if (trinityCards.length >= 2) {
        const measurements = await page.evaluate(() => {
          // Find all card elements that are visible and properly sized
          const cardElements = Array.from(document.querySelectorAll('[class*="card"]'))
            .filter(el => el.offsetWidth > 50 && el.offsetHeight > 50);
          
          if (cardElements.length >= 2) {
            const results = [];
            for (let i = 0; i < cardElements.length - 1; i++) {
              const card1 = cardElements[i].getBoundingClientRect();
              const card2 = cardElements[i + 1].getBoundingClientRect();
              const visibleWidth = card2.left - card1.left;
              
              results.push({
                card1Index: i,
                card2Index: i + 1,
                card1Left: card1.left,
                card2Left: card2.left,
                card1Width: card1.width,
                visibleWidth: visibleWidth,
                overlap: card1.width - visibleWidth
              });
            }
            return results;
          }
          return null;
        });
        
        if (measurements) {
          console.log('\n🎯 Card Spacing Measurements:');
          measurements.forEach(m => {
            console.log(`\nCards ${m.card1Index + 1} to ${m.card2Index + 1}:`);
            console.log(`  Card 1 left: ${m.card1Left}px`);
            console.log(`  Card 2 left: ${m.card2Left}px`);
            console.log(`  Card width: ${m.card1Width}px`);
            console.log(`  Visible width: ${m.visibleWidth}px`);
            console.log(`  Overlap amount: ${m.overlap}px`);
            console.log(`  Expected visible: 3px`);
            console.log(`  Is correct: ${Math.abs(m.visibleWidth - 3) < 0.5 ? '✅ YES' : '❌ NO'}`);
          });
        }
      }
    }
    
    // Add visual measurement guides
    console.log('\n7. Adding measurement guides...');
    await page.evaluate(() => {
      // Find all visible cards
      const cards = Array.from(document.querySelectorAll('[class*="card"]'))
        .filter(el => el.offsetWidth > 50 && el.offsetHeight > 50);
      
      // Add colored borders
      const colors = ['red', 'blue', 'green'];
      cards.forEach((card, i) => {
        card.style.outline = `3px solid ${colors[i % colors.length]}`;
        card.style.outlineOffset = '-3px';
      });
      
      // Add measurement ruler between first two cards
      if (cards.length >= 2) {
        const card1 = cards[0].getBoundingClientRect();
        const card2 = cards[1].getBoundingClientRect();
        
        const ruler = document.createElement('div');
        ruler.style.position = 'fixed';
        ruler.style.top = `${card1.top - 30}px`;
        ruler.style.left = `${card1.left}px`;
        ruler.style.width = `${card2.left - card1.left}px`;
        ruler.style.height = '20px';
        ruler.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        ruler.style.border = '1px solid red';
        ruler.style.zIndex = '9999';
        
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.top = '0';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.backgroundColor = 'white';
        label.style.color = 'black';
        label.style.padding = '2px 5px';
        label.style.fontSize = '14px';
        label.style.fontWeight = 'bold';
        label.textContent = `${card2.left - card1.left}px`;
        
        ruler.appendChild(label);
        document.body.appendChild(ruler);
      }
    });
    
    // Take final screenshot with measurements
    await page.screenshot({ 
      path: 'card-spacing-final-measured.png',
      fullPage: false 
    });

    console.log('\n8. Summary:');
    console.log('Screenshots saved:');
    console.log('  - card-spacing-selected.png: Cards after selection');
    console.log('  - card-spacing-final-measured.png: Final view with measurements');

    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for manual inspection...');
    console.log('Press Ctrl+C to close when done.');
    
    await page.waitForTimeout(300000);

  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ path: 'card-spacing-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();