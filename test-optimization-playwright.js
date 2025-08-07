const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('📊 성능 최적화 테스트 시작...');
    
    // 테스트 페이지로 이동
    console.log('1. 최적화 테스트 페이지 접속...');
    await page.goto('http://localhost:4000/admin/test-optimization');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 - 초기 상태
    await page.screenshot({ 
      path: 'test-screenshots/optimization-initial.png',
      fullPage: true 
    });
    console.log('✅ 초기 상태 스크린샷 저장');

    // 원본 컴포넌트 테스트
    console.log('\n2. 원본 컴포넌트 테스트...');
    await page.click('button:has-text("원본 컴포넌트 보기")');
    await page.waitForTimeout(2000); // 렌더링 대기
    
    await page.screenshot({ 
      path: 'test-screenshots/optimization-original.png',
      fullPage: true 
    });
    console.log('✅ 원본 컴포넌트 스크린샷 저장');

    // 최적화 컴포넌트 테스트
    console.log('\n3. 최적화 컴포넌트 테스트...');
    await page.click('button:has-text("최적화 컴포넌트 보기")');
    await page.waitForTimeout(2000); // 렌더링 대기
    
    await page.screenshot({ 
      path: 'test-screenshots/optimization-optimized.png',
      fullPage: true 
    });
    console.log('✅ 최적화 컴포넌트 스크린샷 저장');

    // 탭 전환 테스트
    console.log('\n4. 탭 전환 성능 테스트...');
    await page.click('button[role="tab"]:has-text("실시간 모니터링")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-screenshots/optimization-realtime.png',
      fullPage: true 
    });
    console.log('✅ 실시간 모니터링 탭 스크린샷 저장');

    // 관리자 페이지 원본과 최적화 버전 비교
    console.log('\n5. 관리자 페이지 비교...');
    
    // 원본 관리자 페이지
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-screenshots/admin-original.png',
      fullPage: true 
    });
    console.log('✅ 원본 관리자 페이지 스크린샷 저장');

    console.log('\n✨ 최적화 테스트 완료!');
    console.log('📁 스크린샷이 test-screenshots 폴더에 저장되었습니다.');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();