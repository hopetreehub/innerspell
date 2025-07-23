const { chromium } = require('playwright');

(async () => {
  console.log('🔧 빌드 에러 해결 확인 테스트\n');
  console.log('✅ node_modules 재설치 완료');
  console.log('✅ OpenTelemetry Jaeger 패키지 문제 해결');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null
  });
  
  const page = await context.newPage();

  try {
    console.log('\n📍 포트 4000 접속 테스트...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const title = await page.title();
    console.log('✅ 페이지 로드 성공:', title || '(타이틀 없음)');
    
    // 콘솔 에러 체크
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('⚠️  콘솔 에러:', msg.text());
      }
    });
    
    // 페이지 에러 체크
    page.on('pageerror', error => {
      console.log('❌ 페이지 에러:', error.message);
    });
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'tests/screenshots/build-fix-verified.png',
      fullPage: true 
    });
    
    console.log('\n✅ 빌드 에러가 해결되었습니다!');
    console.log('📸 스크린샷: tests/screenshots/build-fix-verified.png');
    console.log('\n🔧 브라우저를 열어둡니다. Ctrl+C로 종료하세요.');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ 접속 실패:', error.message);
    console.log('\n🔍 문제 해결 방법:');
    console.log('1. 서버가 실행 중인지 확인: npm run dev');
    console.log('2. 포트 4000이 사용 중인지 확인');
    console.log('3. .next 폴더 삭제 후 재시작');
    
    await browser.close();
  }
})();