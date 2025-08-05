const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = `${msg.type()}: ${msg.text()}`;
    consoleLogs.push(logEntry);
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });
  
  console.log('Opening tarot card detail page...');
  
  try {
    // Navigate to the tarot card detail page with increased timeout
    await page.goto('http://localhost:4000/tarot/major-21-world', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Clear cache by reloading with cache disabled
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Check for any errors in console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'tarot-detail-test.png', fullPage: true });
    console.log('Screenshot saved as tarot-detail-test.png');
    
    // Check if keywords section exists
    const keywordsSection = await page.locator('text=/keywords/i').count();
    console.log('Keywords section found:', keywordsSection > 0);
    
    // Check for the card title
    const title = await page.locator('h1').textContent();
    console.log('Card title:', title);
    
    // Check for upright/reversed toggle
    const toggleButtons = await page.locator('button:has-text("Upright"), button:has-text("Reversed")').count();
    console.log('Toggle buttons found:', toggleButtons);
    
    // Print all console logs
    console.log('\nAll console logs:');
    consoleLogs.forEach(log => console.log(log));
    
    // Wait a bit to observe
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'tarot-detail-error.png', fullPage: true });
  }
  
  await browser.close();
})();