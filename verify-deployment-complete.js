const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function verifyDeployment() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'ko-KR'
  });
  const page = await context.newPage();
  
  const results = [];
  const screenshotDir = 'deployment-verification-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('🔍 Starting Vercel deployment verification...');
  
  try {
    // 1. Homepage Test
    console.log('\n📍 Testing Homepage...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    // Check main elements
    const mainTitle = await page.textContent('h1');
    const hasHeroSection = await page.locator('.hero-section').count() > 0;
    const hasNavbar = await page.locator('nav').count() > 0;
    const hasThemeToggle = await page.locator('button:has-text("테마 변경")').count() > 0;
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '1-homepage.png'),
      fullPage: true 
    });
    
    results.push({
      test: 'Homepage',
      url: 'https://test-studio-firebase.vercel.app/',
      status: 'success',
      checks: {
        title: mainTitle,
        heroSection: hasHeroSection,
        navbar: hasNavbar,
        themeToggle: hasThemeToggle
      }
    });

    // 2. Tarot Reading Page
    console.log('\n📍 Testing Tarot Reading Page...');
    await page.click('a:has-text("타로리딩")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const hasQuestionInput = await page.locator('textarea[placeholder*="질문"]').count() > 0;
    const hasStartButton = await page.locator('button:has-text("타로 읽기 시작")').count() > 0;
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '2-tarot-reading.png'),
      fullPage: true 
    });
    
    results.push({
      test: 'Tarot Reading Page',
      url: page.url(),
      status: 'success',
      checks: {
        questionInput: hasQuestionInput,
        startButton: hasStartButton
      }
    });

    // 3. Tarot Cards Encyclopedia
    console.log('\n📍 Testing Tarot Cards Encyclopedia...');
    await page.click('a:has-text("타로카드")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const hasCardGrid = await page.locator('.tarot-card-grid, .card-grid').count() > 0;
    const cardCount = await page.locator('img[alt*="타로"], img[alt*="Tarot"]').count();
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '3-tarot-encyclopedia.png'),
      fullPage: true 
    });
    
    results.push({
      test: 'Tarot Encyclopedia',
      url: page.url(),
      status: 'success',
      checks: {
        cardGrid: hasCardGrid,
        cardCount: cardCount
      }
    });

    // 4. Dream Interpretation
    console.log('\n📍 Testing Dream Interpretation...');
    await page.click('a:has-text("꿈해몽")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '4-dream-interpretation.png'),
      fullPage: true 
    });
    
    results.push({
      test: 'Dream Interpretation',
      url: page.url(),
      status: 'success'
    });

    // 5. Blog
    console.log('\n📍 Testing Blog...');
    await page.click('a:has-text("블로그")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '5-blog.png'),
      fullPage: true 
    });
    
    results.push({
      test: 'Blog',
      url: page.url(),
      status: 'success'
    });

    // 6. Community
    console.log('\n📍 Testing Community...');
    await page.click('a:has-text("커뮤니티")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '6-community.png'),
      fullPage: true 
    });
    
    results.push({
      test: 'Community',
      url: page.url(),
      status: 'success'
    });

    // 7. Test actual Tarot reading flow
    console.log('\n📍 Testing Tarot Reading Flow...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot/reading');
    await page.waitForLoadState('networkidle');
    
    // Enter a question
    const questionTextarea = page.locator('textarea[placeholder*="질문"]');
    await questionTextarea.fill('오늘의 운세는 어떤가요?');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '7-question-entered.png')
    });
    
    // Start reading
    await page.click('button:has-text("타로 읽기 시작")');
    await page.waitForTimeout(3000);
    
    // Check if we're on spread selection
    const hasSpreadOptions = await page.locator('button:has-text("원카드"), button:has-text("쓰리카드")').count() > 0;
    
    if (hasSpreadOptions) {
      await page.screenshot({ 
        path: path.join(screenshotDir, '8-spread-selection.png')
      });
      
      // Select one card spread
      await page.click('button:has-text("원카드")');
      await page.waitForTimeout(3000);
      
      // Check for card display
      const hasCards = await page.locator('.tarot-card, img[alt*="타로"]').count() > 0;
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '9-card-display.png'),
        fullPage: true
      });
      
      results.push({
        test: 'Tarot Reading Flow',
        status: 'success',
        checks: {
          questionInput: true,
          spreadSelection: hasSpreadOptions,
          cardDisplay: hasCards
        }
      });
    }

    // 8. Check Theme Toggle
    console.log('\n📍 Testing Theme Toggle...');
    await page.goto('https://test-studio-firebase.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.body.className);
    
    // Toggle theme
    await page.click('button:has-text("테마 변경")');
    await page.waitForTimeout(1000);
    
    const changedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.body.className);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '10-theme-changed.png')
    });
    
    results.push({
      test: 'Theme Toggle',
      status: 'success',
      checks: {
        themeChanged: initialTheme !== changedTheme,
        initialTheme,
        changedTheme
      }
    });

  } catch (error) {
    console.error('❌ Error during verification:', error);
    results.push({
      test: 'Error',
      error: error.message,
      status: 'failed'
    });
  }

  await browser.close();

  // Save results
  fs.writeFileSync(
    'deployment-verification-results.json',
    JSON.stringify(results, null, 2)
  );

  // Print summary
  console.log('\n📊 Verification Summary:');
  console.log('=' .repeat(50));
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
    if (result.checks) {
      Object.entries(result.checks).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value}`);
      });
    }
    if (result.error) {
      console.log(`   - Error: ${result.error}`);
    }
  });
  console.log('=' .repeat(50));
  console.log(`\n📸 Screenshots saved to: ${screenshotDir}/`);
  console.log('📄 Results saved to: deployment-verification-results.json');
}

verifyDeployment().catch(console.error);