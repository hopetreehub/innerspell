const { chromium } = require('playwright');

(async () => {
  console.log('현재 상태 확인...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. 로그인 페이지 확인
    console.log('\n📍 로그인 페이지 확인...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'current-01-signin.png' });
    
    // 개발 도우미 확인
    const devHelper = await page.locator('text=개발 환경 도우미').isVisible().catch(() => false);
    console.log('개발 도우미 표시:', devHelper ? '✅ 있음' : '❌ 없음');
    
    // 콘솔 에러 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('콘솔 에러:', msg.text());
      }
    });
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
  } finally {
    await page.waitForTimeout(30000); // 30초 대기
    await browser.close();
  }
})();