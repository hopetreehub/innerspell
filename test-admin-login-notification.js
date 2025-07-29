const { chromium } = require('playwright');

async function testAdminNotificationWithLogin() {
  console.log('관리자 로그인 후 알림 설정 테스트 시작...');
  
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
    
    console.log('2. 로그인 화면 확인...');
    const loginTitle = await page.locator('text=다시 오신 것을 환영합니다').isVisible().catch(() => false);
    
    if (loginTitle) {
      console.log('3. 관리자 계정으로 로그인 시도...');
      
      // 이메일 입력
      await page.fill('[type="email"]', 'admin@innerspell.com');
      await page.waitForTimeout(1000);
      
      // 비밀번호 입력
      await page.fill('[type="password"]', 'admin123456');
      await page.waitForTimeout(1000);
      
      // 로그인 버튼 클릭
      await page.click('button:has-text("로그인")');
      
      console.log('4. 로그인 처리 중...');
      await page.waitForTimeout(5000);
      
      // 로그인 후 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/admin-after-login.png',
        fullPage: true 
      });
      
      // 관리자 대시보드가 로드되었는지 확인
      console.log('5. 관리자 대시보드 로딩 확인...');
      const dashboardElements = [
        'text=대시보드',
        'text=알림 설정',
        'text=사용자 관리',
        'text=통계'
      ];
      
      let dashboardLoaded = false;
      for (const element of dashboardElements) {
        const isVisible = await page.locator(element).isVisible({ timeout: 3000 }).catch(() => false);
        if (isVisible) {
          dashboardLoaded = true;
          console.log(`✅ 찾은 요소: ${element}`);
          break;
        }
      }
      
      if (dashboardLoaded) {
        console.log('6. 알림 설정 탭 찾기...');
        
        // 알림 설정 탭 클릭
        const notificationTab = await page.locator('text=알림 설정').isVisible({ timeout: 5000 }).catch(() => false);
        
        if (notificationTab) {
          console.log('7. 알림 설정 탭 클릭...');
          await page.click('text=알림 설정');
          await page.waitForTimeout(3000);
          
          console.log('8. 알림 설정 화면 요소 확인...');
          
          // 알림 설정 화면의 주요 요소들 확인
          const settingsElements = [
            'text=알림 채널',
            'text=임계값 설정', 
            'text=스케줄',
            'text=이메일',
            'text=Slack',
            'text=푸시 알림',
            'button:has-text("저장")',
            'button:has-text("초기화")'
          ];
          
          const foundElements = [];
          for (const element of settingsElements) {
            const isVisible = await page.locator(element).isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
              foundElements.push(element.replace('text=', '').replace('button:has-text("', '').replace('")', ''));
            }
          }
          
          console.log('찾은 알림 설정 요소들:', foundElements);
          
          // 각 탭 클릭해보기
          const tabs = ['알림 채널', '임계값 설정', '스케줄'];
          for (const tabName of tabs) {
            const tabExists = await page.locator(`text=${tabName}`).isVisible().catch(() => false);
            if (tabExists) {
              console.log(`9. ${tabName} 탭 클릭...`);
              await page.click(`text=${tabName}`);
              await page.waitForTimeout(1500);
              
              // 탭별 스크린샷
              await page.screenshot({ 
                path: `/mnt/e/project/test-studio-firebase/screenshots/notification-tab-${tabName.replace(' ', '-')}.png`,
                fullPage: true 
              });
            }
          }
          
          // 최종 스크린샷
          console.log('10. 최종 알림 설정 화면 스크린샷 촬영...');
          await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/notification-settings-final.png',
            fullPage: true 
          });
          
          console.log('✅ 알림 설정 테스트 완료!');
          console.log('📊 테스트 결과:');
          console.log(`- 찾은 요소 수: ${foundElements.length}`);
          console.log(`- 찾은 요소들: ${foundElements.join(', ')}`);
          
        } else {
          console.log('❌ 알림 설정 탭을 찾을 수 없습니다.');
        }
        
      } else {
        console.log('❌ 관리자 대시보드 요소를 찾을 수 없습니다.');
      }
      
    } else {
      console.log('❌ 로그인 화면을 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    
    // 오류 상태 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/admin-test-error.png',
      fullPage: true 
    });
  } finally {
    console.log('브라우저를 5초 후에 닫습니다...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testAdminNotificationWithLogin();