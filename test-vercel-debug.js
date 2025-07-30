const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log(`CONSOLE: ${msg.type()}: ${msg.text()}`));
  
  // Enable network logging
  page.on('response', response => {
    if (response.url().includes('api/') || response.url().includes('tarot')) {
      console.log(`NETWORK: ${response.status()} ${response.url()}`);
    }
  });
  
  // Navigate to the Vercel deployment
  console.log('Navigating to https://innerspell.vercel.app/tarot-reading');
  await page.goto('https://innerspell.vercel.app/tarot-reading');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'initial-load.png', fullPage: true });
  console.log('Initial screenshot taken: initial-load.png');
  
  try {
    // Enter the question
    console.log('Entering question...');
    const questionInput = await page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"], input[type="text"]').first();
    await questionInput.fill('삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
    
    // Take screenshot after entering question
    await page.screenshot({ path: 'question-entered.png', fullPage: true });
    console.log('Question entered screenshot: question-entered.png');
    
    // Select Trinity View spread
    console.log('Looking for Trinity spread option...');
    const trinitySpread = await page.locator('text*="Trinity", text*="삼위일체", [data-spread*="trinity"], button:has-text("Trinity")').first();
    if (await trinitySpread.count() > 0) {
      await trinitySpread.click();
      console.log('Trinity spread selected');
    } else {
      console.log('Trinity spread not found, looking for available spreads...');
      const spreads = await page.locator('button, [role="button"]').all();
      for (let spread of spreads) {
        const text = await spread.textContent();
        console.log(`Available spread option: ${text}`);
      }
    }
    
    // Select Spiritual Growth style
    console.log('Looking for Spiritual Growth style...');
    const spiritualStyle = await page.locator('text*="Spiritual", text*="영적", [data-style*="spiritual"], button:has-text("Spiritual")').first();
    if (await spiritualStyle.count() > 0) {
      await spiritualStyle.click();
      console.log('Spiritual Growth style selected');
    } else {
      console.log('Spiritual Growth style not found, looking for available styles...');
      const styles = await page.locator('button, [role="button"]').all();
      for (let style of styles) {
        const text = await style.textContent();
        console.log(`Available style option: ${text}`);
      }
    }
    
    // Take screenshot after selections
    await page.screenshot({ path: 'selections-made.png', fullPage: true });
    console.log('Selections made screenshot: selections-made.png');
    
    // Look for and click the reading/draw cards button
    console.log('Looking for reading button...');
    const readingButton = await page.locator('button:has-text("Start"), button:has-text("Draw"), button:has-text("시작"), button:has-text("카드"), [type="submit"]').first();
    if (await readingButton.count() > 0) {
      console.log('Clicking reading button...');
      await readingButton.click();
      
      // Wait for the reading to process
      console.log('Waiting for reading to process...');
      await page.waitForTimeout(10000);
      
      // Take screenshot of results
      await page.screenshot({ path: 'reading-results.png', fullPage: true });
      console.log('Reading results screenshot: reading-results.png');
      
      // Check for interpretation text
      const interpretation = await page.locator('text*="해석", text*="interpretation", "[data-interpretation]", ".interpretation"').first();
      if (await interpretation.count() > 0) {
        const text = await interpretation.textContent();
        console.log(`Interpretation length: ${text.length} characters`);
        console.log(`Interpretation preview: ${text.substring(0, 200)}...`);
      } else {
        console.log('No interpretation text found');
      }
      
    } else {
      console.log('Reading button not found');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  }
  
  console.log('Test completed. Browser will remain open for manual inspection.');
  console.log('Press Ctrl+C to close the browser.');
  
  // Keep browser open for manual inspection
  await page.waitForTimeout(60000);
  
  await browser.close();
})();