const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to admin
    console.log('1. Navigating to admin...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click on blog management tab
    console.log('2. Looking for blog management tab...');
    const blogTab = page.locator('text="블로그 관리"').first();
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot of blog management
    await page.screenshot({ path: 'blog-admin-initial.png', fullPage: true });
    
    // Look for any buttons to add or manage posts
    console.log('3. Looking for post management options...');
    const addPostButtons = [
      'button:has-text("새 포스트")',
      'button:has-text("포스트 추가")',
      'button:has-text("추가")',
      'button:has-text("+")',
      'a:has-text("새 포스트")',
      'a:has-text("Add")'
    ];
    
    for (const selector of addPostButtons) {
      if (await page.isVisible(selector)) {
        console.log(`Found: ${selector}`);
      }
    }
    
    // Check if there's a way to view all posts or drafts
    const viewOptions = [
      'text="전체"',
      'text="모든 포스트"',
      'text="초안"',
      'text="게시됨"',
      'text="미게시"',
      'button:has-text("전체")',
      'select'
    ];
    
    for (const selector of viewOptions) {
      if (await page.isVisible(selector)) {
        console.log(`4. Found view option: ${selector}`);
        
        // If it's a select element, check its options
        if (selector === 'select') {
          const options = await page.locator('select option').allTextContents();
          console.log('Select options:', options);
        }
      }
    }
    
    // Try to look for any existing posts in a table or list
    console.log('5. Looking for posts in different ways...');
    
    // Check for table rows
    const tableRows = await page.locator('tbody tr').count();
    console.log(`Found ${tableRows} table rows`);
    
    // Check for any content that might be posts
    const postContainers = await page.locator('article, .post, [class*="post"], [class*="blog"]').count();
    console.log(`Found ${postContainers} post-like containers`);
    
    // Look specifically for our target post anywhere on the page
    const targetPost = '2025년 AI 시대 타로카드 입문 가이드';
    const hasTargetPost = await page.locator(`text="${targetPost}"`).count();
    console.log(`Target post found ${hasTargetPost} times`);
    
    // Check if we need to change any filters or search
    const searchBox = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"]').first();
    if (await searchBox.isVisible()) {
      console.log('6. Found search box, trying to search for posts...');
      await searchBox.fill('타로카드');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // Take screenshot after search
      await page.screenshot({ path: 'blog-admin-after-search.png', fullPage: true });
      
      // Check again for the post
      const afterSearchCount = await page.locator(`text="${targetPost}"`).count();
      console.log(`After search, target post found ${afterSearchCount} times`);
    }
    
    // Try clicking on any tabs or filters
    const tabs = await page.locator('[role="tab"], .tab').all();
    console.log(`Found ${tabs.length} tabs`);
    
    for (let i = 0; i < tabs.length && i < 5; i++) {
      const tabText = await tabs[i].textContent();
      console.log(`Tab ${i + 1}: ${tabText}`);
    }
    
    // Final attempt - check page source for hidden content
    const pageContent = await page.content();
    if (pageContent.includes(targetPost)) {
      console.log('7. Target post exists in page source!');
      
      // It might be hidden, try to make it visible
      await page.evaluate(() => {
        // Remove any display:none or visibility:hidden
        document.querySelectorAll('*').forEach(el => {
          if (el.textContent && el.textContent.includes('2025년 AI 시대 타로카드')) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            console.log('Made element visible:', el);
          }
        });
      });
      
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'blog-admin-forced-visible.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-explore.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();