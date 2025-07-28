const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testAdminTarotGuidelines() {
  console.log('🧪 Testing Admin Tarot Guidelines Loading Performance...');
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 100
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Track console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const logText = `[${msg.type()}]: ${msg.text()}`;
    consoleLogs.push(logText);
    console.log(logText);
  });
  
  // Track network requests
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      timestamp: Date.now()
    });
  });
  
  page.on('response', response => {
    if (response.url().includes('admin') || 
        response.url().includes('tarot') || 
        response.url().includes('guideline')) {
      console.log(`📡 ${response.status()} - ${response.url().split('/').slice(-2).join('/')}`);
    }
  });
  
  try {
    console.log('\n1️⃣ Navigating directly to admin page...');
    
    // Go directly to admin page
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    
    // Wait for initial load
    await page.waitForTimeout(5000);
    
    console.log('\n📸 Taking initial screenshot...');
    await page.screenshot({ 
      path: 'screenshots/admin-tarot-01-initial.png',
      fullPage: true 
    });
    
    // Check current state
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Look for various possible states
    const adminLoginVisible = await page.isVisible('button:has-text("관리자 로그인")');
    const tabsVisible = await page.isVisible('button:has-text("타로 해석 지침 관리")');
    const needsGoogleAuth = currentUrl.includes('accounts.google.com');
    
    console.log(`🔐 Admin login button visible: ${adminLoginVisible}`);
    console.log(`📋 Tarot tabs visible: ${tabsVisible}`);
    console.log(`🔗 Google auth required: ${needsGoogleAuth}`);
    
    if (needsGoogleAuth) {
      console.log('❌ Google OAuth redirect detected - manual intervention required');
      console.log('⏸️  Please complete authentication manually...');
      await page.waitForTimeout(30000); // Wait for manual auth
      
      // Try to navigate back to admin
      await page.goto('https://test-studio-firebase.vercel.app/admin');
      await page.waitForTimeout(3000);
    }
    
    if (adminLoginVisible) {
      console.log('\n2️⃣ Clicking admin login button...');
      await page.click('button:has-text("관리자 로그인")');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'screenshots/admin-tarot-02-after-admin-login.png',
        fullPage: true 
      });
    }
    
    // Wait for tabs to appear
    console.log('\n3️⃣ Waiting for admin tabs...');
    try {
      await page.waitForSelector('button:has-text("타로 해석 지침 관리")', { 
        timeout: 15000,
        state: 'visible' 
      });
      console.log('✅ Tarot guidelines tab found!');
    } catch (e) {
      console.log('❌ Admin tabs not found, checking page content...');
      
      // Check what's actually on the page
      const bodyText = await page.textContent('body');
      console.log('📄 Page contains:', bodyText.substring(0, 200) + '...');
      
      await page.screenshot({ 
        path: 'screenshots/admin-tarot-03-tabs-not-found.png',
        fullPage: true 
      });
      
      throw new Error('Admin tabs not accessible');
    }
    
    await page.screenshot({ 
      path: 'screenshots/admin-tarot-04-tabs-ready.png',
      fullPage: true 
    });
    
    // 🎯 START TIMING THE TAB CLICK
    console.log('\n⏱️  STARTING TAROT GUIDELINES TAB PERFORMANCE TEST');
    console.log('━'.repeat(60));
    
    // Clear console and reset counters
    await page.evaluate(() => console.clear());
    const tabClickStartTime = Date.now();
    
    console.log(`🚀 Clicking "타로 해석 지침 관리" tab at ${new Date(tabClickStartTime).toISOString()}`);
    
    // Click the tarot guidelines tab
    await page.click('button:has-text("타로 해석 지침 관리")');
    
    // Immediate screenshot
    await page.screenshot({ 
      path: 'screenshots/admin-tarot-05-tab-clicked.png',
      fullPage: true 
    });
    
    // Monitor loading process
    console.log('\n🔍 Monitoring loading process...');
    
    let loadingComplete = false;
    let checkInterval = 500; // Check every 500ms
    let maxChecks = 40; // Max 20 seconds
    let currentCheck = 0;
    
    while (!loadingComplete && currentCheck < maxChecks) {
      currentCheck++;
      await page.waitForTimeout(checkInterval);
      
      // Check for various indicators that content has loaded
      const indicators = await page.evaluate(() => {
        const body = document.body;
        const bodyText = body.textContent || '';
        
        return {
          hasTarotText: bodyText.includes('타로') || bodyText.includes('메이저'),
          hasGuidelineText: bodyText.includes('지침') || bodyText.includes('해석'),
          hasCardText: bodyText.includes('카드') || bodyText.includes('아르카나'),
          hasLoadingIndicator: !!document.querySelector('.loading, .spinner, [aria-label*="loading"]'),
          contentLength: bodyText.length,
          timestamp: Date.now()
        };
      });
      
      console.log(`📊 Check ${currentCheck}: Content:${indicators.contentLength} chars, Tarot:${indicators.hasTarotText}, Guidelines:${indicators.hasGuidelineText}, Loading:${indicators.hasLoadingIndicator}`);
      
      // Consider loaded if we have tarot-related content and no loading indicators
      if ((indicators.hasTarotText || indicators.hasGuidelineText || indicators.hasCardText) && 
          !indicators.hasLoadingIndicator && 
          indicators.contentLength > 1000) {
        loadingComplete = true;
        const tabClickEndTime = Date.now();
        const totalLoadingTime = tabClickEndTime - tabClickStartTime;
        
        console.log('\n🎉 LOADING COMPLETED!');
        console.log(`⏱️  Total Loading Time: ${totalLoadingTime}ms (${(totalLoadingTime/1000).toFixed(2)} seconds)`);
        
        await page.screenshot({ 
          path: 'screenshots/admin-tarot-06-content-loaded.png',
          fullPage: true 
        });
        
        break;
      }
      
      // Take periodic screenshots
      if (currentCheck % 4 === 0) {
        await page.screenshot({ 
          path: `screenshots/admin-tarot-loading-${String(currentCheck).padStart(2, '0')}.png`,
          fullPage: true 
        });
      }
    }
    
    if (!loadingComplete) {
      console.log('⚠️  Loading timeout - content may still be loading');
    }
    
    // Final state capture
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'screenshots/admin-tarot-07-final-state.png',
      fullPage: true 
    });
    
    // Get final performance data
    const performanceData = await page.evaluate(() => {
      const performance = window.performance;
      const resources = performance.getEntriesByType('resource');
      const navigation = performance.getEntriesByType('navigation')[0];
      
      return {
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        resources: resources.map(r => ({
          name: r.name.split('/').slice(-2).join('/'),
          duration: Math.round(r.duration),
          size: r.transferSize || 0
        })).filter(r => r.name.includes('admin') || r.name.includes('tarot'))
      };
    });
    
    // Generate comprehensive report
    const finalLoadTime = Date.now() - tabClickStartTime;
    
    const report = {
      testTimestamp: new Date().toISOString(),
      testUrl: 'https://test-studio-firebase.vercel.app/admin',
      tabClickToContentLoad: finalLoadTime,
      tabClickToContentLoadSeconds: (finalLoadTime/1000).toFixed(2),
      loadingSteps: currentCheck,
      totalNetworkRequests: networkRequests.length,
      performanceData: performanceData,
      consoleLogs: consoleLogs.filter(log => 
        log.includes('tarot') || 
        log.includes('guideline') || 
        log.includes('admin') ||
        log.includes('cache')
      ),
      loadingCompleted: loadingComplete
    };
    
    await fs.writeFile(
      'admin-tarot-guidelines-performance-report.json',
      JSON.stringify(report, null, 2)
    );
    
    // Final summary
    console.log('\n' + '🎯'.repeat(20));
    console.log('📊 TAROT GUIDELINES LOADING PERFORMANCE SUMMARY');
    console.log('🎯'.repeat(20));
    console.log(`⏱️  Tab Click to Content Load: ${finalLoadTime}ms (${(finalLoadTime/1000).toFixed(2)} seconds)`);
    console.log(`🔄 Loading Steps Monitored: ${currentCheck}`);
    console.log(`📡 Network Requests: ${networkRequests.length}`);
    console.log(`✅ Loading Completed: ${loadingComplete}`);
    console.log(`📁 Screenshots Saved: ${currentCheck + 7} files`);
    console.log(`📋 Report Saved: admin-tarot-guidelines-performance-report.json`);
    
    if (performanceData.resources.length > 0) {
      console.log('\n📦 Relevant Resources:');
      performanceData.resources
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .forEach(resource => {
          console.log(`   ${resource.name}: ${resource.duration}ms (${(resource.size/1024).toFixed(1)}KB)`);
        });
    }
    
    // Keep browser open for observation
    console.log('\n👀 Keeping browser open for manual inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    await page.screenshot({ 
      path: 'screenshots/admin-tarot-ERROR.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed');
  }
}

testAdminTarotGuidelines();