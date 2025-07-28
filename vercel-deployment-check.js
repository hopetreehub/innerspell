const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Common Vercel deployment URL patterns
  const urls = [
    'https://innerspell.vercel.app',
    'https://test-studio-firebase.vercel.app',
    'https://innerspell-an7ce.vercel.app'
  ];

  console.log('Testing Vercel deployment URLs...\n');

  for (const url of urls) {
    console.log(`Testing: ${url}`);
    try {
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      if (response && response.ok()) {
        console.log(`✓ Success! Found deployment at: ${url}`);
        console.log(`  Status: ${response.status()}`);
        
        // Take screenshot
        await page.screenshot({ 
          path: `vercel-deployment-${Date.now()}.png`,
          fullPage: true 
        });
        
        // Check for tarot guidelines system
        const hasTarotGuidelines = await page.evaluate(() => {
          const text = document.body.innerText.toLowerCase();
          return text.includes('타로') || text.includes('tarot') || text.includes('지침');
        });
        
        console.log(`  Tarot Guidelines System: ${hasTarotGuidelines ? 'Found' : 'Not visible'}`);
        
        // Check for user tracking system
        const hasUserTracking = await page.evaluate(() => {
          // Check localStorage for tracking data
          const trackingData = localStorage.getItem('userTrackingData');
          const sessionData = localStorage.getItem('sessionData');
          return !!(trackingData || sessionData);
        });
        
        console.log(`  User Tracking System: ${hasUserTracking ? 'Active' : 'Not detected'}`);
        
        // Navigate to specific pages to check functionality
        const pagesToCheck = ['/tarot', '/blog', '/admin'];
        
        for (const pageUrl of pagesToCheck) {
          try {
            console.log(`\n  Checking ${pageUrl}...`);
            await page.goto(url + pageUrl, { 
              waitUntil: 'networkidle',
              timeout: 15000 
            });
            
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
              path: `vercel-${pageUrl.replace('/', '')}-${Date.now()}.png`,
              fullPage: true 
            });
            
            console.log(`  ✓ ${pageUrl} page loaded successfully`);
          } catch (pageError) {
            console.log(`  ✗ ${pageUrl} page error: ${pageError.message}`);
          }
        }
        
        break; // Found working URL, exit loop
      }
    } catch (error) {
      console.log(`✗ Failed: ${error.message}\n`);
    }
  }

  await browser.close();
})();