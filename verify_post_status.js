const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate to admin page
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click on blog management tab
    await page.click('button[data-state="inactive"][id*="blog-management"], button:has-text("블로그 관리")');
    await page.waitForTimeout(2000);
    
    // Take a screenshot to see current post status
    await page.screenshot({ path: '/tmp/current_post_status.png', fullPage: true });
    console.log('Current post status screenshot saved');
    
    // Check if the post is now published (활성)
    const postText = '2025년 AI 시대 타로카드 입문 가이드';
    const postRow = page.locator(`text="${postText}"`).locator('xpath=ancestor::tr').first();
    
    // Look for the status in this row
    const statusElement = postRow.locator('text=활성, text=비활성, .badge').first();
    const currentStatus = await statusElement.textContent();
    console.log('Current post status:', currentStatus);
    
    // Now go to blog page and look for the post
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take full screenshot of blog page
    await page.screenshot({ path: '/tmp/blog_page_full.png', fullPage: true });
    console.log('Full blog page screenshot saved');
    
    // Look for the post title on the blog page
    const blogPostElement = page.locator(`text="${postText}"`);
    const isPostVisible = await blogPostElement.isVisible();
    
    console.log('Is post visible on blog page:', isPostVisible);
    
    if (isPostVisible) {
      console.log('SUCCESS: Post is now visible on the blog page!');
    } else {
      console.log('Post not visible on current view, checking page content');
      
      // Check page content for any blog posts
      const pageContent = await page.textContent('body');
      console.log('Page contains tarot guide:', pageContent.includes('타로카드 입문 가이드'));
      console.log('Page contains AI:', pageContent.includes('AI 시대'));
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: '/tmp/verify_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();