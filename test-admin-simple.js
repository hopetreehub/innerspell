const { chromium } = require('playwright');

async function testAdminAccess() {
  console.log('🚀 Testing Admin Access and Tarot Guidelines Performance');
  console.log('========================================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Enable console monitoring
  const performanceLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log(`Console: ${text}`);
    
    if (text.includes('optimiz') || text.includes('tarot') || text.includes('loading') || text.includes('Performance')) {
      performanceLogs.push(text);
    }
  });
  
  try {
    console.log('\n🏠 Step 1: Navigate to homepage');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.screenshot({ path: 'screenshots/test-01-homepage.png' });
    console.log('📸 Homepage loaded');
    
    console.log('\n🔍 Step 2: Check if user is already authenticated');
    await page.waitForTimeout(3000); // Wait for auth state to settle
    
    // Try to access admin directly
    console.log('\n📱 Step 3: Navigate to admin page');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.screenshot({ path: 'screenshots/test-02-admin-page.png' });
    console.log('📸 Admin page access attempt');
    
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Check what page we're on
    if (currentUrl.includes('/admin')) {
      console.log('✅ Successfully on admin page');
      
      // Look for admin content
      console.log('\n🔍 Step 4: Looking for admin dashboard elements');
      
      // Wait for any dynamic content to load
      await page.waitForTimeout(3000);
      
      // Check for tabs or admin interface
      const tabs = await page.locator('[role="tab"], button[role="tab"]').all();
      const dashboardElements = await page.locator('.admin-dashboard, .dashboard, h1:has-text("관리자"), h1:has-text("Admin")').count();
      
      console.log(`📊 Found ${tabs.length} tabs`);
      console.log(`📊 Found ${dashboardElements} dashboard elements`);
      
      if (tabs.length > 0) {
        console.log('\n🎯 Testing tab performance:');
        
        for (let i = 0; i < tabs.length; i++) {
          const tabText = await tabs[i].textContent();
          console.log(`\n📋 Tab ${i + 1}: "${tabText?.trim()}"`);
          
          const startTime = Date.now();
          await tabs[i].click();
          await page.waitForTimeout(1500); // Wait for content load
          const loadTime = Date.now() - startTime;
          
          console.log(`⏱️ Load time: ${loadTime}ms`);
          
          // Check if this is tarot-related
          if (tabText?.includes('타로') || tabText?.includes('지침')) {
            console.log('🎯 This is the TAROT GUIDELINES tab!');
            
            // Check for immediate content visibility
            const hasContent = await page.locator('div:has-text("타로"), div:has-text("카드"), table, ul li').count();
            const hasLoading = await page.locator('.loading, .spinner, [data-loading="true"]').count();
            
            console.log(`📊 Content elements visible: ${hasContent}`);
            console.log(`⏳ Loading indicators: ${hasLoading}`);
            
            // Performance assessment
            if (loadTime < 1000 && hasContent > 0 && hasLoading === 0) {
              console.log('🏆 EXCELLENT: Optimized loading working perfectly!');
              console.log('  ✅ Fast load time (< 1 second)');
              console.log('  ✅ Immediate content visibility');
              console.log('  ✅ No loading indicators');
            } else if (loadTime < 2000 && hasContent > 0) {
              console.log('✅ GOOD: Performance improvement detected');
              console.log(`  ⏱️ Load time: ${loadTime}ms (good)`);
              console.log(`  📊 Content visible: ${hasContent > 0 ? 'Yes' : 'No'}`);
            } else {
              console.log('⚠️ NEEDS IMPROVEMENT: Still optimizing');
              console.log(`  ⏱️ Load time: ${loadTime}ms (target: < 1000ms)`);
              console.log(`  📊 Content: ${hasContent} elements`);
              console.log(`  ⏳ Loading: ${hasLoading} indicators`);
            }
            
            await page.screenshot({ path: 'screenshots/test-tarot-tab-loaded.png', fullPage: true });
            console.log('📸 Tarot tab screenshot saved');
          }
          
          await page.screenshot({ path: `screenshots/test-tab-${i + 1}.png` });
        }
      } else {
        console.log('❌ No admin tabs found - checking for other admin indicators');
        
        // Look for other admin content
        const adminContent = await page.textContent('body');
        if (adminContent.includes('관리자') || adminContent.includes('Admin') || adminContent.includes('Dashboard')) {
          console.log('✅ Admin content detected');
        } else {
          console.log('❌ No admin content found');
        }
      }
      
    } else if (currentUrl.includes('/signin')) {
      console.log('🔐 Redirected to signin - need authentication');
      
      // Check for Google login
      const googleButton = page.locator('button:has-text("Google로 로그인")');
      const hasGoogle = await googleButton.isVisible();
      
      if (hasGoogle) {
        console.log('🔑 Google login available - in production, user would authenticate here');
        console.log('📝 Note: Manual Google authentication required for admin access');
      }
      
    } else {
      console.log(`⚠️ Unexpected redirect to: ${currentUrl}`);
    }
    
    console.log('\n📈 Performance Summary:');
    console.log('======================');
    
    if (performanceLogs.length > 0) {
      console.log('🔍 Performance-related logs:');
      performanceLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('📊 No specific performance logs captured');
    }
    
    // Final screenshot
    await page.screenshot({ path: 'screenshots/test-final-state.png', fullPage: true });
    console.log('📸 Final state captured');
    
    console.log('\n✅ Admin Access Test Complete!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'screenshots/test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testAdminAccess().catch(console.error);