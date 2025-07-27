/**
 * Simplified Push Notification Test
 * Focus on testing the notification functionality in admin dashboard
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:4000';
const SCREENSHOT_DIR = './notification-test-screenshots';

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

async function testNotifications() {
  console.log('🔔 Starting Simplified Push Notification Test...');
  
  await createScreenshotDir();
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--enable-notifications',
      '--allow-insecure-localhost',
      '--disable-web-security'
    ]
  });

  const context = await browser.newContext({
    permissions: ['notifications']
  });

  const page = await context.newPage();

  // Console logging for debugging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('notification') || text.includes('push') || text.includes('알림')) {
      console.log('🔔 Notification Log:', text);
    }
  });

  try {
    console.log('📱 Step 1: Navigate to admin page...');
    await page.goto(`${BASE_URL}/admin`, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    // Wait a bit more for React components to load
    await delay(5000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-admin-page.png`, fullPage: true });
    
    console.log('🔐 Step 2: Mock admin authentication...');
    await page.evaluate(() => {
      // Mock admin authentication
      const mockUser = {
        uid: 'admin-test-uid',
        email: 'admin@test.com',
        role: 'admin',
        displayName: 'Test Admin'
      };
      
      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      // Mock Firebase auth state
      if (typeof window !== 'undefined') {
        window.__FIREBASE_AUTH_STATE__ = {
          user: mockUser,
          loading: false
        };
      }
    });
    
    // Reload to apply auth state
    await page.reload({ waitUntil: 'domcontentloaded' });
    await delay(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-after-auth.png`, fullPage: true });

    console.log('🔔 Step 3: Look for notifications tab...');
    
    // Wait for admin dashboard to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Get page content for analysis
    const pageText = await page.textContent('body');
    console.log('Page contains "알림":', pageText.includes('알림'));
    console.log('Page contains "notification":', pageText.includes('notification'));
    
    // Look for notification tab/button
    const notificationTab = page.locator('text=알림 설정').first();
    const bellIcon = page.locator('[data-lucide="bell"]').first();
    
    if (await notificationTab.isVisible({ timeout: 5000 })) {
      console.log('✅ Found "알림 설정" tab');
      await notificationTab.click();
      await delay(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/03-notifications-tab.png`, fullPage: true });
    } else if (await bellIcon.isVisible({ timeout: 5000 })) {
      console.log('✅ Found bell icon');
      await bellIcon.click();
      await delay(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/03-bell-clicked.png`, fullPage: true });
    } else {
      console.log('❌ Notifications tab not found, showing all tabs...');
      const allTabs = await page.locator('[role="tab"], button, .tab').allTextContents();
      console.log('Available tabs/buttons:', allTabs.slice(0, 10));
      await page.screenshot({ path: `${SCREENSHOT_DIR}/03-no-notifications-tab.png`, fullPage: true });
    }

    console.log('🔔 Step 4: Look for push notification components...');
    
    // Search for push notification related text
    const pushTexts = ['푸시 알림', '테스트 알림', 'Push Notification', 'notification'];
    let foundPushComponent = false;
    
    for (const text of pushTexts) {
      const element = page.locator(`text=${text}`).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`✅ Found push notification text: "${text}"`);
        foundPushComponent = true;
        break;
      }
    }
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-push-component-search.png`, fullPage: true });
    
    if (foundPushComponent) {
      console.log('🎯 Testing push notification toggle...');
      
      // Look for toggle switches
      const toggles = page.locator('input[type="checkbox"], button[role="switch"], [data-state]');
      const toggleCount = await toggles.count();
      console.log(`Found ${toggleCount} potential toggles`);
      
      if (toggleCount > 0) {
        const firstToggle = toggles.first();
        await firstToggle.click();
        await delay(1000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/05-toggle-clicked.png`, fullPage: true });
      }
      
      // Look for test buttons
      const testButton = page.locator('text=테스트 알림, button:has-text("테스트"), button:has-text("알림")').first();
      if (await testButton.isVisible({ timeout: 2000 })) {
        console.log('📨 Found test button, clicking...');
        await testButton.click();
        await delay(2000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/06-test-button.png`, fullPage: true });
      }
    }

    console.log('🔍 Step 5: Test browser notification APIs...');
    
    const notificationTest = await page.evaluate(async () => {
      try {
        // Check notification support
        const supported = 'Notification' in window;
        if (!supported) return { error: 'Notifications not supported' };
        
        // Request permission
        const permission = await Notification.requestPermission();
        
        // Try to show a test notification
        if (permission === 'granted') {
          new Notification('InnerSpell Test', {
            body: 'Push notification test successful!',
            icon: '/favicon.ico'
          });
        }
        
        return {
          supported: true,
          permission: permission,
          serviceWorker: 'serviceWorker' in navigator,
          pushManager: 'PushManager' in window
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('🔔 Notification test result:', notificationTest);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/07-final-test.png`, fullPage: true });

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/error.png`, fullPage: true });
  }

  await browser.close();
  console.log('✅ Notification test completed!');
  console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
}

testNotifications().catch(console.error);