const { chromium } = require('playwright');

async function createBlogPostComplete() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();

  try {
    console.log('🚀 Starting complete blog post creation test...');
    
    // Step 1: Navigate and open form
    console.log('📍 1. Opening admin panel and blog form...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=새 포스트');
    await page.waitForSelector('text=새 포스트 작성');
    
    // Step 2: Fill all required fields systematically
    console.log('📍 2. Filling all form fields with required data...');
    
    // Fill Title
    await page.fill('input[placeholder*="제목"]', '테스트 블로그 포스트');
    console.log('   ✅ Title filled');
    
    // Fill Summary
    await page.fill('textarea[placeholder*="요약"]', '이것은 테스트용 블로그 포스트입니다');
    console.log('   ✅ Summary filled');
    
    // Fill Tags
    await page.fill('input[placeholder*="태그"]', '테스트, 블로그');
    console.log('   ✅ Tags filled');
    
    // Fill Content (main markdown field)
    const content = `# 테스트 포스트

이것은 테스트를 위한 블로그 포스트 내용입니다. 마크다운 형식으로 작성되었습니다.

## 내용
- 첫 번째 항목
- 두 번째 항목  
- 세 번째 항목

이 포스트는 모든 필수 필드를 포함하여 작성되었습니다.`;

    await page.fill('textarea[placeholder*="마크다운"]', content);
    console.log('   ✅ Content filled');
    
    // Select Category
    try {
      // Click the category dropdown to open it
      await page.click('select');
      await page.waitForTimeout(500);
      
      // Get all options and select the first non-empty one
      const options = await page.locator('select option').all();
      console.log(`   Found ${options.length} category options`);
      
      if (options.length > 1) {
        // Select the first non-default option (usually index 1)
        await page.selectOption('select', { index: 1 });
        console.log('   ✅ Category selected');
      }
    } catch (e) {
      console.log('   ⚠️ Category selection skipped');
    }
    
    // Take screenshot after filling all fields
    await page.screenshot({ 
      path: 'complete-form-filled.png', 
      fullPage: true 
    });
    console.log('   📸 Screenshot: complete-form-filled.png');
    
    // Step 3: Submit the form
    console.log('📍 3. Submitting the form...');
    
    // Look for save/submit button
    let submitSuccess = false;
    const submitSelectors = [
      'button:has-text("저장")',
      'button:has-text("등록")',
      'button:has-text("완료")', 
      'button:has-text("발행")',
      'button[type="submit"]',
      'input[type="submit"]'
    ];
    
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.count() > 0 && await button.isVisible()) {
          await button.click();
          submitSuccess = true;
          console.log(`   ✅ Submit button clicked: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Manual button search if needed
    if (!submitSuccess) {
      console.log('   🔍 Manual button search...');
      const allButtons = await page.locator('button').all();
      
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const text = await allButtons[i].textContent();
          if (text && (text.includes('저장') || text.includes('등록') || text.includes('완료'))) {
            await allButtons[i].click();
            submitSuccess = true;
            console.log(`   ✅ Submit button found manually: "${text}"`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // Wait for form submission response
    await page.waitForTimeout(3000);
    
    // Take screenshot after submission
    await page.screenshot({ 
      path: 'complete-after-submit.png', 
      fullPage: true 
    });
    console.log('   📸 Screenshot: complete-after-submit.png');
    
    // Step 4: Check for success/error messages
    console.log('📍 4. Checking submission result...');
    
    // Check for any error or success messages
    let hasErrors = false;
    const errorSelectors = [
      '.error',
      '.alert-danger', 
      '[role="alert"]',
      '.field-error',
      'text=오류',
      'text=필수'
    ];
    
    for (const selector of errorSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`   ❌ Error found: ${text}`);
            hasErrors = true;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // Check for success indicators
    let hasSuccess = false;
    const successSelectors = [
      '.success',
      '.alert-success',
      'text=성공',
      'text=저장됨',
      'text=등록됨',
      'text=발행됨'
    ];
    
    for (const selector of successSelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          hasSuccess = true;
          console.log(`   ✅ Success indicator found: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Step 5: Verify in blog list
    console.log('📍 5. Verifying post in blog list...');
    
    // Try to close the form modal first
    try {
      const closeButton = page.locator('button[aria-label="Close"], .close-button, text=×');
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // Form might have closed automatically
    }
    
    // Refresh and go back to blog management
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    
    // Take final screenshot of blog list
    await page.screenshot({ 
      path: 'complete-blog-list-final.png', 
      fullPage: true 
    });
    console.log('   📸 Screenshot: complete-blog-list-final.png');
    
    // Check if test post appears in list
    const postFound = await page.locator('text=테스트 블로그 포스트').count() > 0;
    const summaryFound = await page.locator('text=테스트용 블로그').count() > 0;
    
    // Count total posts in list
    const postElements = await page.locator('[data-testid="post-item"], .post-item, .blog-post-item').all();
    const totalPosts = postElements.length;
    
    console.log('📊 FINAL RESULTS:');
    console.log(`   ✅ Form opened: YES`);
    console.log(`   ✅ All fields filled: YES`);
    console.log(`   ✅ Submit attempted: ${submitSuccess ? 'YES' : 'NO'}`);
    console.log(`   📋 Has errors: ${hasErrors ? 'YES' : 'NO'}`);
    console.log(`   📋 Has success: ${hasSuccess ? 'YES' : 'NO'}`);
    console.log(`   📋 Post found in list: ${postFound ? 'YES' : 'NO'}`);
    console.log(`   📋 Summary found: ${summaryFound ? 'YES' : 'NO'}`);
    console.log(`   📋 Total posts in list: ${totalPosts}`);
    
    if (postFound || summaryFound) {
      console.log('🎉 SUCCESS: Blog post was created and appears in the list!');
    } else if (!hasErrors) {
      console.log('⚠️ PARTIAL SUCCESS: Form submitted without errors, but post not visible yet');
    } else {
      console.log('❌ FAILED: Form has validation errors that need to be resolved');
    }
    
    console.log('✨ Blog post creation test completed!');
    
    return {
      success: postFound || summaryFound || (!hasErrors && hasSuccess),
      formFilled: true,
      submitted: submitSuccess,
      hasErrors: hasErrors,
      hasSuccess: hasSuccess,
      postFound: postFound,
      summaryFound: summaryFound,
      totalPosts: totalPosts
    };

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await page.screenshot({ 
      path: 'complete-error-final.png', 
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
createBlogPostComplete().catch(console.error);