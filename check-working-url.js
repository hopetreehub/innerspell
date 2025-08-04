const { chromium } = require('playwright');

async function checkWorkingUrl() {
  console.log('🔍 Checking working tarot detail URL...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    const url = 'http://localhost:4000/tarot/major-00-fool';
    console.log(`📱 Loading ${url}...`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    
    // Wait for content
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    const h1Text = await page.locator('h1').first().textContent().catch(() => 'No H1');
    const hasCardImage = await page.locator('img[alt*="타로"], img[alt*="Tarot"], img[alt*="card"]').count() > 0;
    const hasDescription = await page.locator('text=/정방향|역방향|의미/').count() > 0;
    
    console.log('\n📊 Page details:');
    console.log(`  - Title: ${title}`);
    console.log(`  - H1: ${h1Text}`);
    console.log(`  - Has card image: ${hasCardImage ? '✅' : '❌'}`);
    console.log(`  - Has card meanings: ${hasDescription ? '✅' : '❌'}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/tarot-detail-working.png', 
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved to screenshots/tarot-detail-working.png');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkWorkingUrl();