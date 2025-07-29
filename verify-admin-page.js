const { chromium } = require('playwright');

async function verifyAdminPage() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('=== 관리자 페이지 검증 시작 ===\n');

  // 1. 로컬 환경 확인
  console.log('1. 로컬 환경 확인 (http://localhost:4000/admin)');
  try {
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'screenshots/admin-local-' + Date.now() + '.png',
      fullPage: true 
    });
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`- 페이지 제목: ${title}`);
    
    // URL 확인 (리디렉션 체크)
    const currentUrl = page.url();
    console.log(`- 현재 URL: ${currentUrl}`);
    
    // 주요 요소 확인
    const hasLoginForm = await page.locator('form').count() > 0;
    const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    const hasSubmitButton = await page.locator('button[type="submit"]').count() > 0;
    
    if (hasLoginForm || (hasEmailInput && hasPasswordInput)) {
      console.log('- 로그인 페이지 확인됨');
      console.log(`  - 이메일 입력: ${hasEmailInput ? '있음' : '없음'}`);
      console.log(`  - 비밀번호 입력: ${hasPasswordInput ? '있음' : '없음'}`);
      console.log(`  - 제출 버튼: ${hasSubmitButton ? '있음' : '없음'}`);
    }
    
    // 대시보드 요소 확인
    const hasDashboard = await page.locator('text=/대시보드|Dashboard/i').count() > 0;
    if (hasDashboard) {
      console.log('- 대시보드 페이지 확인됨');
    }
    
    console.log('- 로컬 환경 접속 성공\n');
  } catch (error) {
    console.log(`- 로컬 환경 접속 실패: ${error.message}\n`);
  }

  // 2. Vercel 환경 확인
  console.log('2. Vercel 환경 확인 (https://test-studio-firebase.vercel.app/admin)');
  try {
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'screenshots/admin-vercel-' + Date.now() + '.png',
      fullPage: true 
    });
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`- 페이지 제목: ${title}`);
    
    // URL 확인 (리디렉션 체크)
    const currentUrl = page.url();
    console.log(`- 현재 URL: ${currentUrl}`);
    
    // 주요 요소 확인
    const hasLoginForm = await page.locator('form').count() > 0;
    const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    const hasSubmitButton = await page.locator('button[type="submit"]').count() > 0;
    
    if (hasLoginForm || (hasEmailInput && hasPasswordInput)) {
      console.log('- 로그인 페이지 확인됨');
      console.log(`  - 이메일 입력: ${hasEmailInput ? '있음' : '없음'}`);
      console.log(`  - 비밀번호 입력: ${hasPasswordInput ? '있음' : '없음'}`);
      console.log(`  - 제출 버튼: ${hasSubmitButton ? '있음' : '없음'}`);
    }
    
    // 대시보드 요소 확인
    const hasDashboard = await page.locator('text=/대시보드|Dashboard/i').count() > 0;
    if (hasDashboard) {
      console.log('- 대시보드 페이지 확인됨');
    }
    
    // 에러 메시지 확인
    const errorMessage = await page.locator('text=/error|오류/i').count() > 0;
    if (errorMessage) {
      console.log('- 에러 메시지 감지됨');
    }
    
    console.log('- Vercel 환경 접속 성공\n');
  } catch (error) {
    console.log(`- Vercel 환경 접속 실패: ${error.message}\n`);
  }

  // 브라우저 열어둔 채로 대기 (사용자가 확인할 수 있도록)
  console.log('브라우저 창은 30초 후에 자동으로 닫힙니다...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('\n=== 검증 완료 ===');
}

verifyAdminPage().catch(console.error);