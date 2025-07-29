const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAIReading() {
  console.log('Starting AI Reading test V2...');
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`Browser Console [${msg.type()}]: ${msg.text()}`);
  });
  
  // Enable error logging
  page.on('pageerror', err => {
    console.error('Page Error:', err);
  });
  
  // Enable request failure logging
  page.on('requestfailed', request => {
    if (!request.url().includes('fonts')) { // Ignore font loading errors
      console.error('Request Failed:', request.url(), request.failure().errorText);
    }
  });

  try {
    console.log('1. Navigating to localhost:4000/reading...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await delay(3000);
    
    // Take screenshot of initial page
    await page.screenshot({ 
      path: 'screenshots/v2-01-reading-page-initial.png',
      fullPage: true 
    });
    console.log('Screenshot saved: v2-01-reading-page-initial.png');
    
    // 2. Enter a question - use more generic selector
    console.log('2. Looking for question input field...');
    const questionInputSelectors = [
      'textarea',
      'input[type="text"]',
      '[placeholder*="질문"]',
      '[placeholder*="고민"]',
      '[placeholder*="카드"]',
      '.question-input',
      '#question'
    ];
    
    let questionInput = null;
    for (const selector of questionInputSelectors) {
      try {
        questionInput = await page.waitForSelector(selector, { timeout: 3000 });
        if (questionInput) {
          console.log(`Found input with selector: ${selector}`);
          // Check if it's visible and editable
          const isVisible = await questionInput.isVisible();
          const isEditable = await questionInput.isEditable();
          if (isVisible && isEditable) {
            console.log('Input is visible and editable');
            break;
          } else {
            console.log('Input found but not usable, trying next...');
            questionInput = null;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!questionInput) {
      console.error('Could not find question input field');
      // Log page structure
      const textareas = await page.$$('textarea');
      const inputs = await page.$$('input[type="text"]');
      console.log(`Found ${textareas.length} textareas and ${inputs.length} text inputs`);
      
      // Try to log placeholders
      for (const textarea of textareas) {
        const placeholder = await textarea.getAttribute('placeholder');
        console.log('Textarea placeholder:', placeholder);
      }
    } else {
      await questionInput.fill('내가 2025년에 이루고자 하는 목표를 달성할 수 있을까요?');
      await delay(1000);
      
      await page.screenshot({ 
        path: 'screenshots/v2-02-question-entered.png',
        fullPage: true 
      });
      console.log('Screenshot saved: v2-02-question-entered.png');
    }
    
    // 3. Click the reading button - look for any button that might start the reading
    console.log('3. Looking for reading start button...');
    const buttonSelectors = [
      'button:has-text("타로 리딩")',
      'button:has-text("리딩 시작")',
      'button:has-text("시작")',
      'button:has-text("카드")',
      'button.primary',
      'button[type="submit"]',
      '.card-button',
      'button'
    ];
    
    let readingButton = null;
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons on page`);
    
    for (const button of buttons) {
      const text = await button.textContent();
      console.log('Button text:', text);
      if (text && (text.includes('카드') || text.includes('리딩') || text.includes('시작'))) {
        readingButton = button;
        console.log('Found reading button with text:', text);
        break;
      }
    }
    
    if (readingButton) {
      await readingButton.click();
      console.log('Clicked reading button');
      await delay(3000);
      
      // 4. Wait for card selection phase
      console.log('4. Waiting for card selection...');
      await page.waitForSelector('.card-back, .tarot-card, [class*="card"]', { timeout: 15000 });
      await delay(2000);
      
      await page.screenshot({ 
        path: 'screenshots/v2-03-card-selection.png',
        fullPage: true 
      });
      console.log('Screenshot saved: v2-03-card-selection.png');
      
      // 5. Click on cards (card backs)
      console.log('5. Selecting cards...');
      const cardBacks = await page.$$('.card-back');
      console.log(`Found ${cardBacks.length} card backs`);
      
      if (cardBacks.length >= 3) {
        // Click first 3 cards
        for (let i = 0; i < 3; i++) {
          await cardBacks[i].click();
          await delay(1500);
          console.log(`Clicked card ${i + 1}`);
        }
        
        await page.screenshot({ 
          path: 'screenshots/v2-04-cards-selected.png',
          fullPage: true 
        });
        console.log('Screenshot saved: v2-04-cards-selected.png');
        
        // 6. Look for interpretation button
        console.log('6. Looking for interpretation button...');
        await delay(2000);
        
        const interpretButton = await page.waitForSelector('button:has-text("해석"), button:has-text("리딩"), button:has-text("확인")', { timeout: 10000 });
        if (interpretButton) {
          const buttonText = await interpretButton.textContent();
          console.log('Found interpretation button:', buttonText);
          await interpretButton.click();
          console.log('Clicked interpretation button');
          
          // 7. Wait for AI interpretation
          console.log('7. Waiting for AI interpretation...');
          await delay(10000); // Give more time for AI response
          
          // Check console for any API errors
          await page.screenshot({ 
            path: 'screenshots/v2-05-ai-interpretation.png',
            fullPage: true 
          });
          console.log('Screenshot saved: v2-05-ai-interpretation.png');
          
          // Look for interpretation content
          const interpretationSelectors = [
            '.interpretation',
            '.ai-interpretation',
            '.reading-result',
            '[class*="interpretation"]',
            '[class*="result"]',
            '.card-interpretation'
          ];
          
          for (const selector of interpretationSelectors) {
            const element = await page.$(selector);
            if (element) {
              const text = await element.textContent();
              console.log(`Found interpretation with selector ${selector}:`, text.substring(0, 100) + '...');
              break;
            }
          }
        }
      } else {
        console.error('Not enough cards found for selection');
      }
    } else {
      console.error('Could not find reading button');
    }
    
    // Take final screenshot
    await delay(3000);
    await page.screenshot({ 
      path: 'screenshots/v2-06-final-state.png',
      fullPage: true 
    });
    console.log('Screenshot saved: v2-06-final-state.png');
    
    console.log('Test completed. Check screenshots for results.');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ 
      path: 'screenshots/v2-error-state.png',
      fullPage: true 
    });
  } finally {
    await delay(5000); // Keep browser open for manual inspection
    await browser.close();
  }
}

// Create screenshots directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir('screenshots', { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
  await testAIReading();
})();