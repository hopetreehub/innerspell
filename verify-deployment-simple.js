const { chromium } = require('playwright');

async function verifyDeployment() {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🔍 Verifying Vercel deployment...\n');
  
  try {
    // Set longer timeout for navigation
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    
    // 1. Homepage
    console.log('1️⃣ Loading homepage...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    console.log('   Waiting for content...');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'deploy-1-homepage.png', fullPage: true });
    console.log('✅ Homepage loaded');
    
    // 2. Check for main navigation
    const navLinks = await page.locator('nav a, header a').all();
    console.log(`\n   Found ${navLinks.length} navigation links`);
    
    // 3. Try to navigate to tarot reading
    console.log('\n2️⃣ Checking tarot reading page...');
    const readingLink = await page.locator('a:has-text("타로 리딩"), a:has-text("Tarot Reading")').first();
    if (await readingLink.isVisible()) {
      await readingLink.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'deploy-2-reading.png', fullPage: true });
      console.log('✅ Reading page accessed');
    } else {
      // Try direct navigation
      await page.goto('https://test-studio-firebase.vercel.app/tarot-reading', { 
        waitUntil: 'domcontentloaded' 
      });
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'deploy-2-reading-direct.png', fullPage: true });
      console.log('✅ Reading page accessed via direct URL');
    }
    
    // 4. Check for cards
    const cards = await page.locator('img[alt*="tarot"], img[alt*="카드"], img[src*="tarot"]').all();
    console.log(`\n   Found ${cards.length} card images`);
    
    // 5. Encyclopedia check
    console.log('\n3️⃣ Checking encyclopedia...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot-encyclopedia', { 
      waitUntil: 'domcontentloaded' 
    });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'deploy-3-encyclopedia.png', fullPage: true });
    console.log('✅ Encyclopedia page accessed');
    
    console.log('\n✨ Deployment verification completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'deploy-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

verifyDeployment();