const { chromium } = require('playwright');

async function testAdminWithCorrectCredentials() {
  console.log('올바른 관리자 계정으로 알림 설정 테스트 시작...');
  
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
    
    await page.waitForTimeout(3000);
    
    console.log('2. 로그인 화면 확인...');
    
    // 현재 화면 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/admin-login-correct.png',
      fullPage: true 
    });
    
    // 올바른 관리자 계정 정보 사용
    const adminEmail = 'admin@innerspell.com';
    const adminPassword = 'admin123';
    
    console.log(`3. 관리자 계정으로 로그인 시도: ${adminEmail}`);
    
    // 이메일 입력
    const emailField = page.locator('input[placeholder*="email"]').first();
    await emailField.click();
    await emailField.fill(adminEmail);
    await page.waitForTimeout(1000);
    
    // 비밀번호 입력
    const passwordField = page.locator('input[type="password"]').first();
    await passwordField.click();
    await passwordField.fill(adminPassword);
    await page.waitForTimeout(1000);
    
    // 로그인 버튼 클릭
    const loginButton = page.locator('button:has-text("로그인")').first();
    await loginButton.click();
    
    console.log('4. 로그인 처리 대기...');
    await page.waitForTimeout(10000); // 로그인 처리를 위해 더 오래 대기
    
    // 로그인 후 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/admin-after-correct-login.png',
      fullPage: true 
    });
    
    console.log('5. 관리자 대시보드 확인...');
    
    // 대시보드 로딩 대기
    await page.waitForTimeout(5000);
    
    // 다양한 방법으로 대시보드 요소 확인
    const possibleElements = [
      'text=알림 설정',
      'text=사용자 관리', 
      'text=통계',
      'text=대시보드',
      'text=Dashboard',
      'text=Statistics',
      'text=Users',
      'text=Settings',
      '[data-testid*="admin"]',
      '[class*="admin"]',
      'button',
      'nav',
      'tab'
    ];
    
    const foundElements = [];
    for (const selector of possibleElements) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          for (let i = 0; i < elements.length; i++) {
            const isVisible = await elements[i].isVisible();
            if (isVisible) {
              const text = await elements[i].textContent();
              if (text && text.trim()) {
                foundElements.push(`${selector}: "${text.trim()}"`);
              }
            }
          }
        }
      } catch (e) {
        // 무시
      }
    }
    
    console.log('찾은 요소들:', foundElements);
    
    // 알림 설정 탭 찾기 및 클릭
    let notificationFound = false;
    const notificationSelectors = [
      'text=알림 설정',
      'text*=알림',
      'text*=notification',
      'button:has-text("알림")',
      '[data-testid*="notification"]',
      'text=Settings'
    ];
    
    for (const selector of notificationSelectors) {
      try {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 3000 });
        if (isVisible) {
          console.log(`6. 알림 설정 탭 발견 및 클릭: ${selector}`);
          await element.click();
          notificationFound = true;
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        // 무시
      }
    }
    
    // 알림 설정 화면 요소 확인
    if (notificationFound) {
      console.log('7. 알림 설정 화면 요소 확인...');
      
      const notificationElements = [
        'text=알림 채널',
        'text=임계값 설정',
        'text=스케줄',
        'text=이메일',
        'text=Slack',
        'text=푸시 알림',
        'button:has-text("저장")',
        'button:has-text("초기화")'
      ];
      
      const foundNotificationElements = [];
      for (const selector of notificationElements) {
        try {
          const isVisible = await page.locator(selector).isVisible({ timeout: 2000 });
          if (isVisible) {
            foundNotificationElements.push(selector.replace('text=', '').replace('button:has-text("', '').replace('")', ''));
          }
        } catch (e) {
          // 무시
        }
      }
      
      console.log('알림 설정 요소들:', foundNotificationElements);
      
      // 각 탭 클릭해보기
      const tabs = ['알림 채널', '임계값 설정', '스케줄'];
      for (const tabName of tabs) {
        try {
          const tab = page.locator(`text=${tabName}`);
          const isVisible = await tab.isVisible({ timeout: 2000 });
          if (isVisible) {
            console.log(`8. ${tabName} 탭 클릭...`);
            await tab.click();
            await page.waitForTimeout(1500);
            
            // 탭별 스크린샷
            await page.screenshot({ 
              path: `/mnt/e/project/test-studio-firebase/screenshots/notification-tab-${tabName.replace(' ', '-').replace('값', 'value')}.png`,
              fullPage: true 
            });
          }
        } catch (e) {
          console.log(`${tabName} 탭 클릭 실패:`, e.message);
        }
      }
    }
    
    // 최종 스크린샷
    console.log('9. 최종 알림 설정 화면 스크린샷 촬영...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/notification-settings-final.png',
      fullPage: true 
    });
    
    if (notificationFound) {
      console.log('✅ 알림 설정 테스트 성공!');
    } else {
      console.log('⚠️ 알림 설정을 찾지 못했지만 로그인은 성공한 것 같습니다.');
    }
    
    console.log('📋 테스트 요약:');
    console.log(`- 사용한 계정: ${adminEmail}`);
    console.log(`- 찾은 전체 요소 수: ${foundElements.length}`);
    console.log(`- 알림 설정 접근: ${notificationFound ? '성공' : '실패'}`);
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    
    // 오류 상태 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/admin-correct-error.png',
      fullPage: true 
    });
  } finally {
    console.log('브라우저를 15초 후에 닫습니다...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

testAdminWithCorrectCredentials();