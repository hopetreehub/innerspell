const { chromium } = require('playwright');

async function testDirectTarot() {
  console.log('🔍 Testing direct tarot card URLs...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test different URL patterns
    const urls = [
      'http://localhost:4000/tarot/major-00-fool',
      'http://localhost:4000/tarot/cards/major-00-fool',
      'http://localhost:4000/tarot/00-the-fool',
      'http://localhost:4000/tarot/cards/00-the-fool'
    ];
    
    for (const url of urls) {
      console.log(`\n📱 Testing ${url}...`);
      
      try {
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout: 10000 
        });
        
        const status = response ? response.status() : 'No response';
        const finalUrl = page.url();
        const title = await page.title();
        const hasH1 = await page.locator('h1').count() > 0;
        const h1Text = hasH1 ? await page.locator('h1').first().textContent() : 'No H1';
        const has404 = await page.locator('text=/404|not found/i').count() > 0;
        
        console.log(`  - Status: ${status}`);
        console.log(`  - Final URL: ${finalUrl}`);
        console.log(`  - Title: ${title}`);
        console.log(`  - H1: ${h1Text}`);
        console.log(`  - Is 404: ${has404 ? 'Yes' : 'No'}`);
        
        if (status === 200 && !has404 && hasH1) {
          console.log(`  ✅ This URL pattern works!`);
          
          // Take screenshot of working page
          await page.screenshot({ 
            path: 'screenshots/tarot-detail-working.png', 
            fullPage: true 
          });
        }
      } catch (e) {
        console.log(`  ❌ Error: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testDirectTarot();