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
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'initial-state.png', fullPage: true });
    
    // Click on the first user menu button (in the main header)
    console.log('2. Clicking on user menu in header...');
    const userButton = page.locator('[data-testid="user-profile"]').first();
    await userButton.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of menu
    await page.screenshot({ path: 'user-menu-open.png', fullPage: false });
    
    // Click on admin settings link
    console.log('3. Clicking on admin settings...');
    await page.locator('a[href="/admin"]').click();
    await page.waitForTimeout(3000);
    
    // Take screenshot of where we landed
    await page.screenshot({ path: 'after-admin-click.png', fullPage: true });
    
    // Check if we're at the admin dashboard
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Let's check what's on the admin page
    const pageContent = await page.textContent('body');
    
    if (pageContent.includes('타로 지침')) {
      console.log('4. We are at Tarot Guidelines admin page');
      
      // Look for navigation tabs or menu items
      const navItems = await page.locator('nav a, button').allTextContents();
      console.log('Navigation items found:', navItems.filter(item => item.trim()));
      
      // Try to find blog-related navigation
      const blogNavSelectors = [
        'a:has-text("블로그")',
        'button:has-text("블로그")',
        'nav >> text="블로그"',
        '[role="tab"]:has-text("블로그")'
      ];
      
      for (const selector of blogNavSelectors) {
        if (await page.isVisible(selector)) {
          console.log(`5. Found blog navigation: ${selector}`);
          await page.locator(selector).click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }
    
    // Take screenshot after navigation attempt
    await page.screenshot({ path: 'after-blog-nav.png', fullPage: true });
    
    // Look for the blog post
    console.log('6. Looking for blog posts...');
    const postTitle = '2025년 AI 시대 타로카드 입문 가이드';
    
    if (await page.isVisible(`text="${postTitle}"`)) {
      console.log('Found the blog post!');
      
      // Look for any toggle/button near the post
      const postElement = page.locator(`text="${postTitle}"`);
      const parentRow = postElement.locator('xpath=ancestor::tr').first();
      
      if (await parentRow.isVisible()) {
        const buttons = await parentRow.locator('button').all();
        console.log(`Found ${buttons.length} buttons in the post row`);
        
        if (buttons.length > 0) {
          console.log('7. Clicking the status toggle button...');
          await buttons[0].click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'after-toggle.png', fullPage: true });
        }
      }
    }
    
    // Navigate to blog frontend
    console.log('8. Navigating to blog frontend...');
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'blog-frontend-check.png', fullPage: true });
    
    // Check if post is visible
    if (await page.isVisible(`text="${postTitle}"`)) {
      console.log('✅ Post is now visible on the blog!');
      
      // Click on the post
      await page.locator(`text="${postTitle}"`).click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'blog-article-view.png', fullPage: true });
      console.log('✅ Successfully viewing the blog article!');
    } else {
      console.log('⚠️  Post is not yet visible on the blog');
      
      // Check if there are any posts at all
      const postCount = await page.locator('article, .blog-post, [class*="post"]').count();
      console.log(`Found ${postCount} posts on the blog page`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-specific.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();