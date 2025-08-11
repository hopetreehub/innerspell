import { test, expect } from '@playwright/test';

test.describe('InnerSpell Admin Direct Access Test', () => {
  test('Check admin page direct access and authentication requirements', async ({ page }) => {
    test.setTimeout(60000);

    console.log('=== Starting Admin Direct Access Test ===');
    
    // Step 1: Try to access admin page directly
    console.log('\n1. Attempting direct access to /admin');
    const adminResponse = await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    }).catch(e => null);
    
    await page.screenshot({ 
      path: 'admin-direct-access-2025-07-26.png',
      fullPage: true 
    });
    console.log('Screenshot saved: admin-direct-access-2025-07-26.png');
    
    const adminUrl = page.url();
    console.log(`Admin access result URL: ${adminUrl}`);
    
    if (adminResponse) {
      console.log(`Admin response status: ${adminResponse.status()}`);
    }
    
    // Step 2: Check what's displayed
    const pageText = await page.textContent('body');
    console.log('\nPage content (first 200 chars):');
    console.log(pageText?.substring(0, 200) + '...');
    
    // Check for common admin indicators
    const adminIndicators = [
      '관리자',
      'Admin',
      'Dashboard',
      '대시보드',
      'Management',
      '관리',
      'Settings',
      '설정'
    ];
    
    let foundIndicators = [];
    for (const indicator of adminIndicators) {
      if (pageText?.includes(indicator)) {
        foundIndicators.push(indicator);
      }
    }
    
    console.log(`\nAdmin indicators found: ${foundIndicators.join(', ')}`);
    
    // Step 3: Check if redirected to login
    const isLoginPage = adminUrl.includes('/sign-in') || adminUrl.includes('/login') || pageText?.includes('로그인');
    console.log(`Redirected to login: ${isLoginPage}`);
    
    // Step 4: Check for any error messages
    const errorSelectors = [
      '[class*="error"]',
      '[role="alert"]',
      '.alert',
      '.warning'
    ];
    
    for (const selector of errorSelectors) {
      const errorCount = await page.locator(selector).count();
      if (errorCount > 0) {
        const errorText = await page.locator(selector).first().textContent();
        console.log(`Error/Alert found: ${errorText}`);
      }
    }
    
    // Step 5: Try other admin-related URLs
    const adminUrls = [
      '/admin/dashboard',
      '/admin/users',
      '/admin/settings',
      '/dashboard',
      '/management'
    ];
    
    for (const url of adminUrls) {
      console.log(`\nTrying ${url}...`);
      const response = await page.goto(`https://test-studio-firebase.vercel.app${url}`, {
        waitUntil: 'networkidle',
        timeout: 15000
      }).catch(e => null);
      
      if (response) {
        console.log(`${url} - Status: ${response.status()}, Final URL: ${page.url()}`);
      } else {
        console.log(`${url} - Failed to load`);
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'admin-access-final-2025-07-26.png',
      fullPage: true 
    });
    console.log('\nFinal screenshot saved: admin-access-final-2025-07-26.png');
    
    console.log('\n=== Admin Direct Access Test Complete ===');
  });
});