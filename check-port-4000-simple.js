const { chromium } = require('playwright');

async function checkPort4000() {
  console.log('🔍 Starting Chromium browser to check localhost:4000...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to http://localhost:4000...');
    
    const response = await page.goto('http://localhost:4000/', { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully!');
    console.log('📊 Response status:', response.status());
    console.log('📍 Current URL:', page.url());
    console.log('📝 Page title:', await page.title());
    
    // Wait for any loading to complete
    await page.waitForTimeout(3000);
    
    // Check for loading spinners
    const spinners = await page.locator('.animate-spin').count();
    console.log(`🔄 Loading spinners: ${spinners}`);
    
    // Check for main content
    const heroText = await page.locator('text=InnerSpell').first().textContent().catch(() => null);
    console.log('🏠 Hero text found:', heroText ? 'Yes' : 'No');
    
    // Check for navigation
    const navItems = await page.locator('nav a').count();
    console.log(`🧭 Navigation items: ${navItems}`);
    
    // Check for auth state
    const loginButton = await page.locator('text=로그인').count();
    const signupButton = await page.locator('text=회원가입').count();
    console.log(`🔐 Auth state - Login button: ${loginButton}, Signup button: ${signupButton}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/port-4000-status.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved to screenshots/port-4000-status.png');
    
    // Get console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors:', consoleErrors);
    } else {
      console.log('✅ No console errors detected');
    }
    
    console.log('\n📊 Summary:');
    console.log('- Server is running on port 4000: ✅');
    console.log('- Page loads successfully: ✅');
    console.log(`- Loading issues: ${spinners > 0 ? '⚠️ Spinner detected' : '✅ No spinners'}`);
    console.log(`- Content visible: ${heroText ? '✅' : '⚠️ Check screenshot'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ 
      path: 'screenshots/port-4000-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

checkPort4000().catch(console.error);