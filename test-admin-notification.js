const { chromium } = require('playwright');

async function testAdminNotification() {
  console.log('관리자 대시보드 알림 설정 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('1. 관리자 대시보드 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로딩 대기
    await page.waitForTimeout(3000);
    
    console.log('2. 페이지 로딩 상태 확인...');
    const loadingText = await page.textContent('body');
    console.log('페이지 내용:', loadingText.substring(0, 200) + '...');
    
    // 로딩 중인지 확인
    const isLoading = await page.locator('text=관리자 권한을 확인하는 중').isVisible();
    if (isLoading) {
      console.log('아직 관리자 권한 확인 중입니다. 더 기다리겠습니다...');
      
      // 최대 30초 대기
      await page.waitForTimeout(30000);
      
      // 캐시 새로고침 버튼 클릭 시도
      try {
        const refreshButton = page.locator('text=로딩에 문제가 있나요? 캐시 새로고침');
        if (await refreshButton.isVisible()) {
          console.log('캐시 새로고침 버튼 클릭...');
          await refreshButton.click();
          await page.waitForTimeout(5000);
        }
      } catch (e) {
        console.log('새로고침 버튼을 찾을 수 없습니다:', e.message);
      }
    }
    
    // 스크린샷 촬영
    console.log('3. 현재 상태 스크린샷 촬영...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/admin-loading-state.png',
      fullPage: true 
    });
    
    // 관리자 대시보드가 로드되었는지 확인
    const dashboardLoaded = await page.locator('text=알림 설정').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (dashboardLoaded) {
      console.log('4. 알림 설정 탭 클릭...');
      await page.click('text=알림 설정');
      await page.waitForTimeout(2000);
      
      console.log('5. 알림 설정 화면 확인...');
      
      // 탭 확인
      const channels = await page.locator('text=알림 채널').isVisible().catch(() => false);
      const thresholds = await page.locator('text=임계값 설정').isVisible().catch(() => false);
      const schedule = await page.locator('text=스케줄').isVisible().catch(() => false);
      
      console.log('알림 채널 탭:', channels);
      console.log('임계값 설정 탭:', thresholds);
      console.log('스케줄 탭:', schedule);
      
      // 각 탭 클릭해보기
      if (channels) {
        console.log('6. 알림 채널 탭 클릭...');
        await page.click('text=알림 채널');
        await page.waitForTimeout(1000);
      }
      
      if (thresholds) {
        console.log('7. 임계값 설정 탭 클릭...');
        await page.click('text=임계값 설정');
        await page.waitForTimeout(1000);
      }
      
      if (schedule) {
        console.log('8. 스케줄 탭 클릭...');
        await page.click('text=스케줄');
        await page.waitForTimeout(1000);
      }
      
      // 최종 스크린샷
      console.log('9. 최종 알림 설정 화면 스크린샷 촬영...');
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/notification-settings-final.png',
        fullPage: true 
      });
      
      console.log('✅ 알림 설정 테스트 완료!');
    } else {
      console.log('❌ 관리자 대시보드가 완전히 로드되지 않았습니다.');
      
      // 현재 상태 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/admin-not-loaded.png',
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    
    // 오류 상태 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/admin-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testAdminNotification();