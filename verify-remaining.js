const { chromium } = require('playwright');

async function verifyRemaining() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture dream page
  console.log('Navigating to dream page...');
  await page.goto('http://localhost:4000/dream', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: `/mnt/e/project/test-studio-firebase/screenshots/dream-${Date.now()}.png`,
    fullPage: true 
  });
  console.log('✓ Dream page screenshot taken');
  
  // Capture tarot detail page
  console.log('Navigating to tarot detail page...');
  await page.goto('http://localhost:4000/tarot/0', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: `/mnt/e/project/test-studio-firebase/screenshots/tarot-detail-0-${Date.now()}.png`,
    fullPage: true 
  });
  console.log('✓ Tarot detail page screenshot taken');
  
  await browser.close();
  console.log('\nAll screenshots captured!');
}

verifyRemaining().catch(console.error);