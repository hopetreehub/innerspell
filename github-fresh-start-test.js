const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function createScreenshotDir() {
  const dir = './test-screenshots';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function testServerConnection() {
  console.log('🔍 Testing server connection...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Quick connection test with very short timeout
    await page.goto('http://localhost:4000', { 
      timeout: 5000, 
      waitUntil: 'domcontentloaded' 
    });
    console.log('✅ Server responds - connection OK');
    await browser.close();
    return true;
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    await browser.close();
    return false;
  }
}

async function githubFreshStartTest() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const screenshotDir = await createScreenshotDir();
  
  console.log('🚀 Starting GitHub Fresh Start Test...');
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log('🎯 Target: http://localhost:4000');
  
  // Pre-check server connection
  const serverOK = await testServerConnection();
  if (!serverOK) {
    console.log('💥 Test aborted - server not responding');
    return;
  }

  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1200,800']
  });
  
  const page = await browser.newPage();
  
  // Set short timeouts
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(5000);
  
  try {
    console.log('\n📊 === MAIN PAGE LOAD TEST ===');
    
    const startTime = Date.now();
    
    // Test 1: Main page load
    console.log('🔄 Loading main page...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle', 
      timeout: 5000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ Page loaded in ${loadTime}ms`);
    
    // Take homepage screenshot
    await page.screenshot({ 
      path: `${screenshotDir}/${timestamp}-01-homepage.png`,
      fullPage: true
    });
    console.log('📸 Homepage screenshot saved');
    
    // Test 2: Content verification
    console.log('\n📊 === CONTENT VERIFICATION ===');
    
    try {
      const title = await page.title();
      console.log(`📋 Page title: "${title}"`);
      
      // Check for basic content
      const hasH1 = await page.locator('h1').count() > 0;
      const hasNav = await page.locator('nav').count() > 0;
      const bodyText = await page.textContent('body');
      const hasContent = bodyText && bodyText.length > 100;
      
      console.log(`🏷️  Has H1 title: ${hasH1 ? '✅' : '❌'}`);
      console.log(`🧭 Has navigation: ${hasNav ? '✅' : '❌'}`);
      console.log(`📄 Has content: ${hasContent ? '✅' : '❌'} (${bodyText ? bodyText.length : 0} chars)`);
      
      // Test 3: Check for errors
      const errorElements = await page.locator('[class*="error"], [id*="error"]').count();
      console.log(`🔍 Error elements found: ${errorElements}`);
      
    } catch (error) {
      console.log('❌ Content verification failed:', error.message);
    }
    
    // Test 4: Navigation test
    console.log('\n📊 === NAVIGATION TEST ===');
    
    try {
      const links = await page.locator('a[href^="/"]').all();
      const linkCount = Math.min(links.length, 3); // Test max 3 links
      
      console.log(`🔗 Found ${links.length} internal links, testing first ${linkCount}`);
      
      for (let i = 0; i < linkCount; i++) {
        const link = links[i];
        const href = await link.getAttribute('href');
        const text = (await link.textContent() || '').trim().slice(0, 30);
        
        console.log(`🔗 Testing link ${i + 1}: ${href} ("${text}")`);
        
        try {
          await link.click();
          await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
          
          const newUrl = page.url();
          console.log(`  ✅ Navigation successful: ${newUrl}`);
          
          // Take screenshot of new page
          await page.screenshot({ 
            path: `${screenshotDir}/${timestamp}-0${i + 2}-nav-${href.replace(/[^a-z0-9]/gi, '-')}.png`,
            fullPage: false
          });
          
          // Go back to homepage
          await page.goBack({ waitUntil: 'domcontentloaded', timeout: 5000 });
          
        } catch (navError) {
          console.log(`  ❌ Navigation failed: ${navError.message}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Navigation test failed:', error.message);
    }
    
    // Test 5: Performance metrics
    console.log('\n📊 === PERFORMANCE METRICS ===');
    
    try {
      await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 5000 });
      
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          domInteractive: Math.round(navigation.domInteractive - navigation.navigationStart),
          totalTime: Math.round(navigation.loadEventEnd - navigation.navigationStart)
        };
      });
      
      console.log(`⚡ DOM Content Loaded: ${metrics.domContentLoaded}ms`);
      console.log(`⚡ Load Complete: ${metrics.loadComplete}ms`);
      console.log(`⚡ DOM Interactive: ${metrics.domInteractive}ms`);
      console.log(`⚡ Total Load Time: ${metrics.totalTime}ms`);
      
    } catch (error) {
      console.log('❌ Performance metrics failed:', error.message);
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: `${screenshotDir}/${timestamp}-99-final.png`,
      fullPage: false
    });
    
    console.log('\n🎉 Test completed successfully!');
    console.log(`📂 Screenshots saved to: ${screenshotDir}`);
    
  } catch (error) {
    console.log('\n💥 MAIN TEST FAILED:', error.message);
    
    // Take error screenshot
    try {
      await page.screenshot({ 
        path: `${screenshotDir}/${timestamp}-ERROR.png`,
        fullPage: true
      });
      console.log('📸 Error screenshot saved');
    } catch (screenshotError) {
      console.log('❌ Could not save error screenshot:', screenshotError.message);
    }
    
  } finally {
    await browser.close();
    console.log('\n🔄 Browser closed');
  }
}

// Run the test
githubFreshStartTest().catch(console.error);