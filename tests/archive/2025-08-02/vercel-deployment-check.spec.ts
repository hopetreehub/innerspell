import { test, expect } from '@playwright/test';

test.describe('Vercel Deployment Check', () => {
  const baseURL = 'https://test-studio-firebase.vercel.app';

  test('Verify site is accessible and main page loads', async ({ page }) => {
    // Navigate to the main page
    await page.goto(baseURL);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the main page
    await page.screenshot({ path: 'vercel-main-page-screenshot.png', fullPage: true });
    
    // Check if the main content is visible
    await expect(page).toHaveTitle(/Inner Spell/i);
    
    console.log('✅ Main page loaded successfully');
  });

  test('Check tarot reading page functionality', async ({ page }) => {
    // Navigate to the main page first
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Look for tarot reading link/button
    const tarotLink = page.locator('text=/타로.*카드|tarot/i').first();
    
    if (await tarotLink.isVisible()) {
      await tarotLink.click();
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot of the tarot page
      await page.screenshot({ path: 'vercel-tarot-page-screenshot.png', fullPage: true });
      
      console.log('✅ Tarot page accessed successfully');
      
      // Check for card elements
      const cards = page.locator('.card, [class*="card"]');
      const cardCount = await cards.count();
      console.log(`Found ${cardCount} card elements on the page`);
      
      // Try to interact with a card if available
      if (cardCount > 0) {
        const firstCard = cards.first();
        await firstCard.hover();
        await page.screenshot({ path: 'vercel-card-hover-screenshot.png', fullPage: true });
        
        // Try clicking a card
        await firstCard.click();
        await page.waitForTimeout(1000); // Wait for any animations
        await page.screenshot({ path: 'vercel-card-clicked-screenshot.png', fullPage: true });
      }
    } else {
      console.log('⚠️ Tarot link not found on main page, trying direct navigation');
      
      // Try common tarot page URLs
      const possibleUrls = ['/tarot', '/reading', '/tarot-reading', '/cards'];
      
      for (const url of possibleUrls) {
        try {
          await page.goto(`${baseURL}${url}`);
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          
          // Check if we're on a valid page
          const hasContent = await page.locator('body').evaluate(el => el.textContent.trim().length > 0);
          
          if (hasContent && !page.url().includes('404')) {
            console.log(`✅ Found tarot page at ${url}`);
            await page.screenshot({ path: `vercel-tarot-${url.replace('/', '')}-screenshot.png`, fullPage: true });
            break;
          }
        } catch (error) {
          console.log(`${url} not found`);
        }
      }
    }
  });

  test('Check for recent deployment changes', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check page source for any recent changes indicators
    const pageContent = await page.content();
    
    // Look for build/deployment indicators
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // Check network errors
    page.on('requestfailed', request => {
      console.log('Request failed:', request.url(), request.failure()?.errorText);
    });
    
    // Final screenshot with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `vercel-deployment-check-${timestamp}.png`, 
      fullPage: true 
    });
  });
});