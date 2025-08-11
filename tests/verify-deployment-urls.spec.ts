import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

test.describe('Find and Verify Correct Vercel Deployment', () => {
  const timestamp = format(new Date(), 'yyyy-MM-dd\'T\'HH-mm-ss.SSS\'Z\'');
  
  // Possible Vercel URLs to try
  const possibleUrls = [
    'https://test-studio-firebase.vercel.app',
    'https://nextn.vercel.app',
    'https://innerspell.vercel.app',
    'https://test-studio-firebase-johns-projects-bf5e60f3.vercel.app',
    'https://innerspell-an7ce.vercel.app'
  ];

  test('find working Vercel deployment URL', async ({ page }) => {
    let workingUrl = '';
    
    for (const url of possibleUrls) {
      console.log(`Trying URL: ${url}`);
      
      try {
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        
        if (response && response.status() === 200) {
          console.log(`✅ SUCCESS: ${url} is working!`);
          workingUrl = url;
          
          // Take a screenshot of the working deployment
          await page.screenshot({ 
            path: `vercel-working-deployment-${timestamp}.png`,
            fullPage: true 
          });
          
          // Get page title
          const title = await page.title();
          console.log(`Page title: ${title}`);
          
          // Check for main content
          const bodyText = await page.locator('body').textContent();
          console.log(`Page has content: ${bodyText ? 'Yes' : 'No'}`);
          
          break;
        } else {
          console.log(`❌ ${url} returned status: ${response?.status()}`);
        }
      } catch (error) {
        console.log(`❌ ${url} failed with error: ${error.message}`);
      }
    }
    
    if (workingUrl) {
      console.log(`\n🎉 Found working Vercel deployment at: ${workingUrl}\n`);
      
      // Now test the blog functionality on the working URL
      await testBlogFunctionality(page, workingUrl);
    } else {
      console.error('❌ No working Vercel deployment found!');
      console.log('\nPlease check:');
      console.log('1. If the project is deployed to Vercel');
      console.log('2. The correct project name in Vercel dashboard');
      console.log('3. If there are custom domain settings');
    }
    
    expect(workingUrl).toBeTruthy();
  });
  
  async function testBlogFunctionality(page: any, baseUrl: string) {
    console.log('\n=== Testing Blog Functionality ===\n');
    
    // Navigate to the working URL
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    // Look for blog content or navigation
    const blogElements = await page.locator('a[href*="blog"], nav a:contains("Blog"), nav a:contains("블로그"), article, [class*="post"], [class*="blog"]').all();
    
    console.log(`Found ${blogElements.length} blog-related elements`);
    
    if (blogElements.length > 0) {
      // Take screenshot of homepage with blog elements
      await page.screenshot({ 
        path: `vercel-homepage-with-blog-${timestamp}.png`,
        fullPage: true 
      });
      
      // Try to navigate to a blog post
      const postLink = await page.locator('a[href*="/blog/"], article a, [class*="post"] a').first();
      
      if (await postLink.count() > 0) {
        const postUrl = await postLink.getAttribute('href');
        console.log(`Clicking on blog post: ${postUrl}`);
        
        await postLink.click();
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ 
          path: `vercel-blog-post-detail-${timestamp}.png`,
          fullPage: true 
        });
        
        console.log('✅ Successfully navigated to blog post');
      }
    }
    
    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('\n⚠️  Console errors detected:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('\n✅ No console errors detected');
    }
  }
});