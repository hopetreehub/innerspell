const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable detailed logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`CONSOLE [${type}]: ${text}`);
  });
  
  // Enable network logging with more details
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    // Log all API calls and their responses
    if (url.includes('api/') || status >= 400) {
      console.log(`NETWORK: ${status} ${url}`);
      
      // If it's a tarot API call, log the response body
      if (url.includes('/api/tarot') || url.includes('/api/ai')) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            const body = await response.text();
            console.log(`RESPONSE BODY: ${body.substring(0, 500)}...`);
          }
        } catch (e) {
          console.log(`Could not read response body: ${e.message}`);
        }
      }
    }
  });
  
  // Enable request logging
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api/')) {
      console.log(`REQUEST: ${request.method()} ${url}`);
      
      // Log request body for POST requests
      if (request.method() === 'POST') {
        const postData = request.postData();
        if (postData) {
          console.log(`REQUEST BODY: ${postData.substring(0, 300)}...`);
        }
      }
    }
  });
  
  try {
    console.log('=== Testing Local Tarot Reading Functionality ===');
    console.log('Navigating to http://localhost:4000/tarot-reading');
    
    await page.goto('http://localhost:4000/tarot-reading', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for page to load completely
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'local-initial.png', fullPage: true });
    console.log('Initial screenshot saved: local-initial.png');
    
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Look for question input field
    console.log('Looking for question input...');
    await page.waitForSelector('input, textarea', { timeout: 10000 });
    
    const questionInput = await page.locator('input[type="text"], textarea').first();
    if (await questionInput.count() > 0) {
      console.log('Found question input field');
      
      // Enter the question
      console.log('Entering question...');
      await questionInput.fill('삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
      await page.screenshot({ path: 'local-question-entered.png', fullPage: true });
      
      // Wait for any dynamic content to load
      await page.waitForTimeout(2000);
      
      // Look for spread options
      console.log('Looking for spread and style options...');
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons on the page`);
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        console.log(`Button ${i}: "${text}" (visible: ${isVisible})`);
        
        // Click Trinity spread if found
        if (text && (text.includes('Trinity') || text.includes('삼위일체')) && isVisible) {
          await button.click();
          console.log('Clicked Trinity spread button');
          await page.waitForTimeout(1000);
        }
        
        // Click Spiritual style if found
        if (text && (text.includes('Spiritual') || text.includes('영적')) && isVisible) {
          await button.click();
          console.log('Clicked Spiritual Growth button');
          await page.waitForTimeout(1000);
        }
      }
      
      await page.screenshot({ path: 'local-selections-made.png', fullPage: true });
      
      // Look for start reading button
      console.log('Looking for start reading button...');
      let startButton = null;
      
      for (let button of buttons) {
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        if (text && (text.includes('Start') || text.includes('시작') || text.includes('Draw') || text.includes('Get Reading')) && isVisible) {
          startButton = button;
          console.log(`Found start button: "${text}"`);
          break;
        }
      }
      
      if (startButton) {
        console.log('Clicking start reading button...');
        await startButton.click();
        
        // Wait for reading to process and capture all network activity
        console.log('Waiting for reading to process (capturing all API calls)...');
        await page.waitForTimeout(20000); // Give it plenty of time
        
        // Take screenshot of results
        await page.screenshot({ path: 'local-reading-complete.png', fullPage: true });
        console.log('Reading complete screenshot saved');
        
        // Look for interpretation text
        const interpretationElements = await page.locator('text*="해석", text*="interpretation", .interpretation, .result, .reading-result, [data-interpretation]').all();
        
        if (interpretationElements.length > 0) {
          for (let i = 0; i < interpretationElements.length; i++) {
            const elem = interpretationElements[i];
            const text = await elem.textContent();
            if (text && text.length > 100) {
              console.log(`\n=== INTERPRETATION ${i + 1} (${text.length} chars) ===`);
              console.log(text.substring(0, 400) + '...');
              
              // Check if it's a rich interpretation (>800 chars)
              if (text.length > 800) {
                console.log(`✅ RICH INTERPRETATION DETECTED: ${text.length} characters`);
              } else {
                console.log(`⚠️ SHORT INTERPRETATION: Only ${text.length} characters`);
              }
            }
          }
        } else {
          console.log('❌ No interpretation text found');
          
          // Log all text content on the page for debugging
          const allText = await page.locator('body').textContent();
          console.log(`\nPage contains ${allText.length} characters of text`);
          if (allText.includes('error') || allText.includes('Error')) {
            console.log('Page contains error text');
          }
        }
        
      } else {
        console.log('❌ Could not find start reading button');
      }
      
    } else {
      console.log('❌ Could not find question input field');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'local-error.png', fullPage: true });
  }
  
  console.log('\n=== Test Summary ===');
  console.log('Local tarot reading test completed.');
  console.log('Check the console logs above for API call details and interpretation analysis.');
  console.log('Screenshots saved for visual confirmation.');
  
  console.log('\nBrowser will remain open for 60 seconds for manual inspection...');
  await page.waitForTimeout(60000);
  await browser.close();
})();