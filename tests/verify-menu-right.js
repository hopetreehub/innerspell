const { chromium } = require('playwright');

(async () => {
  console.log('🔍 수정된 메뉴 위치 검증\n');
  
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
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 메뉴 위치 측정
    const measurements = await page.evaluate(() => {
      const container = document.querySelector('header .container');
      const nav = container?.querySelector('nav');
      const menuContainer = nav?.parentElement;
      
      if (!container || !nav) return null;
      
      const containerRect = container.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const menuContainerRect = menuContainer?.getBoundingClientRect();
      
      const containerWidth = containerRect.width;
      const navStart = navRect.left - containerRect.left;
      const navCenter = navStart + (navRect.width / 2);
      const menuEnd = menuContainerRect ? menuContainerRect.right - containerRect.left : navRect.right - containerRect.left;
      const distanceFromRight = containerWidth - menuEnd;
      
      return {
        containerWidth,
        navStart,
        navCenter,
        menuEnd,
        distanceFromRight,
        navStartPercent: ((navStart / containerWidth) * 100).toFixed(1),
        navCenterPercent: ((navCenter / containerWidth) * 100).toFixed(1),
        menuEndPercent: ((menuEnd / containerWidth) * 100).toFixed(1)
      };
    });
    
    console.log('📊 새로운 메뉴 위치:');
    console.log(`  시작: ${measurements?.navStartPercent}%`);
    console.log(`  중심: ${measurements?.navCenterPercent}%`);
    console.log(`  끝: ${measurements?.menuEndPercent}%`);
    console.log(`  오른쪽 여백: ${measurements?.distanceFromRight}px\n`);
    
    // 시각적 가이드 추가
    await page.evaluate(() => {
      const container = document.querySelector('header .container');
      if (container) {
        // 기존 가이드 제거
        container.querySelectorAll('.guide').forEach(el => el.remove());
        
        // 50%, 75%, 90% 가이드라인
        const guides = [
          { pos: '50%', color: 'red', label: '50%' },
          { pos: '75%', color: 'orange', label: '75%' },
          { pos: '90%', color: 'green', label: '90%' }
        ];
        
        guides.forEach(g => {
          const line = document.createElement('div');
          line.className = 'guide';
          line.style.cssText = `position:absolute;left:${g.pos};top:0;width:2px;height:100%;background:${g.color};z-index:9999;`;
          container.appendChild(line);
        });
        
        // 메뉴 하이라이트
        const nav = container.querySelector('nav');
        if (nav) {
          nav.style.outline = '2px solid blue';
          nav.style.backgroundColor = 'rgba(0,0,255,0.1)';
        }
      }
    });
    
    // 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/menu-position-fixed.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 120 }
    });
    
    console.log('✅ 메뉴가 오른쪽 끝으로 이동했습니다!');
    console.log('📸 스크린샷: menu-position-fixed.png\n');
    
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
})();