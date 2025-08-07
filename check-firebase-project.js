const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Firebase 프로젝트 일반 콘솔 접속 시작...');
    
    // Firebase Project Console URL로 이동
    await page.goto('https://console.firebase.google.com/project/innerspell-an7ce', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // 페이지 로드 대기
    await page.waitForTimeout(5000);

    // 현재 URL 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);

    // 프로젝트 일반 페이지 스크린샷
    await page.screenshot({ 
      path: 'firebase-project-general.png',
      fullPage: true 
    });
    console.log('프로젝트 일반 페이지 스크린샷 저장: firebase-project-general.png');

    console.log('\n분석 완료. Firebase Console 접속을 위해서는 Google 계정 로그인이 필요합니다.');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ 
      path: 'firebase-project-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();