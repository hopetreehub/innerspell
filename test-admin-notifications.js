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
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 로그인 필요 여부 확인
    const loginButton = await page.locator('button:has-text("로그인")').first();
    if (await loginButton.isVisible()) {
      console.log('2. 관리자 로그인 필요 - 로그인 진행중...');
      
      // 이메일 입력
      await page.fill('input[type="email"]', 'admin@teststudio.com');
      await page.waitForTimeout(500);
      
      // 비밀번호 입력
      await page.fill('input[type="password"]', 'admin123456');
      await page.waitForTimeout(500);
      
      // 로그인 버튼 클릭
      await loginButton.click();
      
      // 로그인 완료 대기
      await page.waitForTimeout(3000);
      console.log('3. 로그인 완료');
    }
    
    // 관리자 대시보드 로드 확인
    await page.waitForSelector('h1:has-text("관리자 대시보드")', { timeout: 10000 });
    console.log('4. 관리자 대시보드 로드 완료');
    
    // 알림 설정 탭 찾기 및 클릭
    console.log('5. 알림 설정 탭 찾는 중...');
    const notificationTab = await page.locator('button:has-text("알림 설정")').first();
    
    if (await notificationTab.isVisible()) {
      console.log('6. 알림 설정 탭 발견 - 클릭');
      await notificationTab.click();
      
      // 알림 설정 컨텐츠 로드 대기
      await page.waitForTimeout(2000);
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: 'screenshots/admin-notifications.png',
        fullPage: true 
      });
      console.log('7. 스크린샷 저장 완료: screenshots/admin-notifications.png');
      
      // 알림 설정 페이지 요소들 확인
      console.log('\n=== 알림 설정 페이지 구성 요소 확인 ===');
      
      // 이메일 알림 섹션
      const emailSection = await page.locator('h3:has-text("이메일 알림")').isVisible();
      console.log(`- 이메일 알림 섹션: ${emailSection ? '있음' : '없음'}`);
      
      // Slack 알림 섹션
      const slackSection = await page.locator('h3:has-text("Slack 알림")').isVisible();
      console.log(`- Slack 알림 섹션: ${slackSection ? '있음' : '없음'}`);
      
      // 푸시 알림 섹션
      const pushSection = await page.locator('h3:has-text("푸시 알림")').isVisible();
      console.log(`- 푸시 알림 섹션: ${pushSection ? '있음' : '없음'}`);
      
      // 임계값 설정 탭
      const thresholdTab = await page.locator('button:has-text("임계값 설정")').isVisible();
      console.log(`- 임계값 설정 탭: ${thresholdTab ? '있음' : '없음'}`);
      
      // 스케줄 탭
      const scheduleTab = await page.locator('button:has-text("스케줄")').isVisible();
      console.log(`- 스케줄 탭: ${scheduleTab ? '있음' : '없음'}`);
      
      // 임계값 설정 탭 클릭 테스트
      if (thresholdTab) {
        console.log('\n8. 임계값 설정 탭 클릭 테스트');
        await page.locator('button:has-text("임계값 설정")').click();
        await page.waitForTimeout(1500);
        
        // 임계값 설정 내용 확인
        const cpuThreshold = await page.locator('label:has-text("CPU 사용률")').isVisible();
        const memoryThreshold = await page.locator('label:has-text("메모리 사용률")').isVisible();
        console.log(`- CPU 사용률 설정: ${cpuThreshold ? '있음' : '없음'}`);
        console.log(`- 메모리 사용률 설정: ${memoryThreshold ? '있음' : '없음'}`);
        
        await page.screenshot({ 
          path: 'screenshots/admin-notifications-threshold.png',
          fullPage: true 
        });
        console.log('9. 임계값 설정 스크린샷 저장 완료');
      }
      
      // 스케줄 탭 클릭 테스트
      if (scheduleTab) {
        console.log('\n10. 스케줄 탭 클릭 테스트');
        await page.locator('button:has-text("스케줄")').click();
        await page.waitForTimeout(1500);
        
        // 스케줄 설정 내용 확인
        const dailyReport = await page.locator('label:has-text("일일 리포트")').isVisible();
        const weeklyReport = await page.locator('label:has-text("주간 리포트")').isVisible();
        console.log(`- 일일 리포트 설정: ${dailyReport ? '있음' : '없음'}`);
        console.log(`- 주간 리포트 설정: ${weeklyReport ? '있음' : '없음'}`);
        
        await page.screenshot({ 
          path: 'screenshots/admin-notifications-schedule.png',
          fullPage: true 
        });
        console.log('11. 스케줄 설정 스크린샷 저장 완료');
      }
      
      console.log('\n✅ 알림 설정 페이지 확인 완료');
      
    } else {
      console.log('❌ 알림 설정 탭을 찾을 수 없습니다');
      
      // 현재 페이지 상태 스크린샷
      await page.screenshot({ 
        path: 'screenshots/admin-dashboard-current.png',
        fullPage: true 
      });
      console.log('현재 대시보드 상태 스크린샷 저장: screenshots/admin-dashboard-current.png');
      
      // 사용 가능한 탭 목록 출력
      const availableTabs = await page.locator('button[role="tab"]').allTextContents();
      console.log('\n현재 사용 가능한 탭 목록:', availableTabs);
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
    
    // 오류 시 현재 상태 스크린샷
    await page.screenshot({ 
      path: 'screenshots/admin-error-state.png',
      fullPage: true 
    });
    console.log('오류 상태 스크린샷 저장: screenshots/admin-error-state.png');
  }
  
  // 브라우저 열어둔 채로 대기
  console.log('\n브라우저를 확인하려면 Enter 키를 누르세요...');
  await new Promise(resolve => process.stdin.once('data', resolve));
  
  await browser.close();
})();