const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function checkAdminNotificationSettings() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  // screenshots 디렉토리가 없으면 생성
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    console.log('🚀 Vercel 사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    console.log('⏳ 페이지 로드 완료, 입력 필드 확인...');
    await page.waitForTimeout(5000);

    // 모든 input 요소들 확인
    const allInputs = await page.locator('input').all();
    console.log(`🔍 발견된 input 요소 개수: ${allInputs.length}`);
    
    for (let i = 0; i < allInputs.length; i++) {
      const inputType = await allInputs[i].getAttribute('type');
      const inputPlaceholder = await allInputs[i].getAttribute('placeholder');
      const inputName = await allInputs[i].getAttribute('name');
      console.log(`Input ${i}: type=${inputType}, placeholder=${inputPlaceholder}, name=${inputName}`);
    }

    // 로그인 화면 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'login-input-analysis.png'), 
      fullPage: true 
    });
    console.log('📸 로그인 화면 분석 스크린샷 저장됨');

    // 더 넓은 선택자로 이메일 입력 시도
    const emailSelectors = [
      'input[type="email"]',
      'input[placeholder*="이메일"]',
      'input[placeholder*="email"]',
      'input[name="email"]',
      'input:first-of-type',
      'input:nth-of-type(1)'
    ];

    let emailInput = null;
    for (const selector of emailSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          emailInput = element;
          console.log(`✅ 이메일 입력 필드 발견: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector}`);
      }
    }

    if (emailInput) {
      console.log('🔐 로그인 시도 중...');
      
      // 이메일 입력
      await emailInput.click();
      await emailInput.fill('admin@test.com');
      await page.waitForTimeout(1000);
      
      // 비밀번호 입력 필드 찾기
      const passwordSelectors = [
        'input[type="password"]',
        'input[placeholder*="비밀번호"]',
        'input[placeholder*="password"]',
        'input[name="password"]',
        'input:nth-of-type(2)'
      ];

      let passwordInput = null;
      for (const selector of passwordSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            passwordInput = element;
            console.log(`✅ 비밀번호 입력 필드 발견: ${selector}`);
            break;
          }
        } catch (e) {
          console.log(`❌ 비밀번호 선택자 실패: ${selector}`);
        }
      }

      if (passwordInput) {
        await passwordInput.click();
        await passwordInput.fill('admin123');
        await page.waitForTimeout(1000);
        
        // 로그인 후 스크린샷
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'login-form-filled.png'), 
          fullPage: true 
        });
        console.log('📸 로그인 폼 작성 완료 스크린샷 저장됨');
        
        // 로그인 버튼 클릭
        const loginButtonSelectors = [
          'button:has-text("로그인")',
          'button[type="submit"]',
          'input[type="submit"]',
          'button:contains("로그인")',
          'form button'
        ];

        let loginButton = null;
        for (const selector of loginButtonSelectors) {
          try {
            const element = page.locator(selector);
            if (await element.isVisible()) {
              loginButton = element;
              console.log(`✅ 로그인 버튼 발견: ${selector}`);
              break;
            }
          } catch (e) {
            console.log(`❌ 로그인 버튼 선택자 실패: ${selector}`);
          }
        }

        if (loginButton) {
          await loginButton.click();
          console.log('⏳ 로그인 처리 중...');
          await page.waitForTimeout(5000);

          // 로그인 후 상태 스크린샷
          await page.screenshot({ 
            path: path.join(screenshotsDir, 'after-login-attempt.png'), 
            fullPage: true 
          });
          console.log('📸 로그인 시도 후 스크린샷 저장됨');

          console.log('🔗 현재 URL:', page.url());
          
          // 페이지 내용 확인
          const bodyText = await page.textContent('body');
          console.log('📄 현재 페이지 내용 (일부):', bodyText.substring(0, 800));

          // 관리자 대시보드인지 확인
          if (page.url().includes('/admin') && !bodyText.includes('로그인')) {
            console.log('✅ 관리자 대시보드 접속 성공!');
            
            // 알림 설정 탭 찾기
            const tabElements = await page.locator('button, a, [role="tab"], [data-tab]').allTextContents();
            console.log('🔍 발견된 탭/버튼들:', tabElements);
            
            // 알림 관련 요소 찾기
            const notificationTabSelectors = [
              'text=알림 설정',
              'text=알림',
              '[role="tab"]:has-text("알림")',
              'button:has-text("알림")',
              '[data-tab*="notification"]'
            ];

            let notificationTabFound = false;
            for (const selector of notificationTabSelectors) {
              try {
                const element = page.locator(selector);
                if (await element.isVisible()) {
                  console.log(`🎯 알림 설정 탭 발견! 클릭 중: ${selector}`);
                  await element.click();
                  await page.waitForTimeout(2000);
                  
                  // 알림 설정 화면 스크린샷
                  await page.screenshot({ 
                    path: path.join(screenshotsDir, 'admin-notification-check.png'), 
                    fullPage: true 
                  });
                  console.log('📸 알림 설정 화면 스크린샷 저장됨');
                  notificationTabFound = true;
                  break;
                }
              } catch (e) {
                // 계속 진행
              }
            }

            if (!notificationTabFound) {
              console.log('❌ 알림 설정 탭을 찾을 수 없습니다');
            }
          } else {
            console.log('❌ 로그인 실패 또는 관리자 대시보드 접근 실패');
          }
        }
      }
    }

    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'final-admin-state.png'), 
      fullPage: true 
    });
    console.log('📸 최종 상태 스크린샷 저장됨');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    
    // 오류 시에도 스크린샷 저장
    try {
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'admin-error-final-state.png'), 
        fullPage: true 
      });
      console.log('📸 오류 상태 스크린샷 저장됨');
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError);
    }
  } finally {
    await browser.close();
    console.log('🔚 브라우저 종료됨');
  }
}

checkAdminNotificationSettings();