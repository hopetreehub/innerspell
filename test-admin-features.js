const { chromium } = require('playwright');

async function testAdminFeatures() {
  console.log('🔍 관리자 대시보드 기능 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 관리자 대시보드 접속 테스트
    console.log('\n1️⃣ 관리자 대시보드 접속 테스트');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 로그인 페이지 확인
    const isLoginPage = await page.locator('text=관리자 로그인').count() > 0 ||
                       await page.locator('text=Admin Login').count() > 0 ||
                       await page.locator('input[type="email"]').count() > 0;
    
    console.log(`✅ 로그인 페이지 표시 여부: ${isLoginPage}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'screenshots/admin-login-page.png',
      fullPage: true 
    });
    console.log('📸 로그인 페이지 스크린샷 저장: screenshots/admin-login-page.png');
    
    // 페이지 요소 분석
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const loginButton = await page.locator('button:has-text("로그인"), button:has-text("Sign in"), button:has-text("Login")').count();
    
    console.log(`   - 이메일 입력 필드: ${emailInput > 0 ? '있음' : '없음'}`);
    console.log(`   - 비밀번호 입력 필드: ${passwordInput > 0 ? '있음' : '없음'}`);
    console.log(`   - 로그인 버튼: ${loginButton > 0 ? '있음' : '없음'}`);
    
    // 2. 사용통계 탭 직접 접속 테스트
    console.log('\n2️⃣ 사용통계 탭 직접 접속 테스트');
    await page.goto('http://localhost:4000/admin?tab=usage-stats', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 페이지 로드 상태 확인
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`   - 페이지 제목: ${pageTitle}`);
    console.log(`   - 현재 URL: ${pageUrl}`);
    
    // 로그인 리다이렉트 확인
    const redirectedToLogin = pageUrl.includes('/login') || 
                             await page.locator('text=로그인').count() > 0;
    console.log(`   - 로그인 페이지로 리다이렉트: ${redirectedToLogin}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'screenshots/admin-usage-stats-attempt.png',
      fullPage: true 
    });
    console.log('📸 사용통계 탭 접근 시도 스크린샷 저장: screenshots/admin-usage-stats-attempt.png');
    
    // 3. 실시간 모니터링 탭 직접 접속 테스트
    console.log('\n3️⃣ 실시간 모니터링 탭 직접 접속 테스트');
    await page.goto('http://localhost:4000/admin?tab=real-time-monitoring', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 페이지 로드 상태 확인
    const monitoringPageTitle = await page.title();
    const monitoringPageUrl = page.url();
    console.log(`   - 페이지 제목: ${monitoringPageTitle}`);
    console.log(`   - 현재 URL: ${monitoringPageUrl}`);
    
    // 로그인 리다이렉트 확인
    const monitoringRedirectedToLogin = monitoringPageUrl.includes('/login') || 
                                       await page.locator('text=로그인').count() > 0;
    console.log(`   - 로그인 페이지로 리다이렉트: ${monitoringRedirectedToLogin}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'screenshots/admin-realtime-monitoring-attempt.png',
      fullPage: true 
    });
    console.log('📸 실시간 모니터링 탭 접근 시도 스크린샷 저장: screenshots/admin-realtime-monitoring-attempt.png');
    
    // 4. 관리자 로그인 시도 (테스트 계정)
    console.log('\n4️⃣ 관리자 로그인 시도 (테스트 계정)');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 테스트 관리자 계정으로 로그인 시도
    if (await page.locator('input[type="email"]').count() > 0) {
      await page.fill('input[type="email"]', 'test@admin.com');
      await page.fill('input[type="password"]', 'testpassword123');
      
      await page.screenshot({ 
        path: 'screenshots/admin-login-filled.png',
        fullPage: true 
      });
      console.log('📸 로그인 정보 입력 후 스크린샷 저장: screenshots/admin-login-filled.png');
      
      // 로그인 버튼 클릭
      const loginBtn = page.locator('button:has-text("로그인"), button:has-text("Sign in"), button:has-text("Login")').first();
      if (await loginBtn.count() > 0) {
        await loginBtn.click();
        console.log('   - 로그인 버튼 클릭 완료');
        
        // 로그인 결과 대기
        await page.waitForTimeout(3000);
        
        // 로그인 후 상태 확인
        const afterLoginUrl = page.url();
        console.log(`   - 로그인 후 URL: ${afterLoginUrl}`);
        
        await page.screenshot({ 
          path: 'screenshots/admin-after-login-attempt.png',
          fullPage: true 
        });
        console.log('📸 로그인 시도 후 스크린샷 저장: screenshots/admin-after-login-attempt.png');
      }
    }
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: 'screenshots/admin-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testAdminFeatures().catch(console.error);