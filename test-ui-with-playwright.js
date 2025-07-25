const { chromium } = require('playwright');

async function testFirebaseApp() {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  console.log('=== Firebase 앱 UI 테스트 시작 ===\n');
  
  try {
    // 1. 홈페이지 테스트
    console.log('1. 홈페이지 접속 테스트...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    const homeTitle = await page.title();
    console.log(`   - 페이지 타이틀: ${homeTitle}`);
    
    // 홈페이지 스크린샷
    await page.screenshot({ 
      path: 'playwright-test-01-homepage.png',
      fullPage: true 
    });
    console.log('   - 스크린샷 저장: playwright-test-01-homepage.png');
    
    // 홈페이지 주요 요소 확인
    const heroTitle = await page.locator('h1').first().textContent().catch(() => null);
    if (heroTitle) {
      console.log(`   - 메인 타이틀: ${heroTitle}`);
    }
    
    // 2. 로그인 페이지 테스트
    console.log('\n2. 로그인 페이지 접속 테스트...');
    
    // 로그인 링크 찾기
    const loginLink = await page.locator('a[href*="/login"], a:has-text("로그인"), a:has-text("Sign in"), button:has-text("로그인")').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      // 직접 URL로 이동
      await page.goto('http://localhost:4000/login', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
    }
    
    await page.waitForTimeout(2000);
    
    // 로그인 페이지 스크린샷
    await page.screenshot({ 
      path: 'playwright-test-02-login.png',
      fullPage: true 
    });
    console.log('   - 스크린샷 저장: playwright-test-02-login.png');
    
    // Google 로그인 버튼 확인
    const googleButton = await page.locator('button:has-text("Google"), button:has-text("구글"), div:has-text("Sign in with Google")').first();
    const hasGoogleLogin = await googleButton.isVisible().catch(() => false);
    console.log(`   - Google 로그인 버튼: ${hasGoogleLogin ? '있음' : '없음'}`);
    
    // 로그인 폼 요소 확인
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="이메일"], input[placeholder*="Email"]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    
    const hasEmailInput = await emailInput.isVisible().catch(() => false);
    const hasPasswordInput = await passwordInput.isVisible().catch(() => false);
    
    console.log(`   - 이메일 입력 필드: ${hasEmailInput ? '있음' : '없음'}`);
    console.log(`   - 비밀번호 입력 필드: ${hasPasswordInput ? '있음' : '없음'}`);
    
    // 3. 타로 리딩 페이지 테스트
    console.log('\n3. 타로 리딩 페이지 접속 테스트...');
    
    try {
      await page.goto('http://localhost:4000/reading', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      await page.waitForTimeout(2000);
      
      // 타로 리딩 페이지 스크린샷
      await page.screenshot({ 
        path: 'playwright-test-03-reading.png',
        fullPage: true 
      });
      console.log('   - 스크린샷 저장: playwright-test-03-reading.png');
      
      // 타로 리딩 페이지 요소 확인
      const readingTitle = await page.locator('h1, h2').first().textContent().catch(() => null);
      if (readingTitle) {
        console.log(`   - 페이지 타이틀: ${readingTitle}`);
      }
      
      // 질문 입력 필드 확인
      const questionInput = await page.locator('textarea, input[type="text"]').first();
      const hasQuestionInput = await questionInput.isVisible().catch(() => false);
      console.log(`   - 질문 입력 필드: ${hasQuestionInput ? '있음' : '없음'}`);
      
      // 리딩 시작 버튼 확인
      const startButton = await page.locator('button:has-text("시작"), button:has-text("리딩"), button:has-text("Start")').first();
      const hasStartButton = await startButton.isVisible().catch(() => false);
      console.log(`   - 리딩 시작 버튼: ${hasStartButton ? '있음' : '없음'}`);
      
    } catch (error) {
      console.log(`   - 타로 리딩 페이지 접속 실패: ${error.message}`);
      // 오류 페이지 스크린샷
      await page.screenshot({ 
        path: 'playwright-test-03-reading-error.png',
        fullPage: true 
      });
      console.log('   - 오류 스크린샷 저장: playwright-test-03-reading-error.png');
    }
    
    // 4. 추가 페이지 테스트 (커뮤니티)
    console.log('\n4. 커뮤니티 페이지 테스트...');
    
    try {
      await page.goto('http://localhost:4000/community', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'playwright-test-04-community.png',
        fullPage: true 
      });
      console.log('   - 스크린샷 저장: playwright-test-04-community.png');
      
      const communityTitle = await page.locator('h1, h2').first().textContent().catch(() => null);
      if (communityTitle) {
        console.log(`   - 페이지 타이틀: ${communityTitle}`);
      }
    } catch (error) {
      console.log(`   - 커뮤니티 페이지 접속 실패: ${error.message}`);
    }
    
    // 5. 네비게이션 메뉴 확인
    console.log('\n5. 네비게이션 메뉴 확인...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    const navLinks = await page.locator('nav a, header a').all();
    console.log(`   - 네비게이션 링크 수: ${navLinks.length}개`);
    
    for (const link of navLinks) {
      const text = await link.textContent().catch(() => '');
      const href = await link.getAttribute('href').catch(() => '');
      if (text && href) {
        console.log(`   - ${text.trim()}: ${href}`);
      }
    }
    
    console.log('\n=== 테스트 완료 ===');
    console.log('\n생성된 스크린샷 파일:');
    console.log('- playwright-test-01-homepage.png');
    console.log('- playwright-test-02-login.png');
    console.log('- playwright-test-03-reading.png');
    console.log('- playwright-test-04-community.png');
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    // 오류 발생 시 현재 페이지 스크린샷
    await page.screenshot({ 
      path: 'playwright-test-error.png',
      fullPage: true 
    });
    console.log('오류 스크린샷 저장: playwright-test-error.png');
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testFirebaseApp().catch(console.error);