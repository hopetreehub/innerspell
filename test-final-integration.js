const { chromium } = require('playwright');

async function testIntegration() {
  console.log('🚀 통합 기능 테스트 시작...');
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // 커뮤니티 페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/community', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    // 전체 페이지 스크린샷
    await page.screenshot({ path: 'screenshots/final-05-integration.png', fullPage: true });
    console.log('✅ 통합 테스트 스크린샷 저장 완료');
    
    // sitemap.xml 확인
    await page.goto('https://test-studio-firebase.vercel.app/sitemap.xml', {
      waitUntil: 'domcontentloaded'
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/final-06-sitemap.png', fullPage: false });
    console.log('✅ Sitemap.xml 스크린샷 저장 완료');
    
    // robots.txt 확인  
    await page.goto('https://test-studio-firebase.vercel.app/robots.txt', {
      waitUntil: 'domcontentloaded'
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/final-07-robots.png', fullPage: false });
    console.log('✅ Robots.txt 스크린샷 저장 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testIntegration().catch(console.error);