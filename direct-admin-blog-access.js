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
    // First, let's go directly to the admin page
    console.log('1. Navigating directly to admin page...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take screenshot of admin page
    await page.screenshot({ path: 'direct-admin-page.png', fullPage: true });
    
    // Check what's on the page
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Look for any authentication or blog management elements
    const hasAuthForm = await page.isVisible('input[type="email"], input[type="password"]');
    const hasBlogMenu = await page.isVisible('text="블로그"');
    const hasTarotGuide = await page.isVisible('text="타로 지침"');
    
    console.log('Has auth form:', hasAuthForm);
    console.log('Has blog menu:', hasBlogMenu);
    console.log('Has tarot guide:', hasTarotGuide);
    
    if (hasTarotGuide) {
      console.log('2. We are at the Tarot Guide admin page');
      
      // Look for tabs or navigation
      const tabs = await page.locator('[role="tab"], .tab, nav a, nav button').allTextContents();
      console.log('Available tabs/navigation:', tabs.filter(t => t.trim()));
      
      // Try clicking on various blog-related elements
      const blogSelectors = [
        'text="블로그 관리"',
        'text="블로그"',
        '[href*="blog"]',
        'button:has-text("블로그")',
        'a:has-text("블로그")'
      ];
      
      for (const selector of blogSelectors) {
        try {
          if (await page.isVisible(selector)) {
            console.log(`3. Found and clicking: ${selector}`);
            await page.locator(selector).first().click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          console.log(`Could not click ${selector}`);
        }
      }
    }
    
    // Take screenshot after navigation attempt
    await page.screenshot({ path: 'after-blog-click.png', fullPage: true });
    
    // Let's check if we can see any blog posts or tables
    console.log('4. Looking for blog content...');
    
    const hasTable = await page.isVisible('table');
    const postTitle = '2025년 AI 시대 타로카드 입문 가이드';
    const hasTargetPost = await page.isVisible(`text="${postTitle}"`);
    
    console.log('Has table:', hasTable);
    console.log('Has target post:', hasTargetPost);
    
    if (hasTargetPost) {
      console.log('5. Found the target blog post!');
      
      // Find buttons or controls near the post
      // Try different approaches to find the toggle button
      const approaches = [
        // Approach 1: Find button in the same row
        async () => {
          const row = page.locator(`tr:has-text("${postTitle}")`);
          const button = row.locator('button').first();
          if (await button.isVisible()) {
            await button.click();
            return true;
          }
          return false;
        },
        // Approach 2: Find any button with eye icon
        async () => {
          const eyeButton = page.locator('button:has(svg path[d*="M"])').first();
          if (await eyeButton.isVisible()) {
            await eyeButton.click();
            return true;
          }
          return false;
        },
        // Approach 3: Find button by position
        async () => {
          const buttons = await page.locator('button').all();
          for (const button of buttons) {
            const isNearPost = await button.evaluate((el, title) => {
              const tr = el.closest('tr');
              return tr && tr.textContent.includes(title);
            }, postTitle);
            
            if (isNearPost) {
              await button.click();
              return true;
            }
          }
          return false;
        }
      ];
      
      let clicked = false;
      for (let i = 0; i < approaches.length && !clicked; i++) {
        console.log(`Trying approach ${i + 1}...`);
        clicked = await approaches[i]();
        if (clicked) {
          console.log('6. Successfully clicked the toggle button!');
          await page.waitForTimeout(2000);
          break;
        }
      }
      
      // Take screenshot after toggle
      await page.screenshot({ path: 'after-toggle-attempt.png', fullPage: true });
    }
    
    // Navigate to blog frontend to verify
    console.log('7. Checking blog frontend...');
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'blog-frontend-verify.png', fullPage: true });
    
    // Check if the post is visible
    if (await page.isVisible(`text="${postTitle}"`)) {
      console.log('✅ SUCCESS! Post is now visible on the blog!');
      
      // Click on the post to view it
      await page.locator(`text="${postTitle}"`).click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'blog-article-success.png', fullPage: true });
      console.log('✅ Blog article page loaded successfully!');
    } else {
      console.log('⚠️  Post is not visible on the blog yet');
      
      // List any posts that are visible
      const visiblePosts = await page.locator('h2, h3, article').allTextContents();
      console.log('Visible posts:', visiblePosts.slice(0, 5));
    }
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-direct.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();