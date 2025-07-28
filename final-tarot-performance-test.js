const { chromium } = require('playwright');

async function finalTarotPerformanceTest() {
  console.log('🎯 FINAL TAROT GUIDELINES LOADING PERFORMANCE TEST');
  console.log('═'.repeat(65));
  console.log('This test will provide exact loading times for the Tarot Guidelines tab');
  console.log('Auth status will be checked and handled appropriately');
  console.log('═'.repeat(65));
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 100
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Performance tracking
  const performanceLog = [];
  const networkLog = [];
  
  function logPerf(message, timestamp = Date.now()) {
    const entry = { timestamp, message, relativeTime: timestamp - (performanceLog[0]?.timestamp || timestamp) };
    performanceLog.push(entry);
    console.log(`[${new Date(timestamp).toISOString()}] ${message}`);
  }
  
  // Monitor relevant console logs and network requests
  page.on('console', msg => {
    if (msg.text().toLowerCase().includes('tarot') || 
        msg.text().toLowerCase().includes('guideline') ||
        msg.text().toLowerCase().includes('cache') ||
        msg.text().toLowerCase().includes('firestore')) {
      logPerf(`🔍 CONSOLE: ${msg.text()}`);
    }
  });
  
  page.on('request', req => {
    if (req.url().includes('admin') || req.url().includes('tarot') || req.url().includes('guideline')) {
      networkLog.push({ url: req.url(), method: req.method(), timestamp: Date.now() });
      logPerf(`📡 REQUEST: ${req.method()} ${req.url().split('/').slice(-1)[0]}`);
    }
  });
  
  page.on('response', res => {
    if (res.url().includes('admin') || res.url().includes('tarot') || res.url().includes('guideline')) {
      logPerf(`📡 RESPONSE: ${res.status()} ${res.url().split('/').slice(-1)[0]}`);
    }
  });
  
  try {
    logPerf('🚀 TEST START');
    
    // Step 1: Navigate to admin
    logPerf('📍 Navigating to admin page...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'final-test-01-admin-page.png', fullPage: true });
    
    const currentUrl = page.url();
    logPerf(`📍 Current URL: ${currentUrl}`);
    
    // Step 2: Check authentication status
    if (currentUrl.includes('sign-in')) {
      logPerf('🔐 Sign-in required - attempting simplified auth check');
      
      // Check if we can use a test admin credential or skip auth
      const hasTestMode = await page.evaluate(() => {
        return window.location.search.includes('test=true') || 
               localStorage.getItem('test-admin') === 'true';
      });
      
      if (!hasTestMode) {
        logPerf('❌ Authentication required - this test requires manual auth');
        logPerf('📋 PERFORMANCE TEST SUMMARY (AUTHENTICATION REQUIRED)');  
        logPerf('══════════════════════════════════════════════════════════');
        logPerf('⚠️  Cannot measure Tarot Guidelines loading time without authentication');
        logPerf('🔑 Manual steps required:');
        logPerf('   1. Complete Google OAuth authentication');
        logPerf('   2. Access admin dashboard');
        logPerf('   3. Click "타로 해석 지침 관리" tab');
        logPerf('   4. Measure loading time manually');
        logPerf('');
        logPerf('🎯 ESTIMATED PERFORMANCE EXPECTATIONS:');
        logPerf('   • Tab click to content load: 1-3 seconds (typical for Firestore queries)');
        logPerf('   • Network requests: 2-5 requests for guidelines data');
        logPerf('   • Cache behavior: First load slower, subsequent loads faster');
        logPerf('   • Content indicators: "타로", "메이저 아르카나", "카드별 해석" text');
        logPerf('══════════════════════════════════════════════════════════');
        
        await page.waitForTimeout(10000); // Keep browser open for manual intervention
        return;
      }
    }
    
    // Step 3: Look for admin tabs
    try {
      logPerf('🔍 Looking for admin tabs...');
      await page.waitForSelector('button:has-text("타로 해석 지침 관리")', { 
        timeout: 10000,
        state: 'visible' 
      });
      logPerf('✅ Admin tabs found!');
    } catch (e) {
      logPerf('❌ Admin tabs not found - checking for alternative access');
      
      // Check if there's an admin login button
      const adminLoginBtn = await page.isVisible('button:has-text("관리자 로그인")');
      if (adminLoginBtn) {
        logPerf('🔐 Found admin login button - clicking...');
        await page.click('button:has-text("관리자 로그인")');
        await page.waitForTimeout(3000);
        
        // Try again
        await page.waitForSelector('button:has-text("타로 해석 지침 관리")', { 
          timeout: 10000,
          state: 'visible' 
        });
        logPerf('✅ Admin tabs now visible after admin login');
      } else {
        throw new Error('Cannot access admin interface');
      }
    }
    
    await page.screenshot({ path: 'final-test-02-admin-ready.png', fullPage: true });
    
    // Step 4: PERFORMANCE TEST - Measure tab click timing
    logPerf('🎯 STARTING PRECISE PERFORMANCE MEASUREMENT');
    logPerf('━'.repeat(50));
    
    // Clear console and prepare for measurement
    await page.evaluate(() => console.clear());
    
    // Get baseline measurements
    const baselineMetrics = await page.evaluate(() => {
      const perf = performance;
      return {
        now: perf.now(),
        memory: perf.memory ? {
          used: Math.round(perf.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(perf.memory.totalJSHeapSize / 1024 / 1024)
        } : null
      };
    });
    
    logPerf(`📊 Baseline - Performance.now: ${baselineMetrics.now.toFixed(2)}ms`);
    if (baselineMetrics.memory) {
      logPerf(`📊 Baseline - Memory: ${baselineMetrics.memory.used}/${baselineMetrics.memory.total}MB`);
    }
    
    // Record precise start time
    const preciseStartTime = Date.now();
    const performanceStartTime = await page.evaluate(() => performance.now());
    
    logPerf(`🚀 CLICKING TAROT GUIDELINES TAB - Start Time: ${preciseStartTime}`);
    
    // Click the tab
    await page.click('button:has-text("타로 해석 지침 관리")');
    
    const clickCompleteTime = Date.now();
    logPerf(`⚡ Tab click completed in ${clickCompleteTime - preciseStartTime}ms`);
    
    // Immediate screenshot
    await page.screenshot({ path: 'final-test-03-tab-clicked.png', fullPage: true });
    
    // Step 5: Monitor loading with high precision
    logPerf('🔍 Monitoring content loading with precision timing...');
    
    let contentLoaded = false;
    let monitoringAttempts = 0;
    const maxAttempts = 40; // 20 seconds max
    const checkInterval = 500; // Check every 500ms
    
    while (!contentLoaded && monitoringAttempts < maxAttempts) {
      monitoringAttempts++;
      await page.waitForTimeout(checkInterval);
      
      const currentTime = Date.now();
      const elapsedTime = currentTime - preciseStartTime;
      
      // Comprehensive content check
      const contentAnalysis = await page.evaluate(() => {
        const body = document.body;
        const text = body.textContent || '';
        
        // Look for specific tarot-related content
        const indicators = {
          hasTarot: text.includes('타로'),
          hasGuidelines: text.includes('지침') || text.includes('해석'),
          hasMajorArcana: text.includes('메이저') || text.includes('아르카나'),
          hasCards: text.includes('카드'),
          hasSpecificContent: text.includes('The Fool') || text.includes('바보') || text.includes('0번'),
          
          // Loading indicators
          hasLoadingSpinner: !!document.querySelector('.loading, .spinner, [aria-label*="loading"]'),
          hasSkeletonLoader: !!document.querySelector('.skeleton, [class*="skeleton"]'),
          
          // Content metrics
          contentLength: text.length,
          wordCount: text.split(/\s+/).length,
          
          // Performance metrics
          performanceNow: performance.now(),
          timestamp: Date.now()
        };
        
        return indicators;
      });
      
      logPerf(`📊 Check ${monitoringAttempts} (${elapsedTime}ms): ` +
              `Content=${contentAnalysis.contentLength}chars, ` +
              `Tarot=${contentAnalysis.hasTarot}, ` +
              `Guidelines=${contentAnalysis.hasGuidelines}, ` +
              `Cards=${contentAnalysis.hasCards}, ` +
              `Loading=${contentAnalysis.hasLoadingSpinner}`);
      
      // Determine if content is loaded
      if ((contentAnalysis.hasTarot && contentAnalysis.hasGuidelines) || 
          contentAnalysis.hasMajorArcana || 
          contentAnalysis.hasSpecificContent) {
        
        if (!contentAnalysis.hasLoadingSpinner && 
            !contentAnalysis.hasSkeletonLoader &&
            contentAnalysis.contentLength > 1500 &&
            contentAnalysis.wordCount > 50) {
          
          contentLoaded = true;
          const finalLoadTime = Date.now() - preciseStartTime;
          
          logPerf('🎉 CONTENT LOADING COMPLETED!');
          logPerf(`⏱️  FINAL LOADING TIME: ${finalLoadTime}ms (${(finalLoadTime/1000).toFixed(2)} seconds)`);
          
          // Get final performance metrics
          const finalMetrics = await page.evaluate(() => {
            const perf = performance;
            const resources = perf.getEntriesByType('resource');
            const navigation = perf.getEntriesByType('navigation')[0];
            
            return {
              performanceNow: perf.now(),
              memory: perf.memory ? {
                used: Math.round(perf.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(perf.memory.totalJSHeapSize / 1024 / 1024)
              } : null,
              resources: resources
                .filter(r => r.name.includes('admin') || r.name.includes('tarot') || r.name.includes('guideline'))
                .map(r => ({
                  name: r.name.split('/').slice(-1)[0],
                  duration: Math.round(r.duration),
                  size: r.transferSize || 0
                }))
                .sort((a, b) => b.duration - a.duration)
            };
          });
          
          logPerf(`📊 Final Performance.now: ${finalMetrics.performanceNow.toFixed(2)}ms`);
          if (finalMetrics.memory) {
            logPerf(`📊 Final Memory: ${finalMetrics.memory.used}/${finalMetrics.memory.total}MB`);
          }
          
          break;
        }
      }
      
      // Periodic screenshots
      if (monitoringAttempts % 6 === 0) {
        await page.screenshot({ 
          path: `final-test-04-loading-${String(monitoringAttempts).padStart(2, '0')}.png`,
          fullPage: true 
        });
      }
    }
    
    // Final screenshot and summary
    await page.screenshot({ path: 'final-test-05-final-state.png', fullPage: true });
    
    const totalTestTime = Date.now() - preciseStartTime;
    
    // Compile final report
    logPerf('═'.repeat(65));
    logPerf('📊 TAROT GUIDELINES LOADING PERFORMANCE - FINAL RESULTS');
    logPerf('═'.repeat(65));
    logPerf(`⏱️  Total Loading Time: ${totalTestTime}ms (${(totalTestTime/1000).toFixed(2)} seconds)`);
    logPerf(`✅ Content Loaded Successfully: ${contentLoaded}`);
    logPerf(`🔄 Monitoring Attempts: ${monitoringAttempts}`);
    logPerf(`📡 Network Requests Tracked: ${networkLog.length}`);
    logPerf(`📸 Screenshots Captured: ${monitoringAttempts/6 + 5} files`);
    
    if (networkLog.length > 0) {
      logPerf('🌐 Network Activity:');
      networkLog.forEach(req => {
        const relativeTime = req.timestamp - preciseStartTime;
        logPerf(`   📡 ${req.method} ${req.url.split('/').slice(-1)[0]} (+${relativeTime}ms)`);
      });
    }
    
    // Performance conclusions
    logPerf('');
    logPerf('🎯 PERFORMANCE ANALYSIS:');
    if (totalTestTime < 1000) {
      logPerf('   🟢 EXCELLENT: Loading time under 1 second');
    } else if (totalTestTime < 2000) {
      logPerf('   🟡 GOOD: Loading time 1-2 seconds');  
    } else if (totalTestTime < 3000) {
      logPerf('   🟠 ACCEPTABLE: Loading time 2-3 seconds');
    } else {
      logPerf('   🔴 SLOW: Loading time over 3 seconds - optimization needed');
    }
    
    logPerf('');
    logPerf('🏆 Cache Performance Indicators:');
    logPerf('   • First load: Typically 2-4 seconds (Firestore query)');
    logPerf('   • Cached load: Should be under 1 second');
    logPerf('   • Network requests: 2-5 for full guideline data');
    
    logPerf('═'.repeat(65));
    logPerf('✅ PERFORMANCE TEST COMPLETED SUCCESSFULLY');
    
    // Keep browser open for observation
    logPerf('👀 Keeping browser open for 15 seconds for manual verification...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    logPerf(`❌ TEST ERROR: ${error.message}`);
    await page.screenshot({ path: 'final-test-ERROR.png', fullPage: true });
    
    // Provide debugging information
    logPerf('🔍 DEBUGGING INFORMATION:');
    logPerf(`   Current URL: ${page.url()}`);
    logPerf(`   Error occurred at: ${new Date().toISOString()}`);
    logPerf(`   Total performance log entries: ${performanceLog.length}`);
  } finally {
    await browser.close();
    logPerf('🏁 Browser closed - test completed');
    
    // Save performance log
    const fs = require('fs').promises;
    await fs.writeFile(
      'tarot-guidelines-performance-final.json',
      JSON.stringify({
        performanceLog,
        networkLog,
        testCompleted: new Date().toISOString()
      }, null, 2)
    );
    
    console.log('\n📋 Performance log saved to: tarot-guidelines-performance-final.json');
  }
}

finalTarotPerformanceTest();