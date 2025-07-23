const { chromium } = require('playwright');

(async () => {
  console.log('🔍 메뉴 위치 정밀 분석 시작\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized'],
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();

  try {
    console.log('📍 페이지 접속 중...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 메뉴 위치 정밀 측정
    const measurements = await page.evaluate(() => {
      const header = document.querySelector('header');
      const container = header?.querySelector('.container');
      const nav = container?.querySelector('nav');
      const menuContainer = nav?.parentElement;
      
      if (!container || !nav) return null;
      
      const containerRect = container.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const menuContainerRect = menuContainer?.getBoundingClientRect();
      
      // 컨테이너 너비
      const containerWidth = containerRect.width;
      
      // 네비게이션 메뉴 위치
      const navStart = navRect.left - containerRect.left;
      const navEnd = navRect.right - containerRect.left;
      const navCenter = navStart + (navRect.width / 2);
      
      // 메뉴 컨테이너 위치
      const menuEnd = menuContainerRect ? menuContainerRect.right - containerRect.left : navEnd;
      
      // 퍼센트 계산
      const navStartPercent = (navStart / containerWidth) * 100;
      const navCenterPercent = (navCenter / containerWidth) * 100;
      const navEndPercent = (navEnd / containerWidth) * 100;
      const menuEndPercent = (menuEnd / containerWidth) * 100;
      
      // 오른쪽 끝에서의 거리
      const distanceFromRight = containerWidth - menuEnd;
      
      return {
        containerWidth,
        navStart,
        navEnd,
        navCenter,
        navWidth: navRect.width,
        menuEnd,
        distanceFromRight,
        navStartPercent: navStartPercent.toFixed(1),
        navCenterPercent: navCenterPercent.toFixed(1),
        navEndPercent: navEndPercent.toFixed(1),
        menuEndPercent: menuEndPercent.toFixed(1),
        menuContainerClass: menuContainer?.className
      };
    });
    
    console.log('\n📊 메뉴 위치 분석 결과:');
    console.log('─'.repeat(50));
    console.log(`컨테이너 너비: ${measurements?.containerWidth}px`);
    console.log(`\n네비게이션 메뉴:`);
    console.log(`  시작 위치: ${measurements?.navStart}px (${measurements?.navStartPercent}%)`);
    console.log(`  중심 위치: ${measurements?.navCenter}px (${measurements?.navCenterPercent}%)`);
    console.log(`  끝 위치: ${measurements?.navEnd}px (${measurements?.navEndPercent}%)`);
    console.log(`  메뉴 너비: ${measurements?.navWidth}px`);
    console.log(`\n전체 메뉴 컨테이너:`);
    console.log(`  끝 위치: ${measurements?.menuEnd}px (${measurements?.menuEndPercent}%)`);
    console.log(`  오른쪽 끝에서 거리: ${measurements?.distanceFromRight}px`);
    console.log(`  CSS 클래스: ${measurements?.menuContainerClass}`);
    
    // 위치 판단
    console.log('\n🎯 위치 분석:');
    if (measurements?.navCenterPercent && parseFloat(measurements.navCenterPercent) < 60) {
      console.log('⚠️ 메뉴가 중앙에 가까운 위치에 있습니다!');
      console.log(`   현재 메뉴 중심: ${measurements.navCenterPercent}% (60% 미만)`);
    } else if (measurements?.menuEndPercent && parseFloat(measurements.menuEndPercent) < 90) {
      console.log('⚠️ 메뉴가 오른쪽 끝에서 너무 멀리 있습니다!');
      console.log(`   현재 메뉴 끝: ${measurements.menuEndPercent}% (90% 미만)`);
    } else {
      console.log('✅ 메뉴가 오른쪽 끝에 적절히 위치해 있습니다.');
    }
    
    // 시각적 가이드라인 추가
    await page.evaluate(() => {
      const container = document.querySelector('header .container');
      if (container) {
        // 기존 가이드라인 제거
        container.querySelectorAll('.guide').forEach(el => el.remove());
        
        // 50% 중앙선
        const centerLine = document.createElement('div');
        centerLine.className = 'guide';
        centerLine.style.cssText = `
          position: absolute;
          left: 50%;
          top: 0;
          width: 2px;
          height: 100%;
          background: red;
          z-index: 9999;
        `;
        container.appendChild(centerLine);
        
        // 75% 선
        const threeFourthLine = document.createElement('div');
        threeFourthLine.className = 'guide';
        threeFourthLine.style.cssText = `
          position: absolute;
          left: 75%;
          top: 0;
          width: 2px;
          height: 100%;
          background: orange;
          z-index: 9999;
        `;
        container.appendChild(threeFourthLine);
        
        // 90% 선
        const ninetyLine = document.createElement('div');
        ninetyLine.className = 'guide';
        ninetyLine.style.cssText = `
          position: absolute;
          left: 90%;
          top: 0;
          width: 2px;
          height: 100%;
          background: green;
          z-index: 9999;
        `;
        container.appendChild(ninetyLine);
        
        // 라벨 추가
        const labels = [
          { pos: '50%', color: 'red', text: '50% (중앙)' },
          { pos: '75%', color: 'orange', text: '75%' },
          { pos: '90%', color: 'green', text: '90%' }
        ];
        
        labels.forEach(label => {
          const div = document.createElement('div');
          div.className = 'guide';
          div.style.cssText = `
            position: absolute;
            left: ${label.pos};
            bottom: 5px;
            transform: translateX(-50%);
            background: ${label.color};
            color: white;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: bold;
            z-index: 9999;
            border-radius: 3px;
          `;
          div.textContent = label.text;
          container.appendChild(div);
        });
        
        // 메뉴 하이라이트
        const nav = container.querySelector('nav');
        if (nav) {
          nav.style.border = '2px solid blue';
          nav.style.backgroundColor = 'rgba(0,0,255,0.1)';
        }
      }
    });
    
    // 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/menu-position-analysis.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 120 }
    });
    
    console.log('\n📸 스크린샷 저장: menu-position-analysis.png');
    console.log('\n📊 가이드라인 설명:');
    console.log('  🔴 빨간선 = 50% (중앙)');
    console.log('  🟠 주황선 = 75%');
    console.log('  🟢 초록선 = 90% (오른쪽 끝 근처)');
    console.log('  🔵 파란 박스 = 메뉴 위치');
    
    console.log('\n⏰ 30초간 대기...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 분석 완료');
  }
})();