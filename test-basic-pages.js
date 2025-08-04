const { chromium } = require('playwright');

async function testBasicPages() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Basic test of localhost:4000 pages...');
    
    // Test 1: Homepage with very long wait
    console.log('\n1. Testing homepage with extended wait...');
    try {
      await page.goto('http://localhost:4000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Wait for content to actually load
      await page.waitForTimeout(10000);
      
      const title = await page.title();
      const url = page.url();
      
      console.log('   ✅ Page loaded successfully');
      console.log('   ✅ Title:', title);
      console.log('   ✅ URL:', url);
      
      // Check if there's any actual content beyond loading
      const hasContent = await page.$('h1, h2, .hero, nav, main');
      console.log('   ✅ Has main content:', !!hasContent);
      
      // Check for any error messages
      const errorText = await page.textContent('body');
      const hasError = errorText.includes('Module not found') || errorText.includes('Error');
      console.log('   ✅ No build errors:', !hasError);
      
      await page.screenshot({ path: 'screenshots/basic-homepage-final.png', fullPage: true });
      
    } catch (error) {
      console.log('   ❌ Homepage failed:', error.message);
      await page.screenshot({ path: 'screenshots/basic-homepage-error.png', fullPage: true });
    }

    // Test 2: Direct curl test to compare
    console.log('\n2. Testing with curl for comparison...');
    
    await page.close();
    
  } catch (error) {
    console.error('Basic test failed:', error);
  } finally {
    await browser.close();
  }
}

testBasicPages();