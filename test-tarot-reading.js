const { chromium } = require('playwright');
const fs = require('fs');

async function testTarotReading() {
  console.log('Starting Tarot Reading Test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to the reading page
    console.log('Step 1: Navigating to http://localhost:4000/reading...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: '/tmp/01-initial-state.png', fullPage: true });
    console.log('Screenshot 1: Initial state saved');
    
    // Step 2: Enter the question
    console.log('Step 2: Entering the question...');
    const questionText = "삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요";
    
    // Find the question input field
    const questionInput = await page.$('textarea, input[type="text"], .question-input');
    if (questionInput) {
      await questionInput.fill(questionText);
      console.log('Question entered successfully');
    } else {
      console.log('Could not find question input field');
    }
    
    // Step 3: Verify Trinity View spread is selected by default
    console.log('Step 3: Checking if Trinity View spread is selected...');
    const spreadSelector = await page.$('.spread-selector, [data-spread="trinity"], .trinity-spread');
    if (spreadSelector) {
      console.log('Trinity spread selector found');
    }
    
    // Take screenshot after entering question
    await page.screenshot({ path: '/tmp/02-question-entered.png', fullPage: true });
    console.log('Screenshot 2: Question entered saved');
    
    // Step 4: Click "카드 뽑기" button
    console.log('Step 4: Looking for "카드 뽑기" button...');
    
    // Try multiple selectors for the draw cards button
    const drawButtonSelectors = [
      'text=카드 뽑기',
      'button:has-text("카드 뽑기")',
      '[data-action="draw-cards"]',
      '.draw-button',
      'button.draw-cards'
    ];
    
    let drawButton = null;
    for (const selector of drawButtonSelectors) {
      try {
        drawButton = await page.$(selector);
        if (drawButton) {
          console.log(`Found draw button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} failed: ${e.message}`);
      }
    }
    
    if (drawButton) {
      await drawButton.click();
      console.log('Draw button clicked');
      await page.waitForTimeout(2000); // Wait for cards to appear
    } else {
      console.log('Could not find draw button');
      // List all buttons for debugging
      const allButtons = await page.$$('button');
      console.log(`Found ${allButtons.length} buttons on the page`);
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].innerText();
        console.log(`Button ${i}: "${buttonText}"`);
      }
    }
    
    // Take screenshot after drawing cards
    await page.screenshot({ path: '/tmp/03-cards-drawn.png', fullPage: true });
    console.log('Screenshot 3: Cards drawn saved');
    
    // Step 5: Manually select 3 different cards
    console.log('Step 5: Selecting 3 different cards...');
    
    // Find all card elements
    const cardSelectors = [
      '.card',
      '.tarot-card',
      '[data-card]',
      '.card-item',
      '.playing-card'
    ];
    
    let cards = [];
    for (const selector of cardSelectors) {
      cards = await page.$$(selector);
      if (cards.length > 0) {
        console.log(`Found ${cards.length} cards with selector: ${selector}`);
        break;
      }
    }
    
    if (cards.length >= 3) {
      // Click on first 3 cards
      for (let i = 0; i < 3; i++) {
        await cards[i].click();
        console.log(`Clicked card ${i + 1}`);
        await page.waitForTimeout(500); // Small delay between clicks
      }
    } else {
      console.log(`Only found ${cards.length} cards, expected at least 3`);
    }
    
    // Take screenshot after selecting cards
    await page.screenshot({ path: '/tmp/04-cards-selected.png', fullPage: true });
    console.log('Screenshot 4: Cards selected saved');
    
    // Step 6: Look for "타로 해석 받기" button
    console.log('Step 6: Looking for interpretation button...');
    await page.waitForTimeout(1000); // Wait for button to appear
    
    const interpretButtonSelectors = [
      'text=타로 해석 받기',
      'button:has-text("타로 해석 받기")',
      'text=해석 받기',
      'button:has-text("해석")',
      '[data-action="interpret"]',
      '.interpret-button'
    ];
    
    let interpretButton = null;
    for (const selector of interpretButtonSelectors) {
      try {
        interpretButton = await page.$(selector);
        if (interpretButton) {
          console.log(`Found interpretation button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} failed: ${e.message}`);
      }
    }
    
    if (interpretButton) {
      console.log('Interpretation button found and visible!');
      
      // Step 7: Click the interpretation button
      console.log('Step 7: Clicking interpretation button...');
      
      // Monitor network requests for API calls
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          console.log(`API Request: ${request.method()} ${request.url()}`);
        }
      });
      
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          console.log(`API Response: ${response.status()} ${response.url()}`);
        }
      });
      
      await interpretButton.click();
      console.log('Interpretation button clicked');
      
      // Wait for interpretation to load
      await page.waitForTimeout(5000);
      
      // Take screenshot of final result
      await page.screenshot({ path: '/tmp/05-interpretation-result.png', fullPage: true });
      console.log('Screenshot 5: Interpretation result saved');
      
      // Check for interpretation content
      const interpretationSelectors = [
        '.interpretation',
        '.tarot-interpretation',
        '.result',
        '.interpretation-text'
      ];
      
      let interpretationContent = null;
      for (const selector of interpretationSelectors) {
        try {
          interpretationContent = await page.$(selector);
          if (interpretationContent) {
            const text = await interpretationContent.innerText();
            console.log(`Found interpretation content (${text.length} characters): ${text.substring(0, 200)}...`);
            break;
          }
        } catch (e) {
          console.log(`Interpretation selector ${selector} failed: ${e.message}`);
        }
      }
      
      if (!interpretationContent) {
        console.log('No interpretation content found');
      }
      
    } else {
      console.log('Interpretation button NOT found!');
      
      // Debug: List all buttons after card selection
      const allButtons = await page.$$('button');
      console.log(`Found ${allButtons.length} buttons after card selection:`);
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].innerText();
        const isVisible = await allButtons[i].isVisible();
        console.log(`Button ${i}: "${buttonText}" (visible: ${isVisible})`);
      }
    }
    
    console.log('\nTest Summary:');
    console.log('- Trinity View spread check: Attempted');
    console.log('- Question entry: Attempted');
    console.log('- Card drawing: Attempted');
    console.log('- Card selection: Attempted (3 cards)');
    console.log(`- Interpretation button: ${interpretButton ? 'FOUND' : 'NOT FOUND'}`);
    console.log('- Screenshots saved to /tmp/ directory');
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: '/tmp/error-state.png', fullPage: true });
  }
  
  // Keep browser open for manual inspection
  console.log('\nBrowser will remain open for manual inspection...');
  console.log('Press Ctrl+C to close');
  
  // Don't close the browser automatically
  // await browser.close();
}

testTarotReading().catch(console.error);