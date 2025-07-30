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
    if (!text.includes('Cache Stats') && !text.includes('Font loaded')) {
      console.log(`CONSOLE [${type}]: ${text}`);
    }
  });
  
  // Enable network logging with more details
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    // Log API calls and their responses
    if (url.includes('api/') && !url.includes('analytics')) {
      console.log(`NETWORK: ${status} ${url}`);
      
      // Log response body for tarot-related API calls
      if (url.includes('/api/generate-tarot') || url.includes('/api/tarot') || url.includes('/api/debug')) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            const body = await response.text();
            console.log(`\n=== API RESPONSE (${body.length} chars) ===`);
            console.log(body.substring(0, 1500) + (body.length > 1500 ? '...' : ''));
            console.log('=== END API RESPONSE ===\n');
            
            // Try to parse and extract key info
            try {
              const data = JSON.parse(body);
              if (data.interpretation) {
                console.log(`✅ INTERPRETATION LENGTH: ${data.interpretation.length} characters`);
                if (data.interpretation.length > 800) {
                  console.log(`✅ RICH INTERPRETATION DETECTED!`);
                } else {
                  console.log(`⚠️ SHORT INTERPRETATION WARNING`);
                }
              }
              if (data.guidelines) {
                console.log(`📋 GUIDELINES USED: ${data.guidelines.length} guidelines matched`);
                console.log(`🎯 GUIDELINE DETAILS: ${JSON.stringify(data.guidelines, null, 2)}`);
              }
              if (data.debug) {
                console.log(`🔍 DEBUG INFO: ${JSON.stringify(data.debug, null, 2)}`);
              }
            } catch (e) {
              // Not JSON or parsing failed, continue
            }
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
    if (url.includes('api/') && !url.includes('analytics')) {
      console.log(`REQUEST: ${request.method()} ${url}`);
      
      // Log request body for POST requests
      if (request.method() === 'POST') {
        const postData = request.postData();
        if (postData) {
          console.log(`\n=== REQUEST BODY ===`);
          console.log(postData.substring(0, 800) + (postData.length > 800 ? '...' : ''));
          console.log('=== END REQUEST BODY ===\n');
        }
      }
    }
  });
  
  try {
    console.log('=== Testing Local Tarot Reading at /reading ===');
    console.log('Navigating to http://localhost:4000/reading');
    
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait for page to load completely
    await page.waitForTimeout(8000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'reading-initial.png', fullPage: true });
    console.log('Initial screenshot saved: reading-initial.png');
    
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Look for question input field
    console.log('Looking for question input...');
    
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
      
      if (isVisible && (
        placeholder.includes('질문') || 
        placeholder.includes('question') ||
        placeholder.includes('궁금한') ||
        type === 'text' ||
        input.tagName === 'TEXTAREA'
      )) {
        questionInput = input;
        console.log(`✅ Selected input ${i} as question input`);
        break;
      }
    }
    
    if (questionInput) {
      console.log('Found question input field');
      
      // Enter the question
      console.log('Entering question...');
      await questionInput.fill('삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
      await page.screenshot({ path: 'reading-question.png', fullPage: true });
      
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
        
        if (text.length > 0) {
          console.log(`Button ${i}: "${text}" (visible: ${isVisible}, enabled: ${isEnabled})`);
        }
        
        // Click Trinity spread if found
        if (!trinityClicked && text && (
          text.includes('Trinity') || 
          text.includes('삼위일체') || 
          text.includes('Three') ||
          text.includes('과거') ||
          text.includes('현재') ||
          text.includes('미래')
        ) && isVisible && isEnabled) {
          await button.click();
          console.log(`✅ Clicked Trinity/Three spread button: "${text}"`);
          trinityClicked = true;
          await page.waitForTimeout(1000);
        }
        
        // Click Spiritual style if found
        if (!spiritualClicked && text && (
          text.includes('Spiritual') || 
          text.includes('영적') || 
          text.includes('Growth') ||
          text.includes('성장') ||
          text.includes('영성')
        ) && isVisible && isEnabled) {
          await button.click();
          console.log(`✅ Clicked Spiritual Growth button: "${text}"`);
          spiritualClicked = true;
          await page.waitForTimeout(1000);
        }
      }
      
      await page.screenshot({ path: 'reading-selections.png', fullPage: true });
      
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
          text.includes('타로') ||
          text.includes('카드') ||
          text.includes('해석') ||
          text.includes('뽑기')
        ) && isVisible && isEnabled) {
          startButton = button;
          console.log(`✅ Found start button: "${text}"`);
          break;
        }
      }
      
      if (startButton) {
        console.log('🚀 Clicking start reading button...');
        await startButton.click();
        
        // Wait for reading to process and capture all network activity
        console.log('⏳ Waiting for reading to process (capturing all API calls)...');
        await page.waitForTimeout(30000); // Give it plenty of time
        
      } else {
        console.log('❌ Could not find start reading button');
        console.log('Trying form submission with Enter key...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(30000);
      }
      
      // Take screenshot of results
      await page.screenshot({ path: 'reading-final.png', fullPage: true });
      console.log('Final screenshot saved: reading-final.png');
      
      // Look for interpretation text
      console.log('🔍 Looking for interpretation results...');
      const bodyText = await page.locator('body').textContent();
      
      // Look for various interpretation indicators
      const interpretationSelectors = [
        'text="해석"',
        'text="interpretation"', 
        '.interpretation',
        '.result',
        '.reading-result',
        '[data-interpretation]',
        'text="카드"',
        'text="의미"',
        'text="운세"'
      ];
      
      let foundInterpretation = false;
      for (let selector of interpretationSelectors) {
        try {
          const elements = await page.locator(selector).all();
          
          for (let elem of elements) {
            const text = await elem.textContent() || '';
            if (text.length > 100) {
              console.log(`\n=== FOUND INTERPRETATION (${text.length} chars) ===`);
              console.log(text.substring(0, 600) + (text.length > 600 ? '...' : ''));
              
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
        } catch (e) {
          // Skip invalid selectors
        }
      }
      
      if (!foundInterpretation) {
        console.log('❌ No clear interpretation found');
        
        // Check for any error messages
        if (bodyText.toLowerCase().includes('error')) {
          console.log('⚠️ Page contains error text');
          const errorWords = ['error', 'failed', '실패', '오류', 'exception'];
          for (let word of errorWords) {
            if (bodyText.toLowerCase().includes(word)) {
              const index = bodyText.toLowerCase().indexOf(word);
              const context = bodyText.substring(Math.max(0, index - 100), index + 200);
              console.log(`Error context around "${word}": ${context}`);
            }
          }
        }
        
        // Check for loading states
        if (bodyText.includes('Loading') || bodyText.includes('로딩') || bodyText.includes('처리')) {
          console.log('⏳ Page appears to be in loading state');
        }
        
        // Log page content summary
        console.log(`\nPage text summary (${bodyText.length} chars total):`);
        const preview = bodyText.substring(0, 1000).replace(/\s+/g, ' ').trim();
        console.log(preview + '...');
      }
      
    } else {
      console.log('❌ Could not find question input field');
      
      // Log page content for debugging
      const bodyText = await page.locator('body').textContent();
      console.log(`Page content (${bodyText.length} chars): ${bodyText.substring(0, 600)}...`);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'reading-error.png', fullPage: true });
  }
  
  console.log('\n🎯 === COMPREHENSIVE TEST ANALYSIS ===');
  console.log('Local tarot reading test completed at /reading route.');
  console.log('\n📊 Key findings to check:');
  console.log('1. API call success/failure status');
  console.log('2. Interpretation length (target: >800 chars for rich content)');
  console.log('3. Guideline matching information in API responses');
  console.log('4. Any debugging information from the AI integration');
  console.log('5. Error messages or loading states');
  console.log('\n📸 Screenshots saved:');
  console.log('- reading-initial.png: Initial page load');
  console.log('- reading-question.png: After entering question');
  console.log('- reading-selections.png: After making selections');
  console.log('- reading-final.png: Final results');
  
  console.log('\n⏱️ Browser will remain open for 2 minutes for manual inspection...');
  await page.waitForTimeout(120000);
  await browser.close();
})();