const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'reading-page-initial.png', fullPage: true });
    
    // Try to fill the question
    console.log('Looking for question textarea...');
    const textarea = await page.$('textarea#question');
    if (textarea) {
      console.log('Found textarea, filling question...');
      await textarea.fill('Test question for card spacing');
    } else {
      console.log('Textarea not found');
    }
    
    // Take screenshot after filling
    await page.screenshot({ path: 'reading-page-after-question.png', fullPage: true });
    
    // Check for spread selector
    console.log('Looking for spread selector...');
    const spreadSelector = await page.$('#spread-type');
    if (spreadSelector) {
      console.log('Found spread selector, clicking...');
      await spreadSelector.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'reading-page-spread-open.png', fullPage: true });
    } else {
      console.log('Spread selector not found');
    }
    
    // Look for any deck or card elements
    console.log('Looking for deck elements...');
    const deckElements = await page.$$('.deck-container, .deck, [class*="deck"], [class*="card"]');
    console.log(`Found ${deckElements.length} deck/card related elements`);
    
    // Log all visible text on the page
    const pageText = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log('\nPage text content:');
    console.log(pageText.substring(0, 500) + '...');
    
    // Check page structure
    const pageStructure = await page.evaluate(() => {
      const structure = {
        hasQuestion: !!document.querySelector('textarea#question'),
        hasSpreadSelector: !!document.querySelector('#spread-type'),
        hasDeckContainer: !!document.querySelector('.deck-container'),
        hasCards: !!document.querySelector('.card-wrapper'),
        visibleElements: []
      };
      
      // Find main visible elements
      const elements = document.querySelectorAll('div, button, textarea, select');
      elements.forEach(el => {
        if (el.offsetHeight > 0 && el.offsetWidth > 0) {
          const text = el.textContent?.trim().substring(0, 50);
          if (text && text.length > 3) {
            structure.visibleElements.push({
              tag: el.tagName,
              class: el.className.substring(0, 50),
              text: text
            });
          }
        }
      });
      
      return structure;
    });
    
    console.log('\nPage structure:', JSON.stringify(pageStructure, null, 2));
    
    console.log('\nBrowser will remain open for inspection...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'reading-page-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();