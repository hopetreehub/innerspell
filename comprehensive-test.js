const { chromium } = require('playwright');

async function comprehensiveTest() {
  console.log('🚀 Starting comprehensive test with Chromium...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    vercelDeployment: false,
    localServer: false,
    authentication: false,
    tarotReading: false,
    blogPage: false,
    adminPage: false,
    features: []
  };
  
  try {
    // 1. Test Vercel Deployment
    console.log('1️⃣ Testing Vercel Deployment...');
    try {
      await page.goto('https://test-studio-firebase.vercel.app', { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      await page.waitForTimeout(2000);
      
      // Check main elements
      const hasLogo = await page.locator('text=InnerSpell').isVisible();
      const hasHeroText = await page.locator('text=당신의 길을 찾아보세요').isVisible();
      const hasStartButton = await page.locator('text=타로 읽기 시작').isVisible();
      
      results.vercelDeployment = hasLogo && hasHeroText && hasStartButton;
      console.log(`✅ Vercel deployment: ${results.vercelDeployment ? 'Working' : 'Issues found'}`);
      
      await page.screenshot({ 
        path: 'verification-screenshots/test-01-vercel-home.png', 
        fullPage: true 
      });
      
    } catch (error) {
      console.log('❌ Vercel deployment error:', error.message);
    }
    
    // 2. Test Authentication
    console.log('\n2️⃣ Testing Authentication...');
    try {
      // Click login button
      const loginButton = await page.locator('text=로그인').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(2000);
        
        // Check login modal
        const hasGoogleLogin = await page.locator('text=Google로 계속').isVisible();
        const hasEmailLogin = await page.locator('text=이메일로 로그인').isVisible();
        
        results.authentication = hasGoogleLogin || hasEmailLogin;
        console.log(`✅ Authentication modal: ${results.authentication ? 'Working' : 'Not found'}`);
        
        await page.screenshot({ 
          path: 'verification-screenshots/test-02-login-modal.png', 
          fullPage: true 
        });
        
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('❌ Authentication test error:', error.message);
    }
    
    // 3. Test Tarot Reading
    console.log('\n3️⃣ Testing Tarot Reading...');
    try {
      await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
        waitUntil: 'networkidle',
        timeout: 20000 
      });
      await page.waitForTimeout(3000);
      
      // Check reading page elements
      const hasQuestionInput = await page.locator('textarea').isVisible();
      const hasSpreadSelection = await page.locator('text=스프레드 선택').isVisible();
      
      results.tarotReading = hasQuestionInput || hasSpreadSelection;
      console.log(`✅ Tarot reading page: ${results.tarotReading ? 'Working' : 'Issues found'}`);
      
      await page.screenshot({ 
        path: 'verification-screenshots/test-03-tarot-page.png', 
        fullPage: true 
      });
      
      // Try to input a question
      if (hasQuestionInput) {
        await page.fill('textarea', '오늘의 운세는 어떤가요?');
        await page.waitForTimeout(1000);
        
        // Select spread if visible
        const spreadButton = await page.locator('button:has-text("원 카드")').first();
        if (await spreadButton.isVisible()) {
          await spreadButton.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: 'verification-screenshots/test-04-tarot-input.png', 
            fullPage: true 
          });
        }
      }
      
    } catch (error) {
      console.log('❌ Tarot reading test error:', error.message);
    }
    
    // 4. Test Blog Page
    console.log('\n4️⃣ Testing Blog Page...');
    try {
      await page.goto('https://test-studio-firebase.vercel.app/blog', { 
        waitUntil: 'networkidle',
        timeout: 20000 
      });
      await page.waitForTimeout(2000);
      
      // Check blog elements
      const hasBlogTitle = await page.locator('h1:has-text("블로그")').isVisible();
      const hasPosts = await page.locator('article').count() > 0;
      
      results.blogPage = hasBlogTitle || hasPosts;
      console.log(`✅ Blog page: ${results.blogPage ? 'Working' : 'Issues found'}`);
      console.log(`   Found ${await page.locator('article').count()} blog posts`);
      
      await page.screenshot({ 
        path: 'verification-screenshots/test-05-blog-page.png', 
        fullPage: true 
      });
      
    } catch (error) {
      console.log('❌ Blog page test error:', error.message);
    }
    
    // 5. Test Admin Page
    console.log('\n5️⃣ Testing Admin Page...');
    try {
      await page.goto('https://test-studio-firebase.vercel.app/admin', { 
        waitUntil: 'networkidle',
        timeout: 20000 
      });
      await page.waitForTimeout(2000);
      
      // Check if redirected to login or shows admin
      const currentUrl = page.url();
      const hasAdminContent = await page.locator('text=관리자').isVisible();
      const hasLoginPrompt = await page.locator('text=로그인').isVisible();
      
      results.adminPage = hasAdminContent || hasLoginPrompt;
      console.log(`✅ Admin page: ${results.adminPage ? 'Protected/Working' : 'Issues found'}`);
      console.log(`   Current URL: ${currentUrl}`);
      
      await page.screenshot({ 
        path: 'verification-screenshots/test-06-admin-page.png', 
        fullPage: true 
      });
      
    } catch (error) {
      console.log('❌ Admin page test error:', error.message);
    }
    
    // 6. Test Local Server on Port 4000
    console.log('\n6️⃣ Testing Local Server (Port 4000)...');
    try {
      await page.goto('http://localhost:4000', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      await page.waitForTimeout(2000);
      
      results.localServer = true;
      console.log('✅ Local server on port 4000: Running');
      
      await page.screenshot({ 
        path: 'verification-screenshots/test-07-local-4000.png', 
        fullPage: true 
      });
      
    } catch (error) {
      console.log('❌ Local server not running on port 4000');
      results.localServer = false;
    }
    
    // Summary Report
    console.log('\n📊 SUMMARY REPORT:');
    console.log('==================');
    console.log(`Vercel Deployment: ${results.vercelDeployment ? '✅ Working' : '❌ Issues'}`);
    console.log(`Local Server (4000): ${results.localServer ? '✅ Running' : '❌ Not Running'}`);
    console.log(`Authentication: ${results.authentication ? '✅ Working' : '❌ Issues'}`);
    console.log(`Tarot Reading: ${results.tarotReading ? '✅ Working' : '❌ Issues'}`);
    console.log(`Blog Page: ${results.blogPage ? '✅ Working' : '❌ Issues'}`);
    console.log(`Admin Page: ${results.adminPage ? '✅ Protected' : '❌ Issues'}`);
    
    // Save results
    const fs = require('fs');
    fs.writeFileSync(
      'verification-screenshots/test-results.json',
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n✅ All tests completed!');
    console.log('📸 Screenshots saved in verification-screenshots/');
    console.log('📄 Results saved to test-results.json');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
  
  console.log('\n🔍 Browser remains open for manual inspection.');
  console.log('Press Ctrl+C to exit.');
  
  // Keep browser open
  await new Promise(() => {});
}

// Run the test
comprehensiveTest().catch(console.error);