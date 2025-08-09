const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  try {
    console.log('=== COMPREHENSIVE STATUS CHECK ===');
    
    // Step 1: Check admin panel current status
    console.log('Step 1: Checking admin panel blog management...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // Click specifically on 블로그 관리 tab
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot of current blog management status
    await page.screenshot({ path: '/tmp/comprehensive-admin-status.png', fullPage: true });
    console.log('Admin status screenshot taken');
    
    // Check the actual content of the page to see post statuses
    const adminContent = await page.textContent('body');
    
    if (adminContent.includes('타로카드')) {
      console.log('✓ Found tarot post in admin');
      
      // Look for status indicators
      if (adminContent.includes('발행')) {
        console.log('✓ Post appears to be PUBLISHED (발행)');
      } else if (adminContent.includes('미게시')) {
        console.log('✗ Post is still UNPUBLISHED (미게시)');
      }
    } else {
      console.log('✗ Tarot post not found in admin');
    }
    
    // Step 2: Check frontend blog page
    console.log('Step 2: Checking frontend blog page...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/tmp/comprehensive-frontend-status.png', fullPage: true });
    console.log('Frontend status screenshot taken');
    
    const frontendContent = await page.textContent('body');
    
    if (frontendContent.includes('타로카드') || frontendContent.includes('AI 시대')) {
      console.log('✓ SUCCESS! Post is visible on frontend blog!');
      
      // Try to find and click the post link
      const postSelectors = [
        'a:has-text("타로카드")',
        'a:has-text("AI 시대")', 
        '[class*="post"]:has-text("타로카드")',
        'article:has-text("타로카드")'
      ];
      
      for (let selector of postSelectors) {
        try {
          const postElement = page.locator(selector).first();
          if (await postElement.isVisible({ timeout: 2000 })) {
            console.log(`✓ Found post with selector: ${selector}`);
            await postElement.click();
            await page.waitForLoadState('networkidle');
            
            await page.screenshot({ path: '/tmp/comprehensive-article-detail.png', fullPage: true });
            console.log('Article detail screenshot taken');
            
            const articleContent = await page.textContent('body');
            if (articleContent.includes('타로카드')) {
              console.log('✓ Article content loaded successfully!');
            }
            break;
          }
        } catch (e) {
          continue;
        }
      }
    } else {
      console.log('✗ Post is NOT visible on frontend');
      console.log('Frontend content sample:', frontendContent.substring(0, 200));
    }
    
    // Step 3: Direct URL check
    console.log('Step 3: Trying direct blog post URLs...');
    
    // Try some common blog post URL patterns
    const potentialUrls = [
      'http://localhost:4000/blog/2025년-ai-시대-타로카드-입문-가이드',
      'http://localhost:4000/blog/ai-tarot-guide',
      'http://localhost:4000/posts/tarot',
      'http://localhost:4000/blog/posts/1'
    ];
    
    for (let url of potentialUrls) {
      try {
        console.log(`Trying URL: ${url}`);
        await page.goto(url);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        
        const content = await page.textContent('body');
        if (content.includes('타로카드') && !content.includes('404') && !content.includes('Not Found')) {
          console.log(`✓ SUCCESS! Found post at: ${url}`);
          await page.screenshot({ path: '/tmp/comprehensive-direct-url.png', fullPage: true });
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    console.log('=== COMPREHENSIVE CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Error during comprehensive check:', error);
    await page.screenshot({ path: '/tmp/comprehensive-error.png', fullPage: true });
  } finally {
    console.log('Check complete. Browser staying open for manual inspection...');
  }
})();