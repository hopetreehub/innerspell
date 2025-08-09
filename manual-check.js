const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  try {
    console.log('=== MANUAL VERIFICATION ===');
    
    // Step 1: Go to admin
    console.log('Going to admin...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take admin screenshot
    await page.screenshot({ path: '/tmp/manual-admin.png', fullPage: true });
    console.log('Admin screenshot taken');
    
    // Step 2: Click blog management and wait
    console.log('Clicking blog management...');
    await page.click('text=블로그 관리');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give it time to load
    
    // Take blog management screenshot
    await page.screenshot({ path: '/tmp/manual-blog-mgmt.png', fullPage: true });
    console.log('Blog management screenshot taken');
    
    // Step 3: Go to frontend blog
    console.log('Going to frontend blog...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take frontend screenshot
    await page.screenshot({ path: '/tmp/manual-frontend.png', fullPage: true });
    console.log('Frontend screenshot taken');
    
    // Step 4: Check page source
    const content = await page.content();
    console.log('Page content length:', content.length);
    
    // Look for tarot-related content
    if (content.includes('타로카드') || content.includes('AI 시대')) {
      console.log('✓ Found tarot content in page source!');
      
      // Try to scroll down to see if posts are below the fold
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: '/tmp/manual-frontend-scrolled.png', fullPage: true });
      console.log('Scrolled frontend screenshot taken');
    } else {
      console.log('✗ No tarot content found in page source');
    }
    
    console.log('=== MANUAL CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Keep browser open
    console.log('Browser staying open for manual inspection...');
  }
})();