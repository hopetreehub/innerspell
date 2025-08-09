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
    
    // Print page HTML to understand structure
    console.log('=== PAGE HTML CONTENT ===');
    const htmlContent = await page.innerHTML('table');
    console.log(htmlContent.substring(0, 2000)); // Print first 2000 chars
    
    // Find all elements with "비활성" text
    const inactiveElements = page.locator('text=비활성');
    const count = await inactiveElements.count();
    console.log('Number of "비활성" elements:', count);
    
    for (let i = 0; i < count; i++) {
      const element = inactiveElements.nth(i);
      const tagName = await element.evaluate(el => el.tagName);
      const classList = await element.evaluate(el => Array.from(el.classList));
      const isClickable = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.cursor === 'pointer' || el.onclick !== null || el.getAttribute('role') === 'button';
      });
      
      console.log(`Element ${i}:`, {
        tagName,
        classList,
        isClickable
      });
    }
    
    // Take screenshot with highlighted elements
    await page.screenshot({ path: '/tmp/ui_examination.png', fullPage: true });
    
    // Now try to manually toggle the first post's status by clicking on the badge
    console.log('Attempting to click on the first 비활성 badge...');
    const firstInactiveElement = inactiveElements.first();
    
    // Try to click it
    await firstInactiveElement.click();
    await page.waitForTimeout(2000);
    
    // Check if anything changed
    await page.screenshot({ path: '/tmp/after_badge_click.png', fullPage: true });
    
    // Check current status
    const newCount = await page.locator('text=비활성').count();
    const activeCount = await page.locator('text=활성').count();
    
    console.log('After click - 비활성 count:', newCount);
    console.log('After click - 활성 count:', activeCount);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: '/tmp/examine_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();