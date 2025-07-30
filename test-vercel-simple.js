const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set longer timeout
  page.setDefaultTimeout(60000);

  try {
    console.log('Opening Vercel deployment...');
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    console.log('Taking screenshot of main page...');
    await page.screenshot({ path: 'vercel-main-page.png' });
    
    console.log('Navigating to reading page...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    await page.waitForTimeout(5000);
    console.log('Taking screenshot of reading page...');
    await page.screenshot({ path: 'vercel-reading-page.png', fullPage: true });
    
    // Check page content
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Look for any visible text
    const visibleText = await page.evaluate(() => document.body.innerText);
    console.log('\nVisible text preview:');
    console.log(visibleText.substring(0, 500));
    
    // Check for error messages
    if (visibleText.includes('error') || visibleText.includes('Error')) {
      console.log('\n⚠️  Found error text on page');
    }
    
    // Wait a bit more and take final screenshot
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'vercel-final-state.png', fullPage: true });
    
    console.log('\n✅ Screenshots saved. Please check them manually.');
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'vercel-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();