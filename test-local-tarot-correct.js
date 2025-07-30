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
      if (url.includes('/api/generate-tarot') || url.includes('/api/tarot') || url.includes('/api/debug')) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            const body = await response.text();
            console.log(`\n=== API RESPONSE BODY (${body.length} chars) ===`);
            console.log(body.substring(0, 1000) + (body.length > 1000 ? '...' : ''));
            console.log('=== END API RESPONSE ===\n');
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
          console.log(`\n=== REQUEST BODY ===`);
          console.log(postData.substring(0, 500) + (postData.length > 500 ? '...' : ''));
          console.log('=== END REQUEST BODY ===\n');
        }
      }
    }
  });
  
  try {
    console.log('=== Testing Local Tarot Reading at /tarot ===');
    console.log('Navigating to http://localhost:4000/tarot');
    
    await page.goto('http://localhost:4000/tarot', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait for page to load completely
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'local-tarot-initial.png', fullPage: true });
    console.log('Initial screenshot saved: local-tarot-initial.png');
    
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Look for question input field
    console.log('Looking for question input...');
    
    // Wait for inputs to appear
    await page.waitForTimeout(3000);
    
    // Find all input and textarea elements
    const inputs = await page.locator('input, textarea').all();
    console.log(`Found ${inputs.length} input/textarea elements`);
    
    let questionInput = null;
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const placeholder = await input.getAttribute('placeholder') || '';
      const type = await input.getAttribute('type') || '';
      const isVisible = await input.isVisible();
      
      console.log(`Input ${i}: type="${type}" placeholder="${placeholder}" visible=${isVisible}`);
      
      if (isVisible && (placeholder.includes('질문') || type === 'text' || placeholder.includes('question'))) {
        questionInput = input;
        console.log(`Selected input ${i} as question input`);
        break;
      }
    }
    
    if (questionInput) {
      console.log('Found question input field');
      
      // Enter the question
      console.log('Entering question...');
      await questionInput.fill('삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
      await page.screenshot({ path: 'local-tarot-question.png', fullPage: true });
      
      // Wait for any dynamic content to load
      await page.waitForTimeout(3000);
      
      // Look for spread and style options
      console.log('Looking for spread and style options...');
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons on the page`);
      
      let trinityClicked = false;
      let spiritualClicked = false;
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const text = await button.textContent() || '';
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        
        console.log(`Button ${i}: "${text}" (visible: ${isVisible}, enabled: ${isEnabled})`);
        
        // Click Trinity spread if found
        if (!trinityClicked && text && (text.includes('Trinity') || text.includes('삼위일체') || text.includes('Three')) && isVisible && isEnabled) {
          await button.click();
          console.log(`✅ Clicked Trinity/Three spread button: "${text}"`);
          trinityClicked = true;
          await page.waitForTimeout(1000);
        }
        
        // Click Spiritual style if found
        if (!spiritualClicked && text && (text.includes('Spiritual') || text.includes('영적') || text.includes('Growth')) && isVisible && isEnabled) {
          await button.click();
          console.log(`✅ Clicked Spiritual Growth button: "${text}"`);
          spiritualClicked = true;
          await page.waitForTimeout(1000);
        }
      }
      
      await page.screenshot({ path: 'local-tarot-selections.png', fullPage: true });
      
      // Look for start reading button
      console.log('Looking for start/submit reading button...');
      let startButton = null;
      
      // Refresh button list in case new buttons appeared
      const updatedButtons = await page.locator('button').all();
      
      for (let button of updatedButtons) {
        const text = await button.textContent() || '';
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        
        if (text && (
          text.includes('Start') || 
          text.includes('시작') || 
          text.includes('Draw') || 
          text.includes('Get Reading') ||
          text.includes('Submit') ||
          text.includes('Generate') ||
          text.includes('타로')
        ) && isVisible && isEnabled) {
          startButton = button;
          console.log(`✅ Found start button: "${text}"`);
          break;
        }
      }
      
      // Also check for form submit
      const forms = await page.locator('form').all();
      if (forms.length > 0) {
        console.log(`Found ${forms.length} forms - will try form submission`);
      }
      
      if (startButton) {
        console.log('Clicking start reading button...');
        await startButton.click();
        
        // Wait for reading to process and capture all network activity
        console.log('Waiting for reading to process (capturing all API calls)...');
        await page.waitForTimeout(25000); // Give it plenty of time
        
      } else if (forms.length > 0) {
        console.log('No start button found, trying form submission...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(25000);
        
      } else {
        console.log('❌ Could not find start reading button or form');
        
        // Try clicking any prominent button
        const allButtons = await page.locator('button').all();
        for (let button of allButtons) {
          const text = await button.textContent() || '';
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();
          
          if (isVisible && isEnabled && text.length > 2) {
            console.log(`Trying button: "${text}"`);
            await button.click();
            await page.waitForTimeout(5000);
            break;
          }
        }
      }
      
      // Take screenshot of results
      await page.screenshot({ path: 'local-tarot-final.png', fullPage: true });
      console.log('Final screenshot saved');
      
      // Look for interpretation text
      console.log('Looking for interpretation results...');
      const bodyText = await page.locator('body').textContent();
      
      // Look for various interpretation indicators
      const interpretationSelectors = [
        'text*="해석"',
        'text*="interpretation"', 
        '.interpretation',
        '.result',
        '.reading-result',
        '[data-interpretation]',
        'text*="카드"',
        'text*="의미"',
        'text*="운세"'
      ];
      
      let foundInterpretation = false;
      for (let selector of interpretationSelectors) {
        const elements = await page.locator(selector).all();
        
        for (let elem of elements) {
          const text = await elem.textContent() || '';
          if (text.length > 50) {
            console.log(`\n=== FOUND INTERPRETATION (${text.length} chars) ===`);
            console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
            
            // Check if it's a rich interpretation (>800 chars)
            if (text.length > 800) {
              console.log(`✅ RICH INTERPRETATION DETECTED: ${text.length} characters`);
            } else {
              console.log(`⚠️ SHORT INTERPRETATION: Only ${text.length} characters`);
            }
            foundInterpretation = true;
            break;
          }
        }
        if (foundInterpretation) break;
      }
      
      if (!foundInterpretation) {
        console.log('❌ No clear interpretation found');
        
        // Check for any error messages
        if (bodyText.toLowerCase().includes('error')) {
          console.log('⚠️ Page contains error text');
          const errorParts = bodyText.split(/error/i);
          for (let i = 1; i < Math.min(3, errorParts.length); i++) {
            console.log(`Error context ${i}: ${errorParts[i].substring(0, 200)}...`);
          }
        }
        
        // Log page content summary
        console.log(`\nPage text summary (${bodyText.length} chars total):`);
        console.log(bodyText.substring(0, 800) + '...');
      }
      
    } else {
      console.log('❌ Could not find question input field');
      
      // Log page content for debugging
      const bodyText = await page.locator('body').textContent();
      console.log(`Page content (${bodyText.length} chars): ${bodyText.substring(0, 500)}...`);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'local-tarot-error.png', fullPage: true });
  }
  
  console.log('\n=== DETAILED TEST SUMMARY ===');
  console.log('Local tarot reading test completed at /tarot route.');
  console.log('Check the console logs above for:');
  console.log('- API call details and response bodies');
  console.log('- Interpretation length analysis');
  console.log('- Guideline matching information');
  console.log('- Any error messages or debugging info');
  console.log('Screenshots saved for visual confirmation.');
  
  console.log('\nBrowser will remain open for 90 seconds for manual inspection...');
  await page.waitForTimeout(90000);
  await browser.close();
})();