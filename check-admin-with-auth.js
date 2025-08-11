const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Admin 페이지 접근 시도...');
  
  try {
    // 먼저 홈페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('홈페이지 로드 완료');
    await page.waitForTimeout(2000);

    // Admin 페이지로 직접 이동 시도
    console.log('\nAdmin 페이지로 직접 이동 시도...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // 현재 URL 확인
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('❌ Admin 페이지가 로그인 페이지로 리다이렉트됩니다.');
      console.log('   → 인증이 필요한 보호된 페이지입니다.');
      
      // 로그인 페이지 스크린샷
      await page.screenshot({ 
        path: 'admin-redirected-to-login.png',
        fullPage: true 
      });
      console.log('로그인 페이지 스크린샷 저장: admin-redirected-to-login.png');

      // 테스트 계정으로 로그인 시도
      console.log('\n테스트 계정으로 로그인 시도...');
      
      // 이메일 입력
      await page.fill('input[type="email"]', 'test@example.com');
      await page.waitForTimeout(500);
      
      // 비밀번호 입력
      await page.fill('input[type="password"]', 'test123456');
      await page.waitForTimeout(500);
      
      // 로그인 버튼 클릭
      await page.click('button:has-text("로그인")');
      console.log('로그인 버튼 클릭');
      
      // 로그인 후 대기
      await page.waitForTimeout(5000);
      
      // 로그인 후 URL 확인
      const afterLoginUrl = page.url();
      console.log(`로그인 후 URL: ${afterLoginUrl}`);
      
      if (afterLoginUrl.includes('/admin')) {
        console.log('✅ Admin 페이지로 성공적으로 이동했습니다.');
        
        // Admin 페이지 스크린샷
        await page.screenshot({ 
          path: 'admin-page-after-login.png',
          fullPage: true 
        });
        console.log('Admin 페이지 스크린샷 저장: admin-page-after-login.png');
      } else {
        console.log('❌ 로그인 후에도 Admin 페이지로 이동하지 못했습니다.');
        console.log('   → 권한이 없거나 계정 정보가 올바르지 않을 수 있습니다.');
      }
      
    } else if (currentUrl.includes('/admin')) {
      console.log('✅ Admin 페이지가 정상적으로 로드되었습니다.');
      
      // Admin 페이지 내용 확인
      const pageContent = await page.content();
      
      // 실시간 모니터링 요소 확인
      const hasMonitoring = pageContent.includes('실시간 모니터링') || 
                           pageContent.includes('Real-time Monitoring');
      const hasStats = pageContent.includes('사용 통계') || 
                      pageContent.includes('Usage Statistics');
      
      console.log(`\n페이지 구성 요소:`);
      console.log(`- 실시간 모니터링: ${hasMonitoring ? '있음' : '없음'}`);
      console.log(`- 사용 통계: ${hasStats ? '있음' : '없음'}`);
      
      // Admin 페이지 스크린샷
      await page.screenshot({ 
        path: 'admin-page-direct-access.png',
        fullPage: true 
      });
      console.log('\nAdmin 페이지 스크린샷 저장: admin-page-direct-access.png');
    }

    // 개발자 도구 네트워크 탭 정보 수집
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('firebase') || 
          response.url().includes('firestore') ||
          response.url().includes('api')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          type: response.request().resourceType()
        });
      }
    });

    // 페이지 새로고침하여 네트워크 요청 관찰
    console.log('\n페이지 새로고침하여 네트워크 활동 관찰...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    if (responses.length > 0) {
      console.log('\nFirebase/API 관련 네트워크 요청:');
      responses.slice(0, 10).forEach(res => {
        console.log(`- ${res.status} ${res.type}: ${res.url.substring(0, 80)}...`);
      });
    }

  } catch (error) {
    console.error('페이지 확인 중 오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  // 브라우저를 열어둔 상태로 10초 대기
  console.log('\n브라우저를 10초간 열어둡니다...');
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('검사 완료');
})();