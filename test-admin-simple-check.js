const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function checkAdminNotificationSettings() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  // screenshots 디렉토리가 없으면 생성
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    console.log('🚀 Vercel 사이트 접속 중...');
    // 타임아웃을 더 길게 설정하고 domcontentloaded로 변경
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    console.log('⏳ 페이지 로드 완료, 스크린샷 촬영 중...');
    await page.waitForTimeout(2000);

    // 현재 페이지 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'current-page-state.png'), 
      fullPage: true 
    });
    console.log('📸 현재 페이지 상태 스크린샷 저장됨');

    // 페이지 내용 확인
    const pageText = await page.textContent('body');
    console.log('📄 페이지 내용 일부:', pageText.substring(0, 500));

    // 현재 URL 확인
    console.log('🔗 현재 URL:', page.url());

    // admin 페이지로 직접 이동 시도
    console.log('📊 관리자 페이지로 직접 이동 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);

    // 관리자 페이지 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'admin-page-direct.png'), 
      fullPage: true 
    });
    console.log('📸 관리자 페이지 스크린샷 저장됨');

    // 현재 페이지의 모든 텍스트 확인
    const adminPageText = await page.textContent('body');
    console.log('📄 관리자 페이지 내용:', adminPageText);

    // 모든 링크와 버튼 확인
    const allElements = await page.locator('a, button, [role="tab"], [role="button"]').allTextContents();
    console.log('🔍 발견된 요소들:', allElements);

    console.log('✅ 페이지 접속 및 확인 완료');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    
    // 오류 시에도 스크린샷 저장
    try {
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'error-state-simple.png'), 
        fullPage: true 
      });
      console.log('📸 오류 상태 스크린샷 저장됨');
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError);
    }
  } finally {
    await browser.close();
    console.log('🔚 브라우저 종료됨');
  }
}

checkAdminNotificationSettings();