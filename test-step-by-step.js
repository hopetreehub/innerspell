const { chromium } = require('playwright');
const path = require('path');

async function testStepByStep() {
  console.log('🔍 Step by Step Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. Start from homepage
    console.log('1️⃣ Going to homepage...');
    await page.goto('http://localhost:4000/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'step-1-homepage.png'),
      fullPage: true 
    });
    console.log('✅ Homepage loaded');
    
    // 2. Click on admin menu if exists
    console.log('2️⃣ Looking for admin link...');
    const adminLink = await page.locator('a[href*="/admin"], button:has-text("관리자")').first();
    const hasAdminLink = await adminLink.isVisible().catch(() => false);
    
    if (hasAdminLink) {
      console.log('   Found admin link, clicking...');
      await adminLink.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'test-screenshots', 'step-2-after-admin-click.png'),
        fullPage: true 
      });
      console.log(`   Current URL: ${page.url()}`);
    } else {
      console.log('   No admin link found');
    }
    
    // 3. Try navigating directly to /tarot-guidelines
    console.log('3️⃣ Navigating to /tarot-guidelines...');
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    const tarotUrl = page.url();
    console.log(`   Current URL: ${tarotUrl}`);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'step-3-tarot-guidelines.png'),
      fullPage: true 
    });
    
    // Check what's on the page
    const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'No h1');
    const hasLock = await page.locator('svg').count() > 0;
    const buttonCount = await page.locator('button').count();
    
    console.log(`   H1 text: ${h1Text}`);
    console.log(`   Has SVG icons: ${hasLock}`);
    console.log(`   Button count: ${buttonCount}`);
    
    // 4. Check page source for our expected content
    const pageContent = await page.content();
    const hasAdminText = pageContent.includes('관리자 전용');
    const hasTarotText = pageContent.includes('타로 지침');
    
    console.log(`   Has "관리자 전용" in source: ${hasAdminText}`);
    console.log(`   Has "타로 지침" in source: ${hasTarotText}`);
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'step-error.png'),
      fullPage: true 
    });
    
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testStepByStep().catch(console.error);