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
    await page.waitForTimeout(3000);
    
    // Take screenshot before toggling
    await page.screenshot({ path: '/tmp/before_toggle_attempt.png', fullPage: true });
    
    // Find the specific post row and look for the status toggle button (eye icon)
    const postText = '2025년 AI 시대 타로카드 입문 가이드';
    
    // Find all rows in the table
    const tableRows = page.locator('tr');
    const rowCount = await tableRows.count();
    console.log('Number of table rows:', rowCount);
    
    // Look for the row containing our post
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      const rowText = await row.textContent();
      
      if (rowText && rowText.includes('2025년 AI 시대 타로카드 입문 가이드')) {
        console.log('Found the target post row:', i);
        
        // Look for buttons or clickable elements with "비활성" status in this row
        const statusButtons = row.locator('button, [role="button"], .cursor-pointer');
        const buttonCount = await statusButtons.count();
        console.log('Number of clickable elements in row:', buttonCount);
        
        // Try to find and click the status button
        for (let j = 0; j < buttonCount; j++) {
          const button = statusButtons.nth(j);
          const buttonText = await button.textContent();
          console.log(`Button ${j} text:`, buttonText);
          
          // Look for the status badge that says "비활성"
          if (buttonText && buttonText.includes('비활성')) {
            console.log('Found status button, clicking...');
            await button.click();
            await page.waitForTimeout(2000);
            break;
          }
        }
        break;
      }
    }
    
    // Take screenshot after toggling attempt
    await page.screenshot({ path: '/tmp/after_toggle_attempt.png', fullPage: true });
    
    // Wait a moment and check if status changed
    await page.waitForTimeout(3000);
    
    // Take final screenshot to see the result
    await page.screenshot({ path: '/tmp/final_status_check.png', fullPage: true });
    console.log('Final status check screenshot saved');
    
    // Go to blog page to verify
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/tmp/blog_page_after_toggle.png', fullPage: true });
    console.log('Blog page after toggle screenshot saved');
    
    // Check if the post appears on the blog page
    const postOnBlog = page.locator('text*="AI 시대 타로카드"');
    const isVisible = await postOnBlog.isVisible();
    console.log('Post visible on blog page:', isVisible);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: '/tmp/toggle_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();