const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to admin panel...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial admin page
    await page.screenshot({ path: 'admin-initial.png', fullPage: true });
    console.log('Screenshot saved: admin-initial.png');
    
    // Click on 블로그 관리 tab
    console.log('Clicking on 블로그 관리 tab...');
    await page.click('text=블로그 관리');
    await page.waitForTimeout(2000);
    
    // Take screenshot of blog management page
    await page.screenshot({ path: 'blog-management.png', fullPage: true });
    console.log('Screenshot saved: blog-management.png');
    
    // Check if there are any blog posts
    const blogPosts = await page.locator('[data-testid="blog-post"]').count();
    console.log(`Found ${blogPosts} blog posts`);
    
    if (blogPosts === 0) {
      console.log('No blog posts found. Attempting to create a new post...');
      
      // Fill out the blog post creation form
      await page.fill('input[name="title"]', 'Test Blog Post');
      await page.fill('textarea[name="content"]', 'This is a test blog post content for verification.');
      
      // Check if there's a category or tags field
      const categoryField = await page.locator('input[name="category"], select[name="category"]').first();
      if (await categoryField.isVisible()) {
        await categoryField.fill('Test Category');
      }
      
      // Take screenshot before saving
      await page.screenshot({ path: 'blog-form-filled.png', fullPage: true });
      console.log('Screenshot saved: blog-form-filled.png');
      
      // Click save button
      await page.click('button:has-text("저장"), button:has-text("등록"), button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Take screenshot after saving
      await page.screenshot({ path: 'blog-after-save.png', fullPage: true });
      console.log('Screenshot saved: blog-after-save.png');
      
      // Check again for blog posts
      const newBlogPosts = await page.locator('[data-testid="blog-post"]').count();
      console.log(`After creation attempt: Found ${newBlogPosts} blog posts`);
    }
    
  } catch (error) {
    console.error('Error during blog check:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();