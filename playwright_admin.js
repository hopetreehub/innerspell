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
    
    // Take initial screenshot
    await page.screenshot({ path: '/tmp/admin_initial.png', fullPage: true });
    console.log('Initial admin screenshot saved');
    
    // Click on "블로그 관리" tab
    await page.click('button[data-state="inactive"][id*="blog-management"], button:has-text("블로그 관리")');
    await page.waitForTimeout(3000);
    
    // Take screenshot after clicking blog management
    await page.screenshot({ path: '/tmp/blog_management_clicked.png', fullPage: true });
    console.log('Blog management screenshot saved');
    
    // Now look for the specific blog post
    const postText = '2025년 AI 시대 타로카드 입문 가이드: 전통적 지혜와 현대 기술의 조화';
    
    // Try to find the post by text
    const postElement = await page.locator(`text="${postText}"`).first();
    
    if (await postElement.isVisible()) {
      console.log('Found the blog post!');
      
      // Find the status toggle button (eye icon) in the same row
      const parentRow = postElement.locator('xpath=ancestor::tr').first();
      const statusButton = parentRow.locator('button:has(svg), [data-testid="status-toggle"], button[title*="상태"]').first();
      
      // Take screenshot before clicking
      await page.screenshot({ path: '/tmp/before_status_toggle.png', fullPage: true });
      
      // Click the status toggle
      await statusButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot after status change
      await page.screenshot({ path: '/tmp/after_status_toggle.png', fullPage: true });
      console.log('Status toggled!');
      
    } else {
      console.log('Post not found, taking debug screenshot');
      await page.screenshot({ path: '/tmp/post_not_found.png', fullPage: true });
    }
    
    // Now navigate to blog frontend to verify
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take screenshot of blog frontend
    await page.screenshot({ path: '/tmp/blog_frontend_final.png', fullPage: true });
    console.log('Blog frontend screenshot saved');
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: '/tmp/error_debug.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();