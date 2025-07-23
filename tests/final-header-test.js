const { chromium } = require('playwright');

(async () => {
  console.log('🎯 최종 헤더 레이아웃 확인 (포트 4000)\n');
  
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
    console.log('📍 서버 재시작 후 페이지 로딩...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    console.log('✅ 페이지 로딩 완료');
    
    // 개발자 도구 스타일로 요소 확인
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('header');
      const container = header?.querySelector('.container');
      const logo = container?.querySelector('a[href="/"]');
      const nav = container?.querySelector('nav');
      
      return {
        headerWidth: header?.offsetWidth,
        containerClass: container?.className,
        logoClass: logo?.parentElement?.className,
        logoPosition: logo ? {
          left: logo.offsetLeft,
          width: logo.offsetWidth,
          center: logo.offsetLeft + (logo.offsetWidth / 2)
        } : null,
        navPosition: nav ? {
          left: nav.offsetLeft,
          width: nav.offsetWidth,
          right: nav.offsetLeft + nav.offsetWidth
        } : null
      };
    });
    
    console.log('\n📊 헤더 레이아웃 분석:');
    console.log('헤더 정보:', JSON.stringify(headerInfo, null, 2));
    
    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/screenshots/final-header-layout.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 100 }
    });
    
    console.log('\n📸 스크린샷 저장: final-header-layout.png');
    
    console.log('\n🔍 현재 헤더 상태:');
    console.log('  - 로고가 정말 중앙에 있는지 확인해주세요');
    console.log('  - 메뉴가 오른쪽으로 이동했는지 확인해주세요');
    console.log('  - 전체적인 균형감이 개선되었는지 확인해주세요');
    
    console.log('\n⏰ 브라우저를 1분간 열어둡니다...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 최종 확인 완료');
  }
})();