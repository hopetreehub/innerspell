const { chromium } = require('playwright');

async function simpleCheck() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Simple check of localhost:4000...');
    
    // Just try to load the page and see what happens
    await page.goto('http://localhost:4000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Take screenshot to see what's happening
    await page.screenshot({ path: 'screenshots/simple-check-result.png', fullPage: true });
    
    // Check for any visible text content
    const bodyText = await page.textContent('body');
    console.log('Body content preview:', bodyText ? bodyText.substring(0, 200) + '...' : 'No content');
    
  } catch (error) {
    console.error('Error:', error.message);
    // Take error screenshot
    await page.screenshot({ path: 'screenshots/simple-check-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

simpleCheck();