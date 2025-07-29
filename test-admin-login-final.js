const { chromium } = require('playwright');

async function testAdminNotificationFinal() {
  console.log('관리자 로그인 후 알림 설정 최종 테스트 시작...');
  
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
    
    console.log('2. 로그인 화면 분석...');
    
    // 현재 화면 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/admin-login-analysis.png',
      fullPage: true 
    });
    
    // 다양한 방법으로 이메일 입력 필드 찾기
    const emailSelectors = [
      'input[type="email"]',
      'input[placeholder*="email"]',
      'input[placeholder*="your@email.com"]',
      '[aria-label*="email"]',
      '[name="email"]',
      'input:first-of-type'
    ];
    
    let emailField = null;
    for (const selector of emailSelectors) {
      try {
        const field = page.locator(selector).first();
        const isVisible = await field.isVisible({ timeout: 2000 });
        if (isVisible) {
          emailField = field;
          console.log(`✅ 이메일 필드 찾음: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ ${selector} 시도 실패`);
      }
    }
    
    if (emailField) {
      console.log('3. 관리자 계정으로 로그인 시도...');
      
      // 이메일 입력
      await emailField.click();
      await emailField.fill('admin@innerspell.com');
      await page.waitForTimeout(1000);
      
      // 비밀번호 필드 찾기
      const passwordSelectors = [
        'input[type="password"]',
        '[aria-label*="password"]',
        '[name="password"]',
        'input:nth-of-type(2)'
      ];
      
      let passwordField = null;
      for (const selector of passwordSelectors) {
        try {
          const field = page.locator(selector).first();
          const isVisible = await field.isVisible({ timeout: 2000 });
          if (isVisible) {
            passwordField = field;
            console.log(`✅ 비밀번호 필드 찾음: ${selector}`);
            break;
          }
        } catch (e) {
          console.log(`❌ ${selector} 시도 실패`);
        }
      }
      
      if (passwordField) {
        // 비밀번호 입력
        await passwordField.click();
        await passwordField.fill('admin123456');
        await page.waitForTimeout(1000);
        
        // 로그인 버튼 찾기 및 클릭
        const loginSelectors = [
          'button:has-text("로그인")',
          '[type="submit"]',
          'button[type="submit"]',
          '.login-button',
          'button:contains("로그인")'
        ];
        
        let loginClicked = false;
        for (const selector of loginSelectors) {
          try {
            const button = page.locator(selector).first();
            const isVisible = await button.isVisible({ timeout: 2000 });
            if (isVisible) {
              await button.click();
              loginClicked = true;
              console.log(`✅ 로그인 버튼 클릭: ${selector}`);
              break;
            }
          } catch (e) {
            console.log(`❌ ${selector} 버튼 시도 실패`);
          }
        }
        
        if (loginClicked) {
          console.log('4. 로그인 처리 대기...');
          await page.waitForTimeout(8000);
          
          // 로그인 후 스크린샷
          await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/admin-after-login-attempt.png',
            fullPage: true 
          });
          
          // 관리자 대시보드 요소 확인
          console.log('5. 관리자 대시보드 확인...');
          const dashboardElements = [
            'text=대시보드',
            'text=알림 설정',
            'text=사용자 관리',
            'text=통계',
            'text=Dashboard',
            'text=Notification',
            'text=Admin',
            '[data-testid="dashboard"]',
            '.admin-dashboard'
          ];
          
          let foundDashboard = false;
          for (const element of dashboardElements) {
            try {
              const isVisible = await page.locator(element).isVisible({ timeout: 3000 });
              if (isVisible) {
                foundDashboard = true;
                console.log(`✅ 대시보드 요소 찾음: ${element}`);
                break;
              }
            } catch (e) {
              // 무시
            }
          }
          
          if (foundDashboard) {
            console.log('6. 알림 설정 확인...');
            
            // 알림 설정 탭 찾기
            const notificationSelectors = [
              'text=알림 설정',
              'text=Notification',
              '[data-testid="notification"]',
              'button:has-text("알림")',
              'a:has-text("알림")'
            ];
            
            let notificationFound = false;
            for (const selector of notificationSelectors) {
              try {
                const element = page.locator(selector).first();
                const isVisible = await element.isVisible({ timeout: 3000 });
                if (isVisible) {
                  await element.click();
                  notificationFound = true;
                  console.log(`✅ 알림 설정 클릭: ${selector}`);
                  await page.waitForTimeout(3000);
                  break;
                }
              } catch (e) {
                // 무시
              }
            }
            
            // 최종 결과 스크린샷
            await page.screenshot({ 
              path: '/mnt/e/project/test-studio-firebase/screenshots/notification-settings-final.png',
              fullPage: true 
            });
            
            if (notificationFound) {
              console.log('✅ 알림 설정 테스트 성공!');
            } else {
              console.log('⚠️ 알림 설정 탭을 찾지 못했지만 대시보드는 로드됨');
            }
            
          } else {
            console.log('❌ 관리자 대시보드를 찾을 수 없습니다.');
          }
          
        } else {
          console.log('❌ 로그인 버튼을 찾을 수 없습니다.');
        }
        
      } else {
        console.log('❌ 비밀번호 필드를 찾을 수 없습니다.');
      }
      
    } else {
      console.log('❌ 이메일 필드를 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    
    // 오류 상태 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/admin-final-error.png',
      fullPage: true 
    });
  } finally {
    console.log('브라우저를 10초 후에 닫습니다...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testAdminNotificationFinal();