const { chromium } = require('playwright');

async function validateWebsite() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = [];
  const screenshots = [];

  // 1. 메인 페이지 테스트
  console.log('1. Testing Main Page (http://localhost:4000)...');
  try {
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // 주요 UI 요소 확인
    const mainPageElements = {
      title: await page.title(),
      hasHero: await page.locator('.hero-section, [class*="hero"]').count() > 0,
      hasNavigation: await page.locator('nav, header').count() > 0,
      hasFooter: await page.locator('footer').count() > 0,
      mainHeading: await page.locator('h1').first().textContent().catch(() => 'No H1 found'),
      bodyText: await page.locator('body').textContent()
    };
    
    await page.screenshot({ path: 'validation-screenshots/01-main-page.png', fullPage: true });
    screenshots.push('01-main-page.png');
    
    results.push({
      page: 'Main Page',
      url: 'http://localhost:4000',
      status: 'Success',
      elements: mainPageElements
    });
  } catch (error) {
    results.push({
      page: 'Main Page',
      url: 'http://localhost:4000',
      status: 'Failed',
      error: error.message
    });
  }

  // 2. 타로 카드 페이지 테스트
  console.log('2. Testing Tarot Cards Page (http://localhost:4000/tarot)...');
  try {
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const tarotPageElements = {
      title: await page.title(),
      currentUrl: page.url(),
      hasCards: await page.locator('[class*="card"], .tarot-card').count(),
      cardImages: await page.locator('img[src*="tarot"], img[alt*="tarot"]').count(),
      headingText: await page.locator('h1, h2').first().textContent().catch(() => 'No heading found')
    };
    
    await page.screenshot({ path: 'validation-screenshots/02-tarot-page.png', fullPage: true });
    screenshots.push('02-tarot-page.png');
    
    results.push({
      page: 'Tarot Cards Page',
      url: 'http://localhost:4000/tarot',
      status: 'Success',
      elements: tarotPageElements
    });
  } catch (error) {
    results.push({
      page: 'Tarot Cards Page',
      url: 'http://localhost:4000/tarot',
      status: 'Failed',
      error: error.message
    });
  }

  // 3. 타로 가이드라인 페이지 테스트 (리다이렉트 확인)
  console.log('3. Testing Tarot Guidelines Page (http://localhost:4000/tarot-guidelines)...');
  try {
    await page.goto('http://localhost:4000/tarot-guidelines', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const guidelinesPageInfo = {
      currentUrl: page.url(),
      isRedirected: !page.url().includes('/tarot-guidelines'),
      redirectedTo: page.url().includes('/login') ? 'Login Page' : 'Other Page',
      pageTitle: await page.title(),
      hasLoginForm: await page.locator('input[type="password"], form[action*="login"]').count() > 0
    };
    
    await page.screenshot({ path: 'validation-screenshots/03-tarot-guidelines.png', fullPage: true });
    screenshots.push('03-tarot-guidelines.png');
    
    results.push({
      page: 'Tarot Guidelines Page',
      url: 'http://localhost:4000/tarot-guidelines',
      status: 'Success',
      redirectInfo: guidelinesPageInfo
    });
  } catch (error) {
    results.push({
      page: 'Tarot Guidelines Page',
      url: 'http://localhost:4000/tarot-guidelines',
      status: 'Failed',
      error: error.message
    });
  }

  // 4. 관리자 페이지 테스트 (리다이렉트 확인)
  console.log('4. Testing Admin Page (http://localhost:4000/admin)...');
  try {
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const adminPageInfo = {
      currentUrl: page.url(),
      isRedirected: !page.url().includes('/admin'),
      redirectedTo: page.url().includes('/login') ? 'Login Page' : 'Other Page',
      pageTitle: await page.title(),
      hasLoginForm: await page.locator('input[type="password"], form[action*="login"]').count() > 0
    };
    
    await page.screenshot({ path: 'validation-screenshots/04-admin-page.png', fullPage: true });
    screenshots.push('04-admin-page.png');
    
    results.push({
      page: 'Admin Page',
      url: 'http://localhost:4000/admin',
      status: 'Success',
      redirectInfo: adminPageInfo
    });
  } catch (error) {
    results.push({
      page: 'Admin Page',
      url: 'http://localhost:4000/admin',
      status: 'Failed',
      error: error.message
    });
  }

  // 5. 타로 읽기 페이지 테스트
  console.log('5. Testing Reading Page (http://localhost:4000/reading)...');
  try {
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const readingPageElements = {
      title: await page.title(),
      currentUrl: page.url(),
      hasReadingInterface: await page.locator('[class*="reading"], [class*="spread"]').count() > 0,
      hasCards: await page.locator('[class*="card"]').count(),
      hasButtons: await page.locator('button').count(),
      headingText: await page.locator('h1, h2').first().textContent().catch(() => 'No heading found')
    };
    
    await page.screenshot({ path: 'validation-screenshots/05-reading-page.png', fullPage: true });
    screenshots.push('05-reading-page.png');
    
    results.push({
      page: 'Reading Page',
      url: 'http://localhost:4000/reading',
      status: 'Success',
      elements: readingPageElements
    });
  } catch (error) {
    results.push({
      page: 'Reading Page',
      url: 'http://localhost:4000/reading',
      status: 'Failed',
      error: error.message
    });
  }

  // 결과 출력
  console.log('\n=== VALIDATION RESULTS ===\n');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.page}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Status: ${result.status}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else if (result.elements) {
      console.log(`   Elements:`, JSON.stringify(result.elements, null, 2));
    } else if (result.redirectInfo) {
      console.log(`   Redirect Info:`, JSON.stringify(result.redirectInfo, null, 2));
    }
    console.log('');
  });

  console.log(`\nScreenshots saved in: validation-screenshots/`);
  console.log(`Total screenshots: ${screenshots.length}`);

  await browser.close();
}

// 스크린샷 디렉토리 생성
const fs = require('fs');
if (!fs.existsSync('validation-screenshots')) {
  fs.mkdirSync('validation-screenshots');
}

validateWebsite().catch(console.error);