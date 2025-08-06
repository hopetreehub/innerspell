const { chromium } = require('playwright');

async function simpleTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  try {
    console.log('Testing /tarot-guidelines page...');
    
    // Go to tarot-guidelines
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for React to render
    await page.waitForTimeout(10000);
    
    // Get current URL and page content
    const currentUrl = page.url();
    const pageTitle = await page.title();
    const hasLockIcon = await page.locator('svg').count() > 0;
    const pageText = await page.locator('body').innerText();
    
    console.log('\n=== Results ===');
    console.log('Current URL:', currentUrl);
    console.log('Page title:', pageTitle);
    console.log('Has SVG icons:', hasLockIcon);
    console.log('\nPage content preview:');
    console.log(pageText.substring(0, 800));
    
    // Check for specific elements
    const elements = {
      adminOnly: await page.locator('text=/관리자.*전용/').count(),
      lockIcon: await page.locator('svg path[d*="M12"]').count(),
      dashboardButton: await page.locator('text=/관리자.*대시보드/').count(),
      mainPageButton: await page.locator('text=/메인.*페이지/').count()
    };
    
    console.log('\n=== Element Check ===');
    console.log('Admin only text:', elements.adminOnly);
    console.log('Lock icon:', elements.lockIcon);
    console.log('Dashboard button:', elements.dashboardButton);
    console.log('Main page button:', elements.mainPageButton);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-screenshots/simple-tarot-guidelines-final.png',
      fullPage: true 
    });
    console.log('\nScreenshot saved: test-screenshots/simple-tarot-guidelines-final.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

simpleTest().catch(console.error);