const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'https://test-studio-firebase.vercel.app';
  
  console.log('=== Vercel Deployment Feature Verification ===\n');
  console.log(`URL: ${baseUrl}\n`);

  try {
    // 1. Main page check
    console.log('1. Checking main page...');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `vercel-main-${Date.now()}.png`,
      fullPage: true 
    });
    
    // 2. Check Tarot Guidelines System
    console.log('\n2. Checking Tarot Guidelines System...');
    await page.goto(`${baseUrl}/tarot`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check if tarot cards are loaded
    const tarotCards = await page.$$('.tarot-card, [class*="card"], [class*="tarot"]');
    console.log(`   - Found ${tarotCards.length} tarot-related elements`);
    
    await page.screenshot({ 
      path: `vercel-tarot-guidelines-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Try to interact with a tarot card
    if (tarotCards.length > 0) {
      await tarotCards[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: `vercel-tarot-card-clicked-${Date.now()}.png`,
        fullPage: true 
      });
      console.log('   - Successfully clicked on a tarot card');
    }
    
    // 3. Check User Tracking System
    console.log('\n3. Checking User Tracking System...');
    
    // Inject tracking simulation
    await page.evaluate(() => {
      // Simulate user activity
      const trackingData = {
        sessionId: 'test-session-' + Date.now(),
        pageViews: ['/tarot', '/blog'],
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('userTrackingData', JSON.stringify(trackingData));
      
      // Trigger any tracking events
      window.dispatchEvent(new Event('pageview'));
      
      // Check for analytics/tracking scripts
      const hasGoogleAnalytics = !!window.gtag || !!window.ga;
      const hasCustomTracking = !!window.trackUserActivity || !!window.analytics;
      
      console.log('Tracking status:', {
        hasGoogleAnalytics,
        hasCustomTracking,
        localStorage: Object.keys(localStorage)
      });
    });
    
    // Check tracking data
    const trackingData = await page.evaluate(() => {
      return {
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage),
        cookies: document.cookie
      };
    });
    
    console.log('   - LocalStorage keys:', trackingData.localStorage);
    console.log('   - SessionStorage keys:', trackingData.sessionStorage);
    console.log('   - Cookies:', trackingData.cookies || 'None');
    
    // 4. Check Admin Panel
    console.log('\n4. Checking Admin Panel...');
    await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const hasLoginForm = await page.$('input[type="email"], input[type="password"], [class*="login"], [class*="signin"]');
    console.log(`   - Admin login form: ${hasLoginForm ? 'Found' : 'Not found'}`);
    
    await page.screenshot({ 
      path: `vercel-admin-panel-${Date.now()}.png`,
      fullPage: true 
    });
    
    // 5. Check Blog System
    console.log('\n5. Checking Blog System...');
    await page.goto(`${baseUrl}/blog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const blogPosts = await page.$$('article, [class*="blog-post"], [class*="post-item"]');
    console.log(`   - Found ${blogPosts.length} blog posts`);
    
    await page.screenshot({ 
      path: `vercel-blog-system-${Date.now()}.png`,
      fullPage: true 
    });
    
    // 6. Network Activity Check
    console.log('\n6. Monitoring network activity...');
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('api') || request.url().includes('track')) {
        requests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    // Navigate around to trigger tracking
    await page.goto(`${baseUrl}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.goto(`${baseUrl}/tarot`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    console.log('   - API/Tracking requests:', requests.length);
    requests.slice(0, 5).forEach(req => {
      console.log(`     • ${req.method} ${req.url}`);
    });
    
    console.log('\n=== Verification Complete ===');
    
  } catch (error) {
    console.error('Error during verification:', error.message);
  } finally {
    await browser.close();
  }
})();