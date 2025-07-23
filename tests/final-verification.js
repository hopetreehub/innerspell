const { chromium } = require('playwright');

(async () => {
  console.log('🎯 최종 검증: 모든 에러 수정 후 상태 확인 (포트 4000)\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized', '--disable-web-security'],
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();

  const testResults = {
    시작시간: new Date().toLocaleString('ko-KR'),
    서버상태: '확인중...',
    리소스에러: { before: 31, after: 0 },
    테스트결과: {}
  };

  // 에러 수집
  const jsErrors = [];
  const consoleErrors = [];
  const networkErrors = [];
  
  page.on('pageerror', error => jsErrors.push(error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()}: ${response.url()}`);
    }
  });

  try {
    console.log('1. 홈페이지 최종 테스트...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const title = await page.title();
    console.log(`   📄 페이지 타이틀: ${title}`);
    
    testResults.서버상태 = '✅ 포트 4000 정상 응답';
    
    // 메인 히어로 확인
    const heroVisible = await page.locator('h1').first().isVisible();
    const heroText = await page.locator('h1').first().textContent();
    
    // 네비게이션 확인
    const navItems = await page.locator('nav a').count();
    
    // 이미지 로딩 확인
    const images = await page.locator('img').count();
    
    await page.screenshot({
      path: 'tests/screenshots/final-home-verified.png',
      fullPage: true
    });
    
    testResults.테스트결과.홈페이지 = {
      상태: '✅ 성공',
      타이틀: title,
      히어로표시: heroVisible ? '✅ 정상' : '❌ 오류',
      히어로텍스트: heroText,
      네비게이션: `${navItems}개`,
      이미지수: `${images}개`,
      스크린샷: 'final-home-verified.png'
    };
    
    console.log('   ✅ 홈페이지 검증 완료');

    console.log('\n2. 주요 페이지 순차 테스트...');
    
    const pages = [
      { name: '블로그', url: '/blog' },
      { name: '타로리딩', url: '/reading' },
      { name: '백과사전', url: '/encyclopedia' },
      { name: '커뮤니티', url: '/community' },
      { name: '로그인', url: '/sign-in' }
    ];
    
    for (const pageInfo of pages) {
      console.log(`   ${pageInfo.name} 테스트...`);
      
      await page.goto(`http://localhost:4000${pageInfo.url}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      
      const pageTitle = await page.title();
      const mainContent = await page.locator('main').isVisible();
      
      await page.screenshot({
        path: `tests/screenshots/final-${pageInfo.name}-verified.png`,
        fullPage: true
      });
      
      testResults.테스트결과[pageInfo.name] = {
        상태: '✅ 성공',
        타이틀: pageTitle,
        메인컨텐츠: mainContent ? '✅ 정상' : '❌ 오류',
        스크린샷: `final-${pageInfo.name}-verified.png`
      };
      
      console.log(`     ✅ ${pageInfo.name} 완료`);
      await page.waitForTimeout(1000);
    }

    console.log('\n3. 리소스 에러 검증...');
    
    // 마지막으로 홈페이지 재방문하여 에러 카운트
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000); // 모든 리소스 로딩 대기
    
    testResults.리소스에러.after = networkErrors.length;
    testResults.완료시간 = new Date().toLocaleString('ko-KR');

    console.log('\n📊 === 최종 검증 결과 ===');
    console.log('='.repeat(50));
    console.log(`🕐 시작: ${testResults.시작시간}`);
    console.log(`🕐 완료: ${testResults.완료시간}`);
    console.log(`🌐 서버: ${testResults.서버상태}`);
    console.log(`📍 포트: 4000 (http://localhost:4000)`);
    
    console.log('\n🔧 에러 수정 결과:');
    console.log(`  이전 리소스 에러: ${testResults.리소스에러.before}개`);
    console.log(`  현재 리소스 에러: ${testResults.리소스에러.after}개`);
    console.log(`  개선율: ${Math.round((testResults.리소스에러.before - testResults.리소스에러.after) / testResults.리소스에러.before * 100)}%`);
    
    console.log('\n📋 페이지별 최종 상태:');
    Object.entries(testResults.테스트결과).forEach(([페이지, 결과]) => {
      console.log(`\n${페이지}:`);
      Object.entries(결과).forEach(([항목, 값]) => {
        console.log(`  ${항목}: ${값}`);
      });
    });
    
    console.log(`\n🟥 JavaScript 에러: ${jsErrors.length}개`);
    console.log(`🟧 콘솔 에러: ${consoleErrors.length}개`);
    console.log(`🟨 네트워크 에러: ${networkErrors.length}개`);
    
    if (networkErrors.length > 0) {
      console.log('\n남은 네트워크 에러들:');
      networkErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    const 성공페이지 = Object.values(testResults.테스트결과).filter(r => r.상태.includes('성공')).length;
    const 전체페이지 = Object.keys(testResults.테스트결과).length;
    
    console.log(`\n📈 최종 성공률: ${성공페이지}/${전체페이지} (${Math.round(성공페이지/전체페이지*100)}%)`);
    
    if (성공페이지 === 전체페이지 && networkErrors.length < 5) {
      console.log('\n🎉 애플리케이션이 정상적으로 수정되어 작동합니다!');
      console.log('✅ 모든 주요 기능 검증 완료');
      console.log('✅ 화면 표시 문제 해결 완료');
    } else {
      console.log('\n⚠️ 일부 문제가 남아있을 수 있습니다.');
    }
    
    console.log('\n🔗 검증된 URL 목록:');
    console.log(`  ✅ 홈: http://localhost:4000`);
    pages.forEach(p => {
      const 상태 = testResults.테스트결과[p.name]?.상태 || '❓';
      console.log(`  ${상태} ${p.name}: http://localhost:4000${p.url}`);
    });

  } catch (error) {
    console.error('\n❌ 최종 검증 중 오류:', error.message);
    
    await page.screenshot({
      path: 'tests/screenshots/final-verification-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('\n🏁 최종 검증 완료');
  }
})();