/**
 * Push Notification QA Test Script
 * Tests push notification functionality in admin dashboard using Playwright
 */

const { chromium } = require('playwright');
const path = require('path');

// Configuration
const VERCEL_URL = 'https://test-studio-firebase-dogxq5ort-johns-projects-bf5e60f3.vercel.app';
const SCREENSHOT_DIR = './push-notification-screenshots';
const TEST_ADMIN_EMAIL = 'admin@example.com';
const TEST_ADMIN_PASSWORD = 'test123';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createScreenshotDir() {
  const fs = require('fs').promises;
  try {
    await fs.access(SCREENSHOT_DIR);
  } catch {
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  }
}

async function testPushNotifications() {
  console.log('🔔 Starting Push Notification QA Test...');
  
  await createScreenshotDir();
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--allow-running-insecure-content',
      '--disable-blink-features=AutomationControlled',
      '--enable-notifications' // Enable notifications
    ]
  });

  const context = await browser.newContext({
    permissions: ['notifications'], // Grant notification permissions
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('📱 Step 1: Navigating to Vercel deployment...');
    await page.goto(VERCEL_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-homepage.png`, fullPage: true });
    console.log('✅ Homepage loaded successfully');

    console.log('🔐 Step 2: Navigating to sign-in page...');
    const signInButton = page.locator('text=로그인').first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
    } else {
      await page.goto(`${VERCEL_URL}/sign-in`);
    }
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-signin-page.png`, fullPage: true });
    console.log('✅ Sign-in page loaded');

    console.log('🔑 Step 3: Attempting admin login...');
    // Fill login form
    await page.fill('input[type="email"]', TEST_ADMIN_EMAIL);
    await page.fill('input[type="password"]', TEST_ADMIN_PASSWORD);
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for either successful login or error
    await Promise.race([
      page.waitForURL('**/admin**', { timeout: 5000 }),
      page.waitForSelector('[role="alert"], .error, .alert-error', { timeout: 5000 }),
      delay(5000)
    ]);
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-after-login.png`, fullPage: true });

    // Check if we're on admin page
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    if (!currentUrl.includes('/admin')) {
      console.log('❌ Admin login failed or redirected. Trying direct admin access...');
      await page.goto(`${VERCEL_URL}/admin`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: `${SCREENSHOT_DIR}/04-direct-admin-access.png`, fullPage: true });
    }

    console.log('📊 Step 4: Accessing admin dashboard...');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check if we can see admin dashboard
    const adminTitle = await page.locator('h1').textContent();
    console.log('Admin page title:', adminTitle);
    
    if (!adminTitle || !adminTitle.includes('관리자')) {
      console.log('⚠️  Not properly authenticated as admin. Continuing with mock authentication...');
      
      // Mock admin authentication if needed
      await page.evaluate(() => {
        // Mock admin user in localStorage
        localStorage.setItem('mock_admin_user', JSON.stringify({
          email: 'admin@example.com',
          role: 'admin',
          uid: 'mock-admin-uid'
        }));
      });
      
      await page.reload({ waitUntil: 'networkidle' });
      await page.screenshot({ path: `${SCREENSHOT_DIR}/05-after-mock-auth.png`, fullPage: true });
    }

    console.log('🔔 Step 5: Looking for Notifications tab...');
    
    // Look for the notifications tab
    const notificationsTab = page.locator('text=알림 설정');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-admin-dashboard.png`, fullPage: true });
    
    if (await notificationsTab.isVisible()) {
      console.log('✅ Found notifications tab!');
      await notificationsTab.click();
      await delay(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/07-notifications-tab-clicked.png`, fullPage: true });
    } else {
      console.log('❌ Notifications tab not found. Available tabs:');
      const tabs = await page.locator('[role="tab"], .tabs button, .tab').allTextContents();
      console.log('Available tabs:', tabs);
      
      // Try alternative selectors
      const bellIcon = page.locator('[data-lucide="bell"], .lucide-bell').first();
      if (await bellIcon.isVisible()) {
        console.log('🔔 Found bell icon, clicking...');
        await bellIcon.click();
        await delay(1000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/07-bell-icon-clicked.png`, fullPage: true });
      }
    }

    console.log('🔔 Step 6: Testing push notification toggle...');
    
    // Look for the push notification toggle component
    const pushToggle = page.locator('text=푸시 알림');
    if (await pushToggle.isVisible()) {
      console.log('✅ Found push notification component!');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/08-push-notification-component.png`, fullPage: true });
      
      // Look for the toggle switch
      const toggleSwitch = page.locator('button[role="switch"], [type="checkbox"]').first();
      if (await toggleSwitch.isVisible()) {
        console.log('🔄 Found toggle switch, testing...');
        
        // Check current state
        const isChecked = await toggleSwitch.isChecked().catch(() => false);
        console.log('Current toggle state:', isChecked);
        
        // Try to toggle
        await toggleSwitch.click();
        await delay(2000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/09-toggle-clicked.png`, fullPage: true });
        
        // Check if permission dialog appeared
        const permissionDialog = page.locator('text=알림을 허용하시겠습니까?');
        if (await permissionDialog.isVisible()) {
          console.log('🔔 Permission dialog appeared!');
          await page.screenshot({ path: `${SCREENSHOT_DIR}/10-permission-dialog.png`, fullPage: true });
        }
        
      } else {
        console.log('❌ Toggle switch not found');
      }
      
      // Look for test notification button
      const testButton = page.locator('text=테스트 알림 보내기');
      if (await testButton.isVisible()) {
        console.log('📨 Found test notification button!');
        await testButton.click();
        await delay(2000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/11-test-button-clicked.png`, fullPage: true });
        
        console.log('✅ Test notification button clicked successfully!');
      } else {
        console.log('❌ Test notification button not found');
      }
      
    } else {
      console.log('❌ Push notification component not found');
      
      // Search for any notification-related text
      const notificationText = await page.locator('text=/알림|notification/i').allTextContents();
      console.log('Found notification-related text:', notificationText);
    }

    console.log('🔍 Step 7: Inspecting page structure...');
    
    // Get page content for debugging
    const bodyText = await page.locator('body').textContent();
    const hasNotificationText = bodyText.includes('알림') || bodyText.includes('notification');
    console.log('Page contains notification text:', hasNotificationText);
    
    // Get all buttons and their text
    const allButtons = await page.locator('button').allTextContents();
    console.log('All buttons on page:', allButtons.slice(0, 10)); // Show first 10
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/12-final-state.png`, fullPage: true });

    console.log('📝 Step 8: Console logs and errors...');
    
    // Check console logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      } else if (msg.text().includes('notification') || msg.text().includes('push')) {
        console.log('🔔 Notification Log:', msg.text());
      }
    });

    // Test service worker registration
    const swStatus = await page.evaluate(() => {
      return {
        serviceWorkerSupported: 'serviceWorker' in navigator,
        pushManagerSupported: 'PushManager' in window,
        notificationSupported: 'Notification' in window,
        notificationPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unknown'
      };
    });
    
    console.log('🔧 Browser Support Status:', swStatus);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/error-screenshot.png`, fullPage: true });
  }

  await browser.close();
  console.log('✅ Push notification test completed!');
  console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
}

// Run the test
testPushNotifications().catch(console.error);