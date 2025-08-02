import { test, expect } from '@playwright/test';

test.describe('Admin Login and Menu Verification', () => {
  test('Complete admin authentication flow and verify admin menu', async ({ page }) => {
    console.log('🔍 Starting comprehensive admin login test...');
    
    // Go to homepage
    await page.goto('https://test-studio-firebase.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `admin-comprehensive-01-initial-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    console.log('🔍 Step 1: Checking initial authentication state...');
    
    // Look for sign up button (indicates not logged in)
    const signUpButton = page.getByRole('button', { name: /회원가입|sign up/i });
    const isSignUpVisible = await signUpButton.isVisible();
    console.log(`🔍 Sign up button visible: ${isSignUpVisible}`);
    
    // Look for user menu (indicates logged in)
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, [aria-label*="사용자"]');
    const hasUserMenu = await userMenu.count() > 0;
    console.log(`🔍 User menu exists: ${hasUserMenu}`);
    
    if (isSignUpVisible) {
      console.log('🔍 Step 2: User not logged in, attempting to sign in...');
      
      // Click sign up button to go to auth page
      await signUpButton.click();
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of auth page
      await page.screenshot({ 
        path: `admin-comprehensive-02-auth-page-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
        fullPage: true 
      });
      
      // Look for Google sign in button
      console.log('🔍 Looking for Google sign-in option...');
      
      const googleSignInSelectors = [
        'button:has-text("Google")',
        'button:has-text("구글")',
        '[data-provider="google"]',
        'button[aria-label*="Google"]',
        '.google-signin',
        'text=Google로 로그인',
        'text=Sign in with Google',
        'text=Continue with Google',
        '[class*="google"]'
      ];
      
      let googleButton = null;
      for (const selector of googleSignInSelectors) {
        try {
          const btn = page.locator(selector).first();
          if (await btn.count() > 0 && await btn.isVisible()) {
            googleButton = btn;
            console.log(`🔍 Found Google button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (googleButton) {
        console.log('🔍 Step 3: Clicking Google sign-in...');
        
        // Take screenshot before Google click
        await page.screenshot({ 
          path: `admin-comprehensive-03-before-google-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
          fullPage: true 
        });
        
        // Click Google sign-in
        await googleButton.click();
        await page.waitForTimeout(3000);
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`🔍 Current URL after Google click: ${currentUrl}`);
        
        // Take screenshot after Google click
        await page.screenshot({ 
          path: `admin-comprehensive-04-after-google-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
          fullPage: true 
        });
        
        if (currentUrl.includes('accounts.google.com') || currentUrl.includes('google')) {
          console.log('🔍 Step 4: On Google auth page, attempting to fill credentials...');
          
          // Handle Google auth page
          try {
            // Wait for email input
            await page.waitForSelector('input[type="email"], #identifierId', { timeout: 10000 });
            
            const emailInput = page.locator('input[type="email"], #identifierId').first();
            if (await emailInput.isVisible()) {
              await emailInput.fill('junsupark9999@gmail.com');
              console.log('🔍 Filled admin email');
              
              // Click Next
              const nextButton = page.getByRole('button', { name: /next|다음/i });
              if (await nextButton.count() > 0) {
                await nextButton.click();
                await page.waitForTimeout(2000);
              }
              
              // Take screenshot after email
              await page.screenshot({ 
                path: `admin-comprehensive-05-email-filled-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
                fullPage: true 
              });
            }
          } catch (error) {
            console.log(`🔍 Google auth form interaction failed: ${error.message}`);
          }
        }
        
        // Wait for potential redirect back to our site
        try {
          await page.waitForURL(/test-studio-firebase\.vercel\.app/, { timeout: 30000 });
          console.log('🔍 Redirected back to our site');
        } catch (error) {
          console.log('🔍 Did not redirect back automatically, continuing...');
        }
      } else {
        console.log('🔍 No Google sign-in button found, checking for other auth options...');
        
        // Look for email/password form
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
        
        if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
          console.log('🔍 Found email/password form, attempting manual login...');
          
          await emailInput.fill('junsupark9999@gmail.com');
          await passwordInput.fill('dummy-password'); // This will likely fail but let's try
          
          const submitButton = page.getByRole('button', { name: /로그인|sign in|login/i });
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(3000);
          }
        }
      }
    }
    
    // Return to homepage to check final state
    console.log('🔍 Step 5: Returning to homepage to check final authentication state...');
    await page.goto('https://test-studio-firebase.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Wait for auth context to fully load
    await page.waitForTimeout(5000);
    
    // Take final screenshot
    await page.screenshot({ 
      path: `admin-comprehensive-06-final-state-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    console.log('🔍 Step 6: Analyzing final authentication state...');
    
    // Check for admin menu in navigation
    const adminMenuDesktop = page.locator('nav a:has-text("관리자 설정"), nav a[href="/admin"], a:has-text("관리자 설정")');
    const adminMenuCount = await adminMenuDesktop.count();
    
    console.log(`🔍 Admin menu elements found: ${adminMenuCount}`);
    
    if (adminMenuCount > 0) {
      const isAdminMenuVisible = await adminMenuDesktop.first().isVisible();
      console.log(`🔍 Admin menu visible: ${isAdminMenuVisible}`);
      
      if (isAdminMenuVisible) {
        console.log('✅ SUCCESS: Admin menu is visible!');
        
        // Test clicking the admin menu
        await adminMenuDesktop.first().click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of admin page
        await page.screenshot({ 
          path: `admin-comprehensive-07-admin-page-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
          fullPage: true 
        });
        
        console.log('✅ Successfully accessed admin page');
      }
    } else {
      console.log('❌ ISSUE: Admin menu not found');
    }
    
    // Check current authentication state from console
    const authState = await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const state = {
            url: window.location.href,
            hasSignUpButton: !!document.querySelector('button:has-text("회원가입"), button:has-text("Sign Up")'),
            hasUserMenu: !!document.querySelector('[data-testid="user-menu"], .user-menu'),
            hasAdminMenu: !!document.querySelector('a:has-text("관리자 설정"), a[href="/admin"]'),
            authDebugLogs: (window as any).__AUTH_DEBUG_LOGS__ || [],
          };
          resolve(state);
        }, 1000);
      });
    });
    
    console.log('🔍 Final authentication state:', JSON.stringify(authState, null, 2));
    
    // Check mobile menu as well
    console.log('🔍 Step 7: Checking mobile menu for admin options...');
    
    const mobileMenuTrigger = page.locator('button[aria-expanded], [data-testid="mobile-menu"], button:has(svg)').last();
    if (await mobileMenuTrigger.count() > 0) {
      try {
        await mobileMenuTrigger.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot of mobile menu
        await page.screenshot({ 
          path: `admin-comprehensive-08-mobile-menu-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
          fullPage: true 
        });
        
        const mobileAdminMenu = page.locator('[role="dialog"] a:has-text("관리자 설정"), .mobile-menu a:has-text("관리자 설정")');
        const mobileAdminCount = await mobileAdminMenu.count();
        console.log(`🔍 Mobile admin menu elements: ${mobileAdminCount}`);
        
        // Close mobile menu
        await page.keyboard.press('Escape');
      } catch (error) {
        console.log(`🔍 Mobile menu test failed: ${error.message}`);
      }
    }
    
    console.log('🔍 === COMPREHENSIVE TEST COMPLETE ===');
    console.log(`🔍 Admin menu status: ${adminMenuCount > 0 ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`🔍 Authentication status: ${authState.hasSignUpButton ? 'NOT LOGGED IN' : 'LOGGED IN'}`);
  });
  
  test('Direct admin page access test', async ({ page }) => {
    console.log('🔍 Testing direct admin page access...');
    
    // Try to access admin page directly
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: `admin-direct-access-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    const currentUrl = page.url();
    console.log(`🔍 Direct admin access result URL: ${currentUrl}`);
    
    // Check if redirected to sign-in
    if (currentUrl.includes('/sign-in') || currentUrl.includes('/login')) {
      console.log('✅ Properly redirected to sign-in (security working)');
    } else if (currentUrl.includes('/admin')) {
      console.log('❌ Direct admin access allowed (potential security issue)');
    } else {
      console.log(`🔍 Redirected to: ${currentUrl}`);
    }
  });
});