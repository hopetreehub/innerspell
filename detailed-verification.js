const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('=== DETAILED VERIFICATION PROCESS ===');
    
    // Step 1: Navigate to admin and find blog management
    console.log('Step 1: Navigating to admin panel...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Find and click blog management
    console.log('Step 2: Accessing blog management...');
    const blogLinks = await page.locator('text=블로그 관리').or(page.locator('text=Blog')).or(page.locator('[href*="blog"]')).all();
    
    for (let link of blogLinks) {
      try {
        if (await link.isVisible()) {
          await link.click();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    await page.screenshot({ 
      path: '/tmp/detailed-blog-management.png',
      fullPage: true 
    });
    console.log('Screenshot: detailed-blog-management.png');
    
    // Step 3: Look for the specific post and its status
    console.log('Step 3: Looking for the tarot card post...');
    
    // Try to find the specific post
    const postElement = await page.locator('text*=타로카드 입문').or(page.locator('text*=AI 시대 타로카드')).first();
    
    if (await postElement.isVisible({ timeout: 5000 })) {
      console.log('✓ Found the tarot card post!');
      
      // Take screenshot highlighting the post
      await page.screenshot({ 
        path: '/tmp/post-found-highlighted.png',
        fullPage: true 
      });
      
      // Check the status
      const postRow = postElement.locator('xpath=ancestor::tr[1]').or(postElement.locator('xpath=ancestor::div[contains(@class,"row") or contains(@class,"item")]'));
      const statusElement = postRow.locator('[class*="status"], .badge, [data-status], text=발행, text=published, text=게시').first();
      
      if (await statusElement.isVisible({ timeout: 2000 })) {
        const statusText = await statusElement.textContent();
        console.log('✓ Post status:', statusText);
      }
    } else {
      console.log('✗ Could not find the tarot card post');
    }
    
    // Step 4: Navigate to frontend blog
    console.log('Step 4: Navigating to frontend blog page...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await page.screenshot({ 
      path: '/tmp/detailed-frontend-blog.png',
      fullPage: true 
    });
    console.log('Screenshot: detailed-frontend-blog.png');
    
    // Step 5: Look for published posts
    console.log('Step 5: Looking for published posts on frontend...');
    
    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(3000);
    
    const postLinks = await page.locator('a').all();
    let foundTarotPost = false;
    
    for (let link of postLinks) {
      try {
        const text = await link.textContent();
        if (text && (text.includes('타로카드') || text.includes('AI 시대') || text.includes('입문'))) {
          console.log('✓ Found tarot post link:', text);
          foundTarotPost = true;
          
          // Click on it
          await link.click();
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          
          await page.screenshot({ 
            path: '/tmp/detailed-article-content.png',
            fullPage: true 
          });
          console.log('Screenshot: detailed-article-content.png');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!foundTarotPost) {
      console.log('✗ Could not find the tarot post on frontend');
      
      // Take screenshot of current page content
      await page.screenshot({ 
        path: '/tmp/frontend-no-posts-detailed.png',
        fullPage: true 
      });
      
      // Try to see if there are any blog posts at all
      const allText = await page.textContent('body');
      console.log('Page content preview:', allText.substring(0, 500));
    }
    
    console.log('=== VERIFICATION COMPLETE ===');
    
  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ 
      path: '/tmp/detailed-error.png',
      fullPage: true 
    });
  } finally {
    console.log('Browser will remain open for inspection...');
    // await browser.close();
  }
})();