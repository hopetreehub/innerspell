const { chromium } = require('playwright');

async function waitForDeployment() {
  console.log('⏳ Waiting 2 minutes for Vercel deployment to complete...');
  await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutes
}

async function testAIInterpretationSimple() {
  console.log('🚀 Testing AI interpretation on Vercel...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Go directly to tarot page
    console.log('1️⃣ Loading tarot page...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    console.log('✅ Page loaded');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'verification-screenshots/ai-deploy-test-01.png', 
      fullPage: true 
    });
    
    // Try to find any input elements
    console.log('2️⃣ Looking for input elements...');
    
    // Try different selectors
    const selectors = [
      'textarea',
      'input[type="text"]',
      '[placeholder*="질문"]',
      '.text-area',
      '#question'
    ];
    
    let inputFound = false;
    for (const selector of selectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✅ Found input with selector: ${selector}`);
          await element.fill('오늘의 운세를 알려주세요');
          inputFound = true;
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    if (!inputFound) {
      console.log('❌ No input field found');
      console.log('Page might be in a different state or loading');
    }
    
    await page.waitForTimeout(2000);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'verification-screenshots/ai-deploy-test-02-final.png', 
      fullPage: true 
    });
    
    console.log('\n📊 Check the screenshots to see the current state');
    console.log('Screenshots saved in verification-screenshots/');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ 
      path: 'verification-screenshots/ai-deploy-test-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 Browser remains open. Press Ctrl+C to exit.');
  await new Promise(() => {});
}

// Main execution
async function main() {
  await waitForDeployment();
  await testAIInterpretationSimple();
}

main().catch(console.error);