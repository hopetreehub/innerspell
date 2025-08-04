const { chromium } = require('playwright');

async function testBuildError() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing if build error is resolved on localhost:4000...');
    
    // Test 1: Check if we get build error or proper page
    console.log('\n1. Testing homepage for build errors...');
    try {
      await page.goto('http://localhost:4000/', { waitUntil: 'domcontentloaded', timeout: 20000 });
      
      // Check for build error messages
      const buildError = await page.textContent('body');
      
      if (buildError.includes('Module not found')) {
        console.log('   ❌ BUILD ERROR STILL PRESENT:');
        console.log('   Error text:', buildError.substring(0, 200));
        await page.screenshot({ path: 'screenshots/build-error-homepage.png', fullPage: true });
        return false;
      } else {
        console.log('   ✅ No build error on homepage');
        console.log('   Page title:', await page.title());
        await page.screenshot({ path: 'screenshots/build-fixed-homepage.png', fullPage: true });
      }
      
    } catch (error) {
      console.log('   ❌ Homepage failed to load:', error.message);
      await page.screenshot({ path: 'screenshots/build-error-homepage-timeout.png', fullPage: true });
      return false;
    }

    // Test 2: Check login page specifically (where the Firebase import error was)
    console.log('\n2. Testing login page for Firebase config error...');
    try {
      await page.goto('http://localhost:4000/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
      
      const pageContent = await page.textContent('body');
      
      if (pageContent.includes('Module not found') || pageContent.includes('@/lib/firebase/config')) {
        console.log('   ❌ FIREBASE CONFIG ERROR STILL PRESENT:');
        console.log('   Error details:', pageContent.substring(0, 300));
        await page.screenshot({ path: 'screenshots/build-error-login.png', fullPage: true });
        return false;
      } else {
        console.log('   ✅ Login page loads without Firebase config error');
        console.log('   Current URL:', page.url());
        
        // Check if login form is present
        const emailInput = await page.$('input[type="email"]');
        const passwordInput = await page.$('input[type="password"]');
        
        console.log('   ✅ Email input found:', !!emailInput);
        console.log('   ✅ Password input found:', !!passwordInput);
        
        await page.screenshot({ path: 'screenshots/build-fixed-login.png', fullPage: true });
      }
      
    } catch (error) {
      console.log('   ❌ Login page failed:', error.message);
      await page.screenshot({ path: 'screenshots/build-error-login-timeout.png', fullPage: true });
      return false;
    }

    // Test 3: Check signup page
    console.log('\n3. Testing signup page...');
    try {
      await page.goto('http://localhost:4000/signup', { waitUntil: 'domcontentloaded', timeout: 20000 });
      
      const signupContent = await page.textContent('body');
      
      if (signupContent.includes('Module not found')) {
        console.log('   ❌ BUILD ERROR on signup page');
        await page.screenshot({ path: 'screenshots/build-error-signup.png', fullPage: true });
        return false;
      } else {
        console.log('   ✅ Signup page loads successfully');
        await page.screenshot({ path: 'screenshots/build-fixed-signup.png', fullPage: true });
      }
      
    } catch (error) {
      console.log('   ❌ Signup page failed:', error.message);
      return false;
    }

    console.log('\n🎉 BUILD ERROR TEST RESULTS:');
    console.log('✅ All pages load without module not found errors');
    console.log('✅ Firebase config error resolved');
    console.log('✅ Login system accessible');
    
    return true;
    
  } catch (error) {
    console.error('Build error test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

testBuildError().then(success => {
  if (success) {
    console.log('\n🎯 CONCLUSION: Build error has been resolved!');
  } else {
    console.log('\n❌ CONCLUSION: Build error still exists or new issues found');
  }
});