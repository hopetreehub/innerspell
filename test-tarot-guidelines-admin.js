const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testTarotGuidelinesAsAdmin() {
  console.log('Starting tarot-guidelines page verification with admin login...');
  
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
    // Step 1: Login as admin
    console.log('\n=== Step 1: Admin Login ===');
    console.log('Navigating to sign-in page...');
    
    await page.goto('http://localhost:4000/sign-in', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Fill in admin credentials
    await page.fill('input[type="email"]', 'admin@innerspell.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Click sign in button
    await page.click('button:has-text("로그인")');
    
    // Wait for navigation
    await page.waitForTimeout(5000);
    
    console.log('Logged in as admin, current URL:', page.url());
    
    // Step 2: Navigate to tarot-guidelines as logged in admin
    console.log('\n=== Step 2: Navigate to Tarot Guidelines as Admin ===');
    
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    const afterNavUrl = page.url();
    console.log('URL after navigation:', afterNavUrl);
    console.log('Should redirect to:', 'http://localhost:4000/admin?tab=tarot-guidelines');
    console.log('Redirect successful:', afterNavUrl.includes('/admin?tab=tarot-guidelines'));
    
    // Check if we're on the admin page with tarot-guidelines tab
    if (afterNavUrl.includes('/admin')) {
      // Look for tarot guidelines tab content
      const tabContent = await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('[role="tab"], button')).map(el => ({
          text: el.textContent.trim(),
          active: el.classList.contains('active') || el.getAttribute('aria-selected') === 'true'
        }));
        return tabs;
      });
      
      console.log('Available tabs:', tabContent);
      
      // Check for tarot guidelines specific content
      const hasTarotContent = await page.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasGuidelines: text.includes('지침') || text.includes('Guidelines'),
          hasTarot: text.includes('타로') || text.includes('Tarot'),
          hasManagement: text.includes('관리') || text.includes('Management')
        };
      });
      
      console.log('Tarot content found:', hasTarotContent);
    }
    
    await page.screenshot({ 
      path: 'test-screenshots/tarot-guidelines-admin-redirect.png',
      fullPage: true 
    });
    
    // Step 3: Try accessing tarot guidelines content directly
    console.log('\n=== Step 3: Access Tarot Guidelines Tab Directly ===');
    
    // Click on tarot guidelines tab if visible
    const tabSelectors = [
      'text=타로 지침',
      'text=Tarot Guidelines',
      'button:has-text("타로")',
      '[data-tab="tarot-guidelines"]'
    ];
    
    for (const selector of tabSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`Found tab element: ${selector}`);
          await element.click();
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Check content after tab click
    const currentContent = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.textContent.substring(0, 500) : 'No main content found';
    });
    
    console.log('Current content preview:', currentContent);
    
    await page.screenshot({ 
      path: 'test-screenshots/tarot-guidelines-tab-content.png',
      fullPage: true 
    });
    
    // Step 4: Check for admin-only message when not logged in
    console.log('\n=== Step 4: Logout and Check Access Restriction ===');
    
    // Logout
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    // Check for lock icon and admin-only message
    const restrictedAccess = await page.evaluate(() => {
      const body = document.body.textContent;
      const hasLock = document.querySelector('svg path[d*="M12"]') !== null;
      return {
        hasLockIcon: hasLock,
        hasAdminOnlyText: body.includes('관리자 전용') || body.includes('Admin Only'),
        hasDashboardButton: body.includes('관리자 대시보드로 이동'),
        currentUrl: window.location.href
      };
    });
    
    console.log('Restricted access check:', restrictedAccess);
    
    await page.screenshot({ 
      path: 'test-screenshots/tarot-guidelines-restricted.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
    console.log('\n=== Testing completed ===');
  }
}

// Run the test
testTarotGuidelinesAsAdmin().catch(console.error);