const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Testing major-00-fool...');
  
  try {
    const response = await page.goto('http://localhost:4000/tarot/major-00-fool', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    
    console.log(`📊 Status: ${response.status()}`);
    
    if (response.status() === 200) {
      await page.waitForSelector('h1', { timeout: 5000 });
      const title = await page.textContent('h1');
      console.log(`📝 Title: ${title}`);
      
      const bodyText = await page.textContent('body');
      const hasTarotContent = bodyText.includes('바보') || bodyText.includes('Fool');
      console.log(`🎯 Has tarot content: ${hasTarotContent}`);
      
      await page.screenshot({ path: 'quick-single-test.png' });
      console.log('✅ Screenshot saved');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await browser.close();
}

quickTest().catch(console.error);