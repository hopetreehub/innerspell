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
    
    console.log('Current blog management state (0 posts):');
    await page.screenshot({ path: 'blog-empty-state.png', fullPage: true });
    console.log('Screenshot saved: blog-empty-state.png');
    
    // Click on 새 포스트 button
    console.log('Clicking on 새 포스트 button...');
    await page.click('text=새 포스트');
    await page.waitForTimeout(2000);
    
    // Take screenshot of the create post form
    await page.screenshot({ path: 'create-post-form.png', fullPage: true });
    console.log('Screenshot saved: create-post-form.png');
    
    // Wait for form elements to load
    await page.waitForSelector('input, textarea', { timeout: 5000 });
    
    // Find and fill form fields
    const titleInput = page.locator('input[type="text"]').first();
    const contentArea = page.locator('textarea').first();
    
    if (await titleInput.isVisible()) {
      console.log('Filling title field...');
      await titleInput.fill('Test Blog Post - Created via Playwright');
      await page.waitForTimeout(500);
    }
    
    if (await contentArea.isVisible()) {
      console.log('Filling content area...');
      await contentArea.fill('This is a test blog post created to verify the blog management functionality. The content includes various details to test the creation process.');
      await page.waitForTimeout(500);
    }
    
    // Take screenshot with filled form
    await page.screenshot({ path: 'form-filled.png', fullPage: true });
    console.log('Screenshot saved: form-filled.png');
    
    // Look for save/submit button
    const saveButton = page.locator('button:has-text("저장"), button:has-text("등록"), button:has-text("생성"), button[type="submit"]').first();
    
    if (await saveButton.isVisible()) {
      console.log('Clicking save button...');
      await saveButton.click();
      await page.waitForTimeout(3000);
    }
    
    // Take screenshot after attempting to save
    await page.screenshot({ path: 'after-save-attempt.png', fullPage: true });
    console.log('Screenshot saved: after-save-attempt.png');
    
    // Navigate back to blog list to check if post was created
    console.log('Checking if we need to navigate back to blog list...');
    const backButton = page.locator('button:has-text("목록"), button:has-text("뒤로"), text=블로그 관리');
    
    if (await backButton.first().isVisible()) {
      await backButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // Take final screenshot of blog list
    await page.screenshot({ path: 'final-blog-list.png', fullPage: true });
    console.log('Screenshot saved: final-blog-list.png');
    
    // Check for posts in the list
    const postRows = await page.locator('table tbody tr').count();
    console.log(`Found ${postRows} posts in the blog list after creation attempt`);
    
  } catch (error) {
    console.error('Error during blog post creation test:', error);
    await page.screenshot({ path: 'error-during-creation.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();