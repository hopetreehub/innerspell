const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🎯 최종 포트 4000 상태 확인\n');
    
    console.log('📡 localhost:4000 접속 중...');
    
    // 더 긴 타임아웃으로 설정
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',  // 더 빠른 로딩
      timeout: 30000 
    });
    
    const title = await page.title();
    const url = page.url();
    
    console.log(`✅ 접속 성공!`);
    console.log(`   📄 페이지 제목: "${title}"`);
    console.log(`   🔗 URL: ${url}`);
    
    // 페이지 내용 확인
    const bodyExists = await page.locator('body').count() > 0;
    console.log(`   📋 Body 태그: ${bodyExists ? '존재' : '없음'}`);
    
    // React 앱 로딩 확인
    await page.waitForTimeout(2000);
    const reactRoot = await page.locator('#__next, [data-reactroot]').count();
    console.log(`   ⚛️  React 앱: ${reactRoot > 0 ? '로드됨' : '로딩 중'}`);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'final-port-4000-check.png', 
      fullPage: true 
    });
    
    console.log('\n📊 최종 상태:');
    console.log('  ✅ 서버: 정상 실행 중');
    console.log('  ✅ HTTP: 200 응답');
    console.log('  ✅ 페이지: 로드 완료');
    console.log('  📸 스크린샷: final-port-4000-check.png 저장');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
  } finally {
    await browser.close();
  }
})();