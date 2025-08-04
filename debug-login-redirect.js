const { chromium } = require('playwright');

async function debugLoginRedirect() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  const logs = [];
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'log') {
      logs.push(msg.text());
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  console.log('🔍 Debugging Login Redirect...\n');
  
  try {
    console.log('Step 1: Going to /login...');
    await page.goto('http://localhost:4000/login', { waitUntil: 'domcontentloaded' });
    
    console.log('Step 2: Waiting for useEffect to trigger...');
    await page.waitForTimeout(1000);
    
    console.log('Step 3: Checking for router.replace call...');
    const currentUrl = page.url();
    console.log(`Current URL after 1s: ${currentUrl}`);
    
    // Wait a bit more for the redirect
    await page.waitForTimeout(2000);
    const urlAfter3s = page.url();
    console.log(`Current URL after 3s: ${urlAfter3s}`);
    
    // Check if the page content indicates a redirect is happening
    const pageContent = await page.textContent('body');
    console.log('Page content includes redirect text:', pageContent.includes('로그인 페이지로 이동 중'));
    
    // Try to manually trigger navigation
    console.log('Step 4: Manually checking navigation...');
    await page.evaluate(() => {
      console.log('Router object:', typeof window.next?.router);
      console.log('Current pathname:', window.location.pathname);
    });
    
    // Wait longer and check again
    await page.waitForTimeout(5000);
    const finalUrl = page.url();
    console.log(`Final URL after 8s total: ${finalUrl}`);
    
    console.log('\n📋 Console Logs:');
    logs.forEach((log, i) => console.log(`${i + 1}. ${log}`));
    
    if (errors.length > 0) {
      console.log('\n❌ Errors Found:');
      errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    } else {
      console.log('\n✅ No JavaScript errors found');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
  
  await browser.close();
}

debugLoginRedirect().catch(console.error);