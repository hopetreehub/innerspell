const { chromium } = require('playwright');

async function finalCompleteQATest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== 최종 완전 QA 검증 ===');
  console.log('시작 시간:', new Date().toLocaleString('ko-KR'));
  console.log('=========================================\n');
  
  const results = {
    tarotGuidelinesMenuRemoved: false,
    adminPageRedirects: false,
    tarotGuidelinesPageRedirects: false
  };
  
  // 1. 메인 페이지 - 타로지침 메뉴 확인
  console.log('1️⃣ 메인 페이지 헤더 검증');
  try {
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    // 네비게이션 메뉴 확인
    const navLinks = await page.locator('nav a').allTextContents();
    console.log('발견된 네비게이션 메뉴:');
    navLinks.forEach((link, i) => console.log(`  ${i+1}. ${link}`));
    
    const hasTarotGuidelines = navLinks.some(link => 
      link.includes('타로지침') || link.includes('타로 지침')
    );
    
    results.tarotGuidelinesMenuRemoved = !hasTarotGuidelines;
    
    if (results.tarotGuidelinesMenuRemoved) {
      console.log('\n✅ 성공: 타로지침 메뉴가 제거되었습니다.');
    } else {
      console.log('\n❌ 실패: 타로지침 메뉴가 여전히 존재합니다.');
    }
    
    await page.screenshot({ path: 'qa-final-1-main.png' });
    console.log('📸 스크린샷: qa-final-1-main.png\n');
    
  } catch (error) {
    console.error('❌ 메인 페이지 테스트 오류:', error.message);
  }
  
  // 2. 관리자 페이지 접근 테스트
  console.log('2️⃣ 관리자 대시보드 접근 검증');
  try {
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    
    results.adminPageRedirects = currentUrl.includes('sign-in') || 
                                currentUrl.includes('login');
    
    if (results.adminPageRedirects) {
      console.log('✅ 성공: 로그인 페이지로 리다이렉트되었습니다.');
    } else {
      console.log('❌ 실패: 관리자 페이지에 직접 접근 가능합니다.');
      
      // 페이지 내용 확인
      const pageTitle = await page.title();
      const bodyText = await page.locator('body').textContent();
      console.log('페이지 타이틀:', pageTitle);
      console.log('페이지 내용 일부:', bodyText.substring(0, 100) + '...');
    }
    
    await page.screenshot({ path: 'qa-final-2-admin.png' });
    console.log('📸 스크린샷: qa-final-2-admin.png\n');
    
  } catch (error) {
    console.error('❌ 관리자 페이지 테스트 오류:', error.message);
  }
  
  // 3. 타로지침 페이지 직접 접근 테스트
  console.log('3️⃣ 타로지침 페이지 직접 접근 검증');
  try {
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    
    results.tarotGuidelinesPageRedirects = currentUrl.includes('sign-in') || 
                                          currentUrl.includes('login');
    
    if (results.tarotGuidelinesPageRedirects) {
      console.log('✅ 성공: 로그인 페이지로 리다이렉트되었습니다.');
    } else {
      console.log('❌ 실패: 타로지침 페이지에 직접 접근 가능합니다.');
      
      // 페이지 내용 확인
      const pageTitle = await page.title();
      const bodyText = await page.locator('body').textContent();
      console.log('페이지 타이틀:', pageTitle);
      console.log('페이지 내용 일부:', bodyText.substring(0, 100) + '...');
    }
    
    await page.screenshot({ path: 'qa-final-3-tarot-guidelines.png' });
    console.log('📸 스크린샷: qa-final-3-tarot-guidelines.png\n');
    
  } catch (error) {
    console.error('❌ 타로지침 페이지 테스트 오류:', error.message);
  }
  
  // 최종 결과 요약
  console.log('=========================================');
  console.log('📊 최종 검증 결과 요약:');
  console.log('=========================================');
  console.log(`1. 타로지침 메뉴 제거: ${results.tarotGuidelinesMenuRemoved ? '✅ 성공' : '❌ 실패'}`);
  console.log(`2. 관리자 페이지 보호: ${results.adminPageRedirects ? '✅ 성공' : '❌ 실패'}`);
  console.log(`3. 타로지침 페이지 보호: ${results.tarotGuidelinesPageRedirects ? '✅ 성공' : '❌ 실패'}`);
  console.log('=========================================');
  console.log('완료 시간:', new Date().toLocaleString('ko-KR'));
  
  await browser.close();
}

finalCompleteQATest().catch(console.error);