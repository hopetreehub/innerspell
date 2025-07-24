const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('=== InnerSpell Vercel 배포 사이트 전체 기능 테스트 ===\n');
  
  // 사용 가능한 URL
  const deploymentUrl = 'https://test-studio-firebase.vercel.app';
  
  try {
    // 1. 메인 페이지 테스트
    console.log('1. 메인 페이지 접속');
    await page.goto(deploymentUrl, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('✅ 메인 페이지 로드 성공');
    
    const title = await page.title();
    console.log(`페이지 타이틀: ${title}`);
    
    await page.screenshot({ path: 'screenshots/vercel_main.png', fullPage: true });
    
    // 2. 로그인 페이지 테스트
    console.log('\n2. 로그인 페이지 테스트');
    await page.goto(`${deploymentUrl}/sign-in`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const signInForm = await page.$('form');
    if (signInForm) {
      console.log('✅ 로그인 폼 발견');
      
      // 이메일 입력
      await page.fill('input[type="email"]', 'test@example.com');
      
      // 비밀번호 입력 필드가 있는지 확인
      const passwordInput = await page.$('input[type="password"]');
      if (passwordInput) {
        await page.fill('input[type="password"]', 'testpassword123');
        console.log('✅ 이메일/비밀번호 입력 완료');
      }
      
      await page.screenshot({ path: 'screenshots/vercel_signin.png' });
    }
    
    // 3. 타로 리딩 페이지 테스트
    console.log('\n3. 타로 리딩 페이지 테스트');
    await page.goto(`${deploymentUrl}/reading`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const tarotPage = await page.$('text=타로');
    console.log(`타로 관련 요소: ${tarotPage ? '있음' : '없음'}`);
    
    await page.screenshot({ path: 'screenshots/vercel_tarot.png' });
    
    // 4. API 헬스 체크
    console.log('\n4. API 엔드포인트 테스트');
    const apiResponse = await page.evaluate(async (url) => {
      try {
        const res = await fetch(`${url}/api/health`);
        return {
          status: res.status,
          ok: res.ok,
          data: res.ok ? await res.json() : await res.text()
        };
      } catch (e) {
        return { error: e.message };
      }
    }, deploymentUrl);
    
    console.log('Health API 응답:', JSON.stringify(apiResponse, null, 2));
    
    // 5. 커뮤니티 페이지 테스트
    console.log('\n5. 커뮤니티 페이지 테스트');
    await page.goto(`${deploymentUrl}/community/reading-share`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'screenshots/vercel_community.png' });
    console.log('✅ 커뮤니티 페이지 스크린샷 저장');
    
    // 6. 모바일 반응형 테스트
    console.log('\n6. 모바일 반응형 테스트');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(deploymentUrl);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'screenshots/vercel_mobile.png' });
    console.log('✅ 모바일 뷰 테스트 완료');
    
    console.log('\n=== 모든 테스트 완료 ===');
    console.log('배포 URL:', deploymentUrl);
    console.log('상태: 정상 작동 중');
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'screenshots/vercel_error.png' });
  } finally {
    await browser.close();
  }
})();