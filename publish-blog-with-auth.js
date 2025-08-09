const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // First, let's try to access the admin area
    console.log('1. Checking current admin access...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    // Check if we need to authenticate
    const needsAuth = await page.isVisible('text="타로 지침 가이드 관리"');
    
    if (needsAuth) {
      console.log('2. Admin area shows auth screen, attempting to find login option...');
      
      // Take screenshot of current state
      await page.screenshot({ path: 'admin-auth-screen.png', fullPage: true });
      
      // Look for login options
      const hasLoginButton = await page.isVisible('button:has-text("로그인"), a:has-text("로그인")');
      
      if (hasLoginButton) {
        console.log('Found login button');
      }
      
      // Try to find spread/styling selector to log in
      const hasSpreadOption = await page.isVisible('text="스프레드 & 해석 스타일 조합"');
      if (hasSpreadOption) {
        console.log('Found spread option, clicking "지침 찾기" button...');
        await page.click('button:has-text("지침 찾기")');
        await page.waitForTimeout(2000);
      }
    }
    
    // Check if we can access blog management now
    console.log('3. Attempting to access blog management...');
    
    // Look for blog management link/button in the admin interface
    const blogManagementSelectors = [
      'a:has-text("블로그 관리")',
      'button:has-text("블로그 관리")',
      'div:has-text("블로그 관리")',
      'span:has-text("블로그 관리")',
      'text="블로그 관리"'
    ];
    
    let found = false;
    for (const selector of blogManagementSelectors) {
      if (await page.isVisible(selector)) {
        console.log(`Found blog management with selector: ${selector}`);
        await page.click(selector);
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log('Blog management option not found. Taking screenshot of current page...');
      await page.screenshot({ path: 'admin-current-state.png', fullPage: true });
      
      // Let's try to check the page content
      const pageContent = await page.content();
      if (pageContent.includes('블로그')) {
        console.log('Page contains "블로그" text');
      }
      
      // Try to find any admin menu items
      const menuItems = await page.$$eval('a, button', elements => 
        elements.map(el => el.textContent).filter(text => text && text.trim())
      );
      console.log('Found menu items:', menuItems.slice(0, 10));
    }
    
    await page.waitForTimeout(2000);
    
    // Take final screenshot
    await page.screenshot({ path: 'admin-final-state.png', fullPage: true });
    console.log('Screenshot saved: admin-final-state.png');
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();