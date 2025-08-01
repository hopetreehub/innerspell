const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture all console messages and errors
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    console.log(`[${msg.type().toUpperCase()}]`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
    consoleLogs.push({ type: 'pageerror', text: error.message });
  });
  
  page.on('requestfailed', request => {
    console.log('FAILED REQUEST:', request.url(), request.failure()?.errorText);
    consoleLogs.push({ type: 'requestfailed', text: `${request.url()} - ${request.failure()?.errorText}` });
  });
  
  try {
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle0' });
    
    // Wait a bit more for any async operations
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check React component state
    const componentInfo = await page.evaluate(() => {
      // Check if React is loaded
      const reactExists = typeof window.React !== 'undefined';
      
      // Look for the main content container
      const mainContainer = document.querySelector('main');
      const cardElements = mainContainer ? mainContainer.innerHTML.length : 0;
      
      // Check for specific tarot-related elements
      const tarotCards = document.querySelectorAll('[class*="card"], [aria-label*="카드"]');
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => btn.textContent.trim());
      
      // Check for any error boundaries or error messages
      const errorElements = Array.from(document.querySelectorAll('[role="alert"], .error')).map(el => el.textContent);
      
      return {
        reactExists,
        cardElements,
        tarotCardCount: tarotCards.length,
        buttonTexts: buttons,
        errorElements,
        pageTitle: document.title,
        bodyClasses: document.body.className
      };
    });
    
    console.log('\nComponent Analysis:', JSON.stringify(componentInfo, null, 2));
    console.log('\nAll Console Logs:', JSON.stringify(consoleLogs, null, 2));
    
  } catch (error) {
    console.error('Error during analysis:', error);
  }
  
  await browser.close();
})();