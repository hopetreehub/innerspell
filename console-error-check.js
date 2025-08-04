const { chromium } = require('playwright');

async function checkConsoleErrors() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleMessages = [];
  const errors = [];
  
  // Capture all console messages
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack
    });
  });

  // Capture network failures
  page.on('response', response => {
    if (!response.ok()) {
      consoleMessages.push({
        type: 'network',
        text: `Failed to load: ${response.url()} - Status: ${response.status()}`,
        location: { url: response.url() }
      });
    }
  });

  console.log('🔍 Checking Console Errors on Homepage...\n');
  
  try {
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(5000);
    
    console.log('📋 Console Messages:');
    consoleMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
      if (msg.location && msg.location.url) {
        console.log(`   Location: ${msg.location.url}`);
      }
    });
    
    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.split('\n')[0]}`);
        }
      });
    } else {
      console.log('\n✅ No JavaScript errors found');
    }

    // Check login redirect
    console.log('\n🔄 Testing Login Redirect...');
    await page.goto('http://localhost:4000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`Current URL after /login: ${currentUrl}`);
    
    // Check if middleware exists
    console.log('\n📁 Checking middleware file...');
    
  } catch (error) {
    console.error('❌ Error during console check:', error.message);
  }

  await browser.close();
}

checkConsoleErrors().catch(console.error);