// Comprehensive test with React DevTools integration
const puppeteer = require('puppeteer');

async function comprehensiveTest() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--window-size=1400,900']
  });
  
  const page = await browser.newPage();
  
  // Capture all console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      console.log('❌ PAGE ERROR:', text);
    }
  });
  
  try {
    console.log('🔍 Comprehensive Card Spread Test\n');
    
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(3000);
    
    // Step 1: Initial state
    console.log('Step 1: Checking initial state...');
    const initialState = await page.evaluate(() => {
      const getReactState = () => {
        // Find React Fiber
        const findReactFiber = (element) => {
          const key = Object.keys(element).find(k => k.startsWith('__reactFiber'));
          return element[key];
        };
        
        // Search for our component
        const containers = document.querySelectorAll('div[class*="space-y"]');
        for (const container of containers) {
          const fiber = findReactFiber(container);
          if (fiber) {
            let current = fiber;
            while (current) {
              if (current.memoizedState && typeof current.memoizedState === 'object') {
                // Look for hooks
                let hook = current.memoizedState;
                const states = [];
                while (hook && states.length < 30) {
                  states.push(hook.memoizedState);
                  hook = hook.next;
                }
                
                // Check if this has our state
                const hasStage = states.some(s => typeof s === 'string' && ['setup', 'deck_ready', 'shuffled'].includes(s));
                if (hasStage) {
                  return {
                    stage: states.find(s => typeof s === 'string' && ['setup', 'deck_ready', 'shuffled', 'shuffling'].includes(s)),
                    revealedCardsLength: states.find(s => Array.isArray(s))?.length || 0,
                    selectedCardsLength: states.filter(s => Array.isArray(s))[1]?.length || 0
                  };
                }
              }
              current = current.return;
            }
          }
        }
        return null;
      };
      
      const state = getReactState();
      const buttons = Array.from(document.querySelectorAll('button'));
      
      return {
        reactState: state,
        shuffleButton: buttons.find(b => b.textContent.includes('카드 섞기')) ? {
          exists: true,
          disabled: buttons.find(b => b.textContent.includes('카드 섞기')).disabled,
          visible: buttons.find(b => b.textContent.includes('카드 섞기')).offsetParent !== null
        } : { exists: false },
        spreadButton: buttons.find(b => b.textContent.includes('카드 펼치기')) ? {
          exists: true,
          disabled: buttons.find(b => b.textContent.includes('카드 펼치기')).disabled,
          visible: buttons.find(b => b.textContent.includes('카드 펼치기')).offsetParent !== null
        } : { exists: false }
      };
    });
    console.log('Initial state:', JSON.stringify(initialState, null, 2));
    
    // Step 2: Enter question
    console.log('\nStep 2: Entering question...');
    await page.type('textarea#question', 'Testing card spread functionality');
    
    // Step 3: Click shuffle
    console.log('\nStep 3: Clicking shuffle...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('카드 섞기'));
      if (btn) {
        console.log('Clicking shuffle button');
        btn.click();
      }
    });
    
    // Monitor state changes during shuffle
    console.log('\nStep 4: Monitoring shuffle animation...');
    const statesDuringShuffle = [];
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(400);
      const state = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const spreadBtn = buttons.find(b => b.textContent.includes('카드 펼치기'));
        return {
          time: `${i * 0.4}s`,
          spreadButton: spreadBtn ? {
            disabled: spreadBtn.disabled,
            ariaDisabled: spreadBtn.getAttribute('aria-disabled'),
            parentDisplay: spreadBtn.parentElement ? window.getComputedStyle(spreadBtn.parentElement).display : null
          } : null,
          shuffleInProgress: buttons.some(b => b.textContent.includes('섞는 중'))
        };
      });
      statesDuringShuffle.push(state);
    }
    
    console.log('States during shuffle:');
    statesDuringShuffle.forEach(s => console.log(`  ${s.time}:`, s));
    
    // Step 5: Final check after shuffle
    console.log('\nStep 5: Checking final state after shuffle...');
    const finalState = await page.evaluate(() => {
      // More thorough check
      const allButtons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent.trim(),
        disabled: btn.disabled,
        ariaDisabled: btn.getAttribute('aria-disabled'),
        visible: btn.offsetParent !== null,
        parent: btn.parentElement?.className,
        grandparent: btn.parentElement?.parentElement?.className
      }));
      
      // Check specific sections
      const cardSection = document.querySelector('div[class*="flex-col"][class*="items-center"][class*="space-y-6"]');
      const sectionButtons = cardSection ? Array.from(cardSection.querySelectorAll('button')).map(b => b.textContent) : [];
      
      return {
        allButtons,
        cardSectionButtons: sectionButtons,
        toastMessage: document.querySelector('[role="alert"]')?.textContent
      };
    });
    
    console.log('\nAll buttons found:');
    finalState.allButtons.forEach(btn => {
      console.log(`  - "${btn.text}" (disabled: ${btn.disabled}, visible: ${btn.visible})`);
    });
    
    if (finalState.cardSectionButtons.length > 0) {
      console.log('\nButtons in card section:', finalState.cardSectionButtons);
    }
    
    if (finalState.toastMessage) {
      console.log('\nToast message:', finalState.toastMessage);
    }
    
    // Step 6: Try to click spread if available
    const spreadButton = finalState.allButtons.find(b => b.text.includes('카드 펼치기'));
    if (spreadButton && !spreadButton.disabled && spreadButton.visible) {
      console.log('\n✅ Spread button is available! Clicking...');
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('카드 펼치기'));
        if (btn) btn.click();
      });
      
      await page.waitForTimeout(2000);
      
      const cardsSpread = await page.evaluate(() => {
        return document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]').length;
      });
      
      console.log(`\n🎉 SUCCESS: ${cardsSpread} cards have been spread!`);
    } else {
      console.log('\n❌ PROBLEM: Spread button is not clickable');
      console.log('Button state:', spreadButton);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'spread-button-issue.png', fullPage: true });
      console.log('Screenshot saved as spread-button-issue.png');
    }
    
    // Final console logs check
    const errors = consoleLogs.filter(log => log.type === 'error');
    if (errors.length > 0) {
      console.log('\n⚠️  Console errors detected:');
      errors.forEach(err => console.log(`  - ${err.text}`));
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  }
  
  console.log('\n📌 Test complete. Browser remains open for inspection.');
}

comprehensiveTest();