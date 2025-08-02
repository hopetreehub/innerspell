import { test, expect } from '@playwright/test';

test.describe('Admin Menu Debugging', () => {
  test('Debug admin menu visibility and user authentication state', async ({ page }) => {
    console.log('🔍 Starting admin menu debug test...');
    
    // Go to homepage first
    await page.goto('https://test-studio-firebase.vercel.app');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `admin-debug-initial-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    console.log('🔍 Step 1: Checking initial page state...');
    
    // Check if already logged in by looking for user menu
    const userNavExists = await page.locator('[data-testid="user-nav"], .user-nav, [aria-label*="사용자"], [aria-label*="user"]').count();
    console.log(`🔍 User nav elements found: ${userNavExists}`);
    
    // Check for login/logout buttons
    const loginButton = page.getByRole('button', { name: /로그인|sign in|login/i });
    const logoutButton = page.getByRole('button', { name: /로그아웃|sign out|logout/i });
    
    const hasLoginButton = await loginButton.count() > 0;
    const hasLogoutButton = await logoutButton.count() > 0;
    
    console.log(`🔍 Login button exists: ${hasLoginButton}`);
    console.log(`🔍 Logout button exists: ${hasLogoutButton}`);
    
    // If not logged in, perform login
    if (hasLoginButton && !hasLogoutButton) {
      console.log('🔍 Step 2: Not logged in, attempting to log in...');
      
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      
      // Handle Google Sign-in
      console.log('🔍 Looking for Google sign-in...');
      
      // Try multiple possible selectors for Google sign-in
      const googleSignInSelectors = [
        'button:has-text("Google")',
        '[data-provider="google"]',
        'button[aria-label*="Google"]',
        '.google-signin',
        'button:has-text("구글")',
        'text=Google로 로그인',
        'text=Sign in with Google'
      ];
      
      let googleButton = null;
      for (const selector of googleSignInSelectors) {
        try {
          googleButton = page.locator(selector).first();
          if (await googleButton.count() > 0) {
            console.log(`🔍 Found Google button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (googleButton && await googleButton.count() > 0) {
        await googleButton.click();
        console.log('🔍 Clicked Google sign-in button');
        
        // Wait for potential popup or redirect
        await page.waitForTimeout(2000);
        
        // Check if we're on Google's auth page
        const currentUrl = page.url();
        console.log(`🔍 Current URL after Google click: ${currentUrl}`);
        
        if (currentUrl.includes('accounts.google.com')) {
          console.log('🔍 On Google auth page, looking for admin email field...');
          
          // Try to find email input and enter admin email
          const emailInput = page.locator('input[type="email"], #identifierId, [aria-label*="email"]').first();
          if (await emailInput.count() > 0) {
            await emailInput.fill('junsupark9999@gmail.com');
            
            // Look for Next button
            const nextButton = page.getByRole('button', { name: /next|다음/i }).first();
            if (await nextButton.count() > 0) {
              await nextButton.click();
              await page.waitForTimeout(2000);
            }
          }
        }
      }
      
      // Wait for auth completion and redirect back
      await page.waitForURL(/test-studio-firebase\.vercel\.app/, { timeout: 30000 });
      await page.waitForLoadState('networkidle');
    }
    
    console.log('🔍 Step 3: Analyzing current authentication state...');
    
    // Take screenshot after potential login
    await page.screenshot({ 
      path: `admin-debug-after-auth-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    // Capture console logs and auth state
    const authDebugInfo = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait a bit for auth context to update
        setTimeout(() => {
          const logs: string[] = [];
          
          // Try to access auth context through window
          const authInfo = {
            // @ts-ignore
            reactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
            // @ts-ignore
            authContext: window.__AUTH_DEBUG__ || 'Not available',
            localStorage: {
              userLoggedOut: localStorage.getItem('user-logged-out'),
              emailForSignIn: localStorage.getItem('emailForSignIn'),
              authStateChanged: localStorage.getItem('auth-state-changed'),
            },
            url: window.location.href,
            userAgent: navigator.userAgent,
          };
          
          resolve(authInfo);
        }, 1000);
      });
    });
    
    console.log('🔍 Auth debug info:', JSON.stringify(authDebugInfo, null, 2));
    
    // Check for admin menu in desktop navigation
    console.log('🔍 Step 4: Checking for admin menu elements...');
    
    const adminMenuDesktop = page.locator('nav a:has-text("관리자 설정"), nav a[href="/admin"], a:has-text("관리자 설정")');
    const adminMenuMobile = page.locator('nav a:has-text("관리자 설정") >> visible=false');
    
    const desktopAdminCount = await adminMenuDesktop.count();
    const mobileAdminCount = await adminMenuMobile.count();
    
    console.log(`🔍 Desktop admin menu elements: ${desktopAdminCount}`);
    console.log(`🔍 Mobile admin menu elements: ${mobileAdminCount}`);
    
    // Check if elements exist but are hidden
    if (desktopAdminCount > 0) {
      const isVisible = await adminMenuDesktop.first().isVisible();
      const isHidden = await adminMenuDesktop.first().isHidden();
      console.log(`🔍 Desktop admin menu - visible: ${isVisible}, hidden: ${isHidden}`);
    }
    
    // Check the navbar component directly
    const navbarElement = page.locator('header nav, nav').first();
    if (await navbarElement.count() > 0) {
      const navbarContent = await navbarElement.innerHTML();
      console.log(`🔍 Navbar HTML contains "관리자": ${navbarContent.includes('관리자')}`);
      console.log(`🔍 Navbar HTML contains "admin": ${navbarContent.includes('admin')}`);
    }
    
    // Check for console errors and warnings
    const consoleLogs = await page.evaluate(() => {
      // Return any auth-related console logs
      return {
        errors: (window as any).__TEST_CONSOLE_ERRORS__ || [],
        warnings: (window as any).__TEST_CONSOLE_WARNINGS__ || [],
        logs: (window as any).__TEST_CONSOLE_LOGS__ || []
      };
    });
    
    console.log('🔍 Console logs captured:', consoleLogs);
    
    // Try to manually check the user object from React context
    const userObjectInfo = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Try to find React fiber and extract auth context
        const tryToFindAuthContext = () => {
          try {
            const allElements = document.querySelectorAll('*');
            for (let element of allElements) {
              const reactFiber = (element as any)._reactInternalFiber || (element as any).__reactInternalInstance;
              if (reactFiber) {
                // Try to find auth context in the fiber tree
                let current = reactFiber;
                while (current) {
                  if (current.memoizedState && current.memoizedState.user) {
                    return current.memoizedState.user;
                  }
                  if (current.child) current = current.child;
                  else if (current.sibling) current = current.sibling;
                  else break;
                }
              }
            }
            return null;
          } catch (e) {
            return { error: e.message };
          }
        };
        
        const result = tryToFindAuthContext();
        resolve(result);
      });
    });
    
    console.log('🔍 User object from React context:', userObjectInfo);
    
    // Check if we can access the user through React DevTools
    const reactDevToolsInfo = await page.evaluate(() => {
      // @ts-ignore
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        try {
          // @ts-ignore
          const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
          return {
            available: true,
            renderers: Object.keys(hook.renderers || {}),
          };
        } catch (e) {
          return { available: true, error: e.message };
        }
      }
      return { available: false };
    });
    
    console.log('🔍 React DevTools info:', reactDevToolsInfo);
    
    // Take final screenshot
    await page.screenshot({ 
      path: `admin-debug-final-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    // Try clicking on mobile menu to see if admin menu is there
    console.log('🔍 Step 5: Checking mobile menu for admin options...');
    
    const mobileMenuButton = page.locator('button:has([data-testid="menu"]), button:has-text("메뉴"), [data-testid="mobile-menu-trigger"]').first();
    if (await mobileMenuButton.count() > 0) {
      await mobileMenuButton.click();
      await page.waitForTimeout(1000);
      
      // Take screenshot of mobile menu
      await page.screenshot({ 
        path: `admin-debug-mobile-menu-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
        fullPage: true 
      });
      
      const mobileMenuContent = await page.locator('[role="dialog"], .sheet-content, .mobile-menu').first().innerHTML();
      console.log(`🔍 Mobile menu contains "관리자": ${mobileMenuContent.includes('관리자')}`);
      
      // Close mobile menu
      await page.keyboard.press('Escape');
    }
    
    // Summary report
    console.log('🔍 === DEBUGGING SUMMARY ===');
    console.log(`🔍 Desktop admin menu found: ${desktopAdminCount > 0}`);
    console.log(`🔍 Mobile admin menu found: ${mobileAdminCount > 0}`);
    console.log(`🔍 Login button present: ${hasLoginButton}`);
    console.log(`🔍 Logout button present: ${hasLogoutButton}`);
    console.log('🔍 Auth debug info:', authDebugInfo);
    console.log('🔍 User object info:', userObjectInfo);
    console.log('🔍 React DevTools info:', reactDevToolsInfo);
    
    // Final assertion - if we expect admin menu but don't see it
    if (!desktopAdminCount && !mobileAdminCount) {
      console.log('🚨 ISSUE DETECTED: No admin menu found despite expecting it for admin user');
    }
    
    // Test complete
    console.log('🔍 Admin menu debug test completed');
  });
  
  test('Check browser console for auth-related errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    
    // Capture console messages
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`${msg.type()}: ${text}`);
      if (text.includes('Auth') || text.includes('user') || text.includes('admin') || text.includes('role')) {
        console.log(`🔍 Relevant console: ${msg.type()}: ${text}`);
      }
    });
    
    // Capture errors
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`🚨 Page error: ${error.message}`);
    });
    
    await page.goto('https://test-studio-firebase.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for auth to initialize
    await page.waitForTimeout(5000);
    
    console.log('🔍 === CONSOLE ANALYSIS ===');
    console.log(`🔍 Total console messages: ${consoleMessages.length}`);
    console.log(`🔍 Page errors: ${errors.length}`);
    
    const authRelatedMessages = consoleMessages.filter(msg => 
      msg.toLowerCase().includes('auth') || 
      msg.toLowerCase().includes('user') || 
      msg.toLowerCase().includes('admin') ||
      msg.toLowerCase().includes('role')
    );
    
    console.log(`🔍 Auth-related messages: ${authRelatedMessages.length}`);
    authRelatedMessages.forEach(msg => console.log(`  ${msg}`));
    
    if (errors.length > 0) {
      console.log('🚨 Errors found:');
      errors.forEach(error => console.log(`  ${error}`));
    }
  });
});