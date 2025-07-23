const { chromium } = require('playwright');

(async () => {
  console.log('🚀 포트 4000 포괄적 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null  // 전체 화면 사용
  });
  
  const page = await context.newPage();
  
  const testResults = {
    서버상태: '확인중...',
    페이지로드: '확인중...',
    주요페이지: {},
    에러: []
  };

  try {
    // 1. 홈페이지 테스트
    console.log('📍 홈페이지 테스트 중...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    testResults.서버상태 = '✅ 실행중';
    testResults.페이지로드 = '✅ 성공';
    
    const title = await page.title();
    console.log('✅ 홈페이지 로드 성공 -', title);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'tests/screenshots/port-4000-home.png',
      fullPage: true 
    });
    
    // 2. 주요 페이지 테스트
    const pages = [
      { name: '블로그', url: '/blog' },
      { name: '타로리딩', url: '/reading' },
      { name: '백과사전', url: '/encyclopedia' },
      { name: '로그인', url: '/sign-in' }
    ];
    
    for (const pageInfo of pages) {
      console.log(`\n📍 ${pageInfo.name} 페이지 테스트 중...`);
      try {
        await page.goto(`http://localhost:4000${pageInfo.url}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        
        const pageTitle = await page.title();
        testResults.주요페이지[pageInfo.name] = {
          상태: '✅ 성공',
          제목: pageTitle,
          URL: page.url()
        };
        
        console.log(`✅ ${pageInfo.name} 페이지 로드 성공`);
        
        // 각 페이지 스크린샷
        await page.screenshot({ 
          path: `tests/screenshots/port-4000-${pageInfo.name}.png`,
          fullPage: true 
        });
        
      } catch (error) {
        testResults.주요페이지[pageInfo.name] = {
          상태: '❌ 실패',
          에러: error.message
        };
        testResults.에러.push(`${pageInfo.name}: ${error.message}`);
        console.error(`❌ ${pageInfo.name} 페이지 로드 실패:`, error.message);
      }
    }
    
    // 3. 결과 리포트
    console.log('\n' + '='.repeat(50));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(50));
    console.log(`서버 상태: ${testResults.서버상태}`);
    console.log(`페이지 로드: ${testResults.페이지로드}`);
    console.log('\n주요 페이지 상태:');
    for (const [페이지, 정보] of Object.entries(testResults.주요페이지)) {
      console.log(`  - ${페이지}: ${정보.상태}`);
      if (정보.제목) console.log(`    제목: ${정보.제목}`);
    }
    
    if (testResults.에러.length > 0) {
      console.log('\n⚠️  발견된 문제:');
      testResults.에러.forEach(err => console.log(`  - ${err}`));
    }
    
    console.log('\n📸 스크린샷 저장 위치: tests/screenshots/');
    console.log('🔧 브라우저를 열어둡니다. 추가 테스트를 진행하거나 Ctrl+C로 종료하세요.\n');
    
    // 브라우저 유지
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ 치명적 오류:', error.message);
    testResults.서버상태 = '❌ 오류';
    testResults.에러.push(`치명적 오류: ${error.message}`);
    
    console.log('\n⚠️  테스트 중 오류가 발생했지만 브라우저는 유지됩니다.');
    console.log('🔧 수동으로 확인하거나 Ctrl+C로 종료하세요.\n');
    
    await new Promise(() => {});
  }
})();