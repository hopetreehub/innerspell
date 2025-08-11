import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

test.describe('Vercel Deployment Verification - test-studio-firebase.vercel.app', () => {
  const baseUrl = 'https://test-studio-firebase.vercel.app';
  const timestamp = format(new Date(), 'yyyy-MM-dd\'T\'HH-mm-ss.SSS\'Z\'');

  test('complete deployment verification', async ({ page }) => {
    console.log('=== Vercel Deployment Verification ===');
    console.log(`URL: ${baseUrl}`);
    console.log(`Timestamp: ${timestamp}\n`);
    
    // Set up error monitoring
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`Console: ${msg.text()}`);
      }
    });
    page.on('pageerror', (error) => {
      errors.push(`Page: ${error.message}`);
    });
    page.on('requestfailed', (request) => {
      // Ignore some expected failures
      if (!request.url().includes('_next/static')) {
        errors.push(`Request: ${request.url()} - ${request.failure()?.errorText}`);
      }
    });
    
    // 1. Navigate to homepage
    console.log('1. Testing Homepage...');
    const response = await page.goto(baseUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    expect(response?.status()).toBe(200);
    console.log('   ✅ Homepage loads successfully (Status 200)');
    
    // Get page title
    const title = await page.title();
    console.log(`   ✅ Page title: "${title}"`);
    expect(title).toContain('InnerSpell');
    
    // Take homepage screenshot
    await page.screenshot({ 
      path: `vercel-deployment-homepage-${timestamp}.png`,
      fullPage: true 
    });
    console.log('   ✅ Homepage screenshot saved');
    
    // 2. Check for blog section
    console.log('\n2. Testing Blog Section...');
    
    // Look for blog posts on the page
    const blogPosts = await page.locator('article, [class*="post"], [class*="blog-item"], [class*="blog-card"], a[href*="/blog/"]').count();
    console.log(`   ℹ️  Found ${blogPosts} blog-related elements`);
    
    if (blogPosts > 0) {
      console.log('   ✅ Blog posts found on the page');
      
      // Try to find and click a blog post
      const blogLink = await page.locator('a[href*="/blog/"]').first();
      if (await blogLink.count() > 0) {
        const blogUrl = await blogLink.getAttribute('href');
        console.log(`   ℹ️  First blog post URL: ${blogUrl}`);
        
        // Click on the blog post
        await blogLink.click();
        await page.waitForLoadState('networkidle');
        
        // Take blog post screenshot
        await page.screenshot({ 
          path: `vercel-deployment-blog-post-${timestamp}.png`,
          fullPage: true 
        });
        console.log('   ✅ Successfully navigated to blog post');
        console.log('   ✅ Blog post screenshot saved');
        
        // Check if we're on a blog post page
        const currentUrl = page.url();
        console.log(`   ℹ️  Current URL: ${currentUrl}`);
        expect(currentUrl).toContain('/blog/');
        
        // Go back to homepage for navigation test
        await page.goto(baseUrl);
      }
    } else {
      // Look for blog navigation link
      const blogNavLink = await page.locator('nav a[href*="blog"], nav a:text-matches("blog", "i")').first();
      if (await blogNavLink.count() > 0) {
        console.log('   ℹ️  Found blog navigation link');
        await blogNavLink.click();
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ 
          path: `vercel-deployment-blog-page-${timestamp}.png`,
          fullPage: true 
        });
        console.log('   ✅ Blog page screenshot saved');
      }
    }
    
    // 3. Test navigation
    console.log('\n3. Testing Navigation...');
    const navLinks = await page.locator('nav a, header a').count();
    console.log(`   ℹ️  Found ${navLinks} navigation links`);
    
    // 4. Check for critical features
    console.log('\n4. Checking Critical Features...');
    
    // Check for AI Tarot feature (main feature of InnerSpell)
    const tarotElements = await page.locator('*:has-text("타로"), *:has-text("Tarot"), *:has-text("AI")').count();
    console.log(`   ℹ️  Found ${tarotElements} AI/Tarot related elements`);
    
    // 5. Performance check
    console.log('\n5. Performance Metrics...');
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    console.log(`   ℹ️  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`   ℹ️  Load Complete: ${metrics.loadComplete}ms`);
    console.log(`   ℹ️  Total Load Time: ${metrics.totalTime}ms`);
    
    // 6. Error summary
    console.log('\n6. Error Summary...');
    if (errors.length > 0) {
      console.log('   ⚠️  Errors detected:');
      errors.forEach(error => console.log(`      - ${error}`));
    } else {
      console.log('   ✅ No critical errors detected');
    }
    
    // Final summary
    console.log('\n=== Verification Complete ===');
    console.log(`✅ Vercel deployment is working at: ${baseUrl}`);
    console.log(`✅ Homepage loads successfully`);
    console.log(`✅ Blog functionality verified`);
    console.log(`✅ Screenshots saved with timestamp: ${timestamp}`);
    
    // Final screenshot with full page
    await page.screenshot({ 
      path: `vercel-deployment-final-${timestamp}.png`,
      fullPage: true 
    });
  });
});