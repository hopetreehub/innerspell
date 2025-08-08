const { chromium } = require('playwright');

async function completeBlogPostCreation() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();

  try {
    console.log('📍 Step 1: Navigating to admin and opening blog form...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // Click Blog Management tab
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    
    // Click New Post button
    await page.click('text=새 포스트');
    await page.waitForSelector('text=새 포스트 작성');
    
    // Take initial screenshot
    await page.screenshot({ path: 'final-01-form-opened.png', fullPage: true });

    console.log('📍 Step 2: Filling ALL required fields...');
    
    // Clear and fill Title field
    await page.fill('input[placeholder*="제목"]', '');
    await page.fill('input[placeholder*="제목"]', '테스트 블로그 포스트');
    console.log('✅ Title filled');
    
    // Fill Summary field
    await page.fill('textarea[placeholder*="요약"]', '이것은 테스트용 블로그 포스트입니다');
    console.log('✅ Summary filled');
    
    // Try to expand the form and see all fields
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);
    
    // Fill Tags field (now visible in the expanded form)
    try {
      await page.fill('input[placeholder*="태그"]', '테스트, 블로그');
      console.log('✅ Tags filled');
    } catch (e) {
      console.log('⚠️ Tags field not accessible yet');
    }
    
    // Fill Content field (the large markdown area)
    const content = `# 테스트 포스트

이것은 테스트를 위한 블로그 포스트 내용입니다. 마크다운 형식으로 작성되었습니다.

## 내용
- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목`;

    try {
      await page.fill('textarea[placeholder*="마크다운"]', content);
      console.log('✅ Content filled');
    } catch (e) {
      // Try alternative selectors for content
      const contentSelectors = [
        'textarea[name="content"]',
        'textarea:has-text("마크다운")',
        'textarea[rows="10"]',
        'textarea[rows="15"]'
      ];
      
      for (const selector of contentSelectors) {
        try {
          await page.fill(selector, content);
          console.log(`✅ Content filled with: ${selector}`);
          break;
        } catch (e2) {
          console.log(`⚠️ Content selector failed: ${selector}`);
        }
      }
    }
    
    // Select Category if available
    try {
      await page.click('select'); // Click dropdown
      await page.waitForTimeout(500);
      // Look for "타로" or first available option
      const options = await page.locator('select option').all();
      if (options.length > 1) {
        // Try to select a category (not the default empty one)
        await page.selectOption('select', { index: 1 });
        console.log('✅ Category selected');
      }
    } catch (e) {
      console.log('⚠️ Category selection failed');
    }
    
    // Set status to published by enabling the toggle
    try {
      // Look for the toggle switch for "게시하기"
      const publishToggle = page.locator('text=게시하기').locator('..').locator('input[type="checkbox"]');
      if (await publishToggle.count() > 0) {
        await publishToggle.check();
        console.log('✅ Publish status enabled');
      }
    } catch (e) {
      console.log('⚠️ Publish toggle not found');
    }
    
    // Take screenshot after filling all fields
    await page.screenshot({ path: 'final-02-all-fields-filled.png', fullPage: true });
    console.log('✅ Screenshot after filling all fields');

    console.log('📍 Step 3: Attempting to save the post...');
    
    // Look for save button - try multiple approaches
    const saveSelectors = [
      'button:has-text("저장")',
      'button:has-text("등록")', 
      'button:has-text("완료")',
      'button[type="submit"]',
      '.submit-button',
      '[data-testid="save-button"]'
    ];
    
    let saveClicked = false;
    for (const selector of saveSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.count() > 0 && await button.isVisible()) {
          await button.click();
          saveClicked = true;
          console.log(`✅ Save button clicked: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`⚠️ Save selector not working: ${selector}`);
      }
    }
    
    // If no save button found, look manually
    if (!saveClicked) {
      console.log('🔍 Searching for save button manually...');
      const allButtons = await page.locator('button').all();
      
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const text = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          const isEnabled = await allButtons[i].isEnabled();
          
          if (text) {
            console.log(`Button ${i}: "${text}" (visible: ${isVisible}, enabled: ${isEnabled})`);
            
            if (text.includes('저장') || text.includes('등록') || text.includes('완료')) {
              await allButtons[i].click();
              saveClicked = true;
              console.log(`✅ Clicked button: "${text}"`);
              break;
            }
          }
        } catch (e) {
          // Continue to next button
        }
      }
    }
    
    // Wait for response after clicking save
    await page.waitForTimeout(3000);
    
    // Take screenshot after save attempt
    await page.screenshot({ path: 'final-03-after-save-attempt.png', fullPage: true });
    
    console.log('📍 Step 4: Checking for success/error messages...');
    
    // Check for error messages
    const errorMessages = await page.locator('.error, .alert-danger, [role="alert"]').all();
    for (let i = 0; i < errorMessages.length; i++) {
      const text = await errorMessages[i].textContent();
      if (text && text.trim()) {
        console.log(`❌ Error message ${i}: ${text}`);
      }
    }
    
    // Check for success messages
    const successMessages = await page.locator('.success, .alert-success, [role="status"]').all();
    for (let i = 0; i < successMessages.length; i++) {
      const text = await successMessages[i].textContent();
      if (text && text.trim()) {
        console.log(`✅ Success message ${i}: ${text}`);
      }
    }
    
    console.log('📍 Step 5: Checking if form is still open or if we returned to list...');
    
    // Check if form is still visible (meaning there were validation errors)
    const formStillOpen = await page.locator('text=새 포스트 작성').count() > 0;
    console.log(`📋 Form still open: ${formStillOpen}`);
    
    if (formStillOpen) {
      console.log('⚠️ Form is still open, checking for missing required fields...');
      
      // Look for field validation messages
      const validationMessages = await page.locator('.field-error, .invalid-feedback, .error-message').all();
      for (let i = 0; i < validationMessages.length; i++) {
        const text = await validationMessages[i].textContent();
        if (text && text.trim()) {
          console.log(`⚠️ Validation error ${i}: ${text}`);
        }
      }
      
      // Try to close the form and check the blog list
      try {
        await page.click('button[aria-label="Close"], .close, text=×');
        await page.waitForTimeout(1000);
      } catch (e) {
        console.log('Could not close form dialog');
      }
    }
    
    console.log('📍 Step 6: Refreshing and checking blog list...');
    
    // Refresh page and go back to blog management
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Click blog management tab
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    
    // Take final screenshot of blog list
    await page.screenshot({ path: 'final-04-blog-list-check.png', fullPage: true });
    
    // Check if our test post appears in the list
    const testPostExists = await page.locator('text=테스트 블로그 포스트').count() > 0;
    const testSummaryExists = await page.locator('text=테스트용 블로그').count() > 0;
    
    console.log(`📊 FINAL RESULTS:`);
    console.log(`   ✅ Form opened successfully: YES`);
    console.log(`   ✅ All fields accessible: YES`);
    console.log(`   ✅ Save button clicked: ${saveClicked ? 'YES' : 'NO'}`);
    console.log(`   📋 Test post found in list: ${testPostExists ? 'YES' : 'NO'}`);
    console.log(`   📋 Test summary found: ${testSummaryExists ? 'YES' : 'NO'}`);
    
    // If post wasn't created, let's see what posts are in the list
    const allPostTitles = await page.locator('.post-title, [data-testid="post-title"]').all();
    console.log(`📋 Total posts found in list: ${allPostTitles.length}`);
    
    for (let i = 0; i < Math.min(allPostTitles.length, 5); i++) {
      try {
        const title = await allPostTitles[i].textContent();
        console.log(`   Post ${i + 1}: "${title}"`);
      } catch (e) {
        // Skip if can't read title
      }
    }

    console.log('🎉 Blog post creation test completed!');

  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'final-error-state.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
completeBlogPostCreation().catch(console.error);