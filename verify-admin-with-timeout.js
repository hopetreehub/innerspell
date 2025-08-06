const { chromium } = require('playwright');

async function verifyAdminPage() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const timestamp = Date.now();
  
  try {
    console.log('어드민 페이지 재시도 중...\n');
    
    // 타임아웃을 더 길게 설정하고 다양한 대기 옵션 시도
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded', // networkidle 대신 domcontentloaded 사용
      timeout: 60000 
    });
    
    // 추가 대기
    await page.waitForTimeout(5000);
    
    // 현재 URL 확인 (리다이렉트 여부)
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);
    
    // 페이지 내용 캡처
    const pageContent = await page.content();
    const hasLoginForm = pageContent.includes('로그인') || pageContent.includes('login');
    const hasAdminContent = pageContent.includes('Admin') || pageContent.includes('관리자');
    
    await page.screenshot({ 
      path: `screenshots/admin-retry-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log(`✅ 어드민 페이지 접속 성공`);
    console.log(`   - 로그인 폼 발견: ${hasLoginForm ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   - 관리자 콘텐츠 발견: ${hasAdminContent ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   - 스크린샷 저장: screenshots/admin-retry-${timestamp}.png`);
    
    // 로그인 시도가 필요한 경우
    if (hasLoginForm) {
      console.log('\n로그인이 필요한 상태입니다.');
    }
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    
    // 에러 발생 시에도 현재 상태 스크린샷 시도
    try {
      await page.screenshot({ 
        path: `screenshots/admin-error-${timestamp}.png`,
        fullPage: true 
      });
      console.log(`   - 에러 스크린샷 저장: screenshots/admin-error-${timestamp}.png`);
    } catch (screenshotError) {
      console.log('   - 스크린샷 저장도 실패');
    }
  } finally {
    await browser.close();
  }
}

verifyAdminPage().catch(console.error);