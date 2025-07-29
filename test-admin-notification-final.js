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
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    console.log('⏳ 페이지 로드 완료, 로그인 화면 확인...');
    await page.waitForTimeout(3000);

    // 로그인 화면 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'admin-login-screen.png'), 
      fullPage: true 
    });
    console.log('📸 로그인 화면 스크린샷 저장됨');

    // 로그인 수행
    console.log('🔐 관리자 로그인 수행 중...');
    
    // 이메일 입력
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('admin@test.com');
    await page.waitForTimeout(500);
    
    // 비밀번호 입력
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('admin123');
    await page.waitForTimeout(500);
    
    // 로그인 버튼 클릭
    const loginButton = page.locator('button:has-text("로그인")');
    await loginButton.click();
    
    console.log('⏳ 로그인 처리 및 리다이렉트 대기 중...');
    await page.waitForTimeout(5000);

    // 로그인 후 현재 상태 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'after-admin-login.png'), 
      fullPage: true 
    });
    console.log('📸 로그인 후 상태 스크린샷 저장됨');

    console.log('🔗 현재 URL:', page.url());

    // 관리자 대시보드 확인
    console.log('📊 관리자 대시보드 요소들 확인 중...');
    
    // 페이지에서 모든 텍스트 확인
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    console.log('📄 페이지 내용 (일부):', bodyText.substring(0, 500));

    // 모든 버튼, 링크, 탭 요소들 확인
    const allButtons = await page.locator('button, a, [role="tab"], [role="button"], .tab, [data-tab]').allTextContents();
    console.log('🔍 발견된 모든 클릭 가능한 요소들:', allButtons);

    // 네비게이션 또는 탭 영역 찾기
    const navElements = await page.locator('nav, .navigation, .tabs, .tab-list, [role="tablist"]').allTextContents();
    console.log('🧭 네비게이션 요소들:', navElements);

    // 알림 관련 요소 찾기
    const notificationElements = await page.locator('*').filter({ hasText: /알림|notification|notify/i }).allTextContents();
    console.log('🔔 알림 관련 요소들:', notificationElements);

    // 알림 설정 탭 찾기 및 클릭 시도
    const possibleSelectors = [
      'text=알림 설정',
      'text=알림',
      '[role="tab"]:has-text("알림")',
      'button:has-text("알림")',
      'a:has-text("알림")',
      '[data-tab="notifications"]',
      '[data-tab="알림설정"]',
      'text=Notifications',
      'text=Settings'
    ];

    let foundNotificationTab = false;
    
    for (const selector of possibleSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          console.log(`✅ 알림 설정 탭 발견! 선택자: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          foundNotificationTab = true;
          break;
        }
      } catch (e) {
        // 계속 진행
      }
    }

    if (foundNotificationTab) {
      console.log('🎯 알림 설정 탭 클릭 완료');
      
      // 알림 설정 화면 스크린샷
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'admin-notification-check.png'), 
        fullPage: true 
      });
      console.log('📸 알림 설정 화면 스크린샷 저장됨');

      // 하위 탭 확인
      const subTabs = ['알림 채널', '임계값 설정', '스케줄'];
      
      for (const tabName of subTabs) {
        const subTabElement = page.locator(`text=${tabName}`);
        if (await subTabElement.isVisible()) {
          console.log(`🔧 "${tabName}" 하위 탭 발견 및 클릭`);
          await subTabElement.click();
          await page.waitForTimeout(1500);
          
          const fileName = `admin-notification-${tabName.replace(/\s+/g, '-').toLowerCase()}.png`;
          await page.screenshot({ 
            path: path.join(screenshotsDir, fileName), 
            fullPage: true 
          });
          console.log(`📸 ${tabName} 하위 탭 스크린샷 저장됨`);
        }
      }

      console.log('✅ 알림 설정 기능 확인 완료!');
    } else {
      console.log('❌ 알림 설정 탭을 찾을 수 없습니다');
      console.log('💬 현재 페이지에서 사용 가능한 모든 텍스트:', bodyText);
    }

    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'admin-final-notification-check.png'), 
      fullPage: true 
    });
    console.log('📸 최종 상태 스크린샷 저장됨');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    
    // 오류 시에도 스크린샷 저장
    try {
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'admin-notification-error-final.png'), 
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