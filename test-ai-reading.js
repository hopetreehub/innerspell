const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAIReading() {
  console.log('Starting AI Reading test...');
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
    console.error('Request Failed:', request.url(), request.failure().errorText);
  });

  try {
    console.log('1. Navigating to localhost:4000/reading...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await delay(2000);
    
    // Take screenshot of initial page
    await page.screenshot({ 
      path: 'screenshots/01-reading-page-initial.png',
      fullPage: true 
    });
    console.log('Screenshot saved: 01-reading-page-initial.png');
    
    // 2. Enter a question
    console.log('2. Entering question...');
    const questionInput = await page.waitForSelector('textarea[placeholder*="질문"]', { timeout: 10000 });
    await questionInput.fill('내가 2025년에 이루고자 하는 목표를 달성할 수 있을까요?');
    await delay(1000);
    
    await page.screenshot({ 
      path: 'screenshots/02-question-entered.png',
      fullPage: true 
    });
    console.log('Screenshot saved: 02-question-entered.png');
    
    // 3. Click the reading button
    console.log('3. Clicking reading button...');
    const readingButton = await page.waitForSelector('button:has-text("타로 리딩 시작")', { timeout: 10000 });
    await readingButton.click();
    await delay(2000);
    
    // 4. Wait for card selection phase
    console.log('4. Waiting for card selection...');
    await page.waitForSelector('.card-selection-container, [class*="card"]', { timeout: 15000 });
    await delay(2000);
    
    await page.screenshot({ 
      path: 'screenshots/03-card-selection.png',
      fullPage: true 
    });
    console.log('Screenshot saved: 03-card-selection.png');
    
    // 5. Select 3 cards
    console.log('5. Selecting 3 cards...');
    const cards = await page.$$('.tarot-card, [class*="card"]:not([class*="selected"])');
    console.log(`Found ${cards.length} cards available for selection`);
    
    if (cards.length >= 3) {
      // Select first 3 cards
      for (let i = 0; i < 3; i++) {
        await cards[i].click();
        await delay(1000);
        console.log(`Selected card ${i + 1}`);
      }
    } else {
      console.error('Not enough cards found for selection');
    }
    
    await page.screenshot({ 
      path: 'screenshots/04-cards-selected.png',
      fullPage: true 
    });
    console.log('Screenshot saved: 04-cards-selected.png');
    
    // 6. Click confirm/next button
    console.log('6. Looking for confirm button...');
    const confirmButton = await page.waitForSelector('button:has-text("확인"), button:has-text("다음"), button:has-text("해석"), button:has-text("리딩")', { timeout: 10000 });
    await confirmButton.click();
    console.log('Clicked confirm button, waiting for AI interpretation...');
    
    // 7. Wait for AI interpretation (with extended timeout)
    console.log('7. Waiting for AI interpretation result...');
    await delay(5000); // Give it time to process
    
    // Try multiple selectors for AI result
    const aiResultSelectors = [
      '.ai-interpretation',
      '.interpretation-result',
      '[class*="interpretation"]',
      '.reading-result',
      '[class*="result"]',
      '.tarot-reading-result'
    ];
    
    let aiResult = null;
    for (const selector of aiResultSelectors) {
      try {
        aiResult = await page.waitForSelector(selector, { timeout: 30000 });
        if (aiResult) {
          console.log(`Found AI result with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!aiResult) {
      console.log('AI result element not found, checking for any error messages...');
      const pageContent = await page.content();
      console.log('Page content length:', pageContent.length);
    }
    
    await page.screenshot({ 
      path: 'screenshots/05-ai-interpretation.png',
      fullPage: true 
    });
    console.log('Screenshot saved: 05-ai-interpretation.png');
    
    // 8. Check for any error messages in console or on page
    console.log('8. Checking for error messages...');
    const errorElements = await page.$$('.error, [class*="error"], .alert-error');
    if (errorElements.length > 0) {
      for (const errorEl of errorElements) {
        const errorText = await errorEl.textContent();
        console.error('Error found on page:', errorText);
      }
    }
    
    // Take final screenshot
    await delay(3000);
    await page.screenshot({ 
      path: 'screenshots/06-final-state.png',
      fullPage: true 
    });
    console.log('Screenshot saved: 06-final-state.png');
    
    console.log('Test completed. Check screenshots for results.');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ 
      path: 'screenshots/error-state.png',
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