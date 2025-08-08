const { chromium } = require('playwright');

async function createBlogPostSimple() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();

  try {
    console.log('🎯 Creating blog post with required fields only...');
    
    // Open admin and navigate to blog form
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=새 포스트');
    await page.waitForSelector('text=새 포스트 작성');
    
    console.log('✅ Form opened successfully');
    
    // Fill only the fields we can definitely access
    
    // 1. Fill Title field (we know this works)
    await page.fill('input[placeholder*="제목"]', '테스트 블로그 포스트');
    console.log('✅ Title: "테스트 블로그 포스트"');
    
    // 2. Fill Summary field (we know this works) 
    await page.fill('textarea[placeholder*="요약"]', '이것은 테스트용 블로그 포스트입니다');
    console.log('✅ Summary: "이것은 테스트용 블로그 포스트입니다"');
    
    // 3. Try to fill Content field (different selectors)
    const contentText = `# 테스트 포스트

이것은 테스트를 위한 블로그 포스트 내용입니다. 마크다운 형식으로 작성되었습니다.

## 내용
- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목`;

    let contentFilled = false;
    const contentSelectors = [
      'textarea[placeholder*="마크다운"]',
      'textarea[name="content"]',
      'textarea[rows="10"]',
      'textarea[rows="15"]',
      'textarea:not([placeholder*="요약"]):not([placeholder*="제목"])'
    ];
    
    for (const selector of contentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.fill(selector, contentText);
        contentFilled = true;
        console.log(`✅ Content filled using: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Content selector failed: ${selector}`);
      }
    }
    
    if (!contentFilled) {
      console.log('⚠️ Content field not found - continuing with title and summary only');
    }
    
    // 4. Try to fill Tags field (optional)
    try {
      await page.fill('input[placeholder*="태그"], input[name="tags"]', '테스트, 블로그', { timeout: 2000 });
      console.log('✅ Tags: "테스트, 블로그"');
    } catch (e) {
      console.log('⚠️ Tags field not accessible - skipping');
    }
    
    // 5. Try to select a category (optional)
    try {
      await page.click('select', { timeout: 2000 });
      const options = await page.locator('select option').all();
      if (options.length > 1) {
        await page.selectOption('select', { index: 1 });
        console.log('✅ Category selected');
      }
    } catch (e) {
      console.log('⚠️ Category selection failed - skipping');
    }
    
    // Take screenshot before submitting
    await page.screenshot({ path: 'simple-before-submit.png', fullPage: true });
    console.log('📸 Screenshot: simple-before-submit.png');
    
    // 6. Submit the form
    console.log('🚀 Attempting to submit form...');
    
    let submitClicked = false;
    
    // Try different submit button selectors
    const submitSelectors = [
      'button:has-text("저장")',
      'button:has-text("등록")', 
      'button:has-text("완료")',
      'button[type="submit"]'
    ];
    
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.count() > 0 && await button.isVisible()) {
          await button.click();
          submitClicked = true;
          console.log(`✅ Submit button clicked: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Manual search for submit button if automated selectors fail
    if (!submitClicked) {
      console.log('🔍 Looking for submit button manually...');
      const buttons = await page.locator('button').all();
      
      for (let i = 0; i < buttons.length; i++) {
        try {
          const buttonText = await buttons[i].textContent();
          const isVisible = await buttons[i].isVisible();
          
          if (buttonText && isVisible) {
            console.log(`Button ${i}: "${buttonText}"`);
            
            if (buttonText.includes('저장') || 
                buttonText.includes('등록') || 
                buttonText.includes('완료') ||
                buttonText.includes('발행')) {
              await buttons[i].click();
              submitClicked = true;
              console.log(`✅ Clicked: "${buttonText}"`);
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Take screenshot after submission
    await page.screenshot({ path: 'simple-after-submit.png', fullPage: true });
    console.log('📸 Screenshot: simple-after-submit.png');
    
    // Check for validation errors
    let hasValidationError = false;
    try {
      const errorMsg = await page.locator('text=필수, text=오류').count();
      if (errorMsg > 0) {
        hasValidationError = true;
        console.log('⚠️ Form validation errors detected');
      }
    } catch (e) {
      // No validation errors found
    }
    
    // 7. Check if post was created by refreshing blog list
    console.log('🔍 Checking if post was created...');
    
    // Try to close modal if it's still open
    try {
      await page.click('text=×, button[aria-label="Close"]', { timeout: 2000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      // Modal might be closed already
    }
    
    // Refresh and navigate back to blog list
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    
    // Take final screenshot
    await page.screenshot({ path: 'simple-final-list.png', fullPage: true });
    console.log('📸 Screenshot: simple-final-list.png');
    
    // Check if our post appears in the list
    const testPostExists = await page.locator('text=테스트 블로그 포스트').count() > 0;
    const testSummaryExists = await page.locator('text=테스트용 블로그').count() > 0;
    
    // Check total number of posts
    const postCount = await page.locator('.post-title, [data-testid="post-title"], h3, h4').count();
    
    console.log('\n📊 RESULTS SUMMARY:');
    console.log('================');
    console.log(`✅ Admin panel accessed: YES`);
    console.log(`✅ Blog management opened: YES`); 
    console.log(`✅ New post form opened: YES`);
    console.log(`✅ Title field filled: YES`);
    console.log(`✅ Summary field filled: YES`);
    console.log(`✅ Content field filled: ${contentFilled ? 'YES' : 'NO'}`);
    console.log(`✅ Submit button clicked: ${submitClicked ? 'YES' : 'NO'}`);
    console.log(`⚠️ Validation errors: ${hasValidationError ? 'YES' : 'NO'}`);
    console.log(`🎯 Test post found in list: ${testPostExists ? 'YES' : 'NO'}`);
    console.log(`🎯 Test summary found: ${testSummaryExists ? 'YES' : 'NO'}`);
    console.log(`📊 Total posts in list: ${postCount}`);
    
    if (testPostExists || testSummaryExists) {
      console.log('\n🎉 SUCCESS: Blog post was created successfully!');
      return { success: true, postCreated: true };
    } else if (!hasValidationError && submitClicked) {
      console.log('\n⚠️ PARTIAL: Form submitted without errors but post not visible');
      return { success: false, postCreated: false, submitted: true };
    } else {
      console.log('\n❌ FAILED: Unable to create blog post');
      return { success: false, postCreated: false, submitted: submitClicked };
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'simple-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
createBlogPostSimple().catch(console.error);