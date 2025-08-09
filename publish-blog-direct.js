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
    console.log('1. Navigating directly to blog management...');
    await page.goto('http://localhost:4000/admin/blog', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'blog-management.png', fullPage: true });
    console.log('Screenshot saved: blog-management.png');
    
    // Check if we see the blog posts list
    const hasPostsTable = await page.isVisible('table');
    
    if (hasPostsTable) {
      console.log('2. Found blog posts table');
      
      // Look for the specific blog post
      const postTitle = '2025년 AI 시대 타로카드 입문 가이드';
      const hasPost = await page.isVisible(`text="${postTitle}"`);
      
      if (hasPost) {
        console.log('3. Found the blog post!');
        
        // Find the status toggle button (eye icon) for this post
        // Usually in a table row containing the post title
        const postRow = page.locator(`tr:has-text("${postTitle}")`);
        
        // Look for buttons in the row
        const buttons = postRow.locator('button');
        const buttonCount = await buttons.count();
        
        console.log(`Found ${buttonCount} buttons in the post row`);
        
        // Click the first button (usually the status toggle)
        if (buttonCount > 0) {
          console.log('4. Clicking the status toggle button...');
          await buttons.first().click();
          
          // Wait 2 seconds as requested
          await page.waitForTimeout(2000);
          
          // Take screenshot after clicking
          await page.screenshot({ path: 'after-status-toggle.png', fullPage: true });
          console.log('Screenshot saved: after-status-toggle.png');
        }
        
        // Navigate to blog page
        console.log('5. Navigating to blog page...');
        await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
        
        await page.waitForTimeout(2000);
        
        // Take screenshot of blog page
        await page.screenshot({ path: 'blog-frontend.png', fullPage: true });
        console.log('Screenshot saved: blog-frontend.png');
        
        // Check if the post is visible
        const postVisible = await page.isVisible(`text="${postTitle}"`);
        
        if (postVisible) {
          console.log('6. Post is visible on blog page! Clicking on it...');
          await page.click(`text="${postTitle}"`);
          
          await page.waitForTimeout(2000);
          
          // Take screenshot of article page
          await page.screenshot({ path: 'blog-article.png', fullPage: true });
          console.log('Screenshot saved: blog-article.png');
          
          console.log('✅ Success! Blog post has been published and is visible on the frontend.');
        } else {
          console.log('⚠️  Post not found on blog page.');
        }
      } else {
        console.log('⚠️  Could not find the specified blog post in the table');
      }
    } else {
      console.log('⚠️  No blog posts table found. May need authentication.');
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();