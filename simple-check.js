const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'reading-page-check.png', fullPage: false });
    
    console.log('Checking page elements...');
    const question = await page.$('textarea#question');
    const spreadButton = await page.$('button#spread-type');
    
    console.log('Question field:', question ? 'Found' : 'Not found');
    console.log('Spread button:', spreadButton ? 'Found' : 'Not found');
    
    if (spreadButton) {
      console.log('Clicking spread button...');
      await spreadButton.click();
      await page.waitForTimeout(1000);
      
      // Take another screenshot after clicking
      await page.screenshot({ path: 'after-spread-click.png', fullPage: false });
      
      // Check dropdown options
      const options = await page.$$('[role="option"]');
      console.log(`Found ${options.length} dropdown options`);
      
      for (let i = 0; i < Math.min(3, options.length); i++) {
        const text = await options[i].textContent();
        console.log(`Option ${i + 1}: ${text}`);
      }
    }
    
    console.log('Browser will stay open for 30 seconds...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();