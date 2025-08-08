const { chromium } = require('playwright');

(async () => {
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
    
    // Click on 블로그 관리 tab
    console.log('Clicking on 블로그 관리 tab...');
    await page.click('text=블로그 관리');
    await page.waitForTimeout(2000);
    
    console.log('Taking screenshot of empty blog list...');
    await page.screenshot({ path: 'empty-blog-list.png', fullPage: true });
    console.log('Screenshot saved: empty-blog-list.png');
    
    // Click on 새 포스트 button
    console.log('Clicking on 새 포스트 button...');
    await page.click('text=새 포스트');
    await page.waitForTimeout(2000);
    
    // Fill the title field
    console.log('Filling title field...');
    await page.fill('input[placeholder*="제목"], input[name*="title"]', 'Test Blog Post Title');
    await page.waitForTimeout(500);
    
    // Fill the content field
    console.log('Filling content field...');
    await page.fill('textarea', 'This is a comprehensive test blog post to verify the blog management functionality works correctly. The content should be saved and displayed properly in the blog list.');
    await page.waitForTimeout(500);
    
    // Try to select a category if dropdown exists
    console.log('Checking for category dropdown...');
    const categoryDropdown = page.locator('select, [role="combobox"]').first();
    if (await categoryDropdown.isVisible()) {
      await categoryDropdown.click();
      await page.waitForTimeout(500);
      // Try to select first available option
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
      }
    }
    
    await page.screenshot({ path: 'filled-form.png', fullPage: true });
    console.log('Screenshot saved: filled-form.png');
    
    // Scroll to bottom of modal to find submit button
    console.log('Scrolling in the modal to find submit button...');
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(500);
    
    // Try multiple approaches to find and click the submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("저장")',
      'button:has-text("등록")',
      'button:has-text("생성")',
      'button:has-text("완료")',
      '.modal button:last-child',
      '[data-testid="submit"], [data-testid="save"]'
    ];
    
    let buttonFound = false;
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        console.log(`Found submit button with selector: ${selector}`);
        try {
          // Force click if normal click is blocked
          await button.click({ force: true });
          buttonFound = true;
          break;
        } catch (error) {
          console.log(`Failed to click with ${selector}, trying next...`);
        }
      }
    }
    
    if (!buttonFound) {
      console.log('No submit button found, trying to press Enter...');
      await page.keyboard.press('Enter');
    }
    
    await page.waitForTimeout(3000);
    
    // Take screenshot after submit attempt
    await page.screenshot({ path: 'after-submit.png', fullPage: true });
    console.log('Screenshot saved: after-submit.png');
    
    // Check if we're back to the blog list or if there are any success messages
    const successMessage = page.locator('text=성공, text=완료, text=저장됨, .success');
    if (await successMessage.isVisible()) {
      console.log('Success message detected!');
    }
    
    // Try to navigate back to blog list
    const backToListSelectors = [
      'text=블로그 관리',
      'text=목록',
      'text=뒤로',
      'button:has-text("목록")'
    ];
    
    for (const selector of backToListSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Final screenshot of blog list
    await page.screenshot({ path: 'final-blog-list.png', fullPage: true });
    console.log('Screenshot saved: final-blog-list.png');
    
    // Check if any posts are now visible
    const postsText = await page.textContent('text=개의 포스트');
    console.log(`Posts status: ${postsText || 'No posts text found'}`);
    
  } catch (error) {
    console.error('Error during blog management test:', error);
    await page.screenshot({ path: 'error-complete-test.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();