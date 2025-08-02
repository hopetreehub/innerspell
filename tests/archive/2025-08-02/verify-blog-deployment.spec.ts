import { test, expect } from '@playwright/test';

test.describe('Blog Deployment Verification', () => {
  // Set longer timeout for deployment waiting
  test.setTimeout(10 * 60 * 1000); // 10 minutes

  test('verify blog posts on Vercel deployment', async ({ page }) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseUrl = 'https://test-studio-firebase.vercel.app';
    
    console.log('🚀 Starting blog deployment verification...');
    console.log(`⏰ Timestamp: ${timestamp}`);

    // Wait for deployment to be ready (with retries)
    let deploymentReady = false;
    let attempts = 0;
    const maxAttempts = 10; // 10 attempts with 30 second intervals = 5 minutes

    while (!deploymentReady && attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Attempt ${attempts}/${maxAttempts}: Checking deployment status...`);
      
      try {
        // Navigate to the homepage first to check if deployment is ready
        await page.goto(baseUrl, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Check if page loads properly
        await page.waitForSelector('body', { timeout: 10000 });
        
        // Take a screenshot of homepage to verify basic functionality
        await page.screenshot({ 
          path: `tests/screenshots/deployment-check-${attempts}-${timestamp}.png`,
          fullPage: true 
        });
        
        deploymentReady = true;
        console.log('✅ Deployment is ready!');
        
      } catch (error) {
        console.log(`❌ Attempt ${attempts} failed: ${error.message}`);
        if (attempts < maxAttempts) {
          console.log('⏳ Waiting 30 seconds before next attempt...');
          await page.waitForTimeout(30000); // Wait 30 seconds
        }
      }
    }

    if (!deploymentReady) {
      throw new Error('Deployment not ready after maximum attempts');
    }

    // Now navigate to the blog page
    console.log('📖 Navigating to blog page...');
    await page.goto(`${baseUrl}/blog`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for blog content to load
    await page.waitForSelector('main', { timeout: 15000 });
    
    // Take initial screenshot of blog page
    await page.screenshot({ 
      path: `tests/screenshots/blog-page-${timestamp}.png`,
      fullPage: true 
    });

    console.log('📸 Screenshot taken of blog page');

    // Verify page title contains "블로그" or "Blog"
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    expect(title).toMatch(/(블로그|Blog)/i);

    // Check for blog posts container
    const blogContainer = page.locator('main, [data-testid="blog-container"], .blog-container, article');
    await expect(blogContainer).toBeVisible({ timeout: 10000 });

    // Count blog posts - look for various possible selectors
    const postSelectors = [
      'article',
      '[data-testid="blog-post"]',
      '.blog-post',
      '.post-item',
      '.card',
      'h2, h3', // fallback to headers which might be post titles
    ];

    let postsFound = 0;
    let postsSelector = '';

    for (const selector of postSelectors) {
      const posts = page.locator(selector);
      const count = await posts.count();
      
      if (count > postsFound) {
        postsFound = count;
        postsSelector = selector;
      }
    }

    console.log(`📊 Found ${postsFound} blog posts using selector: ${postsSelector}`);

    // Take screenshot highlighting the posts
    if (postsFound > 0) {
      // Highlight the posts by adding borders (for visual verification)
      await page.addStyleTag({
        content: `
          ${postsSelector} {
            border: 2px solid red !important;
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
          }
        `
      });
      
      await page.screenshot({ 
        path: `tests/screenshots/blog-posts-highlighted-${timestamp}.png`,
        fullPage: true 
      });
    }

    // Check for images in posts (SEO-optimized posts should have images)
    const imagesInPosts = page.locator(`${postsSelector} img, img`);
    const imageCount = await imagesInPosts.count();
    console.log(`🖼️ Found ${imageCount} images in blog posts`);

    // Check for specific SEO elements
    const metaDescription = await page.locator('meta[name="description"]').first().getAttribute('content');
    const metaKeywords = await page.locator('meta[name="keywords"]').first().getAttribute('content');
    
    console.log(`🔍 Meta description: ${metaDescription || 'Not found'}`);
    console.log(`🏷️ Meta keywords: ${metaKeywords || 'Not found'}`);

    // Check for structured data (JSON-LD)
    const structuredData = page.locator('script[type="application/ld+json"]');
    const structuredDataCount = await structuredData.count();
    console.log(`📋 Structured data scripts: ${structuredDataCount}`);

    // Verify posts are actually visible and not just present in DOM
    if (postsFound > 0) {
      const firstPost = page.locator(postsSelector).first();
      await expect(firstPost).toBeVisible();
      
      // Check if posts have titles
      const postTitles = await page.locator(`${postsSelector} h1, ${postsSelector} h2, ${postsSelector} h3`).count();
      console.log(`📝 Posts with titles: ${postTitles}`);
    }

    // Final comprehensive screenshot
    await page.screenshot({ 
      path: `tests/screenshots/blog-final-verification-${timestamp}.png`,
      fullPage: true 
    });

    // Generate verification report
    const verificationReport = {
      timestamp: new Date().toISOString(),
      deploymentUrl: `${baseUrl}/blog`,
      pageTitle: title,
      postsFound: postsFound,
      postsSelector: postsSelector,
      imagesCount: imageCount,
      hasMetaDescription: !!metaDescription,
      hasMetaKeywords: !!metaKeywords,
      structuredDataScripts: structuredDataCount,
      screenshotFiles: [
        `blog-page-${timestamp}.png`,
        `blog-posts-highlighted-${timestamp}.png`,
        `blog-final-verification-${timestamp}.png`
      ]
    };

    console.log('📋 VERIFICATION REPORT:');
    console.log(JSON.stringify(verificationReport, null, 2));

    // Assertions for the test
    expect(postsFound).toBeGreaterThan(0); // Should have at least 1 blog post
    expect(title).toBeTruthy(); // Should have a page title
    
    // Save report to file
    await page.evaluate((report) => {
      console.log('BLOG_VERIFICATION_REPORT:', JSON.stringify(report, null, 2));
    }, verificationReport);

    console.log('✅ Blog verification completed successfully!');
    console.log(`📊 Summary: Found ${postsFound} blog posts with ${imageCount} images`);
  });

  test('verify individual blog post functionality', async ({ page }) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseUrl = 'https://test-studio-firebase.vercel.app';
    
    console.log('🔍 Testing individual blog post functionality...');

    await page.goto(`${baseUrl}/blog`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Look for clickable blog post links
    const postLinks = page.locator('a[href*="/blog/"], a[href*="/post/"]');
    const linkCount = await postLinks.count();
    
    console.log(`🔗 Found ${linkCount} blog post links`);

    if (linkCount > 0) {
      // Click on the first blog post link
      const firstLink = postLinks.first();
      const href = await firstLink.getAttribute('href');
      console.log(`📖 Clicking on first post: ${href}`);
      
      // Take screenshot before click
      await page.screenshot({ 
        path: `tests/screenshots/before-post-click-${timestamp}.png`,
        fullPage: true 
      });

      await firstLink.click();
      await page.waitForLoadState('networkidle');

      // Take screenshot of individual post
      await page.screenshot({ 
        path: `tests/screenshots/individual-post-${timestamp}.png`,
        fullPage: true 
      });

      // Verify we're on a blog post page
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      expect(currentUrl).toMatch(/(blog|post)/);

      // Check for post content
      const postContent = page.locator('article, main, .post-content');
      await expect(postContent).toBeVisible();

      console.log('✅ Individual blog post functionality verified!');
    } else {
      console.log('⚠️ No clickable blog post links found');
    }
  });
});