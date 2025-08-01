const { chromium } = require('playwright');
const fs = require('fs');

async function quickTest() {
  console.log('🚀 Starting quick Vercel deployment test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // Test 1: Homepage
    console.log('\n1️⃣ Testing Homepage...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for main content
    await page.waitForSelector('h1', { timeout: 10000 });
    const title = await page.textContent('h1');
    console.log(`   ✓ Title: ${title}`);
    
    await page.screenshot({ path: 'vercel-test-1-homepage.png' });
    
    // Test 2: Navigation links
    console.log('\n2️⃣ Checking Navigation...');
    const navLinks = await page.locator('nav a').allTextContents();
    console.log(`   ✓ Nav links: ${navLinks.join(', ')}`);
    
    // Test 3: Tarot Reading
    console.log('\n3️⃣ Testing Tarot Reading Page...');
    await page.click('a:has-text("타로리딩")');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`   ✓ Current URL: ${currentUrl}`);
    
    await page.screenshot({ path: 'vercel-test-2-tarot.png' });
    
    // Test 4: Check for question input
    const hasInput = await page.locator('textarea').count() > 0;
    console.log(`   ✓ Has question input: ${hasInput}`);
    
    // Test 5: Card Encyclopedia
    console.log('\n4️⃣ Testing Card Encyclopedia...');
    await page.click('a:has-text("타로카드")');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'vercel-test-3-encyclopedia.png' });
    
    // Count visible cards
    const cardImages = await page.locator('img[alt*="타로"], img[alt*="Tarot"], img[src*="tarot"]').count();
    console.log(`   ✓ Card images found: ${cardImages}`);
    
    console.log('\n✅ Vercel deployment is working!');
    console.log('📸 Screenshots saved:');
    console.log('   - vercel-test-1-homepage.png');
    console.log('   - vercel-test-2-tarot.png');
    console.log('   - vercel-test-3-encyclopedia.png');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'vercel-test-error.png' });
  } finally {
    await browser.close();
  }
}

quickTest().catch(console.error);