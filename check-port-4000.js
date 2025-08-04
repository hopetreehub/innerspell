const { chromium } = require('playwright');

async function checkPort4000() {
  console.log('🔍 Checking localhost:4000 with Chromium...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to http://localhost:4000...');
    
    // Try to navigate with a longer timeout
    const response = await page.goto('http://localhost:4000/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    console.log('📊 Response status:', response ? response.status() : 'No response');
    console.log('📍 Current URL:', page.url());
    console.log('📝 Page title:', await page.title());
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);
    
    // Check for loading spinners
    const spinners = await page.locator('.animate-spin').count();
    console.log(`🔄 Loading spinners found: ${spinners}`);
    
    // Check for main content
    const bodyText = await page.textContent('body');
    console.log('📄 Page content preview:', bodyText ? bodyText.substring(0, 200).replace(/\s+/g, ' ').trim() + '...' : 'No content');
    
    // Take screenshots
    await page.screenshot({ 
      path: 'screenshots/port-4000-check.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved to screenshots/port-4000-check.png');
    
    // Check for any error messages
    const errorElements = await page.locator('text=/error|Error|에러/i').count();
    console.log(`❌ Error messages found: ${errorElements}`);
    
    // Check for Firebase initialization
    const firebaseWarnings = await page.locator('text=/Firebase|firebase/i').count();
    console.log(`🔥 Firebase related text found: ${firebaseWarnings}`);
    
    // Wait a bit more to observe the page
    await page.waitForTimeout(5000);
    
    console.log('✅ Check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during check:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'screenshots/port-4000-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot saved');
    
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser will remain open for manual inspection.');
    console.log('📌 Press Ctrl+C to close when done.');
    
    // Wait indefinitely
    await new Promise(() => {});
  }
}

checkPort4000().catch(console.error);