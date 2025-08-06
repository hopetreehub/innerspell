const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testTarotGuidelines() {
  console.log('Starting tarot-guidelines page verification...');
  
  // Create test-screenshots directory if it doesn't exist
  try {
    await fs.mkdir('test-screenshots', { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    // Test 1: General user scenario
    console.log('\n=== Test 1: General User Scenario ===');
    console.log('Navigating to http://localhost:4000/tarot-guidelines...');
    
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(10000);
    
    // Check current URL after any redirects
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);
    
    // Check for admin-only message or login redirect
    const pageContent = await page.content();
    const hasAdminOnlyMessage = pageContent.includes('관리자 전용 페이지') || pageContent.includes('Admin Only');
    const hasLockIcon = await page.locator('svg path[d*="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"]').count() > 0;
    const isLoginPage = currentUrl.includes('/login') || pageContent.includes('로그인');
    
    console.log('Page analysis:');
    console.log('- Has admin-only message:', hasAdminOnlyMessage);
    console.log('- Has lock icon:', hasLockIcon);
    console.log('- Is login page:', isLoginPage);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-screenshots/tarot-guidelines-general-user.png',
      fullPage: true 
    });
    console.log('Screenshot saved: test-screenshots/tarot-guidelines-general-user.png');
    
    // Test 2: Admin dashboard with tarot-guidelines tab
    console.log('\n=== Test 2: Admin Dashboard Tarot Guidelines Tab ===');
    console.log('Navigating to http://localhost:4000/admin?tab=tarot-guidelines...');
    
    await page.goto('http://localhost:4000/admin?tab=tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    const adminUrl = page.url();
    console.log('Current URL:', adminUrl);
    
    // Check if tarot-guidelines tab is active
    const activeTab = await page.locator('.tab-active, [aria-selected="true"], .active-tab').textContent().catch(() => 'No active tab found');
    console.log('Active tab:', activeTab);
    
    await page.screenshot({ 
      path: 'test-screenshots/admin-tarot-guidelines-tab.png',
      fullPage: true 
    });
    console.log('Screenshot saved: test-screenshots/admin-tarot-guidelines-tab.png');
    
    // Test 3: Admin dashboard tarot management interface
    console.log('\n=== Test 3: Admin Dashboard Tarot Management Interface ===');
    
    // Try to find and click tarot guidelines tab
    const tarotTabSelectors = [
      'text=타로 지침',
      'text=Tarot Guidelines',
      '[data-tab="tarot-guidelines"]',
      'button:has-text("타로 지침")',
      'a:has-text("타로 지침")'
    ];
    
    let tabClicked = false;
    for (const selector of tarotTabSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          tabClicked = true;
          console.log(`Clicked tab using selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    if (!tabClicked) {
      console.log('Could not find tarot guidelines tab to click');
    }
    
    await page.waitForTimeout(3000);
    
    // Check for management interface elements
    const hasGuideNavigation = await page.locator('text=지침 탐색').count() > 0;
    const hasGuideManagement = await page.locator('text=지침 관리').count() > 0;
    const hasStatistics = await page.locator('text=통계 및 분석').count() > 0;
    
    console.log('Management interface elements:');
    console.log('- Has guide navigation:', hasGuideNavigation);
    console.log('- Has guide management:', hasGuideManagement);
    console.log('- Has statistics:', hasStatistics);
    
    await page.screenshot({ 
      path: 'test-screenshots/admin-tarot-management-interface.png',
      fullPage: true 
    });
    console.log('Screenshot saved: test-screenshots/admin-tarot-management-interface.png');
    
    // Test 4: Navigation from tarot-guidelines page
    console.log('\n=== Test 4: Navigation Test ===');
    
    // Go back to tarot-guidelines page
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // Look for navigation button
    const navButtonSelectors = [
      'text=관리자 대시보드로 이동',
      'text=Go to Admin Dashboard',
      'button:has-text("대시보드")',
      'a:has-text("대시보드")'
    ];
    
    let navButtonFound = false;
    for (const selector of navButtonSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`Found navigation button: ${selector}`);
          await button.click();
          navButtonFound = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    if (!navButtonFound) {
      console.log('No navigation button found on the page');
    } else {
      await page.waitForTimeout(3000);
      const finalUrl = page.url();
      console.log('Final URL after navigation:', finalUrl);
    }
    
    await page.screenshot({ 
      path: 'test-screenshots/navigation-result.png',
      fullPage: true 
    });
    console.log('Screenshot saved: test-screenshots/navigation-result.png');
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
    console.log('\n=== Testing completed ===');
  }
}

// Run the test
testTarotGuidelines().catch(console.error);