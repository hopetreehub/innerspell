const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Hard reload with cache bypass...');
    await page.goto('http://localhost:4000/tarot/major-00-fool', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Force reload with cache bypass
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('R');
    await page.keyboard.up('Shift');
    await page.keyboard.up('Control');
    
    await page.waitForTimeout(5000);
    
    // Check the actual rendered HTML
    const renderedHTML = await page.evaluate(() => {
      const mainContainer = document.querySelector('img[alt="바보"]')?.parentElement;
      return {
        containerClass: mainContainer?.className || 'Not found',
        containerHTML: mainContainer?.outerHTML.substring(0, 200) || 'Not found',
        allAspectContainers: Array.from(document.querySelectorAll('[class*="aspect-"]')).map(el => ({
          class: el.className,
          tag: el.tagName
        }))
      };
    });
    
    console.log('Rendered HTML Check:');
    console.log(JSON.stringify(renderedHTML, null, 2));
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tarot-image-ratio-issue.png',
      fullPage: false 
    });
    
    // Also check if dev server shows any errors
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    if (consoleMessages.length > 0) {
      console.log('\nConsole messages:');
      consoleMessages.forEach(msg => console.log(msg));
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
  }
})();