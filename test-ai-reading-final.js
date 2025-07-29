const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAIReadingFinal() {
  console.log('Starting Final AI Reading test...');
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
    
    // Highlight important messages
    if (text.includes('API') || text.includes('error') || text.includes('Error') || 
        text.includes('openai') || text.includes('gemini') || text.includes('AI') ||
        text.includes('해석') || text.includes('interpretation')) {
      console.log(`🔴 ${entry}`);
    } else if (msg.type() === 'error') {
      console.log(`❌ ${entry}`);
    }
  });
  
  // Enable network monitoring
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('gemini') || 
        request.url().includes('openai') || request.url().includes('ai')) {
      console.log(`📤 API Request: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('api') || response.url().includes('gemini') || 
        response.url().includes('openai') || response.url().includes('ai')) {
      console.log(`📥 API Response: ${response.status()} ${response.url()}`);
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
    await delay(1000);
    
    console.log('3. Clicking "카드 섞기" button...');
    const shuffleButton = await page.waitForSelector('button:has-text("카드 섞기")', { timeout: 10000 });
    await shuffleButton.click();
    await delay(2000);
    
    console.log('4. Clicking "카드 펼치기" button...');
    const spreadButton = await page.waitForSelector('button:has-text("카드 펼치기")', { timeout: 10000 });
    await spreadButton.click();
    await delay(3000);
    
    console.log('5. Selecting cards directly from the card images...');
    // Wait for card container to be visible
    await page.waitForSelector('.grid, [class*="grid"], .card-grid', { timeout: 10000 });
    
    // Find card images
    const cardImages = await page.$$('img[alt*="Card"], img[src*="card"], .card-image img, img[class*="card"]');
    console.log(`Found ${cardImages.length} card images`);
    
    if (cardImages.length >= 3) {
      // Click the first 3 cards
      for (let i = 0; i < 3; i++) {
        await cardImages[i].click();
        await delay(1500);
        console.log(`✅ Clicked card ${i + 1}`);
      }
    } else {
      console.log('❌ Not enough card images found');
    }
    
    await delay(2000);
    await page.screenshot({ 
      path: 'screenshots/final-01-cards-selected.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: final-01-cards-selected.png');
    
    console.log('\n6. Looking for interpretation button...');
    // The button might have changed text after selection
    const interpretButtonSelectors = [
      'button:has-text("해석 중")',
      'button:has-text("해석")',
      'button:has-text("AI")',
      'button[disabled]', // It might be disabled while processing
      'button.loading'
    ];
    
    let interpretButton = null;
    for (const selector of interpretButtonSelectors) {
      try {
        interpretButton = await page.$(selector);
        if (interpretButton) {
          const text = await interpretButton.textContent();
          console.log(`Found button: "${text}"`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (interpretButton) {
      const isDisabled = await interpretButton.isDisabled();
      console.log(`Button disabled state: ${isDisabled}`);
      
      if (!isDisabled) {
        console.log('7. Clicking interpretation button...');
        await interpretButton.click();
      } else {
        console.log('7. Button is already processing (disabled)...');
      }
      
      console.log('\n8. Waiting for AI interpretation (30 seconds)...');
      console.log('Monitoring console and network activity...\n');
      
      // Wait and collect logs
      await delay(30000);
      
      await page.screenshot({ 
        path: 'screenshots/final-02-after-interpretation.png',
        fullPage: true 
      });
      console.log('\n✅ Screenshot saved: final-02-after-interpretation.png');
      
      // Check for any error toasts or messages
      const errorElements = await page.$$('.toast-error, .error-message, [class*="error"]');
      if (errorElements.length > 0) {
        console.log('\n❌ Error elements found on page:');
        for (const errorEl of errorElements) {
          const text = await errorEl.textContent();
          console.log(`Error: ${text}`);
        }
      }
      
      // Look for interpretation result
      console.log('\n9. Checking for interpretation result...');
      const pageContent = await page.content();
      if (pageContent.includes('해석') || pageContent.includes('interpretation')) {
        console.log('✅ Found interpretation-related content on page');
      }
      
      // Check if still loading
      const loadingElements = await page.$$('.loading, .spinner, [class*="loading"]');
      if (loadingElements.length > 0) {
        console.log('⏳ Page still shows loading indicators');
      }
    }
    
    // Save console logs
    console.log('\n10. Saving console logs...');
    await fs.writeFile('console-logs.txt', consoleMessages.join('\n'));
    console.log('✅ Console logs saved to console-logs.txt');
    
    // Final screenshot
    await delay(5000);
    await page.screenshot({ 
      path: 'screenshots/final-03-final-state.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: final-03-final-state.png');
    
    console.log('\n✅ Test completed. Check screenshots and console-logs.txt for detailed information.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ 
      path: 'screenshots/final-error-state.png',
      fullPage: true 
    });
  } finally {
    await delay(5000); // Keep browser open
    await browser.close();
  }
}

// Run the test
(async () => {
  try {
    await fs.mkdir('screenshots', { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
  await testAIReadingFinal();
})();