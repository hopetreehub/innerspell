const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function visualCheck() {
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('🔍 Starting visual check of InnerSpell project...');

  const pages = [
    { url: 'http://localhost:4000', name: 'homepage', title: '홈페이지' },
    { url: 'http://localhost:4000/tarot', name: 'tarot', title: '타로 페이지' },
    { url: 'http://localhost:4000/dream', name: 'dream', title: '꿈 해몽 페이지' },
    { url: 'http://localhost:4000/admin', name: 'admin', title: '관리자 페이지' }
  ];

  for (const pageInfo of pages) {
    console.log(`📸 Checking ${pageInfo.title} (${pageInfo.url})`);
    
    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for page to be interactive
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // Take screenshot
      const screenshotPath = path.join(screenshotsDir, `${pageInfo.name}-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Check page title and content
      const title = await page.title();
      const hasContent = await page.locator('body').count() > 0;
      
      console.log(`✅ ${pageInfo.title}:`);
      console.log(`   - URL: ${pageInfo.url}`);
      console.log(`   - Title: ${title}`);
      console.log(`   - Content loaded: ${hasContent}`);
      console.log(`   - Screenshot: ${screenshotPath}`);
      
    } catch (error) {
      console.log(`❌ Error loading ${pageInfo.title}: ${error.message}`);
    }
  }

  console.log('🎉 Visual check completed!');
  await browser.close();
}

visualCheck().catch(console.error);