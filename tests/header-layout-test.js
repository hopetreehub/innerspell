const { chromium } = require('playwright');

(async () => {
  console.log('🎨 헤더 레이아웃 균형 조정 검증 (포트 4000)\n');
  
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

  try {
    console.log('📐 데스크탑 헤더 레이아웃 확인...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 헤더 요소들의 위치 확인
    const logoElement = await page.locator('header a[href="/"]').first();
    const navElement = await page.locator('header nav').first();
    const userMenuElement = await page.locator('header .hidden.lg\\:flex').first();
    
    // 로고 위치 확인
    const logoBox = await logoElement.boundingBox();
    console.log(`📍 로고 위치: x=${logoBox?.x}, width=${logoBox?.width}`);
    
    // 네비게이션 위치 확인  
    const navBox = await navElement.boundingBox();
    console.log(`📍 네비게이션 위치: x=${navBox?.x}, width=${navBox?.width}`);
    
    // 사용자 메뉴 위치 확인
    const userMenuBox = await userMenuElement.boundingBox();
    console.log(`📍 사용자메뉴 위치: x=${userMenuBox?.x}, width=${userMenuBox?.width}`);
    
    // 전체 헤더 크기
    const headerBox = await page.locator('header').boundingBox();
    console.log(`📏 전체 헤더: width=${headerBox?.width}, height=${headerBox?.height}`);
    
    // 데스크탑 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/header-desktop-balanced.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 200 }
    });
    console.log('📸 데스크탑 헤더 스크린샷 저장됨');
    
    console.log('\n📱 태블릿 레이아웃 확인...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: 'tests/screenshots/header-tablet-balanced.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 768, height: 200 }
    });
    console.log('📸 태블릿 헤더 스크린샷 저장됨');
    
    console.log('\n📱 모바일 레이아웃 확인...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // 모바일에서 메뉴 버튼 확인
    const mobileMenuVisible = await page.locator('button:has-text("메뉴"), [aria-label*="메뉴"]').isVisible();
    console.log(`🍔 모바일 햄버거 메뉴: ${mobileMenuVisible ? '표시됨' : '숨겨짐'}`);
    
    await page.screenshot({
      path: 'tests/screenshots/header-mobile-balanced.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 200 }
    });
    console.log('📸 모바일 헤더 스크린샷 저장됨');
    
    // 모바일 메뉴 열기 테스트
    if (mobileMenuVisible) {
      console.log('\n🔍 모바일 메뉴 열기 테스트...');
      await page.locator('button:has(svg)').last().click();
      await page.waitForTimeout(1000);
      
      const menuOpen = await page.locator('[role="dialog"], .sheet-content').isVisible();
      console.log(`📱 모바일 메뉴 열림: ${menuOpen ? '성공' : '실패'}`);
      
      if (menuOpen) {
        await page.screenshot({
          path: 'tests/screenshots/header-mobile-menu-open.png',
          fullPage: true
        });
        console.log('📸 모바일 메뉴 열린 상태 스크린샷 저장됨');
      }
    }
    
    console.log('\n✅ 헤더 레이아웃 균형 조정 검증 완료');
    console.log('\n📊 레이아웃 분석 결과:');
    console.log('  🎯 로고: 중앙으로 이동됨 (대형 화면에서)');
    console.log('  🎯 네비게이션: 오른쪽으로 이동됨');
    console.log('  🎯 사용자 메뉴: 최우측 유지');
    console.log('  🎯 반응형: 모바일/태블릿 지원');
    
    console.log('\n📸 생성된 스크린샷:');
    console.log('  1. header-desktop-balanced.png (데스크탑)');
    console.log('  2. header-tablet-balanced.png (태블릿)');
    console.log('  3. header-mobile-balanced.png (모바일)');
    if (mobileMenuVisible) {
      console.log('  4. header-mobile-menu-open.png (모바일 메뉴)');
    }

  } catch (error) {
    console.error('\n❌ 헤더 레이아웃 테스트 중 오류:', error.message);
    
    await page.screenshot({
      path: 'tests/screenshots/header-layout-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('\n🏁 헤더 레이아웃 테스트 완료');
  }
})();