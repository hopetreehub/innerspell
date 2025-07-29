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
    console.log('🚀 Vercel 관리자 페이지 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    console.log('⏳ 페이지 로드 완료, 로그인 준비...');
    await page.waitForTimeout(3000);

    // 올바른 관리자 계정으로 로그인
    console.log('🔐 관리자 로그인 (올바른 계정 정보 사용)...');
    
    // 이메일 입력
    const emailInput = page.locator('input[placeholder*="email"]');
    await emailInput.click();
    await emailInput.fill('admin@innerspell.com');  // 올바른 관리자 이메일
    await page.waitForTimeout(1000);
    
    // 비밀번호 입력
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.click();
    await passwordInput.fill('admin123');
    await page.waitForTimeout(1000);
    
    // 로그인 버튼 클릭
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    console.log('⏳ 로그인 처리 중... (10초 대기)');
    await page.waitForTimeout(10000);

    // 로그인 후 상태 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'admin-dashboard-logged-in.png'), 
      fullPage: true 
    });
    console.log('📸 로그인 후 대시보드 스크린샷 저장됨');

    console.log('🔗 현재 URL:', page.url());
    
    // 페이지 내용 확인
    const bodyText = await page.textContent('body');
    console.log('📄 현재 페이지 내용 키워드:', bodyText.includes('관리자') ? '관리자 있음' : '관리자 없음', 
                 bodyText.includes('대시보드') ? '대시보드 있음' : '대시보드 없음',
                 bodyText.includes('알림') ? '알림 있음' : '알림 없음');

    // 성공적으로 로그인했는지 확인
    if (page.url().includes('/admin') && !bodyText.includes('로그인')) {
      console.log('✅ 관리자 대시보드 접속 성공!');
      
      // 모든 클릭 가능한 요소들 확인
      const allClickableElements = await page.locator('button, a, [role="tab"], [role="button"], [data-tab]').allTextContents();
      console.log('🔍 클릭 가능한 모든 요소들:', allClickableElements);
      
      // 알림 설정 탭 찾기
      const notificationTabSelectors = [
        'text=알림 설정',
        'text=알림',
        '[role="tab"]:has-text("알림")',
        'button:has-text("알림")',
        '[data-tab="notifications"]',
        '[data-tab="notification-settings"]',
        'text=Notification'
      ];

      let notificationTabFound = false;
      
      for (const selector of notificationTabSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            console.log(`🎯 알림 설정 탭 발견! 선택자: ${selector}`);
            await element.click();
            await page.waitForTimeout(3000);
            
            // 알림 설정 화면 스크린샷
            await page.screenshot({ 
              path: path.join(screenshotsDir, 'admin-notification-check.png'), 
              fullPage: true 
            });
            console.log('📸 알림 설정 화면 스크린샷 저장됨');
            
            notificationTabFound = true;
            
            // 하위 탭들 확인 및 클릭
            const subTabs = ['알림 채널', '임계값 설정', '스케줄'];
            
            for (const tabName of subTabs) {
              const subTabElement = page.locator(`text=${tabName}`);
              if (await subTabElement.isVisible()) {
                console.log(`🔧 "${tabName}" 하위 탭 클릭 중...`);
                await subTabElement.click();
                await page.waitForTimeout(2000);
                
                const fileName = `admin-notification-${tabName.replace(/\s+/g, '-').toLowerCase()}.png`;
                await page.screenshot({ 
                  path: path.join(screenshotsDir, fileName), 
                  fullPage: true 
                });
                console.log(`📸 ${tabName} 하위 탭 스크린샷 저장됨`);
              } else {
                console.log(`❌ "${tabName}" 하위 탭을 찾을 수 없음`);
              }
            }
            
            break;
          }
        } catch (e) {
          // 계속 진행
        }
      }

      if (!notificationTabFound) {
        console.log('❌ 알림 설정 탭을 찾을 수 없습니다');
        console.log('📋 현재 페이지에서 사용 가능한 탭/메뉴:', allClickableElements);
      } else {
        console.log('✅ 알림 설정 기능 확인 완료!');
      }
      
    } else {
      console.log('❌ 로그인 실패 또는 관리자 대시보드 접근 실패');
      console.log('현재 URL:', page.url());
      console.log('페이지 내용 일부:', bodyText.substring(0, 500));
    }

    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'admin-final-check-result.png'), 
      fullPage: true 
    });
    console.log('📸 최종 확인 결과 스크린샷 저장됨');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    
    // 오류 시에도 스크린샷 저장
    try {
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'admin-error-correct-login.png'), 
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