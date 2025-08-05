const { chromium } = require('playwright');

async function simpleCardTest() {
  console.log('🧪 Simple tarot card test');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1400,900']
  });
  
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  // Test just one card
  const testCard = 'major-00-fool';
  const url = `http://localhost:4000/tarot/${testCard}`;
  
  console.log(`Testing: ${url}`);
  
  try {
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    
    console.log(`Status: ${response?.status()}`);
    
    // Wait for page to load and check for content
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'simple-card-test.png', 
      fullPage: true 
    });
    
    // Check page content
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const bodyText = await page.textContent('body');
    const has404 = bodyText.includes('404') || bodyText.includes('페이지를 찾을 수 없습니다');
    
    console.log(`Contains 404: ${has404}`);
    console.log(`Screenshot saved: simple-card-test.png`);
    
    if (!has404) {
      console.log('✅ Success - Page loaded without 404');
    } else {
      console.log('❌ Failed - Page shows 404');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  await browser.close();
}

simpleCardTest();