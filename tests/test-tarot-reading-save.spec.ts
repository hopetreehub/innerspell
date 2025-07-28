import { test, expect } from '@playwright/test';

test.describe('Tarot Reading Save Functionality Test', () => {
  const BASE_URL = 'https://test-studio-firebase.vercel.app';
  const ADMIN_EMAIL = 'admin@innerspell.com';
  const ADMIN_PASSWORD = 'admin123'; // 임시 비밀번호, 실제로는 환경변수나 설정에서 가져와야 함

  test('Complete tarot reading save flow', async ({ page }) => {
    // 콘솔 로그 캡처
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    // 에러 캐치
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    console.log('1. Navigating to homepage...');
    
    // 1. 홈페이지 접속
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });

    console.log('2. Looking for login/auth options...');
    
    // 2. 로그인 버튼 찾기 및 클릭
    const loginButton = page.locator('button:has-text("로그인"), a:has-text("로그인"), [data-testid="login"], .login-btn');
    if (await loginButton.first().isVisible({ timeout: 5000 })) {
      await loginButton.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/02-login-modal.png', fullPage: true });
    } else {
      // 네비게이션에서 로그인 옵션 찾기
      const navItems = page.locator('nav a, header a, .nav-item');
      const navCount = await navItems.count();
      console.log(`Found ${navCount} navigation items`);
      
      for (let i = 0; i < navCount; i++) {
        const item = navItems.nth(i);
        const text = await item.textContent();
        if (text && (text.includes('로그인') || text.includes('Login') || text.includes('관리자'))) {
          console.log(`Found potential login link: ${text}`);
          await item.click();
          await page.waitForTimeout(2000);
          break;
        }
      }
      await page.screenshot({ path: 'screenshots/02-after-nav-click.png', fullPage: true });
    }

    console.log('3. Attempting to login...');
    
    // 3. 이메일/비밀번호 입력 또는 Google 로그인
    const emailInput = page.locator('input[type="email"], input[name="email"], #email');
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password');
    const googleLoginButton = page.locator('button:has-text("Google"), .google-login, [data-provider="google"]');

    if (await emailInput.isVisible({ timeout: 3000 })) {
      console.log('Found email input, using email/password login');
      await emailInput.fill(ADMIN_EMAIL);
      await passwordInput.fill(ADMIN_PASSWORD);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("로그인"), .login-submit');
      await submitButton.click();
      await page.waitForTimeout(3000);
    } else if (await googleLoginButton.isVisible({ timeout: 3000 })) {
      console.log('Found Google login button');
      await googleLoginButton.click();
      await page.waitForTimeout(5000);
      
      // Google 로그인 페이지에서 이메일 입력
      if (page.url().includes('accounts.google.com')) {
        await page.fill('input[type="email"]', ADMIN_EMAIL);
        await page.click('#identifierNext');
        await page.waitForTimeout(2000);
        
        // 비밀번호 입력 (실제 환경에서는 보안상 문제가 있을 수 있음)
        if (await page.locator('input[type="password"]').isVisible({ timeout: 5000 })) {
          await page.fill('input[type="password"]', ADMIN_PASSWORD);
          await page.click('#passwordNext');
          await page.waitForTimeout(5000);
        }
      }
    } else {
      console.log('No standard login form found, checking if already logged in or looking for other auth methods');
    }

    await page.screenshot({ path: 'screenshots/03-after-login-attempt.png', fullPage: true });

    console.log('4. Navigating to tarot reading page...');
    
    // 4. 타로 리딩 페이지로 이동
    const tarotButton = page.locator('button:has-text("타로 읽기"), a:has-text("타로 읽기"), .tarot-reading, [href*="tarot"], [href*="reading"]');
    
    if (await tarotButton.first().isVisible({ timeout: 5000 })) {
      await tarotButton.first().click();
    } else {
      // URL 직접 이동 시도
      await page.goto(`${BASE_URL}/tarot-reading`);
      await page.waitForTimeout(2000);
      
      if (page.url().includes('404') || page.url() === BASE_URL + '/') {
        // 다른 경로들 시도
        const possiblePaths = ['/reading', '/tarot', '/cards', '/start'];
        for (const path of possiblePaths) {
          console.log(`Trying path: ${path}`);
          await page.goto(`${BASE_URL}${path}`);
          await page.waitForTimeout(2000);
          if (!page.url().includes('404') && page.url() !== BASE_URL + '/') {
            break;
          }
        }
      }
    }

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/04-tarot-reading-page.png', fullPage: true });

    console.log('5. Starting tarot reading...');
    
    // 5. 타로 리딩 시작
    const questionInput = page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"], .question-input, #question');
    const testQuestion = "나의 미래는 어떻게 될까요?";
    
    if (await questionInput.isVisible({ timeout: 5000 })) {
      await questionInput.fill(testQuestion);
      await page.screenshot({ path: 'screenshots/05-question-entered.png', fullPage: true });
      
      // 질문 제출
      const submitQuestionButton = page.locator('button[type="submit"], button:has-text("시작"), button:has-text("확인"), .submit-question');
      if (await submitQuestionButton.isVisible({ timeout: 3000 })) {
        await submitQuestionButton.click();
        await page.waitForTimeout(3000);
      }
    }

    console.log('6. Selecting cards...');
    
    // 6. 카드 선택
    const cards = page.locator('.card, .tarot-card, [data-card], .card-item');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} cards`);
    
    if (cardCount > 0) {
      // 첫 번째 카드 선택
      await cards.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/06-first-card-selected.png', fullPage: true });
      
      // 두 번째 카드 선택 (있다면)
      if (cardCount > 1) {
        await cards.nth(1).click();
        await page.waitForTimeout(2000);
      }
      
      // 세 번째 카드 선택 (있다면)
      if (cardCount > 2) {
        await cards.nth(2).click();
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: 'screenshots/07-cards-selected.png', fullPage: true });

    console.log('7. Generating interpretation...');
    
    // 7. 해석 생성
    const generateButton = page.locator('button:has-text("해석"), button:has-text("분석"), button:has-text("생성"), .generate-reading, .interpret-button');
    if (await generateButton.isVisible({ timeout: 5000 })) {
      await generateButton.click();
      await page.waitForTimeout(10000); // AI 해석 생성 대기
      await page.screenshot({ path: 'screenshots/08-interpretation-generated.png', fullPage: true });
    }

    console.log('8. Looking for save button...');
    
    // 8. 저장 버튼 찾기 및 클릭
    const saveButton = page.locator('button:has-text("저장"), .save-reading, .save-button, [data-action="save"]');
    let saveButtonFound = false;
    
    if (await saveButton.isVisible({ timeout: 5000 })) {
      console.log('Save button found!');
      saveButtonFound = true;
      await saveButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/09-save-clicked.png', fullPage: true });
      
      // 저장 완료 확인
      const successMessage = page.locator('.success, .toast, [role="alert"]:has-text("저장"), .notification:has-text("저장")');
      if (await successMessage.isVisible({ timeout: 5000 })) {
        console.log('Save success message detected!');
        await page.screenshot({ path: 'screenshots/10-save-success.png', fullPage: true });
      }
    } else {
      console.log('Save button not found, checking for other save options...');
      // 다른 저장 옵션들 찾기
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} buttons on page`);
      
      for (let i = 0; i < Math.min(buttonCount, 20); i++) { // 최대 20개만 체크
        const button = allButtons.nth(i);
        const text = await button.textContent();
        console.log(`Button ${i}: ${text}`);
        if (text && (text.includes('저장') || text.includes('Save') || text.includes('보관'))) {
          console.log(`Found potential save button: ${text}`);
          saveButtonFound = true;
          await button.click();
          await page.waitForTimeout(3000);
          break;
        }
      }
    }

    await page.screenshot({ path: 'screenshots/11-after-save-attempt.png', fullPage: true });

    console.log('9. Checking profile/history page...');
    
    // 9. 프로필/히스토리 페이지로 이동하여 저장된 리딩 확인
    const profileButton = page.locator('button:has-text("프로필"), a:has-text("프로필"), .profile, [href*="profile"]');
    const historyButton = page.locator('button:has-text("히스토리"), a:has-text("히스토리"), .history, [href*="history"]');
    
    if (await profileButton.isVisible({ timeout: 5000 })) {
      await profileButton.click();
    } else if (await historyButton.isVisible({ timeout: 5000 })) {
      await historyButton.click();
    } else {
      // URL 직접 이동 시도
      await page.goto(`${BASE_URL}/profile`);
      await page.waitForTimeout(2000);
      
      if (page.url().includes('404')) {
        await page.goto(`${BASE_URL}/history`);
        await page.waitForTimeout(2000);
      }
    }

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/12-profile-history-page.png', fullPage: true });

    // 저장된 리딩 확인
    const savedReadings = page.locator('.reading-item, .history-item, .saved-reading, [data-reading]');
    const savedCount = await savedReadings.count();
    console.log(`Found ${savedCount} saved readings`);

    if (savedCount > 0) {
      console.log('Saved readings found in history!');
      await page.screenshot({ path: 'screenshots/13-saved-readings-confirmed.png', fullPage: true });
    }

    // 최종 스크린샷
    await page.screenshot({ path: 'screenshots/14-final-state.png', fullPage: true });

    // 결과 리포트
    console.log('\n=== TEST RESULTS ===');
    console.log(`Save button found: ${saveButtonFound}`);
    console.log(`Saved readings in history: ${savedCount}`);
    console.log(`Console logs count: ${consoleLogs.length}`);
    console.log(`Errors count: ${errors.length}`);
    
    if (consoleLogs.length > 0) {
      console.log('\nConsole logs:');
      consoleLogs.forEach((log, i) => console.log(`${i + 1}. ${log}`));
    }
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    }

    // 테스트 결과 파일 생성
    const testResults = {
      timestamp: new Date().toISOString(),
      saveButtonFound,
      savedReadingsCount: savedCount,
      consoleLogs,
      errors,
      screenshots: [
        '01-homepage.png',
        '02-login-modal.png',
        '03-after-login-attempt.png',
        '04-tarot-reading-page.png',
        '05-question-entered.png',
        '06-first-card-selected.png',
        '07-cards-selected.png',
        '08-interpretation-generated.png',
        '09-save-clicked.png',
        '10-save-success.png',
        '11-after-save-attempt.png',
        '12-profile-history-page.png',
        '13-saved-readings-confirmed.png',
        '14-final-state.png'
      ]
    };

    await page.evaluate((results) => {
      console.log('Test Results:', JSON.stringify(results, null, 2));
    }, testResults);
  });
});