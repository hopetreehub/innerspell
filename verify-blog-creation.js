const { chromium } = require('playwright');

async function verifyBlogCreation() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Verifying blog post creation...');
    
    // Navigate to admin
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // Go to blog management
    await page.click('text=블로그 관리');
    await page.waitForTimeout(3000);
    
    // Take screenshot of current blog posts
    await page.screenshot({ path: 'verify-current-blog-list.png', fullPage: true });
    console.log('📸 Screenshot taken of current blog list');
    
    // Check if our post exists
    const targetPostTitle = '2025년 AI 시대 타로카드 입문 가이드';
    const postExists = await page.locator(`text=${targetPostTitle}`).count() > 0;
    
    if (postExists) {
      console.log('✅ SUCCESS: Target blog post found in the list!');
      
      // Try to click on the post to view details
      try {
        await page.click(`text=${targetPostTitle}`);
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'verify-post-details.png', fullPage: true });
        console.log('📸 Screenshot taken of post details');
      } catch (e) {
        console.log('ℹ️ Could not open post details');
      }
    } else {
      console.log('❌ Target blog post not found in the list');
      console.log('📝 Current posts visible:');
      
      // Get all visible post titles
      const postTitles = await page.$$eval('[data-testid="post-title"], .post-title, td:first-child', 
        elements => elements.map(el => el.textContent?.trim()).filter(Boolean)
      );
      
      postTitles.forEach((title, index) => {
        console.log(`  ${index + 1}. ${title}`);
      });
      
      if (postTitles.length === 0) {
        console.log('  No posts found or different selector needed');
      }
    }
    
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log(`Target post: "${targetPostTitle}"`);
    console.log(`Found: ${postExists ? 'YES' : 'NO'}`);
    console.log(`Screenshots saved for manual inspection`);
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    await page.screenshot({ path: 'verify-error.png' });
  } finally {
    console.log('\n🔍 Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

verifyBlogCreation().catch(console.error);