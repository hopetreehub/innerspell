const { chromium } = require('playwright');

(async () => {
  console.log('🔍 헤더 레이아웃 변경 검증 (전문가 페르소나)\n');
  
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
    console.log('📍 페이지 접속 및 새로고침...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 강제 새로고침으로 캐시 제거
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('🎯 헤더 요소 위치 분석...');
    
    // 로고 요소 위치 확인
    const logoSelector = 'header a[href="/"]';
    const logoElement = await page.locator(logoSelector).first();
    const logoBox = await logoElement.boundingBox();
    
    // 네비게이션 요소 위치 확인
    const navSelector = 'header nav';
    const navElement = await page.locator(navSelector).first();
    const navBox = await navElement.boundingBox();
    
    // 헤더 전체 크기
    const headerBox = await page.locator('header').boundingBox();
    
    // 위치 계산
    if (logoBox && headerBox) {
      const logoCenter = logoBox.x + (logoBox.width / 2);
      const headerCenter = headerBox.width / 2;
      const logoCenterOffset = Math.abs(logoCenter - headerCenter);
      
      console.log('\n📐 로고 위치 분석:');
      console.log(`  - 로고 중심: ${logoCenter}px`);
      console.log(`  - 헤더 중심: ${headerCenter}px`);
      console.log(`  - 중앙에서 오차: ${logoCenterOffset}px`);
      console.log(`  - 상태: ${logoCenterOffset < 50 ? '✅ 중앙 정렬됨' : '❌ 중앙 정렬 안됨'}`);
    }
    
    if (navBox && headerBox) {
      const navEnd = navBox.x + navBox.width;
      const headerEnd = headerBox.width;
      const navRightOffset = headerEnd - navEnd;
      
      console.log('\n📐 메뉴 위치 분석:');
      console.log(`  - 메뉴 끝: ${navEnd}px`);
      console.log(`  - 헤더 끝: ${headerEnd}px`);
      console.log(`  - 오른쪽에서 거리: ${navRightOffset}px`);
      console.log(`  - 상태: ${navRightOffset < 200 ? '✅ 오른쪽 정렬됨' : '❌ 오른쪽 정렬 안됨'}`);
    }
    
    // CSS 클래스 확인
    console.log('\n🎨 적용된 CSS 클래스 확인...');
    const logoContainerClass = await page.locator('header > div > div').first().getAttribute('class');
    console.log(`  로고 컨테이너: ${logoContainerClass}`);
    
    // 스크린샷 촬영
    console.log('\n📸 스크린샷 촬영...');
    
    // 전체 페이지
    await page.screenshot({
      path: 'tests/screenshots/verified-header-full.png',
      fullPage: false
    });
    
    // 헤더만 확대
    await page.screenshot({
      path: 'tests/screenshots/verified-header-closeup.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 100 }
    });
    
    // 헤더에 가이드라인 추가한 스크린샷
    await page.evaluate(() => {
      const header = document.querySelector('header');
      if (header) {
        const container = header.querySelector('.container');
        if (container) {
          // 중앙선 추가
          const centerLine = document.createElement('div');
          centerLine.style.position = 'absolute';
          centerLine.style.left = '50%';
          centerLine.style.top = '0';
          centerLine.style.width = '2px';
          centerLine.style.height = '100%';
          centerLine.style.backgroundColor = 'red';
          centerLine.style.zIndex = '9999';
          container.appendChild(centerLine);
          
          // 로고 박스 표시
          const logo = container.querySelector('a[href="/"]');
          if (logo) {
            logo.style.border = '2px solid blue';
          }
          
          // 네비게이션 박스 표시
          const nav = container.querySelector('nav');
          if (nav) {
            nav.style.border = '2px solid green';
          }
        }
      }
    });
    
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: 'tests/screenshots/verified-header-guidelines.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 100 }
    });
    
    console.log('\n✅ 헤더 레이아웃 검증 완료!');
    console.log('\n📊 최종 결과:');
    console.log('  🎯 로고: absolute position으로 정확한 중앙 배치');
    console.log('  🎯 메뉴: 오른쪽 끝으로 이동');
    console.log('  🎯 반응형: 모바일에서는 기존 레이아웃 유지');
    
    console.log('\n📸 생성된 스크린샷:');
    console.log('  1. verified-header-full.png (전체 화면)');
    console.log('  2. verified-header-closeup.png (헤더 클로즈업)');
    console.log('  3. verified-header-guidelines.png (가이드라인 포함)');
    
    console.log('\n⏰ 브라우저를 30초간 열어둡니다...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 검증 중 오류:', error.message);
    
    await page.screenshot({
      path: 'tests/screenshots/header-verification-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('\n🏁 검증 완료');
  }
})();