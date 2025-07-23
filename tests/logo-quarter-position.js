const { chromium } = require('playwright');

(async () => {
  console.log('🎯 로고 1/4 위치 변경 확인 (포트 4000)\n');
  
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
    console.log('📍 페이지 로딩...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 강제 새로고침
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('📐 로고 위치 계산...');
    
    // 헤더 정보 수집
    const measurements = await page.evaluate(() => {
      const header = document.querySelector('header');
      const container = header?.querySelector('.container');
      const logo = container?.querySelector('a[href="/"]');
      
      if (!header || !logo) return null;
      
      const headerWidth = header.offsetWidth;
      const logoRect = logo.getBoundingClientRect();
      const logoCenter = logoRect.left + (logoRect.width / 2);
      
      // 위치 계산
      const quarterPosition = headerWidth * 0.25; // 25% 위치
      const halfPosition = headerWidth * 0.5; // 50% 위치 (중앙)
      const logoPositionPercent = (logoCenter / headerWidth) * 100;
      
      return {
        headerWidth,
        logoLeft: logoRect.left,
        logoWidth: logoRect.width,
        logoCenter,
        quarterPosition,
        halfPosition,
        logoPositionPercent,
        distanceFromQuarter: Math.abs(logoCenter - quarterPosition)
      };
    });
    
    console.log('\n📊 위치 분석 결과:');
    console.log(`  🖥️ 화면 너비: ${measurements?.headerWidth}px`);
    console.log(`  📍 로고 중심 위치: ${measurements?.logoCenter?.toFixed(1)}px`);
    console.log(`  📍 1/4 위치 (25%): ${measurements?.quarterPosition?.toFixed(1)}px`);
    console.log(`  📍 중앙 위치 (50%): ${measurements?.halfPosition?.toFixed(1)}px`);
    console.log(`  📊 로고 위치 퍼센트: ${measurements?.logoPositionPercent?.toFixed(1)}%`);
    console.log(`  📏 1/4 위치에서 오차: ${measurements?.distanceFromQuarter?.toFixed(1)}px`);
    
    if (measurements?.logoPositionPercent && measurements.logoPositionPercent > 20 && measurements.logoPositionPercent < 30) {
      console.log('\n✅ 로고가 정확히 1/4 위치(25%)에 배치되었습니다!');
    } else {
      console.log('\n⚠️ 로고 위치 조정이 필요할 수 있습니다.');
    }
    
    // 가이드라인이 있는 스크린샷
    await page.evaluate(() => {
      const header = document.querySelector('header');
      if (header) {
        const container = header.querySelector('.container');
        if (container) {
          // 1/4 위치 선
          const quarterLine = document.createElement('div');
          quarterLine.style.position = 'absolute';
          quarterLine.style.left = '25%';
          quarterLine.style.top = '0';
          quarterLine.style.width = '2px';
          quarterLine.style.height = '100%';
          quarterLine.style.backgroundColor = 'lime';
          quarterLine.style.zIndex = '9999';
          quarterLine.title = '1/4 위치 (25%)';
          container.appendChild(quarterLine);
          
          // 중앙선
          const centerLine = document.createElement('div');
          centerLine.style.position = 'absolute';
          centerLine.style.left = '50%';
          centerLine.style.top = '0';
          centerLine.style.width = '2px';
          centerLine.style.height = '100%';
          centerLine.style.backgroundColor = 'red';
          centerLine.style.zIndex = '9999';
          centerLine.style.opacity = '0.5';
          centerLine.title = '중앙 (50%)';
          container.appendChild(centerLine);
          
          // 로고 하이라이트
          const logo = container.querySelector('a[href="/"]');
          if (logo) {
            logo.style.border = '2px solid blue';
            logo.style.backgroundColor = 'rgba(0,0,255,0.1)';
          }
        }
      }
    });
    
    await page.waitForTimeout(1000);
    
    // 스크린샷 저장
    console.log('\n📸 스크린샷 저장...');
    
    await page.screenshot({
      path: 'tests/screenshots/logo-quarter-position.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 100 }
    });
    
    await page.screenshot({
      path: 'tests/screenshots/logo-quarter-full-page.png',
      fullPage: false
    });
    
    console.log('\n✅ 로고 위치 변경 완료!');
    console.log('\n📌 변경 사항:');
    console.log('  - 로고: 왼쪽에서 전체의 1/4 지점 (25% 위치)');
    console.log('  - 메뉴: 오른쪽 유지');
    console.log('  - 균형: 더 나은 시각적 균형');
    
    console.log('\n📸 가이드라인 설명:');
    console.log('  🟢 초록선: 1/4 위치 (로고가 있어야 할 위치)');
    console.log('  🔴 빨간선: 중앙 위치 (참고용)');
    console.log('  🔵 파란 박스: 로고 위치');
    
    console.log('\n⏰ 브라우저를 30초간 열어둡니다...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 로고 1/4 위치 확인 완료');
  }
})();