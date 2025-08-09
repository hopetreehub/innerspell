const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // First check admin status
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click on blog management tab
    await page.click('button[data-state="inactive"][id*="blog-management"], button:has-text("블로그 관리")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/tmp/admin_final_status.png', fullPage: true });
    console.log('Admin status screenshot saved');
    
    // Check if we have eye icon (published) or eye-off icon (unpublished)
    const eyeIcons = await page.locator('.lucide-eye').count();
    const eyeOffIcons = await page.locator('.lucide-eye-off').count();
    
    console.log('Published posts (eye icons):', eyeIcons);
    console.log('Unpublished posts (eye-off icons):', eyeOffIcons);
    
    // Go to blog page
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Look for blog post cards or content
    const blogPosts = await page.locator('article, .blog-post, .post-card, h2, h3').count();
    console.log('Blog elements found:', blogPosts);
    
    // Search for specific content
    const pageContent = await page.textContent('body');
    
    console.log('Blog page analysis:');
    console.log('- Contains "2025년":', pageContent.includes('2025년'));
    console.log('- Contains "AI 시대":', pageContent.includes('AI 시대'));
    console.log('- Contains "타로카드":', pageContent.includes('타로카드'));
    console.log('- Contains "입문 가이드":', pageContent.includes('입문 가이드'));
    console.log('- Contains "전통적 지혜":', pageContent.includes('전통적 지혜'));
    console.log('- Contains "현대 기술":', pageContent.includes('현대 기술'));
    
    // Take final screenshot
    await page.screenshot({ path: '/tmp/blog_final_verification.png', fullPage: true });
    
    // Try scrolling down to see if there's more content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: '/tmp/blog_scrolled.png', fullPage: true });
    
    // Check if there are any clickable elements or links that might lead to the post
    const links = await page.locator('a').count();
    console.log('Number of links on blog page:', links);
    
    // Look for any text that might indicate where the posts are
    const relevantText = pageContent.match(/(게시물|포스트|글|기사|블로그)/g);
    console.log('Relevant Korean text found:', relevantText);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: '/tmp/final_verification_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();