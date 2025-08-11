const { chromium } = require('playwright');

(async () => {
  console.log('📏 메뉴 위치 정밀 측정\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized'],
    slowMo: 200
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
    
    // 상세 측정
    const measurements = await page.evaluate(() => {
      const header = document.querySelector('header');
      const container = header?.querySelector('.container');
      const logo = container?.querySelector('a[href="/"]');
      const navSection = container?.querySelector('.ml-auto');
      const nav = navSection?.querySelector('nav');
      
      if (!container || !nav) return null;
      
      const containerRect = container.getBoundingClientRect();
      const logoRect = logo?.getBoundingClientRect();
      const navSectionRect = navSection?.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      
      // 각 요소의 위치 계산
      const containerWidth = containerRect.width;
      const logoLeft = logoRect ? logoRect.left - containerRect.left : 0;
      const logoCenter = logoRect ? logoLeft + (logoRect.width / 2) : 0;
      const navSectionStart = navSectionRect ? navSectionRect.left - containerRect.left : 0;
      const navStart = navRect.left - containerRect.left;
      const navEnd = navRect.right - containerRect.left;
      const distanceFromRight = containerWidth - navEnd;
      
      return {
        containerWidth,
        logoPosition: {
          left: logoLeft,
          center: logoCenter,
          centerPercent: ((logoCenter / containerWidth) * 100).toFixed(1)
        },
        navPosition: {
          start: navStart,
          end: navEnd,
          startPercent: ((navStart / containerWidth) * 100).toFixed(1),
          endPercent: ((navEnd / containerWidth) * 100).toFixed(1)
        },
        spacing: {
          logoToNav: navStart - (logoRect ? logoRect.right - containerRect.left : 0),
          navToRightEdge: distanceFromRight
        }
      };
    });
    
    console.log('📊 측정 결과:');
    console.log('\n🏷️ 로고 위치:');
    console.log(`  중심: ${measurements?.logoPosition.centerPercent}% (목표: 25%)`);
    
    console.log('\n📋 메뉴 위치:');
    console.log(`  시작: ${measurements?.navPosition.startPercent}%`);
    console.log(`  끝: ${measurements?.navPosition.endPercent}%`);
    
    console.log('\n📐 간격:');
    console.log(`  로고→메뉴: ${measurements?.spacing.logoToNav}px`);
    console.log(`  메뉴→오른쪽: ${measurements?.spacing.navToRightEdge}px`);
    
    // 시각적 표시
    await page.evaluate(() => {
      const container = document.querySelector('header .container');
      if (!container) return;
      
      // 기존 가이드 제거
      document.querySelectorAll('.measurement-guide').forEach(el => el.remove());
      
      // 가이드라인 추가
      const guides = [
        { pos: '25%', color: 'blue', label: '로고 중심(25%)' },
        { pos: '50%', color: 'gray', label: '중앙(50%)' },
        { pos: '75%', color: 'orange', label: '75%' },
        { pos: '100%', color: 'red', label: '끝(100%)' }
      ];
      
      guides.forEach(g => {
        const line = document.createElement('div');
        line.className = 'measurement-guide';
        line.style.cssText = `
          position:absolute;
          left:${g.pos};
          top:0;
          width:2px;
          height:100%;
          background:${g.color};
          z-index:9999;
        `;
        
        const label = document.createElement('div');
        label.style.cssText = `
          position:absolute;
          left:${g.pos};
          top:100%;
          transform:translateX(-50%);
          background:${g.color};
          color:white;
          padding:2px 6px;
          font-size:12px;
          white-space:nowrap;
          z-index:9999;
        `;
        label.textContent = g.label;
        
        container.appendChild(line);
        container.appendChild(label);
      });
      
      // 요소 하이라이트
      const logo = container.querySelector('a[href="/"]');
      const nav = container.querySelector('nav');
      
      if (logo) {
        logo.style.outline = '2px solid blue';
        logo.style.backgroundColor = 'rgba(0,0,255,0.1)';
      }
      
      if (nav) {
        nav.style.outline = '2px solid green';
        nav.style.backgroundColor = 'rgba(0,255,0,0.1)';
      }
    });
    
    // 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/menu-position-measured.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 150 }
    });
    
    console.log('\n📸 스크린샷 저장: menu-position-measured.png');
    
    // 결론
    const endPercent = parseFloat(measurements?.navPosition.endPercent || 0);
    if (endPercent > 95) {
      console.log('\n✅ 메뉴가 성공적으로 오른쪽 끝에 배치되었습니다!');
    } else {
      console.log('\n⚠️ 메뉴가 아직 오른쪽 끝에 완전히 도달하지 않았습니다.');
      console.log(`   현재: ${endPercent}%, 목표: >95%`);
    }
    
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
})();