const { chromium } = require('playwright');

(async () => {
  console.log('Starting detailed Dream page navigation test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Collect all network requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()
    });
  });
  
  // Collect all responses
  const responses = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  try {
    // 1. Navigate to home page first
    console.log('1. Navigating to home page...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Take screenshot of home page
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/home-for-dream-nav.png',
      fullPage: true 
    });
    
    // Find all navigation links
    console.log('\n2. Finding all navigation links...');
    const allLinks = await page.$$eval('a', links => 
      links.map(link => ({
        text: link.textContent?.trim() || '',
        href: link.href,
        classList: link.className
      }))
    );
    
    console.log('\nAll links found on page:');
    allLinks.forEach(link => {
      if (link.text && (link.text.toLowerCase().includes('dream') || 
                       link.text.toLowerCase().includes('꿈') || 
                       link.href.includes('dream'))) {
        console.log(`  [DREAM RELATED] "${link.text}" -> ${link.href}`);
      }
    });
    
    // Check header/navbar specifically
    const navbarLinks = await page.$$eval('nav a, header a, [class*="navbar"] a, [class*="navigation"] a', links => 
      links.map(link => ({
        text: link.textContent?.trim() || '',
        href: link.href
      }))
    );
    
    console.log('\nNavbar links:');
    navbarLinks.forEach(link => {
      console.log(`  "${link.text}" -> ${link.href}`);
    });
    
    // 3. Try to find and click dream link
    console.log('\n3. Looking for dream interpretation link...');
    
    // Try multiple selectors
    const dreamSelectors = [
      'a[href*="/dream"]',
      'a:has-text("꿈")',
      'a:has-text("Dream")',
      'a:has-text("dream")',
      'button:has-text("꿈")',
      'button:has-text("Dream")'
    ];
    
    let dreamLink = null;
    for (const selector of dreamSelectors) {
      try {
        dreamLink = await page.$(selector);
        if (dreamLink) {
          const text = await dreamLink.textContent();
          const href = await dreamLink.getAttribute('href');
          console.log(`Found dream link: "${text}" -> ${href}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (dreamLink) {
      // Click the dream link
      await dreamLink.click();
      console.log('Clicked dream link, waiting for navigation...');
      
      // Wait for navigation or timeout
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.waitForTimeout(5000)
      ]);
      
      console.log('Current URL after click:', page.url());
      
      // Take screenshot after navigation
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/dream-after-click.png',
        fullPage: true 
      });
    } else {
      console.log('No dream link found in navigation!');
    }
    
    // 4. Try direct navigation to check if it's a routing issue
    console.log('\n4. Trying direct navigation to /dream-interpretation...');
    const directResponse = await page.goto('http://localhost:4000/dream-interpretation', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('Direct navigation response:', directResponse?.status());
    
    // Check page content
    const pageContent = await page.content();
    if (pageContent.includes('429') || pageContent.includes('Too many requests')) {
      console.log('\n⚠️  429 Error detected - Rate limiting issue!');
      
      // Check if it's a Next.js error page
      const isNextError = await page.$('body > #__next');
      console.log('Is Next.js error page:', !!isNextError);
    }
    
    // Report failed requests
    if (failedRequests.length > 0) {
      console.log('\n=== Failed Requests ===');
      failedRequests.forEach(req => {
        console.log(`${req.url} - ${req.failure?.errorText}`);
      });
    }
    
    // Report error responses
    if (responses.length > 0) {
      console.log('\n=== Error Responses ===');
      responses.forEach(res => {
        console.log(`${res.status} ${res.statusText} - ${res.url}`);
      });
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed.');
  }
})();