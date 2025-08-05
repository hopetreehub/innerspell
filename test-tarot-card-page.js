const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  console.log('Opening tarot card page...');
  await page.goto('http://localhost:4000/tarot/major-21-world', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Hard refresh with Ctrl+F5
  console.log('Performing hard refresh...');
  await page.keyboard.down('Control');
  await page.keyboard.press('F5');
  await page.keyboard.up('Control');
  
  // Wait for page to load after refresh
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take initial screenshot
  await page.screenshot({ 
    path: 'tarot-card-test-initial.png', 
    fullPage: true 
  });
  console.log('Initial screenshot taken');
  
  // Check for errors
  const errorElement = await page.$('.error-message, .error, [class*="error"]');
  if (errorElement) {
    const errorText = await errorElement.textContent();
    console.log('Error found:', errorText);
    await page.screenshot({ 
      path: 'tarot-card-test-error.png', 
      fullPage: true 
    });
  } else {
    console.log('No errors found on page');
  }
  
  // Check if main card elements are present
  const cardImage = await page.$('img[alt*="The World"], img[alt*="world"], .card-image img');
  const keywordsSection = await page.$('text=/Keywords/i, h2:has-text("Keywords"), .keywords-section');
  const meaningSection = await page.$('text=/Meaning/i, text=/Interpretation/i, .meaning-section');
  const adviceSection = await page.$('text=/Advice/i, .advice-section');
  
  console.log('Page elements check:');
  console.log('- Card image:', !!cardImage);
  console.log('- Keywords section:', !!keywordsSection);
  console.log('- Meaning section:', !!meaningSection);
  console.log('- Advice section:', !!adviceSection);
  
  // Test upright/reversed toggle if present
  const toggleButton = await page.$('button:has-text("Reversed"), button:has-text("Upright"), .toggle-button');
  if (toggleButton) {
    console.log('Testing upright/reversed toggle...');
    await toggleButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'tarot-card-test-toggle.png', 
      fullPage: true 
    });
  }
  
  // Test tabs (Love/Career/Health)
  const tabs = await page.$$('button[role="tab"], .tab-button, button:has-text("Love"), button:has-text("Career"), button:has-text("Health")');
  console.log(`Found ${tabs.length} tabs`);
  
  if (tabs.length > 0) {
    for (let i = 0; i < Math.min(tabs.length, 3); i++) {
      const tabText = await tabs[i].textContent();
      console.log(`Clicking tab: ${tabText}`);
      await tabs[i].click();
      await page.waitForTimeout(500);
    }
  }
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'tarot-card-test-final.png', 
    fullPage: true 
  });
  console.log('Final screenshot taken');
  
  // Keep browser open for 10 seconds to observe
  console.log('Keeping browser open for observation...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('Test completed!');
})().catch(console.error);