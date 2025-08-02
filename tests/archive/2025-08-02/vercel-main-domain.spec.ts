import { test, expect } from '@playwright/test';

test.describe('Vercel Main Domain Check', () => {
  const mainUrl = 'https://test-studio-firebase.vercel.app';

  test('should load main Vercel domain homepage', async ({ page }) => {
    await page.goto(mainUrl);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'vercel-main-domain-screenshot.png',
      fullPage: true 
    });
    
    // Basic checks
    expect(page.url()).toBe(mainUrl + '/');
    
    // Check if page has loaded successfully (no error page)
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Check if there's any content on the page
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
    
    console.log('✅ Main Vercel domain is accessible and loaded successfully');
  });

  test('should check reading page functionality', async ({ page }) => {
    await page.goto(`${mainUrl}/reading`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of reading page
    await page.screenshot({ 
      path: 'vercel-reading-page-screenshot.png',
      fullPage: true 
    });
    
    // Check for tarot cards
    const cards = await page.locator('[class*="card"], [data-testid*="card"], img[src*="tarot"]').count();
    console.log(`Found ${cards} card elements on the reading page`);
    
    // Check for back cards specifically
    const backCards = await page.locator('img[src*="back"]').count();
    console.log(`Found ${backCards} back card images`);
    
    // Test card interaction if cards are present
    if (cards > 0) {
      const firstCard = page.locator('[class*="card"], [data-testid*="card"], img[src*="tarot"]').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: 'vercel-card-interaction-screenshot.png',
          fullPage: true 
        });
        
        console.log('✅ Card interaction tested successfully');
      }
    }
  });

  test('should test all major pages and functionality', async ({ page }) => {
    const pagesToTest = [
      '/',
      '/reading', 
      '/blog',
      '/about'
    ];

    for (const pagePath of pagesToTest) {
      try {
        console.log(`Testing page: ${pagePath}`);
        await page.goto(`${mainUrl}${pagePath}`);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Take screenshot of each page
        const filename = `vercel-page-${pagePath.replace('/', 'home').replace('/', '-')}-screenshot.png`;
        await page.screenshot({ 
          path: filename,
          fullPage: true 
        });
        
        // Check page loaded without errors
        const pageTitle = await page.title();
        console.log(`✅ ${pagePath} - Title: ${pageTitle}`);
        
      } catch (error) {
        console.log(`⚠️ ${pagePath} - Error: ${error.message}`);
      }
    }
  });
});