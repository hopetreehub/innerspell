// Debug card spread issue - Check stage transitions
const puppeteer = require('puppeteer');

async function debugCardSpread() {
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('PAGE LOG:', msg.text());
    } else if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });
  
  try {
    console.log('🔍 Debugging Card Spread Stage Transitions');
    console.log('==========================================\n');
    
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle0' });
    
    // Inject debugging code
    await page.evaluate(() => {
      console.log('Injecting debug hooks...');
      
      // Try to find the React component
      const findReactComponent = () => {
        const elements = document.querySelectorAll('[class*="space-y-8"]');
        for (const el of elements) {
          const reactKey = Object.keys(el).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
          if (reactKey) {
            let fiber = el[reactKey];
            while (fiber) {
              if (fiber.memoizedState && fiber.memoizedState.stage !== undefined) {
                return fiber;
              }
              fiber = fiber.return;
            }
          }
        }
        return null;
      };
      
      // Monitor stage changes
      const checkStage = () => {
        const component = findReactComponent();
        if (component && component.memoizedState) {
          const states = [];
          let currentState = component.memoizedState;
          let index = 0;
          
          while (currentState && index < 20) {
            states.push(currentState);
            currentState = currentState.next;
            index++;
          }
          
          // Find stage state
          const stageState = states.find(s => 
            typeof s === 'string' && ['setup', 'deck_ready', 'shuffling', 'shuffled', 'spread_revealed'].includes(s)
          );
          
          if (stageState) {
            console.log(`STAGE: ${stageState}`);
            window.__currentStage = stageState;
          }
          
          // Find isShufflingAnimationActive state
          const shufflingState = states.find(s => typeof s === 'boolean');
          if (shufflingState !== undefined) {
            console.log(`isShufflingAnimationActive: ${shufflingState}`);
            window.__isShuffling = shufflingState;
          }
        }
      };
      
      // Check every 500ms
      setInterval(checkStage, 500);
      checkStage();
    });
    
    // Enter question
    await page.type('textarea#question', 'Testing card spread');
    
    console.log('\n1. Before shuffle - checking button states:');
    const beforeShuffle = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shuffleBtn = buttons.find(btn => btn.textContent.includes('카드 섞기'));
      const spreadBtn = buttons.find(btn => btn.textContent.includes('카드 펼치기'));
      return {
        shuffleDisabled: shuffleBtn?.disabled,
        spreadDisabled: spreadBtn?.disabled,
        stage: window.__currentStage,
        isShuffling: window.__isShuffling
      };
    });
    console.log(beforeShuffle);
    
    // Click shuffle
    console.log('\n2. Clicking shuffle button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shuffleBtn = buttons.find(btn => btn.textContent.includes('카드 섞기'));
      if (shuffleBtn) shuffleBtn.click();
    });
    
    // Monitor during shuffle
    console.log('\n3. Monitoring during shuffle animation:');
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(500);
      const duringState = await page.evaluate(() => ({
        stage: window.__currentStage,
        isShuffling: window.__isShuffling,
        spreadBtnDisabled: Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('카드 펼치기'))?.disabled
      }));
      console.log(`   ${i * 0.5}s:`, duringState);
    }
    
    console.log('\n4. After shuffle - final state:');
    const afterShuffle = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shuffleBtn = buttons.find(btn => btn.textContent.includes('카드 섞기'));
      const spreadBtn = buttons.find(btn => btn.textContent.includes('카드 펼치기'));
      
      // Try to get more details about the button
      let btnDetails = null;
      if (spreadBtn) {
        const rect = spreadBtn.getBoundingClientRect();
        const styles = window.getComputedStyle(spreadBtn);
        btnDetails = {
          visible: rect.width > 0 && rect.height > 0,
          display: styles.display,
          opacity: styles.opacity,
          pointerEvents: styles.pointerEvents,
          ariaDisabled: spreadBtn.getAttribute('aria-disabled'),
          className: spreadBtn.className
        };
      }
      
      return {
        shuffleDisabled: shuffleBtn?.disabled,
        spreadDisabled: spreadBtn?.disabled,
        spreadExists: !!spreadBtn,
        stage: window.__currentStage,
        isShuffling: window.__isShuffling,
        buttonDetails: btnDetails
      };
    });
    console.log(JSON.stringify(afterShuffle, null, 2));
    
    // Try to click spread button
    if (afterShuffle.spreadExists && !afterShuffle.spreadDisabled) {
      console.log('\n5. Clicking spread button...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const spreadBtn = buttons.find(btn => btn.textContent.includes('카드 펼치기'));
        if (spreadBtn) spreadBtn.click();
      });
      await page.waitForTimeout(2000);
      
      const afterSpread = await page.evaluate(() => ({
        stage: window.__currentStage,
        cardsVisible: document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]').length
      }));
      console.log('After spread:', afterSpread);
    }
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
  
  console.log('\nKeeping browser open for inspection...');
}

debugCardSpread();