const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright test for Dream page...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.toString());
  });
  
  try {
    // 1. Navigate directly to dream page
    console.log('1. Navigating directly to /dream...');
    await page.goto('http://localhost:4000/dream', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);
    
    // Take screenshot of direct navigation
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/dream-page-issue.png',
      fullPage: true 
    });
    console.log('Screenshot saved: dream-page-issue.png');
    
    // Check page content
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    const pageUrl = page.url();
    console.log('Current URL:', pageUrl);
    
    // Check for common error elements
    const errorElements = await page.$$('[class*="error"], [class*="Error"], [id*="error"], [id*="Error"]');
    if (errorElements.length > 0) {
      console.log('Found error elements:', errorElements.length);
    }
    
    // 2. Navigate from home page
    console.log('\n2. Navigating from home page...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(1000);
    
    // Look for dream interpretation link/button
    const dreamLinks = await page.$$('a[href*="dream"], button:has-text("dream"), button:has-text("Dream"), a:has-text("dream"), a:has-text("Dream"), a:has-text("꿈"), button:has-text("꿈")');
    console.log('Found dream-related links/buttons:', dreamLinks.length);
    
    if (dreamLinks.length > 0) {
      // Click the first dream link
      await dreamLinks[0].click();
      await page.waitForTimeout(2000);
      
      console.log('Clicked dream link, current URL:', page.url());
    } else {
      console.log('No dream links found on home page');
      
      // Check navigation menu
      const navLinks = await page.$$('nav a, header a, [class*="nav"] a, [class*="menu"] a');
      console.log('Total navigation links found:', navLinks.length);
      
      for (const link of navLinks) {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        if (text) {
          console.log(`Nav link: "${text.trim()}" -> ${href}`);
        }
      }
    }
    
    // Take screenshot of navigation attempt
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/dream-navigation.png',
      fullPage: true 
    });
    console.log('Screenshot saved: dream-navigation.png');
    
    // Report console messages
    if (consoleMessages.length > 0) {
      console.log('\n=== Console Messages ===');
      consoleMessages.forEach(msg => {
        console.log(`${msg.type}: ${msg.text}`);
        if (msg.location && msg.location.url) {
          console.log(`  at ${msg.location.url}:${msg.location.lineNumber}`);
        }
      });
    }
    
    // Report page errors
    if (pageErrors.length > 0) {
      console.log('\n=== Page Errors ===');
      pageErrors.forEach(error => {
        console.log(error);
      });
    }
    
    // Check for 404 or error pages
    const bodyText = await page.textContent('body');
    if (bodyText.includes('404') || bodyText.includes('Not Found') || bodyText.includes('Error')) {
      console.log('\n=== Possible Error Page Detected ===');
      console.log('Body text preview:', bodyText.substring(0, 500));
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed.');
  }
})();