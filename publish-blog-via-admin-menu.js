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
    console.log('1. Navigating to home page...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    // Click on user menu (D icon)
    console.log('2. Clicking on user menu...');
    const userIconSelector = 'button:has-text("D")';
    await page.click(userIconSelector);
    await page.waitForTimeout(1000);
    
    // Click on admin settings
    console.log('3. Clicking on 관리자 설정 (Admin Settings)...');
    await page.click('text="관리자 설정"');
    await page.waitForTimeout(3000);
    
    // Take screenshot of admin page
    await page.screenshot({ path: 'admin-settings-page.png', fullPage: true });
    
    // Look for blog management option
    console.log('4. Looking for blog management in admin area...');
    
    const blogManagementSelectors = [
      'text="블로그 관리"',
      'a:has-text("블로그 관리")',
      'button:has-text("블로그 관리")',
      '[href*="blog"]'
    ];
    
    let found = false;
    for (const selector of blogManagementSelectors) {
      if (await page.isVisible(selector)) {
        console.log(`Found blog management with selector: ${selector}`);
        await page.click(selector);
        found = true;
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    if (!found) {
      // If not found, let's check what options are available
      const menuItems = await page.$$eval('a, button, nav *', elements => 
        elements.map(el => el.textContent).filter(text => text && text.trim().length > 0)
      );
      console.log('Available menu items:', menuItems.filter(item => item.length < 50));
    }
    
    // Take screenshot after navigation
    await page.screenshot({ path: 'blog-management-area.png', fullPage: true });
    
    // Look for the specific blog post
    console.log('5. Looking for the blog post "2025년 AI 시대 타로카드 입문 가이드"...');
    const postTitle = '2025년 AI 시대 타로카드 입문 가이드';
    
    if (await page.isVisible(`text="${postTitle}"`)) {
      console.log('Found the blog post!');
      
      // Find the row containing the post
      const postRow = page.locator(`tr:has-text("${postTitle}")`);
      
      // Look for status toggle button (eye icon)
      const statusButton = postRow.locator('button').first();
      
      console.log('6. Clicking status toggle button...');
      await statusButton.click();
      
      // Wait 2 seconds as requested
      await page.waitForTimeout(2000);
      
      // Take screenshot after status change
      await page.screenshot({ path: 'after-status-change.png', fullPage: true });
      
      // Navigate to blog frontend
      console.log('7. Navigating to blog frontend...');
      await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
      
      await page.waitForTimeout(2000);
      
      // Take screenshot of blog page
      await page.screenshot({ path: 'blog-frontend-final.png', fullPage: true });
      
      // Check if post is visible
      if (await page.isVisible(`text="${postTitle}"`)) {
        console.log('8. Post is visible! Clicking to view full article...');
        await page.click(`text="${postTitle}"`);
        
        await page.waitForTimeout(2000);
        
        // Take screenshot of article
        await page.screenshot({ path: 'blog-article-final.png', fullPage: true });
        
        console.log('✅ Success! Blog post has been published and is visible on the frontend.');
      } else {
        console.log('⚠️  Post not visible on blog frontend yet.');
      }
    } else {
      console.log('⚠️  Could not find the blog post in admin area.');
      
      // Let's check what's on the page
      const pageText = await page.textContent('body');
      if (pageText.includes('블로그')) {
        console.log('Page contains blog-related content');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-final.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();