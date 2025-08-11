import { test, expect } from '@playwright/test';

test('Debug admin menu visibility issue', async ({ page }) => {
  console.log('Starting admin menu debug test...');
  
  // Go to the deployed site
  await page.goto('https://innerspell.vercel.app/sign-in');
  
  // Take screenshot of sign-in page
  await page.screenshot({ path: 'admin-debug-1-signin-page.png', fullPage: true });
  
  // Click Google sign-in button
  await page.click('button:has-text("Google로 로그인")');
  
  // Wait for popup and handle Google login
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('button:has-text("Google로 로그인")')
  ]);
  
  await popup.waitForLoadState();
  
  // Fill Google email
  await popup.fill('input[type="email"]', 'admin@innerspell.com');
  await popup.click('#identifierNext');
  
  // Wait and enter password (you'll need the actual password)
  await popup.waitForSelector('input[type="password"]', { timeout: 10000 });
  await popup.fill('input[type="password"]', 'YOUR_PASSWORD_HERE'); // Replace with actual password
  await popup.click('#passwordNext');
  
  // Wait for redirect back to main page
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  
  // Wait a bit for auth state to propagate
  await page.waitForTimeout(5000);
  
  // Take screenshot after login
  await page.screenshot({ path: 'admin-debug-2-after-login.png', fullPage: true });
  
  // Check console logs
  page.on('console', msg => {
    console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
  });
  
  // Execute script to check user state in browser
  const userState = await page.evaluate(() => {
    // Check localStorage
    const authState = {
      localStorage: {
        emailForSignIn: localStorage.getItem('emailForSignIn'),
        userLoggedOut: localStorage.getItem('user-logged-out'),
        authStateChanged: localStorage.getItem('auth-state-changed')
      },
      // Check if we can access the React context (if exposed)
      reactContext: null
    };
    
    // Try to find React fiber and extract auth context
    const rootElement = document.getElementById('__next');
    if (rootElement && rootElement._reactRootContainer) {
      console.log('Found React root container');
    }
    
    return authState;
  });
  
  console.log('Auth state from browser:', JSON.stringify(userState, null, 2));
  
  // Check if admin menu is visible
  const adminMenuVisible = await page.locator('a[href="/admin"]:has-text("관리자 설정")').isVisible().catch(() => false);
  console.log('Admin menu visible:', adminMenuVisible);
  
  // Check navbar for any admin-related elements
  const navbarHTML = await page.locator('header').innerHTML();
  console.log('Navbar contains "관리자":', navbarHTML.includes('관리자'));
  console.log('Navbar contains "/admin":', navbarHTML.includes('/admin'));
  
  // Try to navigate to admin page directly
  await page.goto('https://innerspell.vercel.app/admin');
  await page.waitForTimeout(3000);
  
  // Take screenshot of admin page attempt
  await page.screenshot({ path: 'admin-debug-3-admin-page.png', fullPage: true });
  
  // Check current URL
  const currentURL = page.url();
  console.log('Current URL after admin navigation:', currentURL);
  
  // Check for any error messages
  const pageContent = await page.content();
  console.log('Page contains "권한":', pageContent.includes('권한'));
  console.log('Page contains "로그인":', pageContent.includes('로그인'));
  
  // Final check - look for user email on page
  const emailVisible = await page.locator('text=admin@innerspell.com').isVisible().catch(() => false);
  console.log('User email visible on page:', emailVisible);
});