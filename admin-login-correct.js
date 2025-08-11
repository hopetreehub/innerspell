const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Admin 페이지 로그인 테스트 시작...');
  
  try {
    // 로그인 페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('로그인 페이지 로드 완료');
    await page.waitForTimeout(2000);

    // 관리자 계정으로 로그인
    console.log('\n관리자 계정으로 로그인 시도...');
    console.log('이메일: admin@example.com');
    
    // name 속성으로 이메일 입력
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.waitForTimeout(500);
    
    // name 속성으로 비밀번호 입력
    await page.fill('input[name="password"]', 'admin123456');
    await page.waitForTimeout(500);
    
    // 로그인 전 스크린샷
    await page.screenshot({ 
      path: 'admin-login-form.png'
    });
    console.log('로그인 폼 스크린샷 저장: admin-login-form.png');
    
    // "로그인" 텍스트가 있는 버튼 클릭
    await page.click('button:has-text("로그인"):not(:has-text("이메일"))');
    console.log('로그인 버튼 클릭');
    
    // 로그인 처리 대기
    await page.waitForTimeout(5000);
    
    // 현재 URL 확인
    const afterLoginUrl = page.url();
    console.log(`\n로그인 후 URL: ${afterLoginUrl}`);
    
    // 로그인 실패 시 오류 메시지 확인
    if (afterLoginUrl.includes('/sign-in')) {
      console.log('❌ 로그인에 실패했습니다.');
      
      // 오류 메시지 찾기
      const errorTexts = await page.locator('text=/오류|에러|잘못|Invalid|incorrect/i').allTextContents();
      if (errorTexts.length > 0) {
        console.log('오류 메시지:', errorTexts.join(', '));
      }
      
      // 개발 환경 테스트 계정 시도
      console.log('\n개발 환경 테스트 계정으로 재시도...');
      
      // 폼 초기화
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="password"]', '');
      
      // 개발 환경 기본 계정
      await page.fill('input[name="email"]', 'test@test.com');
      await page.fill('input[name="password"]', 'testtest');
      
      await page.screenshot({ 
        path: 'dev-login-form.png'
      });
      
      await page.click('button:has-text("로그인"):not(:has-text("이메일"))');
      console.log('개발 계정으로 로그인 시도');
      
      await page.waitForTimeout(5000);
      
      const devLoginUrl = page.url();
      console.log(`개발 계정 로그인 후 URL: ${devLoginUrl}`);
    }
    
    // 로그인 성공 시 admin 페이지로 이동
    if (!page.url().includes('/sign-in')) {
      console.log('✅ 로그인 성공!');
      
      // Admin 페이지로 이동
      console.log('\nAdmin 페이지로 이동 중...');
      await page.goto('https://test-studio-firebase.vercel.app/admin', {
        waitUntil: 'networkidle'
      });
      
      await page.waitForTimeout(3000);
      
      const adminUrl = page.url();
      console.log(`Admin 페이지 URL: ${adminUrl}`);
      
      if (adminUrl.includes('/admin')) {
        console.log('✅ Admin 페이지 접근 성공!');
        
        // Admin 대시보드 스크린샷
        await page.screenshot({ 
          path: 'admin-dashboard-full.png',
          fullPage: true 
        });
        console.log('Admin 대시보드 스크린샷 저장: admin-dashboard-full.png');
        
        // 실시간 모니터링 탭 확인
        console.log('\n실시간 모니터링 탭 클릭...');
        const monitoringTab = await page.locator('button[role="tab"]:has-text("실시간")').or(page.locator('button[role="tab"]:has-text("실시간 모니터링")'));
        
        if (await monitoringTab.count() > 0) {
          await monitoringTab.first().click();
          console.log('실시간 모니터링 탭 클릭 완료');
          await page.waitForTimeout(3000);
          
          // 컴포넌트 로딩 대기
          await page.waitForSelector('text=/컴포넌트 로딩 중|Loading/', { 
            state: 'hidden',
            timeout: 10000 
          }).catch(() => console.log('로딩 완료'));
          
          await page.screenshot({ 
            path: 'admin-realtime-monitoring.png',
            fullPage: true 
          });
          console.log('실시간 모니터링 스크린샷 저장: admin-realtime-monitoring.png');
          
          // 실시간 데이터 확인
          const realtimeData = await page.locator('text=/현재 접속자|활성 세션|Active Users|Sessions/i').count();
          console.log(`실시간 모니터링 요소 발견: ${realtimeData}개`);
        }
        
        // 사용 통계 탭 확인
        console.log('\n사용 통계 탭 클릭...');
        const statsTab = await page.locator('button[role="tab"]:has-text("통계")').or(page.locator('button[role="tab"]:has-text("사용통계")'));
        
        if (await statsTab.count() > 0) {
          await statsTab.first().click();
          console.log('사용 통계 탭 클릭 완료');
          await page.waitForTimeout(3000);
          
          // 컴포넌트 로딩 대기
          await page.waitForSelector('text=/컴포넌트 로딩 중|Loading/', { 
            state: 'hidden',
            timeout: 10000 
          }).catch(() => console.log('로딩 완료'));
          
          await page.screenshot({ 
            path: 'admin-usage-stats.png',
            fullPage: true 
          });
          console.log('사용 통계 스크린샷 저장: admin-usage-stats.png');
          
          // 차트나 그래프 확인
          const charts = await page.locator('canvas, .recharts-wrapper, [class*="chart"]').count();
          console.log(`차트/그래프 발견: ${charts}개`);
        }
        
        // 개발 모드 메시지 확인
        const pageContent = await page.content();
        const hasDevMode = pageContent.includes('개발 모드') || 
                          pageContent.includes('Development Mode') || 
                          pageContent.includes('DEV MODE');
        
        console.log(`\n개발 모드 메시지: ${hasDevMode ? '있음 ⚠️' : '없음 ✅'}`);
        
        // 실제 데이터 확인
        const numbers = await page.locator('text=/[1-9][0-9]*/').allTextContents();
        const hasData = numbers.length > 0 && numbers.some(n => parseInt(n) > 0);
        
        console.log(`실제 데이터 표시: ${hasData ? '있음 ✅' : '없음 ⚠️'}`);
        if (hasData) {
          console.log(`샘플 데이터: ${numbers.slice(0, 5).join(', ')}`);
        }
        
      } else {
        console.log('❌ Admin 페이지 접근 실패 - 권한이 없을 수 있습니다.');
      }
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  // 브라우저를 열어둔 상태로 20초 대기
  console.log('\n브라우저를 20초간 열어둡니다...');
  await page.waitForTimeout(20000);

  await browser.close();
  console.log('테스트 완료');
})();