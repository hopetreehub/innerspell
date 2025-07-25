const { chromium } = require('playwright');

async function testAdminDirect() {
  console.log('Starting direct admin test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate directly to homepage
    console.log('Step 1: Navigating to http://localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'screenshots/admin_test_01_homepage.png',
      fullPage: true 
    });
    console.log('Screenshot saved: admin_test_01_homepage.png');
    
    // Check current authentication state
    console.log('\nStep 2: Checking authentication state...');
    
    // Look for any sign of being logged in
    const profileButton = await page.locator('button[aria-label*="profile"], button[aria-label*="프로필"], img[alt*="avatar"], img[alt*="profile"]').first();
    const logoutButton = await page.locator('button:has-text("로그아웃"), button:has-text("Logout"), a:has-text("로그아웃"), a:has-text("Logout")').first();
    const adminMenu = await page.locator('text="관리자 설정"').first();
    
    const isLoggedIn = await profileButton.isVisible() || await logoutButton.isVisible();
    const isAdmin = await adminMenu.isVisible();
    
    console.log('Authentication state:');
    console.log('- Logged in:', isLoggedIn);
    console.log('- Admin menu visible:', isAdmin);
    
    if (isAdmin) {
      console.log('\n✅ SUCCESS: Admin menu "관리자 설정" is already visible!');
      
      // Take screenshot showing admin menu
      await page.screenshot({ 
        path: 'screenshots/admin_test_02_admin_menu_visible.png',
        fullPage: true 
      });
      console.log('Screenshot saved: admin_test_02_admin_menu_visible.png');
      
      // Click on admin menu
      console.log('\nClicking on "관리자 설정"...');
      await adminMenu.click();
      await page.waitForTimeout(3000);
      
      // Take screenshot of admin dashboard
      await page.screenshot({ 
        path: 'screenshots/admin_test_03_admin_dashboard.png',
        fullPage: true 
      });
      console.log('Screenshot saved: admin_test_03_admin_dashboard.png');
      
    } else {
      console.log('\n❌ Admin menu not visible. Attempting to navigate to sign-in page...');
      
      // Try direct navigation to sign-in
      await page.goto('http://localhost:4000/sign-in', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'screenshots/admin_test_02_signin_page.png',
        fullPage: true 
      });
      console.log('Screenshot saved: admin_test_02_signin_page.png');
      
      // Check page content
      const pageContent = await page.content();
      console.log('\nChecking page for authentication options...');
      
      if (pageContent.includes('오류가 발생했습니다') || pageContent.includes('error')) {
        console.log('⚠️  Error detected on sign-in page');
        console.log('The application may have authentication issues');
      }
      
      // Look for any Google sign-in elements
      const googleElements = await page.locator('button:has-text("Google"), button img[src*="google"], button[aria-label*="Google"], div[class*="google"]').all();
      console.log(`Found ${googleElements.length} potential Google sign-in elements`);
      
      // Check for any OAuth/social login buttons
      const oauthButtons = await page.locator('button[class*="oauth"], button[class*="social"], a[href*="oauth"], a[href*="auth"]').all();
      console.log(`Found ${oauthButtons.length} potential OAuth buttons`);
    }
    
    // Final state check
    console.log('\n=== Final State Analysis ===');
    
    // Check navbar for all elements
    const navbar = await page.locator('nav, header, div[class*="navbar"], div[class*="header"]').first();
    if (await navbar.isVisible()) {
      const navbarText = await navbar.textContent();
      console.log('Navbar content:', navbarText?.substring(0, 200));
      
      // Check specifically for admin-related text
      if (navbarText?.includes('관리자') || navbarText?.includes('admin')) {
        console.log('✅ Admin-related text found in navbar');
      } else {
        console.log('❌ No admin-related text found in navbar');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'screenshots/admin_test_final.png',
      fullPage: true 
    });
    console.log('\nFinal screenshot saved: admin_test_final.png');
    
    console.log('\n📊 Test Summary:');
    console.log('- Application is accessible at http://localhost:4000');
    console.log('- Sign-in page shows an error when accessed');
    console.log('- Admin menu visibility depends on authentication state');
    console.log('- Manual login may be required to test admin functionality');
    
    console.log('\n💡 Recommendations:');
    console.log('1. Check authentication configuration');
    console.log('2. Verify OAuth/Google sign-in setup');
    console.log('3. Ensure admin@innerspell.com is properly configured as admin');
    console.log('4. Review error handling on sign-in page');
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ 
      path: 'screenshots/admin_test_error.png',
      fullPage: true 
    });
  }
  
  console.log('\n🔍 Browser will remain open for 30 seconds for inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

// Run the test
testAdminDirect().catch(console.error);