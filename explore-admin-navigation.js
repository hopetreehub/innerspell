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
    console.log('1. Navigating to home page...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    // Check if user is logged in by looking for user menu
    const userIconSelector = 'button:has-text("D"), div:has-text("D").rounded-full';
    const hasUserIcon = await page.isVisible(userIconSelector);
    
    if (hasUserIcon) {
      console.log('2. User appears to be logged in. Clicking user menu...');
      await page.click(userIconSelector);
      await page.waitForTimeout(1000);
      
      // Look for admin menu option
      const adminMenuOption = await page.isVisible('text="관리자 설정", text="Admin", text="관리자"');
      if (adminMenuOption) {
        console.log('Found admin menu option');
      }
      
      // Take screenshot of user menu
      await page.screenshot({ path: 'user-menu.png', fullPage: false });
    }
    
    // Try to navigate to blog section
    console.log('3. Looking for blog link in navigation...');
    
    const blogLink = await page.isVisible('a[href="/blog"]') || await page.isVisible('text="블로그"');
    if (blogLink) {
      console.log('Found blog link in navigation');
      await page.click('a[href="/blog"]').catch(() => page.click('text="블로그"'));
      await page.waitForTimeout(2000);
      
      // Take screenshot of blog page
      await page.screenshot({ path: 'blog-page-nav.png', fullPage: true });
      
      // Check if there's an admin option here
      const adminOptions = await page.$$eval('button, a', elements => 
        elements.map(el => ({ text: el.textContent, href: el.href }))
          .filter(item => item.text && (item.text.includes('관리') || item.text.includes('admin') || item.text.includes('설정')))
      );
      
      console.log('Admin-related options found:', adminOptions);
    }
    
    // Try direct navigation to admin blog
    console.log('4. Trying direct navigation to admin sections...');
    
    const adminUrls = [
      '/admin',
      '/admin/blog', 
      '/admin/posts',
      '/admin/settings',
      '/dashboard',
      '/cms'
    ];
    
    for (const url of adminUrls) {
      console.log(`Trying ${url}...`);
      const response = await page.goto(`http://localhost:4000${url}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      }).catch(() => null);
      
      if (response && response.status() === 200) {
        console.log(`✓ ${url} returned 200`);
        await page.waitForTimeout(1000);
        
        // Check page content
        const hasTable = await page.isVisible('table');
        const hasBlogText = await page.isVisible('text="블로그"');
        
        if (hasTable || hasBlogText) {
          console.log(`  - Page has relevant content`);
          await page.screenshot({ path: `admin-${url.replace(/\//g, '-')}.png`, fullPage: true });
        }
      } else {
        console.log(`✗ ${url} not accessible`);
      }
    }
    
    // Final check - look for any administrative functions
    console.log('5. Final check for admin functions...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    const allLinks = await page.$$eval('a', links => 
      links.map(link => ({ text: link.textContent, href: link.href }))
        .filter(item => item.text && item.href)
    );
    
    const adminRelatedLinks = allLinks.filter(link => 
      link.text.includes('관리') || 
      link.text.includes('admin') || 
      link.text.includes('설정') ||
      link.href.includes('admin')
    );
    
    console.log('Admin-related links found:', adminRelatedLinks);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-explore.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();