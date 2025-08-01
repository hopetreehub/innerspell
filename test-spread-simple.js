// Simple test for card spread functionality
const puppeteer = require('puppeteer');

async function testSpread() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE:', msg.text()));
  
  try {
    console.log('Testing Card Spread...\n');
    
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Enter question
    await page.type('textarea#question', 'Test question for card spread');
    
    // Find and click shuffle button
    console.log('1. Looking for shuffle button...');
    const shuffleClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shuffleBtn = buttons.find(btn => btn.textContent.includes('카드 섞기'));
      if (shuffleBtn && !shuffleBtn.disabled) {
        console.log('Found shuffle button:', {
          text: shuffleBtn.textContent,
          disabled: shuffleBtn.disabled,
          className: shuffleBtn.className
        });
        shuffleBtn.click();
        return true;
      }
      return false;
    });
    
    if (!shuffleClicked) {
      console.log('ERROR: Could not click shuffle button');
      return;
    }
    
    console.log('✓ Shuffle clicked, waiting for animation...');
    await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for shuffle animation
    
    // Check spread button state
    console.log('\n2. Checking spread button after shuffle...');
    const spreadState = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const spreadBtn = buttons.find(btn => btn.textContent.includes('카드 펼치기'));
      
      if (!spreadBtn) {
        return { found: false };
      }
      
      // Get button container to check visibility
      let parent = spreadBtn.parentElement;
      let container = null;
      while (parent && !container) {
        if (parent.className && parent.className.includes('space-y-6')) {
          container = parent;
        }
        parent = parent.parentElement;
      }
      
      return {
        found: true,
        text: spreadBtn.textContent,
        disabled: spreadBtn.disabled,
        ariaDisabled: spreadBtn.getAttribute('aria-disabled'),
        className: spreadBtn.className,
        visible: spreadBtn.offsetParent !== null,
        containerVisible: container ? container.offsetParent !== null : null
      };
    });
    
    console.log('Spread button state:', JSON.stringify(spreadState, null, 2));
    
    if (spreadState.found && !spreadState.disabled) {
      console.log('\n3. Clicking spread button...');
      const spreadClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const spreadBtn = buttons.find(btn => btn.textContent.includes('카드 펼치기'));
        if (spreadBtn) {
          spreadBtn.click();
          return true;
        }
        return false;
      });
      
      if (spreadClicked) {
        console.log('✓ Spread button clicked');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if cards appeared
        const cardsCount = await page.evaluate(() => {
          return document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]').length;
        });
        
        console.log(`\n✓ SUCCESS: ${cardsCount} cards are now spread!`);
      }
    } else {
      console.log('\n✗ PROBLEM: Spread button is disabled or not found after shuffle');
      
      // Debug: Check what stage we're in
      const debugInfo = await page.evaluate(() => {
        // Check all buttons on the page
        const allButtons = Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.textContent.trim(),
          disabled: btn.disabled,
          visible: btn.offsetParent !== null
        }));
        
        // Check for any error messages
        const toasts = Array.from(document.querySelectorAll('[role="alert"]')).map(el => el.textContent);
        
        return { allButtons, toasts };
      });
      
      console.log('\nAll buttons on page:', debugInfo.allButtons);
      if (debugInfo.toasts.length > 0) {
        console.log('Toast messages:', debugInfo.toasts);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
  
  console.log('\nTest complete. Browser stays open for inspection.');
}

testSpread();