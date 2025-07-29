const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('1. Vercel 배포 사이트 접속중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { waitUntil: 'networkidle' });
    
    // 페이지 로드 대기
    await page.waitForTimeout(5000);
    
    // 현재 페이지 상태 확인
    console.log('2. 현재 페이지 URL:', page.url());
    
    // 로그인 페이지인지 확인
    const isLoginPage = page.url().includes('/login') || page.url().includes('/auth');
    
    if (isLoginPage || await page.locator('text=/로그인|Sign in/i').isVisible()) {
      console.log('3. 로그인 페이지 감지 - 로그인 진행중...');
      
      // 로그인 페이지 스크린샷
      await page.screenshot({ 
        path: 'screenshots/admin-login-page.png',
        fullPage: true 
      });
      console.log('로그인 페이지 스크린샷 저장');
      
      // 다양한 이메일 입력 필드 선택자 시도
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email" i]',
        'input[placeholder*="이메일" i]',
        '#email',
        'input[autocomplete="email"]'
      ];
      
      let emailFilled = false;
      for (const selector of emailSelectors) {
        try {
          if (await page.locator(selector).isVisible()) {
            await page.fill(selector, 'admin@teststudio.com');
            emailFilled = true;
            console.log(`이메일 입력 성공: ${selector}`);
            break;
          }
        } catch (e) {
          // 다음 선택자 시도
        }
      }
      
      if (!emailFilled) {
        console.log('이메일 필드를 찾을 수 없습니다. 수동 로그인 필요.');
        console.log('브라우저에서 직접 로그인해주세요.');
        console.log('이메일: admin@teststudio.com');
        console.log('비밀번호: admin123456');
        console.log('\n로그인 후 Enter 키를 눌러주세요...');
        await new Promise(resolve => process.stdin.once('data', resolve));
      } else {
        // 비밀번호 입력
        await page.waitForTimeout(500);
        const passwordSelectors = [
          'input[type="password"]',
          'input[name="password"]',
          'input[placeholder*="password" i]',
          'input[placeholder*="비밀번호" i]',
          '#password'
        ];
        
        for (const selector of passwordSelectors) {
          try {
            if (await page.locator(selector).isVisible()) {
              await page.fill(selector, 'admin123456');
              console.log(`비밀번호 입력 성공: ${selector}`);
              break;
            }
          } catch (e) {
            // 다음 선택자 시도
          }
        }
        
        // 로그인 버튼 클릭
        await page.waitForTimeout(500);
        const loginButtonSelectors = [
          'button:has-text("로그인")',
          'button:has-text("Sign in")',
          'button[type="submit"]',
          'input[type="submit"]'
        ];
        
        for (const selector of loginButtonSelectors) {
          try {
            if (await page.locator(selector).isVisible()) {
              await page.locator(selector).click();
              console.log(`로그인 버튼 클릭: ${selector}`);
              break;
            }
          } catch (e) {
            // 다음 선택자 시도
          }
        }
        
        // 로그인 완료 대기
        await page.waitForTimeout(5000);
      }
    }
    
    // 관리자 대시보드 접근 시도
    console.log('4. 관리자 대시보드 접근 시도...');
    if (!page.url().includes('/admin')) {
      await page.goto('https://test-studio-firebase.vercel.app/admin', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }
    
    // 대시보드 로드 확인
    console.log('5. 현재 페이지 URL:', page.url());
    
    // 대시보드 스크린샷
    await page.screenshot({ 
      path: 'screenshots/admin-dashboard-loaded.png',
      fullPage: true 
    });
    console.log('대시보드 스크린샷 저장');
    
    // 알림 설정 탭 찾기
    console.log('6. 알림 설정 탭 찾는 중...');
    
    // 다양한 탭 선택자 시도
    const tabSelectors = [
      'button:has-text("알림 설정")',
      'a:has-text("알림 설정")',
      '[role="tab"]:has-text("알림 설정")',
      'div:has-text("알림 설정"):not(:has(*))'
    ];
    
    let notificationTabFound = false;
    for (const selector of tabSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          console.log(`7. 알림 설정 탭 발견: ${selector}`);
          await page.locator(selector).click();
          notificationTabFound = true;
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }
    
    if (notificationTabFound) {
      // 알림 설정 컨텐츠 로드 대기
      await page.waitForTimeout(3000);
      
      // 알림 설정 페이지 스크린샷
      await page.screenshot({ 
        path: 'screenshots/admin-notifications.png',
        fullPage: true 
      });
      console.log('8. 알림 설정 페이지 스크린샷 저장 완료');
      
      // 알림 설정 페이지 구성 요소 확인
      console.log('\n=== 알림 설정 페이지 구성 요소 확인 ===');
      
      const components = {
        '이메일 알림': ['이메일 알림', 'Email Notifications', 'Email'],
        'Slack 알림': ['Slack 알림', 'Slack Notifications', 'Slack'],
        '푸시 알림': ['푸시 알림', 'Push Notifications', 'Push'],
        '임계값 설정': ['임계값 설정', 'Threshold Settings', '임계값'],
        '스케줄': ['스케줄', 'Schedule', '일정']
      };
      
      for (const [name, selectors] of Object.entries(components)) {
        let found = false;
        for (const text of selectors) {
          if (await page.locator(`text=${text}`).isVisible()) {
            console.log(`✓ ${name}: 있음`);
            found = true;
            break;
          }
        }
        if (!found) {
          console.log(`✗ ${name}: 없음`);
        }
      }
      
      // 탭 테스트
      console.log('\n=== 탭 기능 테스트 ===');
      
      // 임계값 설정 탭 테스트
      const thresholdTabSelectors = ['button:has-text("임계값 설정")', '[role="tab"]:has-text("임계값")'];
      for (const selector of thresholdTabSelectors) {
        try {
          if (await page.locator(selector).isVisible()) {
            console.log('9. 임계값 설정 탭 클릭');
            await page.locator(selector).click();
            await page.waitForTimeout(2000);
            await page.screenshot({ 
              path: 'screenshots/admin-notifications-threshold.png',
              fullPage: true 
            });
            console.log('임계값 설정 스크린샷 저장');
            break;
          }
        } catch (e) {}
      }
      
      // 스케줄 탭 테스트
      const scheduleTabSelectors = ['button:has-text("스케줄")', '[role="tab"]:has-text("스케줄")'];
      for (const selector of scheduleTabSelectors) {
        try {
          if (await page.locator(selector).isVisible()) {
            console.log('10. 스케줄 탭 클릭');
            await page.locator(selector).click();
            await page.waitForTimeout(2000);
            await page.screenshot({ 
              path: 'screenshots/admin-notifications-schedule.png',
              fullPage: true 
            });
            console.log('스케줄 설정 스크린샷 저장');
            break;
          }
        } catch (e) {}
      }
      
    } else {
      console.log('❌ 알림 설정 탭을 찾을 수 없습니다');
      
      // 현재 표시된 모든 탭/메뉴 항목 확인
      console.log('\n=== 현재 표시된 메뉴/탭 목록 ===');
      const visibleButtons = await page.locator('button:visible').allTextContents();
      const visibleLinks = await page.locator('a:visible').allTextContents();
      const visibleTabs = await page.locator('[role="tab"]:visible').allTextContents();
      
      console.log('버튼:', visibleButtons.filter(t => t.trim()).slice(0, 10));
      console.log('링크:', visibleLinks.filter(t => t.trim()).slice(0, 10));
      console.log('탭:', visibleTabs.filter(t => t.trim()));
    }
    
    console.log('\n✅ 테스트 완료');
    
  } catch (error) {
    console.error('오류 발생:', error);
    
    // 오류 시 현재 상태 스크린샷
    await page.screenshot({ 
      path: 'screenshots/admin-error-final.png',
      fullPage: true 
    });
    console.log('최종 오류 상태 스크린샷 저장');
  }
  
  // 브라우저 열어둔 채로 대기
  console.log('\n브라우저를 확인하려면 Enter 키를 누르세요...');
  await new Promise(resolve => process.stdin.once('data', resolve));
  
  await browser.close();
})();