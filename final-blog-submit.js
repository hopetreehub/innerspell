const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to admin panel...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // Click on 블로그 관리 tab
    await page.click('text=블로그 관리');
    await page.waitForTimeout(1000);
    
    // Take screenshot of empty blog list
    await page.screenshot({ path: 'final-empty-blog.png', fullPage: true });
    console.log('Empty blog list screenshot taken');
    
    // Click on 새 포스트 button
    await page.click('text=새 포스트');
    await page.waitForTimeout(1000);
    
    // Fill the form
    await page.fill('input[placeholder*="제목"], input[name*="title"]', 'Playwright Test Blog Post');
    await page.fill('textarea', 'This is a comprehensive test to verify the blog management system works correctly. The post should be created and displayed in the admin panel.');
    
    // Take screenshot before looking for submit
    await page.screenshot({ path: 'final-form-ready.png', fullPage: true });
    console.log('Form filled screenshot taken');
    
    // Look for all possible submit buttons in the modal
    const modalSelector = '[role="dialog"]';
    const modal = page.locator(modalSelector);
    
    // Scroll within the modal to find submit button
    await modal.evaluate(element => {
      element.scrollTop = element.scrollHeight;
    });
    
    await page.waitForTimeout(500);
    
    // Try to find submit button
    const submitButtons = [
      'button[type="submit"]',
      'button:has-text("저장")',
      'button:has-text("등록")',
      'button:has-text("생성")',
      'button:has-text("완료")',
      'button:has-text("포스트")'
    ];
    
    // Look for buttons outside the image overlay
    await page.locator('.w-full.h-48.object-cover').waitFor(); // Wait for image to load
    
    // Take screenshot to see current state
    await page.screenshot({ path: 'final-looking-for-submit.png', fullPage: true });
    console.log('Looking for submit button screenshot taken');
    
    // Try each submit button selector
    for (const selector of submitButtons) {
      const buttons = page.locator(selector);
      const count = await buttons.count();
      console.log(`Found ${count} buttons with selector: ${selector}`);
      
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const text = await button.textContent();
          console.log(`Button ${i} text: "${text}"`);
          
          // Try to click visible submit buttons
          if (text && (text.includes('저장') || text.includes('등록') || text.includes('생성'))) {
            try {
              console.log(`Attempting to click button: ${text}`);
              await button.click({ timeout: 5000 });
              console.log('Successfully clicked submit button!');
              break;
            } catch (error) {
              console.log(`Failed to click button with text "${text}": ${error.message}`);
            }
          }
        }
      }
    }
    
    // Wait for potential response
    await page.waitForTimeout(3000);
    
    // Take screenshot after submit attempt
    await page.screenshot({ path: 'final-after-submit-attempt.png', fullPage: true });
    console.log('After submit attempt screenshot taken');
    
    // Check if we're back at the blog list or if modal is still open
    const modalStillOpen = await page.locator('[role="dialog"]').isVisible();
    console.log(`Modal still open: ${modalStillOpen}`);
    
    if (!modalStillOpen) {
      // We might be back at blog list, check for posts
      const postCount = await page.textContent('.포스트');
      console.log(`Post count text: ${postCount}`);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'final-blog-test-complete.png', fullPage: true });
    console.log('Final screenshot taken');
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'final-blog-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();