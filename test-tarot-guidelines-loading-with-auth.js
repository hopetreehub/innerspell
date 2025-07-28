const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testTarotGuidelinesLoadingWithAuth() {
  console.log('Starting Tarot Guidelines Loading Test with Authentication...');
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`[Browser Console - ${msg.type()}]: ${msg.text()}`);
  });
  
  // Track network requests related to tarot/guidelines
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('tarot') || 
        request.url().includes('guideline') || 
        request.url().includes('firestore') ||
        request.url().includes('admin')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('tarot') || 
        response.url().includes('guideline') || 
        response.url().includes('firestore')) {
      console.log(`[Network Response]: ${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    // Navigate to home page first
    console.log('\n1. Navigating to home page...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-00-homepage.png',
      fullPage: true 
    });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Try to login as admin
    console.log('\n2. Attempting admin login...');
    
    // Look for login button in navbar
    const loginButton = await page.waitForSelector('button:has-text("로그인")', { 
      timeout: 10000,
      state: 'visible' 
    });
    
    await loginButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-01-login-clicked.png',
      fullPage: true 
    });
    
    // Check if we're redirected to Google sign-in or if there's a direct admin option
    const currentUrl = page.url();
    console.log(`Current URL after login click: ${currentUrl}`);
    
    if (currentUrl.includes('accounts.google.com')) {
      console.log('❌ Google OAuth required - cannot proceed with automated test');
      console.log('Manual steps needed:');
      console.log('1. Login manually with Google account');
      console.log('2. Make sure the account has admin privileges');
      console.log('3. Navigate to /admin page');
      
      // Keep browser open for manual intervention
      console.log('\n⏸️  Pausing for 30 seconds for manual login...');
      await page.waitForTimeout(30000);
      
      // Try to navigate to admin after manual login
      console.log('\n3. Attempting to navigate to admin page after manual login...');
      await page.goto('https://test-studio-firebase.vercel.app/admin', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
    }
    
    // Check if we're now on admin page
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-02-after-auth-attempt.png',
      fullPage: true 
    });
    
    // Look for admin tabs
    const adminTabsVisible = await page.isVisible('button:has-text("타로 해석 지침 관리")');
    
    if (!adminTabsVisible) {
      console.log('❌ Admin tabs not visible. Checking page content...');
      
      // Check if there's an admin login button on the page
      const adminLoginBtn = await page.isVisible('button:has-text("관리자 로그인")');
      if (adminLoginBtn) {
        console.log('🔐 Found admin login button, clicking...');
        await page.click('button:has-text("관리자 로그인")');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'screenshots/tarot-loading-03-admin-login-clicked.png',
          fullPage: true 
        });
      }
      
      // Wait for admin tabs to appear
      await page.waitForSelector('button:has-text("타로 해석 지침 관리")', { 
        timeout: 15000,
        state: 'visible' 
      });
    }
    
    console.log('\n4. Admin tabs are now visible!');
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-04-admin-tabs-visible.png',
      fullPage: true 
    });
    
    // Clear console to track only tarot-related logs
    await page.evaluate(() => console.clear());
    
    // Record start time for tab click
    const startTime = Date.now();
    console.log(`\n5. Clicking "타로 해석 지침 관리" tab at ${new Date(startTime).toISOString()}`);
    
    // Click the tarot guidelines tab
    await page.click('button:has-text("타로 해석 지침 관리")');
    
    // Wait for loading to start
    await page.waitForTimeout(200);
    
    // Take screenshot during loading
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-05-tab-clicked.png',
      fullPage: true 
    });
    
    // Wait for content to load - try multiple selectors
    console.log('\n6. Waiting for guidelines content to load...');
    
    try {
      // Wait for any indication that guidelines are loading or loaded
      await Promise.race([
        page.waitForSelector('text=/타로 카드 해석 지침/', { timeout: 20000 }),
        page.waitForSelector('div:has-text("메이저 아르카나")', { timeout: 20000 }),
        page.waitForSelector('div:has-text("카드별 해석")', { timeout: 20000 }),
        page.waitForSelector('.guidelines-content', { timeout: 20000 }),
        page.waitForSelector('[class*="guideline"]', { timeout: 20000 }),
        // Also wait for any loading indicators to disappear
        page.waitForFunction(() => {
          const loadingElements = document.querySelectorAll('.loading, .spinner, [class*="loading"]');
          return loadingElements.length === 0;
        }, { timeout: 20000 })
      ]);
      
      const endTime = Date.now();
      const loadingTime = endTime - startTime;
      
      console.log(`\n✅ Guidelines loaded in ${loadingTime}ms (${(loadingTime/1000).toFixed(2)} seconds)`);
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'screenshots/tarot-loading-06-content-loaded.png',
        fullPage: true 
      });
      
      // Wait a bit more to capture any delayed content
      await page.waitForTimeout(3000);
      
      // Take final state screenshot
      await page.screenshot({ 
        path: 'screenshots/tarot-loading-07-final-state.png',
        fullPage: true 
      });
      
      // Check page content
      const pageContent = await page.textContent('body');
      const hasGuidelineContent = pageContent.includes('타로') || 
                                 pageContent.includes('메이저') || 
                                 pageContent.includes('카드');
      
      console.log(`Content includes tarot-related text: ${hasGuidelineContent}`);
      
      // Get performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        const relevantEntries = entries.filter(e => 
          e.name.includes('tarot') || 
          e.name.includes('guideline') ||
          e.name.includes('firestore') ||
          e.name.includes('admin')
        );
        
        return relevantEntries.map(e => ({
          name: e.name.split('/').slice(-2).join('/'),
          duration: Math.round(e.duration),
          size: e.transferSize || 0
        }));
      });
      
      // Generate report
      const report = {
        testTime: new Date().toISOString(),
        loadingTime: loadingTime,
        loadingTimeSeconds: (loadingTime/1000).toFixed(2),
        networkRequests: networkRequests.length,
        performanceMetrics: performanceMetrics,
        hasGuidelineContent: hasGuidelineContent,
        testUrl: 'https://test-studio-firebase.vercel.app/admin'
      };
      
      // Save report
      await fs.writeFile(
        'tarot-guidelines-loading-report.json',
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n=== TAROT GUIDELINES LOADING PERFORMANCE SUMMARY ===');
      console.log(`⏱️  Total Loading Time: ${loadingTime}ms (${(loadingTime/1000).toFixed(2)} seconds)`);
      console.log(`🌐 Network Requests Tracked: ${networkRequests.length}`);
      console.log(`📊 Performance Metrics: ${performanceMetrics.length}`);
      console.log(`📄 Has Guideline Content: ${hasGuidelineContent}`);
      
      if (performanceMetrics.length > 0) {
        console.log('\n🔍 Resource Loading Times:');
        performanceMetrics
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 8)
          .forEach(metric => {
            console.log(`  📦 ${metric.name}: ${metric.duration}ms (${(metric.size/1024).toFixed(1)}KB)`);
          });
      }
      
      if (networkRequests.length > 0) {
        console.log('\n🌐 Network Requests:');
        networkRequests.forEach(req => {
          console.log(`  🔗 ${req.method} ${req.url.split('/').slice(-2).join('/')}`);
        });
      }
      
    } catch (loadError) {
      console.error('❌ Content loading timeout or error:', loadError.message);
      await page.screenshot({ 
        path: 'screenshots/tarot-loading-error-timeout.png',
        fullPage: true 
      });
    }
    
    // Keep browser open for observation
    console.log('\n⏳ Keeping browser open for 10 seconds for observation...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n🏁 Tarot Guidelines Loading Test completed');
  }
}

testTarotGuidelinesLoadingWithAuth();