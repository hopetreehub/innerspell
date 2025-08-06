const { chromium } = require('playwright');

async function finalQAValidation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    // 브라우저 캐시 완전히 비우기
    storageState: undefined,
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('=== 최종 QA 검증 ===\n');
  console.log('테스트 시작 시간:', new Date().toLocaleString('ko-KR'));
  console.log('----------------------------------------\n');
  
  // 1. 메인 페이지 검증
  console.log('1. 메인 페이지 헤더 검증');
  try {
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);
    
    // 네비게이션 메뉴 텍스트 수집
    const navLinks = await page.locator('nav a').allTextContents();
    console.log(`✅ 발견된 네비게이션 링크: ${navLinks.length}개`);
    navLinks.forEach((link, index) => {
      console.log(`   ${index + 1}. ${link}`);
    });
    
    // 타로지침 메뉴 검사
    const hasTarotGuidelines = navLinks.some(link => 
      link.includes('타로지침') || link.includes('타로 지침')
    );
    
    console.log('\n검증 결과:');
    if (hasTarotGuidelines) {
      console.log('❌ 실패: "타로지침" 메뉴가 여전히 존재합니다.');
    } else {
      console.log('✅ 성공: "타로지침" 메뉴가 제거되었습니다.');
    }
    
    await page.screenshot({ 
      path: 'qa-final-main-page.png',
      fullPage: false 
    });
    console.log('📸 스크린샷: qa-final-main-page.png\n');
    
  } catch (error) {
    console.error('❌ 메인 페이지 테스트 실패:', error.message);
  }
  
  // 2. 관리자 페이지 접근 검증
  console.log('2. 관리자 대시보드 접근 검증');
  try {
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`✅ 현재 URL: ${currentUrl}`);
    
    const isRedirectedToLogin = currentUrl.includes('/sign-in') || 
                                currentUrl.includes('/login');
    
    console.log('\n검증 결과:');
    if (isRedirectedToLogin) {
      console.log('✅ 성공: 로그인 페이지로 리다이렉트되었습니다.');
    } else {
      console.log('❌ 실패: 관리자 페이지가 인증 없이 접근 가능합니다.');
    }
    
    await page.screenshot({ 
      path: 'qa-final-admin-access.png',
      fullPage: false 
    });
    console.log('📸 스크린샷: qa-final-admin-access.png\n');
    
  } catch (error) {
    console.error('❌ 관리자 페이지 테스트 실패:', error.message);
  }
  
  // 3. 타로지침 페이지 직접 접근 검증
  console.log('3. 타로지침 페이지 직접 접근 검증');
  try {
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`✅ 현재 URL: ${currentUrl}`);
    
    const isRedirectedToLogin = currentUrl.includes('/sign-in') || 
                                currentUrl.includes('/login');
    
    console.log('\n검증 결과:');
    if (isRedirectedToLogin) {
      console.log('✅ 성공: 로그인 페이지로 리다이렉트되었습니다.');
    } else {
      console.log('❌ 실패: 타로지침 페이지가 인증 없이 접근 가능합니다.');
      
      // 페이지 내용 확인
      const pageTitle = await page.title();
      console.log(`   페이지 타이틀: ${pageTitle}`);
    }
    
    await page.screenshot({ 
      path: 'qa-final-tarot-guidelines.png',
      fullPage: false 
    });
    console.log('📸 스크린샷: qa-final-tarot-guidelines.png\n');
    
  } catch (error) {
    console.error('❌ 타로지침 페이지 테스트 실패:', error.message);
  }
  
  console.log('----------------------------------------');
  console.log('테스트 완료 시간:', new Date().toLocaleString('ko-KR'));
  console.log('=== 최종 QA 검증 완료 ===');
  
  await browser.close();
}

// 서버가 준비될 때까지 잠시 대기 후 실행
setTimeout(() => {
  finalQAValidation().catch(console.error);
}, 5000);