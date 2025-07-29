const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAIComplete() {
  console.log('Starting Complete AI Reading test...');
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Collect all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    const entry = `[${new Date().toISOString()}] [${msg.type()}] ${text}`;
    consoleMessages.push(entry);
    
    // Highlight AI/API related messages
    if (text.includes('AI') || text.includes('api') || text.includes('해석') || 
        text.includes('gemini') || text.includes('openai') || text.includes('error')) {
      console.log(`🔴 ${entry}`);
    }
  });
  
  // Monitor network for API calls
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('ai') || url.includes('interpretation')) {
      console.log(`📤 API Request: ${request.method()} ${url}`);
      if (request.postData()) {
        console.log(`📤 Request Body: ${request.postData().substring(0, 200)}...`);
      }
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('api') || url.includes('ai') || url.includes('interpretation')) {
      console.log(`📥 API Response: ${response.status()} ${url}`);
    }
  });

  try {
    console.log('\n1. Navigating to localhost:4000/reading...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await delay(3000);
    
    console.log('2. Entering question...');
    const questionInput = await page.waitForSelector('textarea', { timeout: 10000 });
    await questionInput.fill('내가 2025년에 이루고자 하는 목표를 달성할 수 있을까요?');
    
    console.log('3. Clicking "카드 섞기" button...');
    await page.click('button:has-text("카드 섞기")');
    await delay(2000);
    
    console.log('4. Clicking "카드 펼치기" button...');
    await page.click('button:has-text("카드 펼치기")');
    await delay(3000);
    
    console.log('5. Selecting cards from the spread deck...');
    // Now cards should be visible in a row
    // Try to click on the card images directly
    const cardArea = await page.waitForSelector('.flex.overflow-x-auto, [class*="overflow"]', { timeout: 10000 });
    
    // Click on 3 different positions in the card spread
    const boundingBox = await cardArea.boundingBox();
    if (boundingBox) {
      // Click on 3 cards at different positions
      const positions = [0.2, 0.5, 0.8]; // 20%, 50%, 80% of the width
      
      for (let i = 0; i < positions.length; i++) {
        const x = boundingBox.x + (boundingBox.width * positions[i]);
        const y = boundingBox.y + (boundingBox.height * 0.5);
        
        await page.mouse.click(x, y);
        await delay(1500);
        console.log(`✅ Clicked card ${i + 1} at position ${positions[i] * 100}%`);
      }
    }
    
    await page.screenshot({ 
      path: 'screenshots/complete-01-cards-selected.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: complete-01-cards-selected.png');
    
    console.log('\n6. Looking for AI interpretation button...');
    // After selecting 3 cards, look for the AI interpretation button
    const aiButtons = await page.$$('button');
    let aiButton = null;
    
    for (const button of aiButtons) {
      const text = await button.textContent();
      if (text && (text.includes('AI') || text.includes('해석'))) {
        console.log(`Found button with text: "${text}"`);
        const isDisabled = await button.isDisabled();
        if (!isDisabled) {
          aiButton = button;
          break;
        }
      }
    }
    
    if (aiButton) {
      console.log('7. Clicking AI interpretation button...');
      await aiButton.click();
      console.log('✅ Clicked AI interpretation button');
      
      console.log('\n8. Waiting for AI response (monitoring for 60 seconds)...');
      
      // Monitor for longer period
      const startTime = Date.now();
      let foundResponse = false;
      
      while (Date.now() - startTime < 60000 && !foundResponse) {
        // Check for interpretation content
        const interpretationElements = await page.$$('.prose, [class*="interpretation"], [class*="reading-result"]');
        
        for (const element of interpretationElements) {
          const text = await element.textContent();
          if (text && text.length > 100) {
            console.log('\n✅ Found AI interpretation!');
            console.log(`Preview: ${text.substring(0, 200)}...`);
            foundResponse = true;
            break;
          }
        }
        
        // Check for error messages
        const errorElements = await page.$$('.error, .toast-error, [class*="error"]');
        for (const errorEl of errorElements) {
          const errorText = await errorEl.textContent();
          if (errorText) {
            console.log(`\n❌ Error found: ${errorText}`);
          }
        }
        
        if (!foundResponse) {
          await delay(2000);
        }
      }
      
      await page.screenshot({ 
        path: 'screenshots/complete-02-after-ai.png',
        fullPage: true 
      });
      console.log('✅ Screenshot saved: complete-02-after-ai.png');
      
      if (!foundResponse) {
        console.log('\n❌ No AI interpretation found after 60 seconds');
      }
    } else {
      console.log('❌ Could not find AI interpretation button');
    }
    
    // Save all console logs
    await fs.writeFile('complete-console-logs.txt', consoleMessages.join('\n'));
    console.log('\n✅ Console logs saved to complete-console-logs.txt');
    
    // Final screenshot
    await page.screenshot({ 
      path: 'screenshots/complete-03-final.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: complete-03-final.png');
    
    console.log('\n✅ Test completed. Check screenshots and logs for results.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ 
      path: 'screenshots/complete-error.png',
      fullPage: true 
    });
  } finally {
    await delay(10000); // Keep browser open longer
    await browser.close();
  }
}

// Run the test
(async () => {
  try {
    await fs.mkdir('screenshots', { recursive: true });
  } catch (err) {
    // Directory exists
  }
  await testAIComplete();
})();