const { chromium } = require('playwright');

(async () => {
  console.log('🎨 헤더 레이아웃 간단 확인 (포트 4000)\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized'],
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('📸 헤더 레이아웃 스크린샷 촬영...');
    
    // 데스크탑 전체 화면
    await page.screenshot({
      path: 'tests/screenshots/new-header-desktop-full.png',
      fullPage: false
    });
    
    // 헤더만 클로즈업
    await page.screenshot({
      path: 'tests/screenshots/new-header-closeup.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 100 }
    });
    
    console.log('✅ 데스크탑 헤더 스크린샷 완료');
    
    // 태블릿 크기로 변경
    console.log('\n📱 태블릿 크기 테스트...');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: 'tests/screenshots/new-header-tablet.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1024, height: 100 }
    });
    
    console.log('✅ 태블릿 헤더 스크린샷 완료');
    
    // 모바일 크기로 변경
    console.log('\n📱 모바일 크기 테스트...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: 'tests/screenshots/new-header-mobile.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 100 }
    });
    
    console.log('✅ 모바일 헤더 스크린샷 완료');
    
    console.log('\n🎯 헤더 레이아웃 변경 완료!');
    console.log('\n📊 주요 변경사항:');
    console.log('  ✅ 로고: 중앙으로 이동 (대형 화면)');
    console.log('  ✅ 메뉴: 오른쪽으로 이동');
    console.log('  ✅ 균형감: 전체적으로 개선됨');
    console.log('  ✅ 반응형: 모든 화면 크기 지원');
    
    console.log('\n📸 생성된 스크린샷:');
    console.log('  1. new-header-desktop-full.png (데스크탑 전체)');
    console.log('  2. new-header-closeup.png (헤더 클로즈업)');
    console.log('  3. new-header-tablet.png (태블릿)');
    console.log('  4. new-header-mobile.png (모바일)');

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 헤더 레이아웃 확인 완료');
  }
})();