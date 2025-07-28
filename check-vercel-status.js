const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Checking Vercel deployment status...');
  
  try {
    // Try the main URL
    console.log('Attempting to load: https://test-studio-firebase.vercel.app');
    const response = await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('Response status:', response.status());
    
    // Take screenshot
    await page.screenshot({ 
      path: `vercel-status-${new Date().toISOString().replace(/:/g, '-')}.png`,
      fullPage: true
    });
    
    // Check for error messages
    const bodyText = await page.textContent('body');
    console.log('Page content preview:', bodyText.substring(0, 500));
    
    // Check for specific error elements
    const errorMessage = await page.$eval('body', el => {
      // Look for common error indicators
      const h1 = el.querySelector('h1');
      const preError = el.querySelector('pre');
      const errorDiv = el.querySelector('[class*="error"], [id*="error"]');
      
      if (h1 && h1.textContent.includes('500')) return '500 Error: ' + el.textContent;
      if (preError) return 'Error details: ' + preError.textContent;
      if (errorDiv) return 'Error found: ' + errorDiv.textContent;
      
      return null;
    }).catch(() => null);
    
    if (errorMessage) {
      console.log('Error detected:', errorMessage);
    }
    
  } catch (error) {
    console.error('Error loading page:', error.message);
    
    // Try to capture whatever is on screen
    await page.screenshot({ 
      path: `vercel-error-${new Date().toISOString().replace(/:/g, '-')}.png`,
      fullPage: true
    });
  }
  
  // Keep browser open for manual inspection
  console.log('Browser will remain open for 30 seconds for inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  await browser.close();
})();