const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testOptimizedTarotLoading() {
  console.log('🚀 Testing Optimized Tarot Loading on Vercel Deployment');
  console.log('==================================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(logEntry);
    console.log('Console:', logEntry);
  });
  
  // Track network requests for performance analysis
  const networkLogs = [];
  page.on('request', request => {
    networkLogs.push({
      url: request.url(),
      method: request.method(),
      timestamp: Date.now()
    });
  });
  
  try {
    console.log('\n📊 Step 1: Measuring initial page load time');
    const startTime = Date.now();
    
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const initialLoadTime = Date.now() - startTime;
    console.log(`⏱️ Initial page load time: ${initialLoadTime}ms`);
    
    // Take screenshot of initial load
    await page.screenshot({ 
      path: 'screenshots/vercel-admin-initial-load.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved: vercel-admin-initial-load.png');
    
    console.log('\n🔐 Step 2: Testing authentication');
    
    // Check if we need to authenticate
    const needsAuth = await page.locator('input[type="password"]').isVisible();
    
    if (needsAuth) {
      console.log('🔑 Authentication required - entering admin key');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'screenshots/vercel-admin-after-auth.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved: vercel-admin-after-auth.png');
    } else {
      console.log('✅ No authentication required - already authenticated');
    }
    
    console.log('\n📋 Step 3: Testing tarot guidelines tab loading');
    
    // Look for tarot guidelines tab
    const tarotTab = page.locator('button:has-text("타로 지침")');
    const isTabVisible = await tarotTab.isVisible();
    
    if (!isTabVisible) {
      console.log('❌ Tarot guidelines tab not found');
      return;
    }
    
    console.log('✅ Tarot guidelines tab found');
    
    // Measure tab click and content loading time
    const tabClickStart = Date.now();
    await tarotTab.click();
    
    // Wait for content to load
    await page.waitForTimeout(2000); // Give time for any async operations
    
    const tabLoadTime = Date.now() - tabClickStart;
    console.log(`⏱️ Tab click to content load time: ${tabLoadTime}ms`);
    
    // Take screenshot after clicking tab
    await page.screenshot({ 
      path: 'screenshots/vercel-tarot-tab-loaded.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved: vercel-tarot-tab-loaded.png');
    
    console.log('\n🔍 Step 4: Checking for optimized loading indicators');
    
    // Check if base data is immediately visible
    const hasBaseData = await page.locator('div:has-text("타로 지침")').isVisible();
    console.log(`📊 Base tarot data visible: ${hasBaseData ? '✅ YES' : '❌ NO'}`);
    
    // Check for any loading indicators
    const hasLoadingIndicator = await page.locator('.loading, [data-loading="true"], .spinner').isVisible();
    console.log(`⏳ Loading indicators present: ${hasLoadingIndicator ? '⚠️ YES' : '✅ NO'}`);
    
    console.log('\n🔄 Step 5: Testing tab switching performance');
    
    // Test switching between tabs to measure smoothness
    const otherTabs = await page.locator('button[role="tab"]').all();
    
    for (let i = 0; i < Math.min(otherTabs.length, 3); i++) {
      const tabText = await otherTabs[i].textContent();
      if (tabText && !tabText.includes('타로 지침')) {
        console.log(`🔄 Testing switch to: ${tabText}`);
        
        const switchStart = Date.now();
        await otherTabs[i].click();
        await page.waitForTimeout(500); // Short wait for tab switch
        const switchTime = Date.now() - switchStart;
        
        console.log(`⏱️ Tab switch time: ${switchTime}ms`);
      }
    }
    
    // Switch back to tarot guidelines
    console.log('🔄 Switching back to tarot guidelines tab');
    const switchBackStart = Date.Now();
    await tarotTab.click();
    await page.waitForTimeout(500);
    const switchBackTime = Date.now() - switchBackStart;
    console.log(`⏱️ Switch back to tarot tab time: ${switchBackTime}ms`);
    
    // Final screenshot
    await page.screenshot({ 
      path: 'screenshots/vercel-final-tarot-state.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved: vercel-final-tarot-state.png');
    
    console.log('\n📈 Performance Summary:');
    console.log('========================');
    console.log(`🚀 Initial page load: ${initialLoadTime}ms`);
    console.log(`📋 Tarot tab load: ${tabLoadTime}ms`);
    console.log(`🔄 Tab switch back: ${switchBackTime}ms`);
    console.log(`📊 Base data visible: ${hasBaseData ? 'YES' : 'NO'}`);
    console.log(`⏳ Loading indicators: ${hasLoadingIndicator ? 'Present' : 'None'}`);
    
    console.log('\n🔍 Console Logs Analysis:');
    console.log('==========================');
    const optimizationLogs = consoleLogs.filter(log => 
      log.includes('optimiz') || 
      log.includes('loading') || 
      log.includes('tarot') ||
      log.includes('guideline')
    );
    
    if (optimizationLogs.length > 0) {
      optimizationLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('  No optimization-related logs found');
    }
    
    console.log('\n🌐 Network Requests:');
    console.log('====================');
    const relevantRequests = networkLogs.filter(req => 
      req.url.includes('tarot') || 
      req.url.includes('guideline') ||
      req.url.includes('admin')
    );
    
    relevantRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
    });
    
    console.log('\n✅ Optimization Testing Complete!');
    console.log('==================================');
    
    // Performance assessment
    if (tabLoadTime < 1000 && !hasLoadingIndicator && hasBaseData) {
      console.log('🏆 EXCELLENT: Optimizations are working perfectly!');
      console.log('  - Fast tab loading (< 1 second)');
      console.log('  - No loading indicators');
      console.log('  - Base data immediately visible');
    } else if (tabLoadTime < 2000) {
      console.log('✅ GOOD: Optimizations show improvement');
      console.log(`  - Tab loads in ${tabLoadTime}ms`);
      console.log(`  - Base data: ${hasBaseData ? 'Visible' : 'Not visible'}`);
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT: Further optimization required');
      console.log(`  - Tab load time: ${tabLoadTime}ms (target: < 1000ms)`);
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'screenshots/vercel-test-error.png',
      fullPage: true 
    });
    console.log('📸 Error screenshot saved: vercel-test-error.png');
  } finally {
    await browser.close();
  }
}

// Run the test
testOptimizedTarotLoading().catch(console.error);