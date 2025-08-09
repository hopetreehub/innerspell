const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('=== FINAL VERIFICATION PROCESS ===');
    
    // Step 1: Navigate to admin and find blog management specifically
    console.log('Step 1: Navigating to admin panel...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Find and click "블로그 관리" specifically
    console.log('Step 2: Clicking on 블로그 관리...');
    try {
      await page.click('text=블로그 관리');
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      console.log('✓ Successfully clicked 블로그 관리');
    } catch (e) {
      console.log('Could not find 블로그 관리, trying alternative...');
      await page.screenshot({ path: '/tmp/admin-navigation.png', fullPage: true });
    }
    
    await page.screenshot({ 
      path: '/tmp/final-blog-management.png',
      fullPage: true 
    });
    console.log('Screenshot: final-blog-management.png');
    
    // Step 3: Look for the post table and the specific post
    console.log('Step 3: Looking for the tarot post in the table...');
    
    // Look for text containing "타로카드"
    const postRows = await page.locator('tr, .post-row, .item').all();
    let foundPost = false;
    
    for (let row of postRows) {
      try {
        const rowText = await row.textContent();
        if (rowText && rowText.includes('타로카드')) {
          console.log('✓ Found row with tarot content:', rowText.substring(0, 100) + '...');
          foundPost = true;
          
          // Look for status in this row
          const statusElements = await row.locator('.status, .badge, [class*="status"], text=발행, text=Published').all();
          for (let statusEl of statusElements) {
            const statusText = await statusEl.textContent();
            if (statusText) {
              console.log('✓ Post status:', statusText.trim());
            }
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!foundPost) {
      console.log('✗ Could not find tarot post in admin');
      const pageContent = await page.textContent('body');
      console.log('Page content sample:', pageContent.substring(0, 300));
    }
    
    // Step 4: Navigate to frontend blog
    console.log('Step 4: Navigating to frontend blog...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for any dynamic content
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: '/tmp/final-frontend-blog.png',
      fullPage: true 
    });
    console.log('Screenshot: final-frontend-blog.png');
    
    // Step 5: Check for any blog posts
    console.log('Step 5: Checking for blog posts on frontend...');
    
    const blogContent = await page.textContent('body');
    
    if (blogContent.includes('타로카드') || blogContent.includes('AI 시대')) {
      console.log('✓ Found tarot content on blog page!');
      
      // Try to find and click the post
      const postLink = await page.locator('a').filter({ hasText: '타로카드' }).or(
        page.locator('a').filter({ hasText: 'AI 시대' })
      ).first();
      
      if (await postLink.isVisible({ timeout: 3000 })) {
        console.log('✓ Found clickable post link');
        await postLink.click();
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        await page.screenshot({ 
          path: '/tmp/final-article-detail.png',
          fullPage: true 
        });
        console.log('Screenshot: final-article-detail.png');
      }
    } else {
      console.log('✗ No tarot content found on frontend blog');
      console.log('Blog page content sample:', blogContent.substring(0, 300));
      
      // Check if there are any posts at all
      const postElements = await page.locator('article, .post, .blog-post, [class*="post"]').count();
      console.log('Number of post elements found:', postElements);
    }
    
    console.log('=== VERIFICATION COMPLETE ===');
    
  } catch (error) {
    console.error('Error during final verification:', error);
    await page.screenshot({ 
      path: '/tmp/final-error.png',
      fullPage: true 
    });
  } finally {
    console.log('Browser will remain open for inspection...');
    // await browser.close();
  }
})();