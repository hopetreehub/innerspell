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
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    if (url.includes('innerspell') || url.includes('api/') || status >= 400) {
      console.log(`NETWORK: ${status} ${url}`);
    }
  });
  
  // Enable request logging
  page.on('request', request => {
    const url = request.url();
    if (url.includes('innerspell') && url.includes('api/')) {
      console.log(`REQUEST: ${request.method()} ${url}`);
    }
  });
  
  try {
    console.log('=== Testing Fresh Vercel Deployment ===');
    console.log('Navigating to https://innerspell.vercel.app/tarot-reading');
    
    await page.goto('https://innerspell.vercel.app/tarot-reading', { 
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Wait for page to load completely
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'fresh-deployment-initial.png', fullPage: true });
    console.log('Initial screenshot saved: fresh-deployment-initial.png');
    
    // Check if we're on a login page or if the app loaded
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    const bodyText = await page.locator('body').textContent();
    const isLoginPage = bodyText.includes('Log in') || bodyText.includes('Sign in') || bodyText.includes('Login');
    console.log(`Is login page: ${isLoginPage}`);
    
    if (isLoginPage) {
      console.log('Still redirected to login page. Deployment may need more time or has authentication restrictions.');
      await browser.close();
      return;
    }
    
    console.log('App appears to be accessible! Proceeding with tarot reading test...');
    
    // Look for question input field
    const questionSelectors = [
      'input[placeholder*="질문"]',
      'textarea[placeholder*="질문"]', 
      'input[type="text"]',
      'textarea',
      '[data-testid="question-input"]',
      '.question-input'
    ];
    
    let questionInput = null;
    for (let selector of questionSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        questionInput = element.first();
        console.log(`Found question input with selector: ${selector}`);
        break;
      }
    }
    
    if (questionInput) {
      // Enter the question
      console.log('Entering question...');
      await questionInput.fill('삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
      await page.screenshot({ path: 'question-entered.png', fullPage: true });
      
      // Look for Trinity spread option
      console.log('Looking for Trinity spread...');
      const trinitySelectors = [
        'text="Trinity"', 
        'text="삼위일체"',
        '[data-spread*="trinity"]',
        'button:has-text("Trinity")',
        '.spread-option:has-text("Trinity")'
      ];
      
      for (let selector of trinitySelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await element.first().click();
          console.log(`Selected Trinity spread with selector: ${selector}`);
          break;
        }
      }
      
      // Look for Spiritual Growth style
      console.log('Looking for Spiritual Growth style...');
      const spiritualSelectors = [
        'text="Spiritual"',
        'text="영적"',
        '[data-style*="spiritual"]',
        'button:has-text("Spiritual")',
        '.style-option:has-text("Spiritual")'
      ];
      
      for (let selector of spiritualSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await element.first().click();
          console.log(`Selected Spiritual Growth with selector: ${selector}`);
          break;
        }
      }
      
      await page.screenshot({ path: 'selections-made.png', fullPage: true });
      
      // Look for start reading button
      console.log('Looking for reading button...');
      const buttonSelectors = [
        'button:has-text("Start")',
        'button:has-text("시작")',
        'button:has-text("Draw")',
        'button:has-text("카드")',
        '[type="submit"]',
        '.start-reading',
        '.draw-cards'
      ];
      
      for (let selector of buttonSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          console.log(`Clicking reading button with selector: ${selector}`);
          await element.first().click();
          break;
        }
      }
      
      // Wait for reading to process
      console.log('Waiting for reading to process...');
      await page.waitForTimeout(15000);
      
      // Take final screenshot
      await page.screenshot({ path: 'reading-complete.png', fullPage: true });
      console.log('Reading complete screenshot saved');
      
      // Check for interpretation
      const interpretationSelectors = [
        '.interpretation',
        '[data-interpretation]',
        'text*="해석"',
        'text*="interpretation"',
        '.result',
        '.reading-result'
      ];
      
      for (let selector of interpretationSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          const text = await element.first().textContent();
          console.log(`Found interpretation (${text.length} chars): ${text.substring(0, 200)}...`);
          break;
        }
      }
      
    } else {
      console.log('Could not find question input field');
      
      // Log all visible elements for debugging
      const allInputs = await page.locator('input, textarea, button').all();
      console.log(`Found ${allInputs.length} input/button elements`);
      for (let i = 0; i < Math.min(10, allInputs.length); i++) {
        const elem = allInputs[i];
        const tagName = await elem.evaluate(el => el.tagName);
        const placeholder = await elem.getAttribute('placeholder') || '';
        const text = await elem.textContent() || '';
        console.log(`Element ${i}: ${tagName} placeholder="${placeholder}" text="${text.substring(0, 50)}"`);
      }
    }
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error-fresh-deployment.png', fullPage: true });
  }
  
  console.log('Test completed. Browser will remain open for 30 seconds for inspection.');
  await page.waitForTimeout(30000);
  await browser.close();
})();