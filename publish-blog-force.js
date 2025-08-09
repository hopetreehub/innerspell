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
    
    // First, let's close any overlays or popups
    console.log('2. Checking for overlays...');
    
    // Try to close any modal/overlay by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Click on user menu - use force click if needed
    console.log('3. Force clicking on user menu...');
    await page.locator('button:has-text("D")').click({ force: true });
    await page.waitForTimeout(1000);
    
    // Force click on admin settings
    console.log('4. Force clicking on admin settings...');
    await page.locator('text="관리자 설정"').click({ force: true });
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'admin-force-nav.png', fullPage: true });
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // If we're at admin page, look for blog management
    if (currentUrl.includes('admin')) {
      console.log('5. Successfully reached admin area');
      
      // Look for blog management link
      const blogLinks = [
        'text="블로그 관리"',
        'text="블로그"',
        'text="게시물"',
        'text="Posts"',
        'text="Blog"'
      ];
      
      for (const selector of blogLinks) {
        if (await page.isVisible(selector)) {
          console.log(`Found: ${selector}`);
          await page.locator(selector).click({ force: true });
          await page.waitForTimeout(2000);
          break;
        }
      }
    } else {
      // Try direct navigation
      console.log('5. Direct navigation to admin...');
      await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'admin-final-force.png', fullPage: true });
    
    // Look for any table or list that might contain blog posts
    console.log('6. Looking for blog posts...');
    
    const hasTable = await page.isVisible('table');
    const hasList = await page.isVisible('ul');
    
    if (hasTable || hasList) {
      console.log('Found content area');
      
      // Look for the specific post
      const postTitle = '2025년 AI 시대 타로카드 입문 가이드';
      if (await page.isVisible(`text="${postTitle}"`)) {
        console.log('Found the blog post!');
        
        // Find any button near the post title
        const buttons = await page.locator(`tr:has-text("${postTitle}") button, div:has-text("${postTitle}") button`).all();
        
        if (buttons.length > 0) {
          console.log(`Found ${buttons.length} buttons near the post`);
          
          // Click the first button (usually status toggle)
          await buttons[0].click({ force: true });
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'after-toggle-force.png', fullPage: true });
        }
      }
    }
    
    // Navigate to blog to check
    console.log('7. Checking blog frontend...');
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'blog-check-force.png', fullPage: true });
    
    const postTitle = '2025년 AI 시대 타로카드 입문 가이드';
    if (await page.isVisible(`text="${postTitle}"`)) {
      console.log('✅ Post is visible on blog!');
      
      await page.locator(`text="${postTitle}"`).click({ force: true });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'article-view-force.png', fullPage: true });
      console.log('✅ Successfully viewed the article!');
    } else {
      console.log('⚠️  Post not yet visible on blog');
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-force.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();