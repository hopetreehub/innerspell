const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.type(), msg.text());
  });
  
  try {
    console.log('Navigating to reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle0' });
    
    console.log('Page loaded, taking screenshot...');
    await page.screenshot({ path: 'reading-page-debug.png', fullPage: true });
    
    // Check for buttons
    const buttons = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      return allButtons.map(btn => ({
        text: btn.textContent.trim(),
        ariaLabel: btn.getAttribute('aria-label'),
        disabled: btn.disabled,
        id: btn.id,
        className: btn.className
      }));
    });
    
    console.log('Found buttons:', JSON.stringify(buttons, null, 2));
    
    // Check for any error messages in the page
    const errorMessages = await page.evaluate(() => {
      const errors = Array.from(document.querySelectorAll('[role="alert"], .error, .text-red-500, .text-destructive'));
      return errors.map(el => el.textContent.trim()).filter(text => text.length > 0);
    });
    
    console.log('Error messages:', errorMessages);
    
    // Check for card-related elements
    const cardElements = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-nimg], img[alt*="카드"], [class*="card"]'));
      return cards.length;
    });
    
    console.log(`Found ${cardElements} card-related elements`);
    
    console.log('Debug complete. Check reading-page-debug.png');
    
  } catch (error) {
    console.error('Error during debugging:', error);
  }
  
  await browser.close();
})();