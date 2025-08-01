// Visual test with screenshots at each step
const puppeteer = require('puppeteer');
const fs = require('fs');

async function visualTest() {
  // Create screenshots directory
  if (!fs.existsSync('card-spread-test')) {
    fs.mkdirSync('card-spread-test');
  }
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  const page = await browser.newPage();
  
  console.log('🎬 Visual Card Spread Test\n');
  
  try {
    // Step 1: Load page
    console.log('1. Loading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'card-spread-test/01-initial-load.png', fullPage: true });
    console.log('   ✓ Screenshot: 01-initial-load.png\n');
    
    // Step 2: Enter question
    console.log('2. Entering question...');
    await page.type('textarea#question', 'Will the card spread feature work properly?');
    await page.screenshot({ path: 'card-spread-test/02-question-entered.png', fullPage: true });
    console.log('   ✓ Screenshot: 02-question-entered.png\n');
    
    // Step 3: Check initial button states
    console.log('3. Checking initial button states...');
    const initialButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(btn => ({
        text: btn.textContent.trim(),
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      })).filter(b => b.text.includes('카드') || b.text.includes('섞') || b.text.includes('펼'));
    });
    console.log('   Initial buttons:', initialButtons);
    console.log('');
    
    // Step 4: Click shuffle
    console.log('4. Clicking shuffle button...');
    const shuffleClicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('카드 섞기'));
      if (btn && !btn.disabled) {
        btn.click();
        return true;
      }
      return false;
    });
    
    if (!shuffleClicked) {
      console.log('   ❌ Could not click shuffle button!');
      return;
    }
    
    await page.screenshot({ path: 'card-spread-test/03-shuffle-clicked.png', fullPage: true });
    console.log('   ✓ Shuffle clicked\n');
    
    // Step 5: Monitor shuffle animation
    console.log('5. Monitoring shuffle animation...');
    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      await page.screenshot({ path: `card-spread-test/04-shuffling-${i}.png`, fullPage: true });
      
      const state = await page.evaluate(() => {
        const shuffleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('섞'));
        const spreadBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('펼치기'));
        return {
          shuffleText: shuffleBtn?.textContent || 'not found',
          spreadExists: !!spreadBtn,
          spreadDisabled: spreadBtn?.disabled
        };
      });
      console.log(`   ${i * 0.8}s: Shuffle="${state.shuffleText}", Spread exists=${state.spreadExists}, disabled=${state.spreadDisabled}`);
    }
    console.log('');
    
    // Step 6: Check final state
    console.log('6. Checking final state after shuffle...');
    await page.screenshot({ path: 'card-spread-test/05-after-shuffle.png', fullPage: true });
    
    const finalState = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cardSection = document.querySelector('div[class*="flex-col"][class*="items-center"][class*="space-y-6"]');
      
      return {
        allCardButtons: buttons
          .filter(b => b.textContent.includes('카드') || b.textContent.includes('섞') || b.textContent.includes('펼'))
          .map(btn => ({
            text: btn.textContent.trim(),
            disabled: btn.disabled,
            visible: btn.offsetParent !== null,
            parent: btn.parentElement?.className?.substring(0, 50) + '...'
          })),
        cardSectionExists: !!cardSection,
        cardSectionVisible: cardSection ? cardSection.offsetParent !== null : false,
        toastMessage: document.querySelector('[role="alert"]')?.textContent
      };
    });
    
    console.log('   Card-related buttons:');
    finalState.allCardButtons.forEach(btn => {
      console.log(`     - "${btn.text}" (disabled: ${btn.disabled}, visible: ${btn.visible})`);
    });
    console.log(`   Card section exists: ${finalState.cardSectionExists}, visible: ${finalState.cardSectionVisible}`);
    if (finalState.toastMessage) {
      console.log(`   Toast: ${finalState.toastMessage}`);
    }
    console.log('');
    
    // Step 7: Try to click spread
    const spreadButton = finalState.allCardButtons.find(b => b.text.includes('카드 펼치기'));
    if (spreadButton && !spreadButton.disabled && spreadButton.visible) {
      console.log('7. ✅ Spread button is available! Clicking...');
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('카드 펼치기'));
        if (btn) btn.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: 'card-spread-test/06-after-spread.png', fullPage: true });
      
      const cardsCount = await page.evaluate(() => {
        return document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]').length;
      });
      
      console.log(`   🎉 SUCCESS: ${cardsCount} cards have been spread!`);
      console.log('   ✓ Screenshot: 06-after-spread.png\n');
      
      // Try selecting a card
      if (cardsCount > 0) {
        console.log('8. Clicking first card...');
        await page.evaluate(() => {
          const card = document.querySelector('[role="button"][aria-label*="펼쳐진"]');
          if (card) card.click();
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({ path: 'card-spread-test/07-card-selected.png', fullPage: true });
        console.log('   ✓ Screenshot: 07-card-selected.png\n');
      }
    } else {
      console.log('7. ❌ PROBLEM: Spread button is not available');
      console.log('   Button state:', spreadButton || 'not found');
      
      // Debug info
      await page.screenshot({ path: 'card-spread-test/ERROR-no-spread-button.png', fullPage: true });
      console.log('   ✓ Screenshot: ERROR-no-spread-button.png\n');
    }
    
    console.log('📊 Test Summary:');
    console.log(`- Screenshots saved in: ./card-spread-test/`);
    console.log(`- Total screenshots: ${fs.readdirSync('card-spread-test').length}`);
    console.log('- Please review the screenshots to see the exact UI state at each step');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'card-spread-test/ERROR-exception.png', fullPage: true });
  }
  
  console.log('\n✅ Test complete. Browser remains open for manual inspection.');
}

visualTest();