const { chromium } = require('playwright');

(async () => {
  console.log('Starting Chromium to verify deployment...');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Check Vercel deployment
    console.log('1. Checking Vercel deployment...');
    await page.goto('https://test-studio-firebase.vercel.app', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'verification-screenshots/01-vercel-home.png', fullPage: true });
    console.log('✓ Vercel deployment loaded');
    
    // Check main page elements
    console.log('2. Checking main page elements...');
    await page.waitForSelector('text=타로 카드 리딩', { timeout: 5000 });
    await page.screenshot({ path: 'verification-screenshots/02-main-elements.png', fullPage: true });
    console.log('✓ Main page elements loaded');
    
    // Check authentication
    console.log('3. Checking authentication flow...');
    const loginButton = await page.locator('text=로그인').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'verification-screenshots/03-login-modal.png', fullPage: true });
      console.log('✓ Login modal opened');
      
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    
    // Check tarot reading page
    console.log('4. Checking tarot reading page...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verification-screenshots/04-tarot-page.png', fullPage: true });
    console.log('✓ Tarot page loaded');
    
    // Check blog page
    console.log('5. Checking blog page...');
    await page.goto('https://test-studio-firebase.vercel.app/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification-screenshots/05-blog-page.png', fullPage: true });
    console.log('✓ Blog page loaded');
    
    // Check admin page (should redirect or show login)
    console.log('6. Checking admin page...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification-screenshots/06-admin-page.png', fullPage: true });
    console.log('✓ Admin page checked');
    
    // Check local development on port 4000
    console.log('7. Checking local development server on port 4000...');
    try {
      await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'verification-screenshots/07-local-port-4000.png', fullPage: true });
      console.log('✓ Local server on port 4000 is running');
    } catch (error) {
      console.log('✗ Local server on port 4000 is not running (this is expected if only checking deployment)');
    }
    
    console.log('\n✅ All verification completed! Check the screenshots in verification-screenshots/ folder');
    
  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ path: 'verification-screenshots/error-screenshot.png', fullPage: true });
  }
  
  // Keep browser open for manual inspection
  console.log('\nBrowser will remain open for manual inspection. Press Ctrl+C to close.');
  await new Promise(() => {}); // Keep process alive
})();