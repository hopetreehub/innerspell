const { chromium } = require('playwright');

(async () => {
  console.log('🌐 포트 4000 열어서 헤더 레이아웃 확인\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized', '--disable-web-security', '--no-sandbox'],
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: null,
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();

  try {
    console.log('📍 http://localhost:4000 접속 중...');
    console.log('⏳ 서버 시작을 기다리는 중...\n');
    
    // 여러 번 재시도
    let connected = false;
    for (let i = 0; i < 10; i++) {
      try {
        await page.goto('http://localhost:4000', { 
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        connected = true;
        break;
      } catch (e) {
        console.log(`  재시도 ${i + 1}/10...`);
        await page.waitForTimeout(3000);
      }
    }
    
    if (!connected) {
      throw new Error('서버 연결 실패');
    }
    
    console.log('✅ 브라우저가 열렸습니다!\n');
    
    // 헤더에 가이드라인 추가
    await page.evaluate(() => {
      const container = document.querySelector('header .container');
      if (container) {
        // 1/4 위치 표시 (초록선)
        const quarterLine = document.createElement('div');
        quarterLine.style.cssText = `
          position: absolute;
          left: 25%;
          top: 0;
          width: 3px;
          height: 100%;
          background: lime;
          z-index: 9999;
        `;
        container.appendChild(quarterLine);
        
        // 1/4 라벨
        const quarterLabel = document.createElement('div');
        quarterLabel.style.cssText = `
          position: absolute;
          left: 25%;
          bottom: 5px;
          transform: translateX(-50%);
          background: lime;
          color: black;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: bold;
          z-index: 9999;
          border-radius: 3px;
        `;
        quarterLabel.textContent = '25% (1/4 위치)';
        container.appendChild(quarterLabel);
        
        // 중앙선 (빨간선) - 참고용
        const centerLine = document.createElement('div');
        centerLine.style.cssText = `
          position: absolute;
          left: 50%;
          top: 0;
          width: 1px;
          height: 100%;
          background: red;
          opacity: 0.5;
          z-index: 9999;
        `;
        container.appendChild(centerLine);
        
        // 중앙 라벨
        const centerLabel = document.createElement('div');
        centerLabel.style.cssText = `
          position: absolute;
          left: 50%;
          top: 5px;
          transform: translateX(-50%);
          background: red;
          color: white;
          padding: 2px 8px;
          font-size: 10px;
          z-index: 9999;
          border-radius: 3px;
          opacity: 0.7;
        `;
        centerLabel.textContent = '50% (중앙)';
        container.appendChild(centerLabel);
      }
    });
    
    // 스크린샷 저장
    await page.screenshot({
      path: 'tests/screenshots/header-with-guidelines.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 150 }
    });
    
    console.log('📊 헤더 레이아웃 분석:');
    console.log('  🟢 초록선 = 25% 위치 (로고가 있어야 할 위치)');
    console.log('  🔴 빨간선 = 50% 위치 (중앙 - 참고용)');
    console.log('  📍 InnerSpell 로고가 초록선(25%) 위치에 있는지 확인해주세요\n');
    
    console.log('🎯 변경된 레이아웃:');
    console.log('  - 로고: 왼쪽에서 1/4 지점 (25% 위치)');
    console.log('  - 메뉴: 오른쪽 끝');
    console.log('  - 균형: 왼쪽 치우침 제거, 시각적 균형 개선\n');
    
    // 전체 페이지 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/full-page-with-new-header.png',
      fullPage: false
    });
    
    console.log('📸 스크린샷 저장됨:');
    console.log('  - header-with-guidelines.png (가이드라인 포함)');
    console.log('  - full-page-with-new-header.png (전체 페이지)\n');
    
    console.log('🔄 다른 페이지도 확인해보시겠습니까?');
    console.log('  브라우저에서 직접 클릭해서 이동하실 수 있습니다.\n');
    
    console.log('⏰ 브라우저를 2분간 열어둡니다...');
    console.log('💡 브라우저를 닫으려면 Ctrl+C를 누르세요.\n');
    
    await page.waitForTimeout(120000); // 2분 대기
    
  } catch (error) {
    console.error('\n❌ 오류:', error.message);
    console.log('\n🔧 해결 방법:');
    console.log('  1. npm run dev 명령으로 서버를 직접 시작하세요');
    console.log('  2. 서버가 시작된 후 이 스크립트를 다시 실행하세요');
  } finally {
    await browser.close();
    console.log('\n🏁 브라우저를 닫았습니다.');
  }
})();