const { chromium } = require('playwright');

(async () => {
  console.log('🌐 Chromium 브라우저로 포트 4000 열기 (7월 22일 최신 상태)\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null
  });
  
  const page = await context.newPage();

  try {
    console.log('📍 http://localhost:4000 접속 중...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const title = await page.title();
    console.log('✅ 페이지 로드 완료!');
    console.log('📄 페이지 타이틀:', title);
    console.log('📍 현재 URL:', page.url());
    
    // 주요 요소 확인
    const heroText = await page.locator('h1').first().textContent().catch(() => '');
    if (heroText) {
      console.log('🎯 Hero 텍스트:', heroText);
    }
    
    // 네비게이션 메뉴 확인
    const navLinks = await page.locator('nav a, header a').allTextContents();
    if (navLinks.length > 0) {
      console.log('🧭 네비게이션 메뉴:', navLinks.join(', '));
    }
    
    console.log('\n🎉 7월 22일 최신 기능들:');
    console.log('- 🔥 리딩 경험 공유 커뮤니티 (완전 구현)');
    console.log('- 🔥 Firebase Firestore 통합');
    console.log('- 📝 자체 제작 블로그 시스템');
    console.log('- 🔮 타로 리딩 + 백과사전');
    console.log('- 👤 사용자 인증 시스템');
    
    console.log('\n💡 이용 가능한 페이지들:');
    console.log('- 홈: http://localhost:4000');
    console.log('- 블로그: http://localhost:4000/blog');
    console.log('- 타로 리딩: http://localhost:4000/reading');
    console.log('- 백과사전: http://localhost:4000/encyclopedia');
    console.log('- 커뮤니티: http://localhost:4000/community');
    console.log('- 리딩 공유: http://localhost:4000/community/reading-share');
    console.log('- 로그인: http://localhost:4000/sign-in');
    console.log('- 관리자: http://localhost:4000/admin');
    
    console.log('\n🔧 브라우저를 열어둡니다. 자유롭게 탐색하세요!');
    console.log('📌 Ctrl+C로 종료할 수 있습니다.\n');
    
    // 브라우저 종료 대기
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    console.log('\n⚠️  페이지 로드 중 오류가 있었지만 브라우저는 열어둡니다.');
    console.log('📍 주소창에 직접 http://localhost:4000 을 입력해보세요.');
    console.log('🔧 서버가 실행 중인지 확인해주세요: npm run dev');
    console.log('\n🔧 브라우저를 열어둡니다. Ctrl+C로 종료하세요.\n');
    
    await new Promise(() => {});
  }
})();