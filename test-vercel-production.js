const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });
  
  let page;
  try {
    const context = await browser.newContext();
    page = await context.newPage();
    
    console.log('=== Vercel 프로덕션 환경 테스트 ===\n');
    
    // Vercel 배포 URL 추정 (프로젝트명 기반)
    const vercelUrls = [
      'https://test-studio-firebase.vercel.app',
      'https://innerspell.vercel.app',
      'https://innerspell-an7ce.vercel.app',
      'https://innerspell-an7ce.firebaseapp.com'
    ];
    
    let workingUrl = null;
    
    // URL 테스트
    console.log('1. Vercel 배포 URL 확인 중...');
    for (const url of vercelUrls) {
      try {
        console.log(`   테스트: ${url}`);
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        if (response && response.ok()) {
          workingUrl = url;
          console.log(`✓ 작동하는 URL 발견: ${url}`);
          break;
        }
      } catch (e) {
        console.log(`   ❌ 접속 실패: ${e.message.split('\n')[0]}`);
      }
    }
    
    if (!workingUrl) {
      console.log('\n⚠️ Vercel URL을 찾을 수 없습니다.');
      console.log('정확한 URL을 확인해주세요:');
      console.log('- Vercel 대시보드에서 확인');
      console.log('- git 저장소 이름: innerspell');
      console.log('- 프로젝트 이름: test-studio-firebase');
      return;
    }
    
    // 홈페이지 테스트
    console.log('\n2. 홈페이지 로딩 테스트...');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/vercel_01_homepage.png' });
    
    const title = await page.title();
    console.log(`✓ 페이지 제목: ${title}`);
    
    // 주요 요소 확인
    console.log('\n3. 주요 요소 확인...');
    const elements = {
      navbar: await page.isVisible('nav'),
      loginBtn: await page.isVisible('text=로그인'),
      tarotLink: await page.isVisible('text=/타로|AI 타로/i'),
      communityLink: await page.isVisible('text=커뮤니티')
    };
    
    console.log(`- 네비게이션: ${elements.navbar ? '✓' : '❌'}`);
    console.log(`- 로그인 버튼: ${elements.loginBtn ? '✓' : '❌'}`);
    console.log(`- 타로 링크: ${elements.tarotLink ? '✓' : '❌'}`);
    console.log(`- 커뮤니티: ${elements.communityLink ? '✓' : '❌'}`);
    
    // 타로 읽기 페이지 테스트
    console.log('\n4. 타로 읽기 페이지 테스트...');
    await page.goto(`${workingUrl}/reading`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/vercel_02_reading.png' });
    
    const readingElements = {
      questionInput: await page.isVisible('textarea'),
      shuffleBtn: await page.isVisible('button:has-text("카드 섞기")'),
      spreadSelect: await page.isVisible('select, [role="combobox"]')
    };
    
    console.log(`- 질문 입력란: ${readingElements.questionInput ? '✓' : '❌'}`);
    console.log(`- 카드 섞기 버튼: ${readingElements.shuffleBtn ? '✓' : '❌'}`);
    console.log(`- 스프레드 선택: ${readingElements.spreadSelect ? '✓' : '❌'}`);
    
    // Firebase 연결 확인
    console.log('\n5. Firebase 연결 상태 확인...');
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.text().includes('Firebase')) {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (consoleMessages.length > 0) {
      console.log('Firebase 관련 콘솔 메시지:');
      consoleMessages.forEach(msg => console.log(`  - ${msg}`));
    }
    
    // 로그인 페이지 테스트
    console.log('\n6. 로그인 페이지 테스트...');
    if (elements.loginBtn) {
      await page.click('text=로그인');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/vercel_03_login.png' });
      
      const authElements = {
        emailInput: await page.isVisible('input[type="email"]'),
        passwordInput: await page.isVisible('input[type="password"]'),
        googleBtn: await page.isVisible('text=/Google|구글/i')
      };
      
      console.log(`- 이메일 입력: ${authElements.emailInput ? '✓' : '❌'}`);
      console.log(`- 비밀번호 입력: ${authElements.passwordInput ? '✓' : '❌'}`);
      console.log(`- Google 로그인: ${authElements.googleBtn ? '✓' : '❌'}`);
    }
    
    console.log('\n=== 테스트 완료 ===');
    console.log(`\n✅ 프로덕션 URL: ${workingUrl}`);
    console.log('\n다음 단계:');
    console.log('1. 실제 사용자 계정으로 로그인 테스트');
    console.log('2. 타로 리딩 전체 플로우 테스트');
    console.log('3. 커뮤니티 기능 테스트');
    console.log('4. 공유 기능 테스트');
    
  } catch (error) {
    console.error('테스트 중 오류:', error.message);
    if (page) {
      await page.screenshot({ path: 'screenshots/vercel_error.png' });
    }
  }
})();