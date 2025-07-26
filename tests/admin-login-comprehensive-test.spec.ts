import { test, expect } from '@playwright/test';

test.describe('InnerSpell Admin Login Comprehensive Test', () => {
  test('Verify deployment and admin login functionality', async ({ page }) => {
    // Set longer timeout for this comprehensive test
    test.setTimeout(120000);

    console.log('=== Starting InnerSpell Admin Login Comprehensive Test ===');
    
    // Step 1: Visit the Vercel deployment
    console.log('\n1. Navigating to https://test-studio-firebase.vercel.app');
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'innerspell-homepage-2025-07-26.png',
      fullPage: true 
    });
    console.log('Screenshot saved: innerspell-homepage-2025-07-26.png');
    
    // Step 2: Check for signs of recent deployment
    console.log('\n2. Checking for deployment indicators...');
    
    // Check page title
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Check for any loading indicators
    const loadingIndicators = await page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]').count();
    console.log(`Loading indicators found: ${loadingIndicators}`);
    
    // Check meta tags for version info
    const metaTags = await page.$$eval('meta', metas => 
      metas.map(meta => ({
        name: meta.getAttribute('name'),
        content: meta.getAttribute('content'),
        property: meta.getAttribute('property')
      }))
    );
    console.log('Meta tags:', JSON.stringify(metaTags, null, 2));
    
    // Step 3: Look for login elements
    console.log('\n3. Looking for login elements...');
    
    // Check for login button in various possible locations
    const loginSelectors = [
      'button:has-text("로그인")',
      'a:has-text("로그인")',
      '[href*="login"]',
      '[href*="signin"]',
      'button:has-text("Login")',
      'a:has-text("Login")',
      '[class*="login"]',
      '[id*="login"]'
    ];
    
    let loginElement = null;
    for (const selector of loginSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        loginElement = selector;
        console.log(`Found login element with selector: ${selector}`);
        break;
      }
    }
    
    if (!loginElement) {
      console.log('No login button found on homepage');
      
      // Check if we're already on a login page
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      // Try to navigate to common login URLs
      const loginUrls = ['/login', '/signin', '/auth/login', '/auth/signin'];
      for (const loginUrl of loginUrls) {
        console.log(`\nTrying to navigate to ${loginUrl}...`);
        const response = await page.goto(`https://test-studio-firebase.vercel.app${loginUrl}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        }).catch(e => null);
        
        if (response && response.ok()) {
          console.log(`Successfully navigated to ${loginUrl}`);
          break;
        }
      }
    } else {
      // Click the login element
      console.log(`\nClicking login element...`);
      await page.locator(loginElement).first().click();
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot after login navigation
    await page.screenshot({ 
      path: 'innerspell-login-page-2025-07-26.png',
      fullPage: true 
    });
    console.log('Screenshot saved: innerspell-login-page-2025-07-26.png');
    
    // Step 4: Check for login form
    console.log('\n4. Checking for login form elements...');
    
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email"]',
      'input[placeholder*="이메일"]',
      '#email',
      '[id*="email"]'
    ];
    
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password"]',
      'input[placeholder*="비밀번호"]',
      '#password',
      '[id*="password"]'
    ];
    
    let emailInput = null;
    let passwordInput = null;
    
    for (const selector of emailSelectors) {
      if (await page.locator(selector).count() > 0) {
        emailInput = selector;
        console.log(`Found email input with selector: ${selector}`);
        break;
      }
    }
    
    for (const selector of passwordSelectors) {
      if (await page.locator(selector).count() > 0) {
        passwordInput = selector;
        console.log(`Found password input with selector: ${selector}`);
        break;
      }
    }
    
    if (!emailInput || !passwordInput) {
      console.log('Login form not found');
      console.log(`Email input found: ${!!emailInput}`);
      console.log(`Password input found: ${!!passwordInput}`);
      
      // Log all visible text on the page
      const visibleText = await page.textContent('body');
      console.log('\nVisible text on page:');
      console.log(visibleText?.substring(0, 500) + '...');
      
      return;
    }
    
    // Step 5: Attempt to login
    console.log('\n5. Attempting to login as admin@innerspell.com...');
    
    // Fill in login credentials
    await page.locator(emailInput).fill('admin@innerspell.com');
    await page.locator(passwordInput).fill('test123!@#');
    
    // Look for submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("로그인")',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
      'button:has-text("Submit")',
      '[type="submit"]'
    ];
    
    let submitButton = null;
    for (const selector of submitSelectors) {
      if (await page.locator(selector).count() > 0) {
        submitButton = selector;
        console.log(`Found submit button with selector: ${selector}`);
        break;
      }
    }
    
    if (submitButton) {
      // Take screenshot before submitting
      await page.screenshot({ 
        path: 'innerspell-before-login-2025-07-26.png',
        fullPage: true 
      });
      console.log('Screenshot saved: innerspell-before-login-2025-07-26.png');
      
      // Click submit
      console.log('Clicking submit button...');
      await page.locator(submitButton).click();
      
      // Wait for navigation or response
      await page.waitForTimeout(5000);
      
      // Check for any error messages
      const errorSelectors = [
        '[class*="error"]',
        '[class*="alert"]',
        '[role="alert"]',
        '.error-message',
        '.alert-danger'
      ];
      
      for (const selector of errorSelectors) {
        const errorCount = await page.locator(selector).count();
        if (errorCount > 0) {
          const errorText = await page.locator(selector).first().textContent();
          console.log(`Error message found: ${errorText}`);
        }
      }
    }
    
    // Step 6: Check login status
    console.log('\n6. Checking login status...');
    
    // Take screenshot after login attempt
    await page.screenshot({ 
      path: 'innerspell-after-login-2025-07-26.png',
      fullPage: true 
    });
    console.log('Screenshot saved: innerspell-after-login-2025-07-26.png');
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    
    // Look for user indicators
    const userIndicators = [
      '[class*="user"]',
      '[class*="profile"]',
      '[class*="avatar"]',
      'button:has-text("로그아웃")',
      'button:has-text("Logout")',
      'a:has-text("로그아웃")',
      'a:has-text("Logout")'
    ];
    
    let userFound = false;
    for (const selector of userIndicators) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        userFound = true;
        console.log(`User indicator found: ${selector}`);
      }
    }
    
    console.log(`User logged in: ${userFound}`);
    
    // Step 7: Check for admin menu
    console.log('\n7. Checking for admin menu ("관리자 설정")...');
    
    const adminSelectors = [
      'button:has-text("관리자 설정")',
      'a:has-text("관리자 설정")',
      '[href*="admin"]',
      'button:has-text("Admin")',
      'a:has-text("Admin")',
      '[class*="admin"]',
      'nav >> text="관리자"',
      'menu >> text="관리자"'
    ];
    
    let adminMenuFound = false;
    for (const selector of adminSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        adminMenuFound = true;
        console.log(`Admin menu found with selector: ${selector}`);
        
        // Take screenshot of admin menu
        await page.screenshot({ 
          path: 'innerspell-admin-menu-found-2025-07-26.png',
          fullPage: true 
        });
        console.log('Screenshot saved: innerspell-admin-menu-found-2025-07-26.png');
        
        // Try to click it
        console.log('Attempting to click admin menu...');
        await page.locator(selector).first().click();
        await page.waitForTimeout(3000);
        
        // Take screenshot after clicking
        await page.screenshot({ 
          path: 'innerspell-admin-page-2025-07-26.png',
          fullPage: true 
        });
        console.log('Screenshot saved: innerspell-admin-page-2025-07-26.png');
        
        break;
      }
    }
    
    if (!adminMenuFound) {
      console.log('Admin menu ("관리자 설정") NOT FOUND');
      
      // Log all visible navigation items
      const navItems = await page.$$eval('nav a, nav button, [role="navigation"] a, [role="navigation"] button', 
        elements => elements.map(el => el.textContent?.trim()).filter(text => text)
      );
      console.log('Navigation items found:', navItems);
      
      // Log all visible buttons
      const buttons = await page.$$eval('button', 
        elements => elements.map(el => el.textContent?.trim()).filter(text => text)
      );
      console.log('All buttons found:', buttons);
    }
    
    // Step 8: Final status report
    console.log('\n=== FINAL STATUS REPORT ===');
    console.log(`1. Website accessible: YES`);
    console.log(`2. Current URL: ${page.url()}`);
    console.log(`3. Login form found: ${!!(emailInput && passwordInput)}`);
    console.log(`4. Login attempted: ${!!submitButton}`);
    console.log(`5. User logged in: ${userFound}`);
    console.log(`6. Admin menu found: ${adminMenuFound}`);
    
    // Get page HTML structure for debugging
    const htmlStructure = await page.evaluate(() => {
      const getStructure = (element: Element, depth = 0): string => {
        if (depth > 3) return '';
        const tag = element.tagName.toLowerCase();
        const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
        const id = element.id ? `#${element.id}` : '';
        let result = `${'  '.repeat(depth)}<${tag}${id}${classes}>`;
        
        if (element.children.length > 0) {
          result += '\n';
          for (let child of Array.from(element.children)) {
            result += getStructure(child, depth + 1);
          }
          result += `${'  '.repeat(depth)}</${tag}>\n`;
        } else {
          const text = element.textContent?.trim();
          if (text && text.length < 50) {
            result += ` ${text}`;
          }
          result += `</${tag}>\n`;
        }
        return result;
      };
      return getStructure(document.body);
    });
    
    console.log('\nPage structure:');
    console.log(htmlStructure.substring(0, 1000) + '...');
    
    // Final screenshot
    await page.screenshot({ 
      path: 'innerspell-final-state-2025-07-26.png',
      fullPage: true 
    });
    console.log('\nFinal screenshot saved: innerspell-final-state-2025-07-26.png');
    
    console.log('\n=== Test Complete ===');
  });
});