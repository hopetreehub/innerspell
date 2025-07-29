const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function checkAdminNotificationSettings() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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
    console.log('🚀 Vercel 사이트에 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('⏳  페이지 로드 대기 중...');
    await page.waitForTimeout(3000);

    // 로그인이 필요한지 확인
    const needsLogin = await page.locator('text=로그인').isVisible().catch(() => false) ||
                      await page.locator('[type="email"]').isVisible().catch(() => false) ||
                      await page.locator('text=Sign in').isVisible().catch(() => false);

    if (needsLogin) {
      console.log('🔐 로그인 필요 - 로그인 시도 중...');
      
      // 이메일과 비밀번호 입력 필드 찾기
      const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="이메일"], input[placeholder*="email"]').first();
      const passwordInput = await page.locator('input[type="password"], input[name="password"], input[placeholder*="비밀번호"], input[placeholder*="password"]').first();
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        await emailInput.fill('admin@test.com');
        await passwordInput.fill('admin123');
        
        // 로그인 버튼 클릭
        const loginButton = await page.locator('button:has-text("로그인"), button:has-text("Sign in"), button[type="submit"]').first();
        await loginButton.click();
        
        console.log('⏳ 로그인 처리 중...');
        await page.waitForTimeout(3000);
      }
    }

    // 관리자 대시보드로 이동했는지 확인
    console.log('📊 관리자 대시보드 확인 중...');
    await page.waitForTimeout(2000);

    // 현재 페이지 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'admin-dashboard-current.png'), 
      fullPage: true 
    });
    console.log('📸 관리자 대시보드 스크린샷 저장됨');

    // 상단 탭들 확인
    console.log('🔍 상단 탭들 검색 중...');
    
    // 다양한 탭 선택자로 확인
    const tabSelectors = [
      'text=알림 설정',
      '[role="tab"]:has-text("알림 설정")',
      'button:has-text("알림 설정")',
      'a:has-text("알림 설정")',
      '[data-testid*="notification"]',
      '[aria-label*="알림"]',
      '.tab:has-text("알림")',
      'text=Notification',
      'text=notifications'
    ];

    let notificationTab = null;
    for (const selector of tabSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          notificationTab = element;
          console.log(`✅ 알림 설정 탭 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 선택자가 없으면 계속 진행
      }
    }

    if (notificationTab) {
      console.log('🎯 알림 설정 탭 클릭 중...');
      await notificationTab.click();
      await page.waitForTimeout(2000);

      // 알림 설정 화면 스크린샷
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'admin-notification-check.png'), 
        fullPage: true 
      });
      console.log('📸 알림 설정 화면 스크린샷 저장됨');

      // 각 하위 탭들 확인
      const subTabs = [
        '알림 채널',
        '임계값 설정', 
        '스케줄',
        'Notification Channels',
        'Threshold Settings',
        'Schedule'
      ];

      for (const tabName of subTabs) {
        const subTab = page.locator(`text=${tabName}`);
        if (await subTab.isVisible()) {
          console.log(`🔧 "${tabName}" 하위 탭 클릭 중...`);
          await subTab.click();
          await page.waitForTimeout(1500);
          
          // 각 하위 탭 스크린샷
          const fileName = `admin-notification-${tabName.toLowerCase().replace(/\s+/g, '-')}.png`;
          await page.screenshot({ 
            path: path.join(screenshotsDir, fileName), 
            fullPage: true 
          });
          console.log(`📸 ${tabName} 탭 스크린샷 저장됨`);
        }
      }

      console.log('✅ 알림 설정 기능 확인 완료!');
    } else {
      console.log('❌ 알림 설정 탭을 찾을 수 없습니다');
      
      // 현재 페이지의 모든 텍스트 확인
      console.log('🔍 현재 페이지 내용 분석 중...');
      const pageText = await page.textContent('body');
      console.log('페이지 내용 일부:', pageText.substring(0, 500));
      
      // 모든 버튼과 링크 확인
      const buttons = await page.locator('button, a, [role="tab"]').allTextContents();
      console.log('발견된 버튼/링크들:', buttons);
    }

    // 최종 전체 화면 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'admin-final-state.png'), 
      fullPage: true 
    });
    console.log('📸 최종 상태 스크린샷 저장됨');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    
    // 오류 시에도 스크린샷 저장
    try {
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'admin-notification-error.png'), 
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