const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testTarotGuidelinesDetailed() {
  console.log('Starting detailed tarot-guidelines page verification...');
  
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
    // Test 1: Check if tarot-guidelines page exists
    console.log('\n=== Test 1: Tarot Guidelines Page Check ===');
    
    const response = await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('Response status:', response.status());
    console.log('Response URL:', response.url());
    
    // Wait for React to render
    await page.waitForTimeout(5000);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for specific elements that should be on tarot-guidelines page
    const h1Text = await page.locator('h1').first().textContent().catch(() => 'No h1 found');
    console.log('H1 text:', h1Text);
    
    // Check for admin-only indicators
    const elements = {
      lockIcon: await page.locator('svg').filter({ hasText: /lock/i }).count(),
      adminText: await page.locator('text=/관리자.*전용/i').count(),
      loginButton: await page.locator('button:has-text("로그인")').count(),
      dashboardButton: await page.locator('text=/대시보드/i').count()
    };
    
    console.log('Element counts:', elements);
    
    // Get page content preview
    const bodyText = await page.locator('body').innerText();
    console.log('Page content preview (first 500 chars):', bodyText.substring(0, 500));
    
    await page.screenshot({ 
      path: 'test-screenshots/tarot-guidelines-detailed-1.png',
      fullPage: true 
    });
    
    // Test 2: Try accessing with auth simulation
    console.log('\n=== Test 2: Check Auth Behavior ===');
    
    // Check localStorage or sessionStorage
    const storage = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage)
    }));
    console.log('Storage keys:', storage);
    
    // Test 3: Check admin dashboard
    console.log('\n=== Test 3: Admin Dashboard Check ===');
    
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    const adminUrl = page.url();
    console.log('Admin page URL:', adminUrl);
    
    // Look for tabs
    const tabs = await page.locator('[role="tab"], .tab, button[data-tab]').allTextContents();
    console.log('Found tabs:', tabs);
    
    await page.screenshot({ 
      path: 'test-screenshots/admin-dashboard-tabs.png',
      fullPage: true 
    });
    
    // Test 4: Direct tab navigation
    console.log('\n=== Test 4: Direct Tab Navigation ===');
    
    await page.goto('http://localhost:4000/admin?tab=tarot-guidelines', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // Check URL params
    const urlParams = new URL(page.url()).searchParams;
    console.log('URL params:', Object.fromEntries(urlParams));
    
    // Check active tab
    const activeTab = await page.locator('.active, [aria-selected="true"], .tab-active').textContent().catch(() => 'No active tab');
    console.log('Active tab text:', activeTab);
    
    await page.screenshot({ 
      path: 'test-screenshots/admin-tarot-tab-direct.png',
      fullPage: true 
    });
    
    // Test 5: Check for tarot guidelines specific content
    console.log('\n=== Test 5: Tarot Guidelines Content Check ===');
    
    const tarotContent = {
      hasGuidelines: await page.locator('text=/지침|guidelines/i').count(),
      hasNavigation: await page.locator('text=/탐색|navigation/i').count(),
      hasManagement: await page.locator('text=/관리|management/i').count(),
      hasStatistics: await page.locator('text=/통계|statistics/i').count()
    };
    
    console.log('Tarot content elements:', tarotContent);
    
    // Final detailed page structure
    const pageStructure = await page.evaluate(() => {
      const main = document.querySelector('main');
      const divs = document.querySelectorAll('div');
      return {
        hasMain: !!main,
        mainClasses: main?.className || 'No main element',
        divCount: divs.length,
        bodyClasses: document.body.className
      };
    });
    
    console.log('Page structure:', pageStructure);
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
    console.log('\n=== Testing completed ===');
  }
}

// Run the test
testTarotGuidelinesDetailed().catch(console.error);