const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAIReading() {
  console.log('Starting AI Reading test V3...');
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
    const text = msg.text();
    if (text.includes('API') || text.includes('error') || text.includes('Error') || 
        text.includes('openai') || text.includes('gemini') || text.includes('AI')) {
      console.log(`🔴 Browser Console [${msg.type()}]: ${text}`);
    } else if (msg.type() === 'error') {
      console.log(`❌ Browser Console ERROR: ${text}`);
    }
  });
  
  // Enable error logging
  page.on('pageerror', err => {
    console.error('❌ Page Error:', err);
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
      path: 'screenshots/v3-01-reading-page-initial.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: v3-01-reading-page-initial.png');
    
    // 2. Enter a question
    console.log('2. Entering question...');
    const questionInput = await page.waitForSelector('textarea', { timeout: 10000 });
    await questionInput.fill('내가 2025년에 이루고자 하는 목표를 달성할 수 있을까요?');
    await delay(1000);
    
    await page.screenshot({ 
      path: 'screenshots/v3-02-question-entered.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: v3-02-question-entered.png');
    
    // 3. First click "카드 섞기" button
    console.log('3. Clicking "카드 섞기" button...');
    const shuffleButton = await page.waitForSelector('button:has-text("카드 섞기")', { timeout: 10000 });
    await shuffleButton.click();
    console.log('✅ Clicked shuffle button');
    await delay(2000);
    
    // 4. Then click "카드 펼치기" button
    console.log('4. Looking for "카드 펼치기" button...');
    const spreadButton = await page.waitForSelector('button:has-text("카드 펼치기")', { timeout: 10000 });
    await spreadButton.click();
    console.log('✅ Clicked spread button');
    await delay(3000);
    
    // 5. Wait for cards to appear
    console.log('5. Waiting for cards to appear...');
    await page.waitForSelector('.tarot-card, .card-container .card', { timeout: 15000 });
    
    await page.screenshot({ 
      path: 'screenshots/v3-03-cards-displayed.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: v3-03-cards-displayed.png');
    
    // 6. Select 3 cards
    console.log('6. Selecting 3 cards...');
    // Try different selectors for cards
    const cardSelectors = [
      '.tarot-card:not(.selected)',
      '.card-container .card:not(.selected)',
      '.card:not(.selected)',
      '[class*="card"]:not([class*="selected"])'
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
      for (let i = 0; i < 3; i++) {
        await cards[i].click();
        await delay(1500);
        console.log(`✅ Selected card ${i + 1}`);
      }
      
      await page.screenshot({ 
        path: 'screenshots/v3-04-cards-selected.png',
        fullPage: true 
      });
      console.log('✅ Screenshot saved: v3-04-cards-selected.png');
      
      // 7. Click interpretation button
      console.log('7. Looking for AI interpretation button...');
      await delay(2000);
      
      // Try multiple button texts
      const interpretButtonTexts = ['AI 해석 받기', 'AI 해석', '해석 받기', '리딩 받기', '해석하기'];
      let interpretButton = null;
      
      for (const text of interpretButtonTexts) {
        try {
          interpretButton = await page.waitForSelector(`button:has-text("${text}")`, { timeout: 3000 });
          if (interpretButton) {
            console.log(`Found button with text: ${text}`);
            break;
          }
        } catch (e) {
          // Continue to next text
        }
      }
      
      if (interpretButton) {
        console.log('8. Clicking AI interpretation button...');
        await interpretButton.click();
        console.log('✅ Clicked AI interpretation button');
        
        // 9. Monitor for API calls and errors
        console.log('9. Monitoring for AI API calls (waiting 15 seconds)...');
        
        // Wait and monitor console
        await delay(15000);
        
        await page.screenshot({ 
          path: 'screenshots/v3-05-after-ai-click.png',
          fullPage: true 
        });
        console.log('✅ Screenshot saved: v3-05-after-ai-click.png');
        
        // 10. Check for interpretation result
        console.log('10. Checking for AI interpretation result...');
        const interpretationSelectors = [
          '.ai-interpretation',
          '.interpretation-container',
          '.reading-result',
          '[class*="interpretation"]',
          '.card-reading',
          '.tarot-interpretation'
        ];
        
        let foundInterpretation = false;
        for (const selector of interpretationSelectors) {
          const element = await page.$(selector);
          if (element) {
            const text = await element.textContent();
            if (text && text.length > 50) {
              console.log(`✅ Found interpretation with selector ${selector}`);
              console.log(`Interpretation preview: ${text.substring(0, 150)}...`);
              foundInterpretation = true;
              break;
            }
          }
        }
        
        if (!foundInterpretation) {
          console.log('❌ No AI interpretation found on page');
          
          // Check for error messages
          const errorSelectors = ['.error', '.alert', '[class*="error"]', '.toast'];
          for (const selector of errorSelectors) {
            const errorElement = await page.$(selector);
            if (errorElement) {
              const errorText = await errorElement.textContent();
              console.log(`❌ Error found: ${errorText}`);
            }
          }
        }
      } else {
        console.log('❌ Could not find AI interpretation button');
      }
    } else {
      console.log('❌ Not enough cards found for selection');
    }
    
    // Final screenshot
    await delay(3000);
    await page.screenshot({ 
      path: 'screenshots/v3-06-final-state.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: v3-06-final-state.png');
    
    console.log('\n✅ Test completed. Check screenshots and console output for results.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: 'screenshots/v3-error-state.png',
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