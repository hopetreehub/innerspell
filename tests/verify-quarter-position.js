const { chromium } = require('playwright');

(async () => {
  console.log('🎯 로고 1/4 위치 최종 확인 (서버 재시작 후)\n');
  
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
    console.log('📍 새로 시작된 서버에 접속...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    await page.waitForTimeout(3000);
    
    // CSS 클래스 확인
    const logoClasses = await page.locator('header .container > div').first().getAttribute('class');
    console.log('\n🎨 로고 컨테이너 클래스:');
    console.log(`  ${logoClasses}`);
    
    // 위치 측정
    const position = await page.evaluate(() => {
      const container = document.querySelector('header .container');
      const logoDiv = container?.querySelector('div:first-child');
      const logo = logoDiv?.querySelector('a');
      
      if (!container || !logo) return null;
      
      const containerRect = container.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      
      const containerWidth = containerRect.width;
      const logoCenter = logoRect.left - containerRect.left + (logoRect.width / 2);
      const logoPercent = (logoCenter / containerWidth) * 100;
      
      return {
        containerWidth,
        logoLeft: logoRect.left - containerRect.left,
        logoCenter,
        logoPercent: logoPercent.toFixed(1),
        quarterPosition: containerWidth * 0.25,
        expectedLeft25: 'lg:left-1/4'
      };
    });
    
    console.log('\n📊 측정 결과:');
    console.log(`  컨테이너 너비: ${position?.containerWidth}px`);
    console.log(`  로고 중심: ${position?.logoCenter?.toFixed(1)}px`);
    console.log(`  현재 위치: ${position?.logoPercent}%`);
    console.log(`  목표 위치: 25% (${position?.quarterPosition?.toFixed(1)}px)`);
    
    // 가이드라인 추가
    await page.evaluate(() => {
      const container = document.querySelector('header .container');
      if (container) {
        // 기존 가이드라인 제거
        container.querySelectorAll('.guide-line').forEach(el => el.remove());
        
        // 1/4 위치 표시
        const quarterLine = document.createElement('div');
        quarterLine.className = 'guide-line';
        quarterLine.style.cssText = `
          position: absolute;
          left: 25%;
          top: 0;
          width: 3px;
          height: 100%;
          background-color: #00ff00;
          z-index: 9999;
        `;
        container.appendChild(quarterLine);
        
        // 1/4 위치 라벨
        const quarterLabel = document.createElement('div');
        quarterLabel.style.cssText = `
          position: absolute;
          left: 25%;
          top: 70px;
          transform: translateX(-50%);
          background: #00ff00;
          color: black;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: bold;
          z-index: 9999;
        `;
        quarterLabel.textContent = '25% (1/4)';
        container.appendChild(quarterLabel);
        
        // 로고 현재 위치 표시
        const logo = container.querySelector('a[href="/"]');
        if (logo) {
          const rect = logo.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const center = rect.left - containerRect.left + (rect.width / 2);
          const percent = ((center / containerRect.width) * 100).toFixed(1);
          
          const currentLine = document.createElement('div');
          currentLine.className = 'guide-line';
          currentLine.style.cssText = `
            position: absolute;
            left: ${center}px;
            top: 0;
            width: 3px;
            height: 100%;
            background-color: #ff0000;
            z-index: 9999;
          `;
          container.appendChild(currentLine);
          
          const currentLabel = document.createElement('div');
          currentLabel.style.cssText = `
            position: absolute;
            left: ${center}px;
            top: 10px;
            transform: translateX(-50%);
            background: #ff0000;
            color: white;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
            z-index: 9999;
          `;
          currentLabel.textContent = `현재: ${percent}%`;
          container.appendChild(currentLabel);
        }
      }
    });
    
    // 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/verified-quarter-position.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 120 }
    });
    
    console.log('\n📸 스크린샷 저장: verified-quarter-position.png');
    
    if (position?.logoPercent && parseFloat(position.logoPercent) > 24 && parseFloat(position.logoPercent) < 26) {
      console.log('\n✅ 성공! 로고가 정확히 1/4 위치(25%)에 있습니다!');
    } else {
      console.log('\n⚠️ 로고가 아직 1/4 위치에 정확히 오지 않았습니다.');
      console.log('   서버 재시작이나 캐시 삭제가 필요할 수 있습니다.');
    }
    
    console.log('\n⏰ 확인을 위해 30초간 대기...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 확인 완료');
  }
})();