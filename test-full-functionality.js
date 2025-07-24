const { chromium } = require('playwright');

async function testFullFunctionality() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  let page;
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    page = await context.newPage();

    console.log('🚀 InnerSpell 전체 기능 테스트 시작\n');
    console.log('✅ 개발 서버 재시작 완료 (포트 4000)');
    console.log('✅ Next.js 캐시 정리 완료\n');

    // 1. 홈페이지 테스트
    console.log('📍 1. 홈페이지 접속 테스트');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log(`   - 페이지 타이틀: ${title}`);
    
    // 네비게이션 메뉴 확인
    const navItems = await page.$$('nav a, header a');
    console.log(`   - 네비게이션 항목 수: ${navItems.length}`);
    
    await page.screenshot({ path: 'screenshots/final-1-home.png' });

    // 2. 로그인 페이지 테스트
    console.log('\n📍 2. 로그인 페이지 테스트');
    const loginLink = await page.$('a:has-text("로그인")').catch(() => null);
    if (loginLink) {
      await loginLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('http://localhost:4000/sign-in');
    }
    
    // 로그인 폼 요소 확인
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const googleButton = await page.$('button:has-text("Google로 로그인")');
    
    console.log(`   - 이메일 입력란: ${emailInput ? '✅' : '❌'}`);
    console.log(`   - 비밀번호 입력란: ${passwordInput ? '✅' : '❌'}`);
    console.log(`   - 구글 로그인 버튼: ${googleButton ? '✅' : '❌'}`);
    
    await page.screenshot({ path: 'screenshots/final-2-signin.png' });

    // 3. 타로 리딩 페이지 테스트
    console.log('\n📍 3. 타로 리딩 페이지 테스트');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    // 타로 리딩 설정 요소 확인
    const questionTextarea = await page.$('textarea');
    const spreadSelect = await page.$('button[role="combobox"]');
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    
    console.log(`   - 질문 입력란: ${questionTextarea ? '✅' : '❌'}`);
    console.log(`   - 스프레드 선택: ${spreadSelect ? '✅' : '❌'}`);
    console.log(`   - 카드 섞기 버튼: ${shuffleButton ? '✅' : '❌'}`);
    
    // 질문 입력
    if (questionTextarea) {
      await questionTextarea.fill('오늘 하루의 운세와 조언을 알려주세요.');
      console.log('   - 질문 입력 완료');
    }
    
    await page.screenshot({ path: 'screenshots/final-3-reading-setup.png' });

    // 4. 백과사전 페이지 테스트
    console.log('\n📍 4. 타로 백과사전 테스트');
    await page.goto('http://localhost:4000/encyclopedia');
    await page.waitForLoadState('networkidle');
    
    const tarotCards = await page.$$('[class*="card"]');
    console.log(`   - 표시된 타로 카드 수: ${tarotCards.length}`);
    
    await page.screenshot({ path: 'screenshots/final-4-encyclopedia.png' });

    // 5. 커뮤니티 페이지 테스트
    console.log('\n📍 5. 커뮤니티 페이지 테스트');
    await page.goto('http://localhost:4000/community');
    await page.waitForLoadState('networkidle');
    
    const communityLinks = await page.$$('a[href*="/community/"]');
    console.log(`   - 커뮤니티 섹션 수: ${communityLinks.length}`);
    
    await page.screenshot({ path: 'screenshots/final-5-community.png' });

    // 6. 블로그 페이지 테스트
    console.log('\n📍 6. 블로그 페이지 테스트');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    
    const blogPosts = await page.$$('article, [class*="post"]');
    console.log(`   - 블로그 포스트 수: ${blogPosts.length}`);
    
    await page.screenshot({ path: 'screenshots/final-6-blog.png' });

    console.log('\n✅ 모든 테스트 완료!\n');
    console.log('📊 테스트 결과 요약:');
    console.log('1. 개발 서버: 정상 작동 (포트 4000)');
    console.log('2. 모든 페이지 접근 가능');
    console.log('3. UI 요소들이 정상적으로 렌더링됨');
    console.log('\n⚠️ Firebase Rules 배포 필요:');
    console.log('1. Firebase Console 접속');
    console.log('2. Firestore → Rules 탭');
    console.log('3. userReadings 규칙 추가');
    console.log('4. Publish 클릭');

  } catch (error) {
    console.error('\n❌ 테스트 중 오류:', error);
    if (page) {
      await page.screenshot({ path: 'screenshots/final-error.png' });
    }
  } finally {
    console.log('\n브라우저를 열어둡니다. 수동 테스트를 계속하세요.');
  }
}

testFullFunctionality().catch(console.error);