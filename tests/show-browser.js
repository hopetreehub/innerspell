const { chromium } = require('playwright');

(async () => {
  console.log('🌐 Playwright Chromium으로 포트 4000 열기\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: [
      '--start-maximized',
      '--disable-web-security',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: null, // 전체 화면 사용
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();

  try {
    console.log('📍 http://localhost:4000 접속 중...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ 브라우저가 열렸습니다!');
    console.log('\n🎯 확인할 수 있는 내용:');
    console.log('  📱 새로운 헤더 레이아웃 (로고 중앙, 메뉴 우측)');
    console.log('  🏠 메인 홈페이지 디자인');
    console.log('  🎨 전체적인 UI/UX');
    console.log('  📊 반응형 디자인');
    
    console.log('\n🧭 네비게이션 메뉴:');
    console.log('  - 홈');
    console.log('  - 타로리딩');
    console.log('  - 타로카드');
    console.log('  - 꿈해몽');
    console.log('  - 블로그');
    console.log('  - 커뮤니티');
    
    console.log('\n🔄 페이지 이동 테스트...');
    
    // 각 페이지를 순서대로 방문
    const pages = [
      { name: '홈', url: '/', delay: 3000 },
      { name: '타로리딩', url: '/reading', delay: 3000 },
      { name: '백과사전', url: '/encyclopedia', delay: 3000 },
      { name: '블로그', url: '/blog', delay: 3000 },
      { name: '커뮤니티', url: '/community', delay: 3000 },
      { name: '로그인', url: '/sign-in', delay: 3000 },
      { name: '홈 (복귀)', url: '/', delay: 5000 }
    ];
    
    for (const pageInfo of pages) {
      console.log(`📄 ${pageInfo.name} 페이지로 이동...`);
      await page.goto(`http://localhost:4000${pageInfo.url}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      
      // 페이지 타이틀 확인
      const title = await page.title();
      console.log(`   ✅ ${pageInfo.name}: ${title}`);
      
      // 지정된 시간만큼 대기 (사용자가 확인할 수 있도록)
      await page.waitForTimeout(pageInfo.delay);
    }
    
    console.log('\n🎉 모든 페이지 투어 완료!');
    console.log('💡 브라우저를 닫으려면 터미널에서 Ctrl+C를 누르세요.');
    
    // 브라우저를 열어둔 채로 대기 (사용자가 직접 확인할 수 있도록)
    console.log('\n⏰ 브라우저를 2분간 열어둡니다...');
    await page.waitForTimeout(120000); // 2분 대기
    
  } catch (error) {
    console.error('\n❌ 브라우저 열기 중 오류:', error.message);
  } finally {
    console.log('\n🔚 브라우저를 닫습니다...');
    await browser.close();
  }
})();