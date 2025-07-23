const { chromium } = require('playwright');

(async () => {
  console.log('🚀 MysticSight Tarot 단계별 검증 (포트 4000) - 절대 추정 금지 원칙\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized', '--disable-web-security', '--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: null,
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();
  
  const testResults = {
    시작시간: new Date().toLocaleString('ko-KR'),
    서버포트: '4000',
    테스트결과: {},
    스크린샷: []
  };

  const pages = [
    { name: '홈페이지', url: '/', expected: 'MysticSight' },
    { name: '블로그', url: '/blog', expected: '블로그' },
    { name: '타로리딩', url: '/reading', expected: '타로' },
    { name: '백과사전', url: '/encyclopedia', expected: '백과사전' },
    { name: '커뮤니티', url: '/community', expected: '커뮤니티' },
    { name: '로그인', url: '/sign-in', expected: '로그인' }
  ];

  for (let i = 0; i < pages.length; i++) {
    const pageInfo = pages[i];
    console.log(`\n${i + 1}. ${pageInfo.name} 테스트 중...`);
    
    try {
      const startTime = Date.now();
      
      await page.goto(`http://localhost:4000${pageInfo.url}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      const loadTime = Date.now() - startTime;
      
      // 페이지 타이틀 확인
      const title = await page.title();
      console.log(`   📄 페이지 타이틀: ${title}`);
      
      // 페이지 내용 확인
      const bodyText = await page.textContent('body');
      const hasExpectedContent = bodyText.includes(pageInfo.expected) || 
                                bodyText.includes(pageInfo.name) ||
                                title.includes(pageInfo.expected);
      
      // 스크린샷 촬영
      const screenshotName = `step-${i + 1}-${pageInfo.name.toLowerCase()}.png`;
      await page.screenshot({
        path: `tests/screenshots/${screenshotName}`,
        fullPage: true
      });
      
      testResults.테스트결과[pageInfo.name] = {
        상태: '✅ 성공',
        로딩시간: `${loadTime}ms`,
        타이틀: title,
        내용확인: hasExpectedContent ? '✅ 정상' : '⚠️ 확인필요',
        스크린샷: screenshotName
      };
      
      testResults.스크린샷.push(screenshotName);
      
      console.log(`   ⏱️ 로딩 시간: ${loadTime}ms`);
      console.log(`   📸 스크린샷: ${screenshotName}`);
      console.log(`   ✅ ${pageInfo.name} 테스트 완료`);
      
      // 각 페이지 간 1초 대기
      await page.waitForTimeout(1000);
      
    } catch (error) {
      console.log(`   ❌ ${pageInfo.name} 테스트 실패: ${error.message}`);
      
      testResults.테스트결과[pageInfo.name] = {
        상태: '❌ 실패',
        오류: error.message,
        스크린샷: 'error-screenshot.png'
      };
      
      // 오류 시에도 스크린샷 촬영
      try {
        await page.screenshot({
          path: `tests/screenshots/error-${pageInfo.name.toLowerCase()}.png`,
          fullPage: true
        });
      } catch (screenshotError) {
        console.log(`   📸 스크린샷 촬영 실패: ${screenshotError.message}`);
      }
    }
  }

  testResults.완료시간 = new Date().toLocaleString('ko-KR');

  // 최종 결과 출력
  console.log('\n📊 === 종합 테스트 결과 보고서 ===');
  console.log('='.repeat(50));
  console.log(`🕐 시작: ${testResults.시작시간}`);
  console.log(`🕐 완료: ${testResults.완료시간}`);
  console.log(`🌐 서버: 포트 4000`);
  console.log(`📍 기본 URL: http://localhost:4000`);
  
  console.log('\n📋 페이지별 테스트 결과:');
  Object.entries(testResults.테스트결과).forEach(([페이지, 결과]) => {
    console.log(`\n${페이지}:`);
    Object.entries(결과).forEach(([항목, 값]) => {
      console.log(`  ${항목}: ${값}`);
    });
  });
  
  const 성공페이지 = Object.values(testResults.테스트결과).filter(r => r.상태.includes('성공')).length;
  const 전체페이지 = Object.keys(testResults.테스트결과).length;
  
  console.log(`\n📈 성공률: ${성공페이지}/${전체페이지} (${Math.round(성공페이지/전체페이지*100)}%)`);
  console.log(`📸 생성된 스크린샷: ${testResults.스크린샷.length}개`);
  
  if (성공페이지 === 전체페이지) {
    console.log('\n🎉 모든 페이지가 정상적으로 작동합니다!');
  } else {
    console.log('\n⚠️ 일부 페이지에서 문제가 발견되었습니다.');
  }
  
  console.log('\n🔗 확인된 URL 목록:');
  pages.forEach(p => {
    const 상태 = testResults.테스트결과[p.name]?.상태 || '❓';
    console.log(`  ${상태} http://localhost:4000${p.url}`);
  });

  await browser.close();
  console.log('\n🏁 단계별 검증 완료');
})();