const { chromium } = require('playwright');

async function completeBlogTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    console.log('📍 Step 1: Navigating to admin panel...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    console.log('📍 Step 2: Clicking Blog Management tab...');
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    console.log('📍 Step 3: Opening new post form...');
    await page.click('text=새 포스트');
    await page.waitForSelector('text=새 포스트 작성', { timeout: 10000 });
    
    // Take screenshot of opened form
    await page.screenshot({ path: 'step3-form-opened.png', fullPage: true });
    console.log('✅ Screenshot: step3-form-opened.png');

    console.log('📍 Step 4: Filling form fields...');
    
    // Fill Title - clear first then type
    console.log('  📝 Filling Title...');
    await page.fill('input[placeholder*="제목"]', '');
    await page.fill('input[placeholder*="제목"]', '테스트 블로그 포스트');
    
    // Fill Summary
    console.log('  📝 Filling Summary...');
    await page.fill('textarea[placeholder*="요약"]', '이것은 테스트용 블로그 포스트입니다');
    
    // Try to select category if available
    console.log('  📝 Setting Category...');
    try {
      await page.click('select', { timeout: 2000 });
      const options = await page.locator('select option').all();
      if (options.length > 1) {
        await page.selectOption('select', { index: 1 }); // Select first non-default option
      }
    } catch (e) {
      console.log('  ⚠️ Category selection not available or failed');
    }

    // Take screenshot after filling basic fields
    await page.screenshot({ path: 'step4-basic-fields-filled.png', fullPage: true });
    console.log('✅ Screenshot: step4-basic-fields-filled.png');

    // Scroll down to see more fields if they exist
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);

    // Look for additional fields like content, slug, tags, status
    console.log('  📝 Looking for additional fields...');
    
    // Try to find and fill content field
    const contentSelectors = [
      'textarea[name="content"]', 
      'textarea[placeholder*="내용"]',
      '.cm-editor .cm-content', // CodeMirror editor
      '[data-testid="content-editor"]'
    ];
    
    let contentFilled = false;
    for (const selector of contentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        const content = `# 테스트 포스트

이것은 테스트를 위한 블로그 포스트 내용입니다. 마크다운 형식으로 작성되었습니다.

## 내용
- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목`;
        
        await page.fill(selector, content);
        contentFilled = true;
        console.log(`  ✅ Content filled with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`  ⚠️ Content selector not found: ${selector}`);
      }
    }

    // Try to find and fill slug field
    const slugSelectors = ['input[name="slug"]', 'input[placeholder*="slug"]', 'input[placeholder*="URL"]'];
    for (const selector of slugSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.fill(selector, 'test-blog-post');
        console.log(`  ✅ Slug filled with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`  ⚠️ Slug selector not found: ${selector}`);
      }
    }

    // Try to find and fill tags field
    const tagSelectors = ['input[name="tags"]', 'input[placeholder*="태그"]'];
    for (const selector of tagSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.fill(selector, '테스트, 블로그');
        console.log(`  ✅ Tags filled with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`  ⚠️ Tags selector not found: ${selector}`);
      }
    }

    // Try to set status to published
    const statusSelectors = [
      'select[name="status"]',
      'input[name="status"][value="published"]',
      'input[type="checkbox"][name="published"]'
    ];
    for (const selector of statusSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        if (selector.includes('select')) {
          await page.selectOption(selector, 'published');
        } else if (selector.includes('checkbox')) {
          await page.check(selector);
        } else {
          await page.check(selector);
        }
        console.log(`  ✅ Status set with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`  ⚠️ Status selector not found: ${selector}`);
      }
    }

    // Take screenshot after filling all fields
    await page.screenshot({ path: 'step4-all-fields-filled.png', fullPage: true });
    console.log('✅ Screenshot: step4-all-fields-filled.png');

    console.log('📍 Step 5: Looking for save button...');
    
    // Find and click save/submit button
    const saveSelectors = [
      'button[type="submit"]',
      'button:has-text("저장")',
      'button:has-text("발행")',
      'button:has-text("등록")',
      'button:has-text("완료")',
      'text=저장',
      'text=발행',
      'text=등록',
      'text=완료'
    ];
    
    let saved = false;
    for (const selector of saveSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        
        // Take screenshot before clicking save
        await page.screenshot({ path: 'step5-before-save.png', fullPage: true });
        console.log('✅ Screenshot: step5-before-save.png');
        
        await page.click(selector);
        console.log(`  ✅ Clicked save button with selector: ${selector}`);
        saved = true;
        break;
      } catch (e) {
        console.log(`  ⚠️ Save selector not found: ${selector}`);
      }
    }

    if (!saved) {
      console.log('🔍 Manually looking for save button...');
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons on the page`);
      
      for (let i = 0; i < buttons.length; i++) {
        try {
          const buttonText = await buttons[i].textContent();
          const isVisible = await buttons[i].isVisible();
          const isEnabled = await buttons[i].isEnabled();
          
          console.log(`  Button ${i}: "${buttonText}" (visible: ${isVisible}, enabled: ${isEnabled})`);
          
          if (buttonText && (
            buttonText.includes('저장') || 
            buttonText.includes('발행') || 
            buttonText.includes('등록') || 
            buttonText.includes('완료') ||
            buttonText.includes('submit') ||
            buttonText.toLowerCase().includes('save')
          )) {
            await buttons[i].click();
            saved = true;
            console.log(`  ✅ Clicked save button: "${buttonText}"`);
            break;
          }
        } catch (e) {
          console.log(`  ⚠️ Error checking button ${i}: ${e.message}`);
        }
      }
    }

    // Wait a bit after clicking save
    await page.waitForTimeout(3000);
    
    // Take screenshot after save attempt
    await page.screenshot({ path: 'step5-after-save.png', fullPage: true });
    console.log('✅ Screenshot: step5-after-save.png');

    console.log('📍 Step 6: Checking if post was saved...');
    
    // Check if we're back to the blog list or if there's a success message
    const successIndicators = [
      'text=성공',
      'text=저장됨',
      'text=발행됨',
      'text=등록됨',
      '.success',
      '.alert-success',
      '[role="alert"]'
    ];

    let successFound = false;
    for (const indicator of successIndicators) {
      try {
        await page.waitForSelector(indicator, { timeout: 2000 });
        successFound = true;
        console.log(`  ✅ Success indicator found: ${indicator}`);
        break;
      } catch (e) {
        // Continue checking other indicators
      }
    }

    // Try to go back to blog list to verify the post was created
    console.log('📍 Step 7: Verifying post in blog list...');
    
    // Close modal if it's still open
    try {
      await page.click('button[aria-label="Close"]', { timeout: 2000 });
    } catch (e) {
      // Modal might already be closed
    }

    try {
      await page.click('text=×', { timeout: 2000 }); // Close button
    } catch (e) {
      // Close button might not exist
    }

    // Refresh to see latest posts
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Click blog management tab again
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Take final screenshot
    await page.screenshot({ path: 'step7-final-blog-list.png', fullPage: true });
    console.log('✅ Screenshot: step7-final-blog-list.png');

    // Check if our test post appears in the list
    const testPostExists = await page.locator('text=테스트 블로그 포스트').count() > 0;
    console.log(`📊 Test post exists in list: ${testPostExists ? '✅ YES' : '❌ NO'}`);

    // Also check for the post content or slug
    const testPostContentExists = await page.locator('text=테스트를 위한 블로그').count() > 0;
    console.log(`📊 Test post content found: ${testPostContentExists ? '✅ YES' : '❌ NO'}`);

    console.log('🎉 Blog creation test completed!');

    const results = {
      formOpened: true,
      fieldsAccessible: true,
      saveAttempted: saved,
      successIndicator: successFound,
      postFoundInList: testPostExists,
      timestamp: new Date().toISOString()
    };

    console.log('📋 Final Results:', JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('❌ Error during blog creation test:', error);
    
    await page.screenshot({ path: 'error-final-state.png', fullPage: true });
    console.log('💾 Error screenshot saved: error-final-state.png');
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
completeBlogTest().catch(console.error);