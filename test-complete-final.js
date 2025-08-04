const { chromium } = require('playwright');

async function testCompleteFinal() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🎯 COMPLETE FINAL TEST of localhost:4000');
    
    // Test 1: Homepage - wait longer for content to load
    console.log('\n1. Homepage Test (/)...');
    try {
      await page.goto('http://localhost:4000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait for content to actually appear
      await page.waitForTimeout(5000);
      
      console.log('   ✅ URL:', page.url());
      console.log('   ✅ Title:', await page.title());
      
      // Look for specific content
      const heroText = await page.textContent('h1, h2, .hero, [data-testid="hero"]');
      console.log('   ✅ Hero content found:', !!heroText);
      
      await page.screenshot({ path: 'screenshots/complete-final-01-homepage.png', fullPage: true });
      
    } catch (error) {
      console.log('   ❌ Homepage failed:', error.message);
      await page.screenshot({ path: 'screenshots/complete-final-01-error.png', fullPage: true });
    }

    // Test 2: Login Page
    console.log('\n2. Login Page Test (/login)...');
    try {
      await page.goto('http://localhost:4000/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      console.log('   ✅ URL:', page.url());
      
      // Check for login elements
      const loginTitle = await page.textContent('h1, h2, .title');
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');
      
      console.log('   ✅ Login title:', loginTitle);
      console.log('   ✅ Email input found:', !!emailInput);
      console.log('   ✅ Password input found:', !!passwordInput);
      
      await page.screenshot({ path: 'screenshots/complete-final-02-login.png', fullPage: true });
      
    } catch (error) {
      console.log('   ❌ Login failed:', error.message);
      await page.screenshot({ path: 'screenshots/complete-final-02-error.png', fullPage: true });
    }

    // Test 3: Community Page
    console.log('\n3. Community Page Test (/community)...');
    try {
      await page.goto('http://localhost:4000/community', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      console.log('   ✅ URL:', page.url());
      
      const communityTitle = await page.textContent('h1');
      console.log('   ✅ Community title:', communityTitle);
      
      await page.screenshot({ path: 'screenshots/complete-final-03-community.png', fullPage: true });
      
    } catch (error) {
      console.log('   ❌ Community failed:', error.message);
      await page.screenshot({ path: 'screenshots/complete-final-03-error.png', fullPage: true });
    }

    console.log('\n🎉 COMPLETE FINAL TEST FINISHED!');
    console.log('📸 All screenshots saved with complete-final-* prefix');
    
  } catch (error) {
    console.error('Complete final test failed:', error);
  } finally {
    await browser.close();
  }
}

testCompleteFinal();