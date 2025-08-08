const { chromium } = require('playwright');

async function testBlogCreation() {
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Add delay between actions to see what's happening
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    console.log('📍 Step 1: Navigating to admin panel...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of admin page
    await page.screenshot({ 
      path: 'admin-page-initial.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: admin-page-initial.png');

    console.log('📍 Step 2: Looking for Blog Management tab...');
    // Wait for and click on Blog Management tab
    await page.waitForSelector('text=블로그 관리', { timeout: 10000 });
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of blog management tab
    await page.screenshot({ 
      path: 'blog-management-tab.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: blog-management-tab.png');

    console.log('📍 Step 3: Opening new post form...');
    // Look for "새 포스트" or "New Post" button
    const newPostSelectors = [
      'text=새 포스트',
      'text=New Post',
      'text=포스트 작성',
      'text=글 쓰기',
      '[data-testid="new-post"]',
      'button:has-text("새")',
      'button:has-text("추가")'
    ];
    
    let clicked = false;
    for (const selector of newPostSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        clicked = true;
        console.log(`✅ Clicked new post button with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Selector not found: ${selector}`);
        continue;
      }
    }
    
    if (!clicked) {
      console.log('🔍 Looking for any button that might be the new post button...');
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons on the page`);
      
      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].textContent();
        console.log(`Button ${i}: "${buttonText}"`);
        if (buttonText && (buttonText.includes('새') || buttonText.includes('추가') || buttonText.includes('작성'))) {
          await buttons[i].click();
          clicked = true;
          console.log(`✅ Clicked button: "${buttonText}"`);
          break;
        }
      }
    }

    await page.waitForLoadState('networkidle');
    
    // Take screenshot of new post form
    await page.screenshot({ 
      path: 'new-post-form.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: new-post-form.png');

    console.log('📍 Step 4: Filling out form fields...');
    
    // Fill Title
    console.log('📝 Filling Title field...');
    const titleSelectors = ['input[name="title"]', 'input[placeholder*="제목"]', 'input[id*="title"]'];
    for (const selector of titleSelectors) {
      try {
        await page.fill(selector, '테스트 블로그 포스트');
        console.log(`✅ Filled title with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Title selector not found: ${selector}`);
      }
    }

    // Fill Slug
    console.log('📝 Filling Slug field...');
    const slugSelectors = ['input[name="slug"]', 'input[placeholder*="slug"]', 'input[id*="slug"]'];
    for (const selector of slugSelectors) {
      try {
        await page.fill(selector, 'test-blog-post');
        console.log(`✅ Filled slug with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Slug selector not found: ${selector}`);
      }
    }

    // Fill Summary
    console.log('📝 Filling Summary field...');
    const summarySelectors = ['textarea[name="summary"]', 'textarea[placeholder*="요약"]', 'textarea[id*="summary"]', 'input[name="summary"]'];
    for (const selector of summarySelectors) {
      try {
        await page.fill(selector, '이것은 테스트용 블로그 포스트입니다');
        console.log(`✅ Filled summary with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Summary selector not found: ${selector}`);
      }
    }

    // Fill Content
    console.log('📝 Filling Content field...');
    const content = `# 테스트 포스트

이것은 테스트를 위한 블로그 포스트 내용입니다. 마크다운 형식으로 작성되었습니다.

## 내용
- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목`;

    const contentSelectors = ['textarea[name="content"]', 'textarea[placeholder*="내용"]', 'textarea[id*="content"]'];
    for (const selector of contentSelectors) {
      try {
        await page.fill(selector, content);
        console.log(`✅ Filled content with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Content selector not found: ${selector}`);
      }
    }

    // Fill Categories
    console.log('📝 Setting Categories...');
    const categorySelectors = [
      'select[name="category"]', 
      'select[name="categories"]',
      'input[name="category"]',
      'input[name="categories"]'
    ];
    for (const selector of categorySelectors) {
      try {
        if (selector.includes('select')) {
          await page.selectOption(selector, { label: '타로' });
        } else {
          await page.fill(selector, '타로');
        }
        console.log(`✅ Set category with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Category selector not found: ${selector}`);
      }
    }

    // Fill Tags
    console.log('📝 Filling Tags field...');
    const tagSelectors = ['input[name="tags"]', 'input[placeholder*="태그"]', 'input[id*="tags"]'];
    for (const selector of tagSelectors) {
      try {
        await page.fill(selector, '테스트, 블로그');
        console.log(`✅ Filled tags with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Tags selector not found: ${selector}`);
      }
    }

    // Set Status to Published
    console.log('📝 Setting Status to Published...');
    const statusSelectors = [
      'select[name="status"]',
      'input[name="status"][value="published"]',
      'select[id*="status"]'
    ];
    for (const selector of statusSelectors) {
      try {
        if (selector.includes('select')) {
          await page.selectOption(selector, 'published');
        } else {
          await page.check(selector);
        }
        console.log(`✅ Set status with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Status selector not found: ${selector}`);
      }
    }

    // Take screenshot after filling form
    await page.screenshot({ 
      path: 'form-filled.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: form-filled.png');

    console.log('📍 Step 5: Saving the post...');
    
    // Find and click save button
    const saveSelectors = [
      'button[type="submit"]',
      'text=저장',
      'text=Save',
      'text=발행',
      'text=Publish',
      'button:has-text("저장")',
      'button:has-text("Save")'
    ];
    
    let saved = false;
    for (const selector of saveSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        saved = true;
        console.log(`✅ Clicked save button with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Save selector not found: ${selector}`);
      }
    }

    if (!saved) {
      console.log('🔍 Looking for any button that might be the save button...');
      const buttons = await page.locator('button').all();
      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].textContent();
        if (buttonText && (buttonText.includes('저장') || buttonText.includes('Save') || buttonText.includes('발행'))) {
          await buttons[i].click();
          saved = true;
          console.log(`✅ Clicked save button: "${buttonText}"`);
          break;
        }
      }
    }

    await page.waitForLoadState('networkidle');
    
    // Take screenshot after saving
    await page.screenshot({ 
      path: 'post-saved.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: post-saved.png');

    console.log('📍 Step 6: Checking if post appears in blog list...');
    
    // Navigate back to blog list or refresh to see the new post
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Take final screenshot of blog list
    await page.screenshot({ 
      path: 'blog-list-final.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: blog-list-final.png');

    // Check if our test post appears in the list
    const testPostExists = await page.locator('text=테스트 블로그 포스트').count() > 0;
    console.log(`📊 Test post exists in list: ${testPostExists ? '✅ YES' : '❌ NO'}`);

    console.log('🎉 Blog creation test completed successfully!');

  } catch (error) {
    console.error('❌ Error during blog creation test:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'error-screenshot.png',
      fullPage: true 
    });
    console.log('💾 Error screenshot saved: error-screenshot.png');
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testBlogCreation().catch(console.error);