const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to reading page');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'step1-question.png' });

    console.log('Step 2: Fill question');
    await page.fill('textarea#question', '카드 간격을 확인하는 질문입니다');
    await page.waitForTimeout(500);

    console.log('Step 3: Select spread - trying dropdown approach');
    
    // Take screenshot before dropdown
    await page.screenshot({ path: 'step2-spread-selected.png' });
    
    // Try to click dropdown and select Trinity View  
    try {
      await page.click('button#spread-type');
      await page.waitForTimeout(1000);
      
      // Look for Trinity View option
      const trinityOption = await page.locator('text=삼위일체 조망').or(
        page.locator('text=Trinity View')
      );
      
      if (await trinityOption.count() > 0) {
        console.log('Found Trinity View option, clicking...');
        await trinityOption.first().click();
        await page.waitForTimeout(500);
      } else {
        console.log('Trinity View not found, selecting first available option...');
        const firstOption = await page.$('[role="option"]');
        if (firstOption) {
          await firstOption.click();
          await page.waitForTimeout(500);
        }
      }
    } catch (e) {
      console.log('Dropdown selection failed:', e.message);
    }

    console.log('Step 4: Select interpretation method');
    try {
      await page.click('button#interpretation-method');
      await page.waitForTimeout(500);
      
      // Select first available interpretation
      const firstInterpretation = await page.$('[role="option"]');
      if (firstInterpretation) {
        await firstInterpretation.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('Interpretation selection failed:', e.message);
    }

    // Take screenshot after selections
    await page.screenshot({ path: 'step3-shuffled.png' });

    console.log('Step 5: Look for start/shuffle buttons');
    
    // Try different button selectors to start the reading
    const buttonSelectors = [
      'button:has-text("시작")',
      'button:has-text("카드")',
      'button:has-text("리딩")', 
      'button:has-text("셔플")',
      'button:has-text("뽑기")',
      'text=시작하기',
      'text=리딩 시작'
    ];

    let foundButton = false;
    for (const selector of buttonSelectors) {
      try {
        const button = await page.$(selector);
        if (button && await button.isVisible()) {
          console.log(`Found button: ${selector}`);
          await button.click();
          foundButton = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!foundButton) {
      console.log('No start button found, checking all buttons on page...');
      const allButtons = await page.$$('button');
      console.log(`Total buttons found: ${allButtons.length}`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        console.log(`Button ${i}: "${text}" (visible: ${isVisible})`);
      }
      
      // Try clicking any visible button in the reading area
      const readingButton = await page.$('.space-y-8 button:visible, .min-h-\\[400px\\] button:visible');
      if (readingButton) {
        console.log('Trying reading area button...');
        await readingButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // Take screenshot after button click
    await page.screenshot({ path: 'step4-reading-started.png' });

    console.log('Step 6: Look for cards...');
    
    // Wait a bit more for cards to appear
    await page.waitForTimeout(3000);
    
    // Try different selectors for cards
    const cardSelectors = [
      '.tarot-card',
      '[class*="card"]',
      'img[src*="tarot"]',
      'img[alt*="카드"]',
      '.relative img',
      '[style*="margin"]'
    ];
    
    let cardsFound = false;
    for (const selector of cardSelectors) {
      const cards = await page.$$(selector);
      if (cards.length > 0) {
        console.log(`Found ${cards.length} cards with selector: ${selector}`);
        cardsFound = true;
        
        // Measure spacing if we have multiple cards
        if (cards.length >= 2) {
          const measurements = [];
          
          for (let i = 0; i < Math.min(3, cards.length); i++) {
            const box = await cards[i].boundingBox();
            const styles = await cards[i].evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                marginLeft: computed.marginLeft,
                width: computed.width,
                transform: computed.transform,
                position: computed.position
              };
            });
            
            measurements.push({ box, styles });
            console.log(`Card ${i + 1}:`, {
              x: box?.x.toFixed(2),
              width: box?.width.toFixed(2),
              ...styles
            });
          }
          
          // Calculate spacing between first two cards
          if (measurements.length >= 2 && measurements[0].box && measurements[1].box) {
            const card1 = measurements[0].box;
            const card2 = measurements[1].box;
            const spacing = card2.x - card1.x;
            const visibleWidth = spacing;
            const overlap = card1.width - spacing;
            
            console.log('\n=== CARD SPACING ANALYSIS ===');
            console.log(`Card width: ${card1.width.toFixed(2)}px`);
            console.log(`Distance between cards: ${spacing.toFixed(2)}px`);
            console.log(`Visible portion: ${visibleWidth.toFixed(2)}px`);
            console.log(`Overlap: ${overlap.toFixed(2)}px`);
            
            // Check if this matches expected -153px marginLeft
            if (Math.abs(overlap - 153) < 10) {
              console.log('✅ Overlap matches expected ~153px!');
            } else {
              console.log(`❌ Overlap ${overlap.toFixed(2)}px doesn't match expected ~153px`);
            }
            console.log('===========================');
          }
        }
        break;
      }
    }
    
    if (!cardsFound) {
      console.log('No cards found yet. Checking page state...');
      
      // Check if we're in a different state
      const pageText = await page.textContent('body');
      if (pageText.includes('카드 펼치기')) {
        console.log('Found "카드 펼치기" button, clicking...');
        try {
          await page.click('text=카드 펼치기');
          await page.waitForTimeout(3000);
          
          // Try finding cards again
          const finalCards = await page.$$('.tarot-card, [class*="card"], img[src*="tarot"]');
          console.log(`After clicking 펼치기: found ${finalCards.length} cards`);
          
          if (finalCards.length >= 2) {
            // Quick spacing check
            const box1 = await finalCards[0].boundingBox();
            const box2 = await finalCards[1].boundingBox();
            if (box1 && box2) {
              const spacing = box2.x - box1.x;
              const overlap = box1.width - spacing;
              console.log(`\nFinal spacing: ${spacing.toFixed(2)}px, overlap: ${overlap.toFixed(2)}px`);
            }
          }
        } catch (e) {
          console.log('Failed to click 펼치기 button:', e.message);
        }
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'card-spacing-final-verification.png', fullPage: false });
    
    console.log('\nKeeping browser open for inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'spacing-error-verification.png' });
  } finally {
    await browser.close();
  }
})();