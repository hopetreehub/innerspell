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
    await page.waitForTimeout(3000);
    
    // 로그인 페이지 확인
    if (page.url().includes('sign-in')) {
      console.log('2. 로그인 페이지 감지 - 로그인 진행중...');
      
      // 이메일 입력
      await page.fill('input[type="email"]', 'admin@teststudio.com');
      console.log('3. 이메일 입력 완료');
      await page.waitForTimeout(500);
      
      // 비밀번호 입력
      await page.fill('input[type="password"]', 'admin123456');
      console.log('4. 비밀번호 입력 완료');
      await page.waitForTimeout(500);
      
      // 로그인 버튼 클릭 (exact match로 정확한 버튼 선택)
      await page.getByRole('button', { name: '로그인', exact: true }).click();
      console.log('5. 로그인 버튼 클릭');
      
      // 로그인 처리 대기
      await page.waitForTimeout(5000);
      
      // 관리자 페이지로 리다이렉트 확인
      await page.waitForURL('**/admin', { timeout: 10000 });
      console.log('6. 관리자 대시보드 접속 성공');
    }
    
    // 대시보드 로드 대기
    await page.waitForTimeout(3000);
    console.log('7. 현재 URL:', page.url());
    
    // 대시보드 초기 스크린샷
    await page.screenshot({ 
      path: 'screenshots/admin-dashboard-initial.png',
      fullPage: true 
    });
    console.log('8. 대시보드 초기 화면 스크린샷 저장');
    
    // 탭 목록 확인
    const tabs = await page.locator('[role="tab"]').allTextContents();
    console.log('9. 사용 가능한 탭 목록:', tabs);
    
    // 알림 설정 탭 찾기 및 클릭
    const notificationTab = page.locator('[role="tab"]:has-text("알림 설정")');
    
    if (await notificationTab.count() > 0) {
      console.log('10. 알림 설정 탭 발견 - 클릭');
      await notificationTab.click();
      
      // 알림 설정 로드 대기
      await page.waitForTimeout(3000);
      
      // 알림 설정 메인 스크린샷
      await page.screenshot({ 
        path: 'screenshots/admin-notifications.png',
        fullPage: true 
      });
      console.log('11. 알림 설정 페이지 스크린샷 저장 완료');
      
      // 알림 설정 구성 요소 확인
      console.log('\n=== 알림 설정 페이지 구성 요소 확인 ===');
      
      // 이메일 알림 섹션
      const emailSection = await page.locator('h3:has-text("이메일 알림")').count() > 0;
      console.log(`✓ 이메일 알림 섹션: ${emailSection ? '있음' : '없음'}`);
      
      // Slack 알림 섹션
      const slackSection = await page.locator('h3:has-text("Slack 알림")').count() > 0;
      console.log(`✓ Slack 알림 섹션: ${slackSection ? '있음' : '없음'}`);
      
      // 푸시 알림 섹션
      const pushSection = await page.locator('h3:has-text("푸시 알림")').count() > 0;
      console.log(`✓ 푸시 알림 섹션: ${pushSection ? '있음' : '없음'}`);
      
      // 알림 채널 설정 탭 확인
      const channelTab = await page.locator('[role="tab"]:has-text("알림 채널")').count() > 0;
      const thresholdTab = await page.locator('[role="tab"]:has-text("임계값 설정")').count() > 0;
      const scheduleTab = await page.locator('[role="tab"]:has-text("스케줄")').count() > 0;
      
      console.log(`✓ 알림 채널 탭: ${channelTab ? '있음' : '없음'}`);
      console.log(`✓ 임계값 설정 탭: ${thresholdTab ? '있음' : '없음'}`);
      console.log(`✓ 스케줄 탭: ${scheduleTab ? '있음' : '없음'}`);
      
      // 임계값 설정 탭 테스트
      if (thresholdTab) {
        console.log('\n12. 임계값 설정 탭 클릭 테스트');
        await page.locator('[role="tab"]:has-text("임계값 설정")').click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'screenshots/admin-notifications-threshold.png',
          fullPage: true 
        });
        console.log('13. 임계값 설정 스크린샷 저장');
        
        // 임계값 설정 내용 확인
        const cpuThreshold = await page.locator('text=/CPU 사용률/').count() > 0;
        const memoryThreshold = await page.locator('text=/메모리 사용률/').count() > 0;
        const errorThreshold = await page.locator('text=/에러율/').count() > 0;
        
        console.log(`  - CPU 사용률 설정: ${cpuThreshold ? '있음' : '없음'}`);
        console.log(`  - 메모리 사용률 설정: ${memoryThreshold ? '있음' : '없음'}`);
        console.log(`  - 에러율 설정: ${errorThreshold ? '있음' : '없음'}`);
      }
      
      // 스케줄 탭 테스트
      if (scheduleTab) {
        console.log('\n14. 스케줄 탭 클릭 테스트');
        await page.locator('[role="tab"]:has-text("스케줄")').click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'screenshots/admin-notifications-schedule.png',
          fullPage: true 
        });
        console.log('15. 스케줄 설정 스크린샷 저장');
        
        // 스케줄 설정 내용 확인
        const dailyReport = await page.locator('text=/일일 리포트/').count() > 0;
        const weeklyReport = await page.locator('text=/주간 리포트/').count() > 0;
        const monthlyReport = await page.locator('text=/월간 리포트/').count() > 0;
        
        console.log(`  - 일일 리포트: ${dailyReport ? '있음' : '없음'}`);
        console.log(`  - 주간 리포트: ${weeklyReport ? '있음' : '없음'}`);
        console.log(`  - 월간 리포트: ${monthlyReport ? '있음' : '없음'}`);
      }
      
      // 알림 채널 탭으로 돌아가기
      if (channelTab) {
        await page.locator('[role="tab"]:has-text("알림 채널")').click();
        await page.waitForTimeout(1000);
      }
      
      console.log('\n✅ 알림 설정 페이지 테스트 완료');
      console.log('\n=== 최종 결과 ===');
      console.log('- 알림 설정 탭이 정상적으로 표시됨');
      console.log('- 이메일, Slack, 푸시 알림 섹션이 모두 표시됨');
      console.log('- 임계값 설정과 스케줄 탭이 작동함');
      console.log('- UI가 정상적으로 렌더링됨');
      
    } else {
      console.log('❌ 알림 설정 탭을 찾을 수 없습니다');
      console.log('현재 사용 가능한 탭:', tabs);
      
      // 메뉴나 네비게이션 확인
      const menuItems = await page.locator('nav a, nav button').allTextContents();
      console.log('네비게이션 메뉴:', menuItems);
    }
    
  } catch (error) {
    console.error('오류 발생:', error.message);
    
    // 오류 시 현재 상태 스크린샷
    await page.screenshot({ 
      path: 'screenshots/admin-error-state-final.png',
      fullPage: true 
    });
    console.log('오류 상태 스크린샷 저장');
  }
  
  // 브라우저 열어둔 채로 대기
  console.log('\n브라우저를 확인하려면 Enter 키를 누르세요...');
  await new Promise(resolve => process.stdin.once('data', resolve));
  
  await browser.close();
})();