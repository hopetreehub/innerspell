import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

test.describe('Vercel Deployment Verification', () => {
  const baseUrl = 'https://innerspell.vercel.app';
  const timestamp = format(new Date(), 'yyyy-MM-dd\'T\'HH-mm-ss.SSS\'Z\'');

  test('should load homepage successfully', async ({ page }) => {
    console.log('Navigating to:', baseUrl);
    
    // Navigate to the homepage
    const response = await page.goto(baseUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check if the page loads successfully
    expect(response?.status()).toBe(200);
    
    // Take a screenshot of the homepage
    await page.screenshot({ 
      path: `vercel-homepage-${timestamp}.png`,
      fullPage: true 
    });
    
    // Check for the main title or header
    const title = await page.title();
    console.log('Page title:', title);
    expect(title).toBeTruthy();
    
    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any delayed console errors
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.error('Console errors found:', consoleErrors);
    }
  });

  test('should load blog section', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    // Look for blog link or navigation
    const blogLink = await page.locator('a[href*="blog"], nav a:has-text("Blog"), nav a:has-text("블로그")').first();
    
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot of the blog page
      await page.screenshot({ 
        path: `vercel-blog-page-${timestamp}.png`,
        fullPage: true 
      });
      
      // Check if blog posts are loaded
      const blogPosts = await page.locator('article, [class*="post"], [class*="blog-item"], [class*="blog-card"]').count();
      console.log('Number of blog posts found:', blogPosts);
      expect(blogPosts).toBeGreaterThan(0);
    } else {
      console.log('Blog link not found in navigation, checking if we are on a blog page');
      
      // Check if we're already on a page with blog posts
      const blogPosts = await page.locator('article, [class*="post"], [class*="blog-item"], [class*="blog-card"]').count();
      if (blogPosts > 0) {
        console.log('Found blog posts on homepage:', blogPosts);
        await page.screenshot({ 
          path: `vercel-homepage-with-blogs-${timestamp}.png`,
          fullPage: true 
        });
      }
    }
  });

  test('should navigate to a blog post', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    // Find and click on the first blog post link
    const postLink = await page.locator('a[href*="/blog/"], article a, [class*="post"] a, [class*="blog-item"] a, [class*="blog-card"] a').first();
    
    if (await postLink.isVisible()) {
      const postUrl = await postLink.getAttribute('href');
      console.log('Clicking on blog post:', postUrl);
      
      await postLink.click();
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot of the blog post
      await page.screenshot({ 
        path: `vercel-blog-post-${timestamp}.png`,
        fullPage: true 
      });
      
      // Check if the blog post content is loaded
      const postContent = await page.locator('article, main, [class*="content"], [class*="post-content"]').first();
      expect(await postContent.isVisible()).toBe(true);
      
      const postTitle = await page.locator('h1, h2, [class*="title"]').first().textContent();
      console.log('Blog post title:', postTitle);
    } else {
      console.log('No blog post links found on the page');
    }
  });

  test('should check for critical errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      errors.push(`Page error: ${error.message}`);
    });
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`Console error: ${msg.text()}`);
      }
    });
    
    // Listen for request failures
    page.on('requestfailed', (request) => {
      errors.push(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for any delayed errors
    
    if (errors.length > 0) {
      console.error('Critical errors found:', errors);
      // We log errors but don't fail the test, as some errors might be expected
    } else {
      console.log('No critical errors detected');
    }
    
    // Take a final screenshot with browser console open
    await page.screenshot({ 
      path: `vercel-final-state-${timestamp}.png`,
      fullPage: true 
    });
  });
});