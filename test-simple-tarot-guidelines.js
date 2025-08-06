const { chromium } = require('playwright');
const path = require('path');

async function testSimpleTarotGuidelines() {
  console.log('🔍 Simple Tarot Guidelines Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate directly to tarot-guidelines
    console.log('📍 Going to /tarot-guidelines...');
    const response = await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log(`   Response status: ${response.status()}`);
    console.log(`   Response URL: ${response.url()}`);
    
    // Wait a bit for any redirects
    await page.waitForTimeout(3000);
    
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'simple-tarot-guidelines.png'),
      fullPage: true 
    });
    console.log('✅ Screenshot saved');
    
    // Get page title and any visible text
    const title = await page.title();
    console.log(`   Page title: ${title}`);
    
    // Try to get main heading
    const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
    console.log(`   H1 text: ${h1Text}`);
    
    // Check for specific elements
    const hasAdminText = await page.locator('text=/관리자.*전용/').count() > 0;
    const hasLockIcon = await page.locator('svg').count() > 0;
    const hasButton = await page.locator('button').count() > 0;
    
    console.log(`   Has "관리자 전용" text: ${hasAdminText}`);
    console.log(`   Has SVG icons: ${hasLockIcon}`);
    console.log(`   Has buttons: ${hasButton}`);
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'simple-tarot-error.png'),
      fullPage: true 
    });
    
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

testSimpleTarotGuidelines().catch(console.error);