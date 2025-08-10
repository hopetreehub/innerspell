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
    await page.waitForTimeout(3000); // Wait for client-side rendering

    console.log('2. Setting up tarot reading...');
    // Enter a question
    const textarea = await page.waitForSelector('textarea#question', { timeout: 10000 });
    await textarea.fill('카드 간격 테스트용 질문입니다');
    
    // The spread is already selected as Trinity View (3 cards) by default
    console.log('3. Trinity View spread is already selected (3 cards)');

    console.log('4. Shuffling cards...');
    // Click the shuffle button
    const shuffleButton = await page.waitForSelector('button:has-text("카드 섞기")', { timeout: 10000 });
    await shuffleButton.click();
    await page.waitForTimeout(2000); // Wait for shuffle animation

    console.log('5. Revealing spread...');
    // Click the reveal button
    const revealButton = await page.waitForSelector('button:has-text("카드 펼치기")', { timeout: 10000 });
    await revealButton.click();
    await page.waitForTimeout(3000); // Wait for card animation

    // Take initial screenshot
    await page.screenshot({ 
      path: 'card-spacing-full-view.png',
      fullPage: false 
    });

    console.log('6. Analyzing card spacing...');
    // Wait for cards to be visible
    await page.waitForSelector('.card-wrapper', { timeout: 5000 });
    
    // Get all card elements in the spread
    const cards = await page.$$('.card-wrapper');
    console.log(`Found ${cards.length} cards in the spread`);

    // Get computed styles and dimensions for each card
    for (let i = 0; i < cards.length; i++) {
      const cardInfo = await cards[i].evaluate((el, index) => {
        const computedStyle = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const parentRect = el.parentElement.getBoundingClientRect();
        
        // Get the actual margin-left value
        const marginLeft = computedStyle.marginLeft;
        
        // Calculate visible width by checking overlap with next card
        let visibleWidth = rect.width;
        const nextCard = el.parentElement.children[index + 1];
        if (nextCard) {
          const nextRect = nextCard.getBoundingClientRect();
          visibleWidth = nextRect.left - rect.left;
        }
        
        return {
          index: index,
          width: rect.width,
          height: rect.height,
          left: rect.left,
          marginLeft: marginLeft,
          position: computedStyle.position,
          transform: computedStyle.transform,
          visibleWidth: visibleWidth,
          parentLeft: parentRect.left
        };
      }, i);
      
      console.log(`\nCard ${i + 1}:`);
      console.log(`  Width: ${cardInfo.width}px`);
      console.log(`  Height: ${cardInfo.height}px`);
      console.log(`  Left position: ${cardInfo.left}px`);
      console.log(`  Margin-left: ${cardInfo.marginLeft}`);
      console.log(`  Position: ${cardInfo.position}`);
      console.log(`  Transform: ${cardInfo.transform}`);
      if (i < cards.length - 1) {
        console.log(`  Visible width (overlap): ${cardInfo.visibleWidth}px`);
      }
    }

    // Highlight cards for visual inspection
    console.log('\n7. Highlighting cards for inspection...');
    await page.evaluate(() => {
      // Highlight each card with a different color border
      const cards = document.querySelectorAll('.card-wrapper');
      const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
      cards.forEach((card, i) => {
        card.style.outline = `3px solid ${colors[i % colors.length]}`;
        card.style.outlineOffset = '-3px';
      });
    });

    // Take a zoomed screenshot of the overlapped area
    const firstCard = cards[0];
    const boundingBox = await firstCard.boundingBox();
    if (boundingBox) {
      await page.screenshot({
        path: 'card-spacing-zoomed.png',
        clip: {
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width * 2, // Capture 2x width to see overlap
          height: boundingBox.height
        }
      });
    }

    // Add measurement rulers
    console.log('\n8. Adding visual measurement guides...');
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.card-wrapper');
      if (cards.length >= 2) {
        const card1 = cards[0].getBoundingClientRect();
        const card2 = cards[1].getBoundingClientRect();
        
        // Create ruler element
        const ruler = document.createElement('div');
        ruler.style.position = 'fixed';
        ruler.style.top = `${card1.top - 30}px`;
        ruler.style.left = `${card1.left}px`;
        ruler.style.width = `${card2.left - card1.left}px`;
        ruler.style.height = '20px';
        ruler.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        ruler.style.border = '1px solid red';
        ruler.style.zIndex = '9999';
        
        // Add text label
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.top = '0';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.backgroundColor = 'white';
        label.style.padding = '2px 5px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.color = 'black';
        label.textContent = `${card2.left - card1.left}px`;
        
        ruler.appendChild(label);
        document.body.appendChild(ruler);
        
        // Also add a visual indicator at 3px width
        const indicator = document.createElement('div');
        indicator.style.position = 'fixed';
        indicator.style.top = `${card1.top}px`;
        indicator.style.left = `${card1.left}px`;
        indicator.style.width = '3px';
        indicator.style.height = `${card1.height}px`;
        indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
        indicator.style.zIndex = '9998';
        indicator.style.pointerEvents = 'none';
        
        document.body.appendChild(indicator);
        
        // Add label for 3px indicator
        const indicatorLabel = document.createElement('div');
        indicatorLabel.style.position = 'fixed';
        indicatorLabel.style.top = `${card1.top + card1.height + 10}px`;
        indicatorLabel.style.left = `${card1.left - 10}px`;
        indicatorLabel.style.backgroundColor = 'rgba(0, 255, 0, 0.8)';
        indicatorLabel.style.color = 'black';
        indicatorLabel.style.padding = '2px 5px';
        indicatorLabel.style.fontSize = '11px';
        indicatorLabel.style.fontWeight = 'bold';
        indicatorLabel.style.zIndex = '9999';
        indicatorLabel.textContent = '3px reference';
        
        document.body.appendChild(indicatorLabel);
      }
    });

    // Take final screenshot with measurements
    await page.screenshot({ 
      path: 'card-spacing-with-ruler.png',
      fullPage: false 
    });

    // Zoom in even more for precise measurement
    console.log('\n9. Taking ultra-zoomed screenshot for precise measurement...');
    if (cards.length >= 2) {
      const card1Box = await cards[0].boundingBox();
      const card2Box = await cards[1].boundingBox();
      if (card1Box && card2Box) {
        await page.screenshot({
          path: 'card-spacing-ultra-zoom.png',
          clip: {
            x: card1Box.x + card1Box.width - 20, // 20px before end of first card
            y: card1Box.y + card1Box.height / 2 - 50, // Middle area
            width: 60, // Show 60px total (includes overlap area)
            height: 100
          }
        });
      }
    }

    console.log('\n10. Summary:');
    console.log('Screenshots saved:');
    console.log('  - card-spacing-full-view.png: Full view of the spread');
    console.log('  - card-spacing-zoomed.png: Zoomed view of card overlap');
    console.log('  - card-spacing-with-ruler.png: View with measurement ruler');
    console.log('  - card-spacing-ultra-zoom.png: Ultra-zoomed view of overlap area');
    
    // Calculate exact visible width
    if (cards.length >= 2) {
      const measurements = await page.evaluate(() => {
        const cards = document.querySelectorAll('.card-wrapper');
        if (cards.length >= 2) {
          const card1 = cards[0].getBoundingClientRect();
          const card2 = cards[1].getBoundingClientRect();
          const visibleWidth = card2.left - card1.left;
          const expectedWidth = 3;
          
          return {
            visibleWidth: visibleWidth,
            expectedWidth: expectedWidth,
            difference: visibleWidth - expectedWidth,
            isCorrect: Math.abs(visibleWidth - expectedWidth) < 0.5
          };
        }
        return null;
      });
      
      if (measurements) {
        console.log('\n🎯 Measurement Results:');
        console.log(`  Visible width between cards: ${measurements.visibleWidth}px`);
        console.log(`  Expected width: ${measurements.expectedWidth}px`);
        console.log(`  Difference: ${measurements.difference}px`);
        console.log(`  Is correct (within 0.5px tolerance): ${measurements.isCorrect ? '✅ YES' : '❌ NO'}`);
      }
    }

    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for manual inspection...');
    console.log('Press Ctrl+C to close when done.');
    
    await page.waitForTimeout(300000); // Keep open for 5 minutes

  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ path: 'card-spacing-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();