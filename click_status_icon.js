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
    
    // Take screenshot before clicking
    await page.screenshot({ path: '/tmp/before_icon_click.png', fullPage: true });
    
    // Find the status icon in the first post row
    // Look for the eye-off icon (which indicates inactive status)
    const statusIcon = page.locator('.lucide-eye-off').first();
    
    if (await statusIcon.isVisible()) {
      console.log('Found eye-off icon, clicking it...');
      
      // Click on the icon's parent badge to toggle status
      const statusBadge = statusIcon.locator('xpath=ancestor::div[@class and contains(@class, "rounded-full")]').first();
      await statusBadge.click();
      await page.waitForTimeout(2000);
      
      console.log('Clicked on status badge');
    } else {
      console.log('Eye-off icon not found, trying alternative approach');
      
      // Alternative: Look for any clickable elements in the status column
      const statusColumn = page.locator('td').filter({ hasText: /상태/ }).locator('div.rounded-full');
      const statusBadgeCount = await statusColumn.count();
      console.log('Found status badges:', statusBadgeCount);
      
      // Click on the first post's status badge
      const firstRow = page.locator('tbody tr').first();
      const statusCell = firstRow.locator('td').nth(3); // Status column (0-indexed)
      const badge = statusCell.locator('div.rounded-full');
      
      if (await badge.isVisible()) {
        console.log('Found status badge, clicking...');
        await badge.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Take screenshot after clicking
    await page.screenshot({ path: '/tmp/after_icon_click.png', fullPage: true });
    
    // Check if we now have an eye icon (active status)
    const activeIcon = page.locator('.lucide-eye');
    const hasActiveIcon = await activeIcon.count();
    console.log('Number of active eye icons after click:', hasActiveIcon);
    
    // Go to blog page to verify the change
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/tmp/blog_final_check.png', fullPage: true });
    
    // Check if post appears
    const blogContent = await page.textContent('body');
    const hasPost = blogContent.includes('2025년') || blogContent.includes('AI 시대') || blogContent.includes('타로카드');
    console.log('Blog page contains the post:', hasPost);
    
    if (hasPost) {
      console.log('SUCCESS: Post is now published and visible on blog page!');
    } else {
      console.log('Post may not be visible yet, or status change did not work');
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: '/tmp/icon_click_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();