const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('Step 1: Navigating to admin panel...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Take screenshot of admin panel
    await page.screenshot({ 
      path: '/tmp/admin-panel-initial.png',
      fullPage: true 
    });
    console.log('Screenshot saved: admin-panel-initial.png');
    
    // Look for blog management tab/section
    console.log('Step 2: Looking for blog management...');
    
    // Try different selectors for blog management
    const blogSelectors = [
      'text=Blog',
      'text=블로그',
      '[href*="blog"]',
      'text=Blog Management',
      'text=블로그 관리',
      'nav a[href*="blog"]',
      '.nav-link[href*="blog"]'
    ];
    
    let blogElement = null;
    for (const selector of blogSelectors) {
      try {
        blogElement = await page.locator(selector).first();
        if (await blogElement.isVisible({ timeout: 2000 })) {
          console.log('Found blog management element:', selector);
          await blogElement.click();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!blogElement) {
      console.log('Blog management not found, checking page content...');
      await page.screenshot({ 
        path: '/tmp/admin-content-search.png',
        fullPage: true 
      });
    }
    
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    
    // Take screenshot after clicking blog management
    await page.screenshot({ 
      path: '/tmp/blog-management-page.png',
      fullPage: true 
    });
    console.log('Screenshot saved: blog-management-page.png');
    
    // Look for the specific post
    console.log('Step 3: Looking for the post "2025년 AI 시대 타로카드 입문 가이드"...');
    
    const postSelectors = [
      'text=2025년 AI 시대 타로카드 입문 가이드',
      'text*=AI 시대 타로카드',
      'text*=타로카드 입문',
      '[data-title*="타로카드"]',
      'tr:has-text("타로카드")',
      '.post-title:has-text("타로카드")'
    ];
    
    let postElement = null;
    for (const selector of postSelectors) {
      try {
        postElement = await page.locator(selector).first();
        if (await postElement.isVisible({ timeout: 2000 })) {
          console.log('Found post element:', selector);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (postElement) {
      // Try to find and click publish/status button
      console.log('Step 4: Looking for publish/status controls...');
      
      const publishSelectors = [
        'text=Publish',
        'text=게시',
        'text=발행',
        'select[name*="status"]',
        'button:has-text("Publish")',
        'button:has-text("게시")',
        '.status-dropdown',
        '[data-status]'
      ];
      
      // Look for publish controls near the post
      const postRow = postElement.locator('xpath=ancestor::tr[1]').or(postElement.locator('xpath=ancestor::div[1]'));
      
      for (const selector of publishSelectors) {
        try {
          const publishElement = postRow.locator(selector).or(page.locator(selector));
          if (await publishElement.isVisible({ timeout: 2000 })) {
            console.log('Found publish element:', selector);
            
            if (selector.includes('select')) {
              await publishElement.selectOption({ label: 'Published' });
            } else {
              await publishElement.click();
            }
            
            // Take screenshot of status change
            await page.screenshot({ 
              path: '/tmp/post-status-change.png',
              fullPage: true 
            });
            console.log('Screenshot saved: post-status-change.png');
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Wait for any save/update to complete
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      
    } else {
      console.log('Post not found, capturing current page...');
      await page.screenshot({ 
        path: '/tmp/post-not-found.png',
        fullPage: true 
      });
    }
    
    console.log('Step 5: Navigating to frontend blog page...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Take screenshot of blog frontend
    await page.screenshot({ 
      path: '/tmp/frontend-blog-page.png',
      fullPage: true 
    });
    console.log('Screenshot saved: frontend-blog-page.png');
    
    // Look for the published post on frontend
    console.log('Step 6: Looking for published post on frontend...');
    
    const frontendPostSelectors = [
      'text=2025년 AI 시대 타로카드 입문 가이드',
      'text*=AI 시대 타로카드',
      'text*=타로카드 입문',
      'a:has-text("타로카드")',
      '.blog-post:has-text("타로카드")',
      'article:has-text("타로카드")'
    ];
    
    let frontendPostElement = null;
    for (const selector of frontendPostSelectors) {
      try {
        frontendPostElement = await page.locator(selector).first();
        if (await frontendPostElement.isVisible({ timeout: 2000 })) {
          console.log('Found post on frontend:', selector);
          
          // Click on the post to view full article
          await frontendPostElement.click();
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          
          // Take screenshot of full article
          await page.screenshot({ 
            path: '/tmp/full-article-content.png',
            fullPage: true 
          });
          console.log('Screenshot saved: full-article-content.png');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!frontendPostElement) {
      console.log('Published post not found on frontend');
      await page.screenshot({ 
        path: '/tmp/frontend-no-post.png',
        fullPage: true 
      });
    }
    
    console.log('Process completed successfully!');
    
  } catch (error) {
    console.error('Error during automation:', error);
    await page.screenshot({ 
      path: '/tmp/error-screenshot.png',
      fullPage: true 
    });
  } finally {
    // Keep browser open for manual inspection
    console.log('Browser will remain open for inspection...');
    // await browser.close();
  }
})();