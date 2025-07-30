const { chromium } = require('playwright');

(async () => {
  console.log('Starting Chromium verification...');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Quick check of Vercel deployment
    console.log('\n1. Checking Vercel deployment...');
    try {
      await page.goto('https://test-studio-firebase.vercel.app', { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'verification-screenshots/vercel-check.png', fullPage: true });
      console.log('✓ Vercel site accessible');
      
      // Check for main content
      const hasContent = await page.locator('body').textContent();
      console.log('✓ Page has content:', hasContent ? 'Yes' : 'No');
      
    } catch (error) {
      console.log('✗ Vercel deployment error:', error.message);
      await page.screenshot({ path: 'verification-screenshots/vercel-error.png', fullPage: true });
    }
    
    // 2. Check local port 4000
    console.log('\n2. Checking local development on port 4000...');
    try {
      await page.goto('http://localhost:4000', { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 
      });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'verification-screenshots/local-4000.png', fullPage: true });
      console.log('✓ Local server on port 4000 is running');
    } catch (error) {
      console.log('✗ Local server not running on port 4000');
      console.log('  Starting local server...');
      
      // Try to start the server
      const { spawn } = require('child_process');
      const server = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'inherit'
      });
      
      console.log('  Waiting for server to start...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Try again
      try {
        await page.goto('http://localhost:4000', { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'verification-screenshots/local-4000-started.png', fullPage: true });
        console.log('✓ Local server started successfully on port 4000');
      } catch (e) {
        console.log('✗ Failed to start local server');
      }
    }
    
    console.log('\n✅ Verification completed!');
    console.log('Check screenshots in verification-screenshots/ folder');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
  
  console.log('\nKeeping browser open for inspection. Press Ctrl+C to exit.');
  await new Promise(() => {});
})();