const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 }); // Visible browser to debug
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
    
    console.log('Navigated to blog management');
    
    // Find the first post row
    const firstPostRow = page.locator('tbody tr').first();
    
    // Look specifically for the status badge in the status column (4th column, 0-indexed = 3)
    const statusCell = firstPostRow.locator('td').nth(3);
    const statusBadge = statusCell.locator('div.rounded-full').first();
    
    console.log('Found status badge, taking screenshot before click');
    await page.screenshot({ path: '/tmp/direct_before_click.png', fullPage: true });
    
    // Click on the status badge
    await statusBadge.click();
    console.log('Clicked on status badge');
    
    // Wait for any potential API call or state change
    await page.waitForTimeout(2000);
    
    // Take screenshot after click
    await page.screenshot({ path: '/tmp/direct_after_click.png', fullPage: true });
    
    // Check if the icon changed from eye-off to eye
    const hasEyeIcon = await statusCell.locator('.lucide-eye').count();
    const hasEyeOffIcon = await statusCell.locator('.lucide-eye-off').count();
    
    console.log('After click - Eye icon (active):', hasEyeIcon);
    console.log('After click - Eye-off icon (inactive):', hasEyeOffIcon);
    
    // If it's now active (eye icon), go check blog
    if (hasEyeIcon > 0) {
      console.log('Status appears to be active now, checking blog page...');
      
      await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: '/tmp/direct_blog_check.png', fullPage: true });
      
      // Look for the post content
      const hasPostContent = await page.locator('text*="2025년 AI 시대 타로카드"').isVisible();
      console.log('Post visible on blog:', hasPostContent);
    } else {
      console.log('Status toggle may not have worked, post still appears inactive');
    }
    
    // Wait 5 seconds for manual inspection if needed
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: '/tmp/direct_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();