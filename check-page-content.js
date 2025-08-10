const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const page = await browser.newPage();

  try {
    console.log('Navigating to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Take screenshot of current state
    await page.screenshot({ 
      path: 'reading-page-state.png',
      fullPage: true 
    });
    console.log('Screenshot saved: reading-page-state.png');

    // Get page content
    const title = await page.title();
    console.log('Page title:', title);

    // Check for any error messages
    const bodyText = await page.locator('body').textContent();
    console.log('\nPage content preview:', bodyText.substring(0, 500));

    // Look for specific elements
    const elements = {
      'textarea': await page.locator('textarea').count(),
      'input': await page.locator('input').count(),
      'button': await page.locator('button').count(),
      '.card-back': await page.locator('.card-back').count(),
      '.spread-selector': await page.locator('.spread-selector').count()
    };

    console.log('\nElement counts:', elements);

    // Try to find question input by different selectors
    const possibleSelectors = [
      'textarea',
      'input[type="text"]',
      '[placeholder*="질문"]',
      '.question-input',
      '#question'
    ];

    console.log('\nSearching for question input...');
    for (const selector of possibleSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`Found ${count} elements with selector: ${selector}`);
        const el = page.locator(selector).first();
        const attrs = await el.evaluate(e => ({
          tagName: e.tagName,
          placeholder: e.placeholder,
          type: e.type,
          class: e.className,
          id: e.id
        }));
        console.log('  Attributes:', attrs);
      }
    }

    console.log('\nPage will remain open for inspection...');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();