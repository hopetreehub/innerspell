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
    console.log('1. Navigating to admin page...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    
    // Take screenshot of admin page
    await page.screenshot({ path: 'admin-page.png', fullPage: true });
    console.log('Screenshot saved: admin-page.png');
    
    // Wait for blog management section
    console.log('2. Looking for blog management section...');
    
    // Click on blog management menu
    const blogMenuSelector = 'a[href="/admin/blog"], button:has-text("블로그 관리"), div:has-text("블로그 관리")';
    await page.waitForSelector(blogMenuSelector, { timeout: 10000 });
    await page.click(blogMenuSelector);
    
    await page.waitForTimeout(2000);
    
    // Look for the specific blog post
    console.log('3. Looking for the blog post...');
    const postTitle = '2025년 AI 시대 타로카드 입문 가이드';
    
    // Wait for the post to be visible
    await page.waitForSelector(`text="${postTitle}"`, { timeout: 10000 });
    
    // Find the eye icon button for this post
    const postRow = page.locator(`tr:has-text("${postTitle}")`);
    const eyeButton = postRow.locator('button:has(svg)').first();
    
    console.log('4. Clicking the status toggle button...');
    await eyeButton.click();
    
    // Wait 2 seconds as requested
    await page.waitForTimeout(2000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'admin-after-toggle.png', fullPage: true });
    console.log('Screenshot saved: admin-after-toggle.png');
    
    // Navigate to blog page
    console.log('5. Navigating to blog page...');
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    // Take screenshot of blog page
    await page.screenshot({ path: 'blog-page.png', fullPage: true });
    console.log('Screenshot saved: blog-page.png');
    
    // Check if the post is visible
    const postVisible = await page.isVisible(`text="${postTitle}"`);
    
    if (postVisible) {
      console.log('6. Post is visible on blog page! Clicking on it...');
      await page.click(`text="${postTitle}"`);
      
      await page.waitForTimeout(2000);
      
      // Take screenshot of article page
      await page.screenshot({ path: 'article-page.png', fullPage: true });
      console.log('Screenshot saved: article-page.png');
      
      console.log('✅ Success! Blog post has been published and is visible on the frontend.');
    } else {
      console.log('⚠️  Post not found on blog page. It may still be unpublished.');
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();