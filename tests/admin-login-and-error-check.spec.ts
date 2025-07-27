import { test, expect } from '@playwright/test';

test.describe('관리자 로그인 후 타로 지침 저장 에러 확인', () => {
  test('관리자 계정으로 로그인하여 타로 지침 저장 기능 에러 확인', async ({ page }) => {
    // 콘솔 메시지 수집
    const consoleMessages: any[] = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
      console.log(`${msg.type()}: ${msg.text()}`);
    });

    // 네트워크 요청 모니터링
    const failedRequests: any[] = [];
    page.on('response', response => {
      if (!response.ok()) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log(`Failed request: ${response.status()} ${response.url()}`);
      }
    });

    // 에러 이벤트 수집
    const errors: any[] = [];
    page.on('pageerror', error => {
      errors.push({
        message: error.message,
        stack: error.stack
      });
      console.log(`Page error: ${error.message}`);
    });

    try {
      // 1. 홈페이지에 먼저 접속하여 로그인
      console.log('1. 홈페이지 접속하여 로그인');
      await page.goto('https://test-studio-firebase.vercel.app/');
      await page.waitForLoadState('networkidle');
      
      // 스크린샷 저장
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-01-homepage.png',
        fullPage: true 
      });

      // 로그인 버튼 찾기 및 클릭
      const loginButton = page.locator('text=로그인').or(page.locator('text=Sign In')).or(page.locator('button:has-text("로그인")'));
      
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(2000);
      }

      // 로그인 페이지에서 관리자 이메일로 로그인 시도
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-02-login-page.png',
        fullPage: true 
      });

      // 이메일과 비밀번호 입력 (실제 관리자 계정 정보가 필요함)
      const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
      const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        // 테스트용 관리자 계정 (실제 환경에서는 유효한 관리자 계정 필요)
        await emailInput.fill('admin@test.com');
        await passwordInput.fill('testpassword123');
        
        const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("로그인")'));
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Google 로그인도 시도
      const googleButton = page.locator('text=Google로 로그인').or(page.locator('button:has-text("Google")'));
      if (await googleButton.isVisible()) {
        await googleButton.click();
        await page.waitForTimeout(3000);
      }

      // 2. 관리자 페이지로 직접 이동
      console.log('2. 관리자 페이지로 이동');
      await page.goto('https://test-studio-firebase.vercel.app/admin');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-03-admin-page.png',
        fullPage: true 
      });

      // 개발자 도구에서 인증 상태를 시뮬레이션
      console.log('3. 개발자 도구로 인증 상태 시뮬레이션');
      await page.evaluate(() => {
        // localStorage에 mock 사용자 데이터 설정
        const mockUser = {
          uid: 'test-admin-uid',
          email: 'admin@test.com',
          displayName: 'Test Admin',
          isAdmin: true,
          role: 'admin'
        };
        localStorage.setItem('auth-user', JSON.stringify(mockUser));
        localStorage.setItem('auth-token', 'mock-admin-token');
        
        // window 객체에 mock auth 설정
        (window as any).mockAuth = {
          currentUser: mockUser,
          isAdmin: true
        };
      });

      // 페이지 새로고침
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-04-after-mock-auth.png',
        fullPage: true 
      });

      // 3. 타로 지침 탭 찾기
      console.log('4. 타로 지침 탭 찾기');
      
      // 다양한 선택자로 타로 지침 탭 찾기
      const tarotTabSelectors = [
        'text=타로 지침',
        'button:has-text("타로 지침")',
        '[role="tab"]:has-text("타로 지침")',
        '.tab:has-text("타로 지침")',
        'a:has-text("타로 지침")',
        '[data-testid="tarot-guidelines-tab"]'
      ];

      let tarotTab = null;
      for (const selector of tarotTabSelectors) {
        tarotTab = page.locator(selector).first();
        if (await tarotTab.isVisible()) {
          console.log(`타로 지침 탭 발견: ${selector}`);
          break;
        }
      }

      if (tarotTab && await tarotTab.isVisible()) {
        await tarotTab.click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-05-tarot-tab.png',
        fullPage: true 
      });

      // 4. 새 지침 생성 버튼 찾기
      console.log('5. 새 지침 생성 버튼 찾기');
      
      const newGuidelineSelectors = [
        'button:has-text("새 지침 생성")',
        'button:has-text("새 지침")',
        'button:has-text("생성")',
        'text=새 지침 생성',
        '[data-testid="new-guideline-button"]',
        '.btn:has-text("새")'
      ];

      let newButton = null;
      for (const selector of newGuidelineSelectors) {
        newButton = page.locator(selector).first();
        if (await newButton.isVisible()) {
          console.log(`새 지침 생성 버튼 발견: ${selector}`);
          break;
        }
      }

      if (newButton && await newButton.isVisible()) {
        await newButton.click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-06-new-guideline-form.png',
        fullPage: true 
      });

      // 5. 폼 필드 찾기 및 입력
      console.log('6. 폼 필드 입력');
      
      // 제목 입력
      const titleSelectors = [
        'input[name="title"]',
        'input[placeholder*="제목"]',
        '#title',
        '.title-input',
        'input[data-testid="title-input"]'
      ];

      for (const selector of titleSelectors) {
        const titleInput = page.locator(selector).first();
        if (await titleInput.isVisible()) {
          await titleInput.fill('에러 테스트 타로 지침');
          console.log(`제목 입력 완료: ${selector}`);
          break;
        }
      }

      // 설명 입력
      const descriptionSelectors = [
        'textarea[name="description"]',
        'textarea[placeholder*="설명"]',
        '#description',
        '.description-input',
        'textarea[data-testid="description-input"]'
      ];

      for (const selector of descriptionSelectors) {
        const descInput = page.locator(selector).first();
        if (await descInput.isVisible()) {
          await descInput.fill('에러 테스트용 타로 지침 설명입니다.');
          console.log(`설명 입력 완료: ${selector}`);
          break;
        }
      }

      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-07-form-filled.png',
        fullPage: true 
      });

      // 6. 저장 버튼 클릭
      console.log('7. 저장 버튼 클릭');
      
      const saveSelectors = [
        'button:has-text("저장")',
        'button[type="submit"]',
        '.save-button',
        '[data-testid="save-button"]',
        'button:has-text("Save")',
        '.btn-primary:has-text("저장")'
      ];

      let saveButton = null;
      for (const selector of saveSelectors) {
        saveButton = page.locator(selector).first();
        if (await saveButton.isVisible()) {
          console.log(`저장 버튼 발견: ${selector}`);
          break;
        }
      }

      if (saveButton && await saveButton.isVisible()) {
        // 네트워크 응답 대기 설정
        const responsePromise = page.waitForResponse(response => 
          response.url().includes('/api/') && response.request().method() === 'POST'
        ).catch(() => null);

        await saveButton.click();
        
        // 응답 대기 (최대 10초)
        try {
          const response = await Promise.race([
            responsePromise,
            page.waitForTimeout(10000)
          ]);
          
          if (response) {
            console.log(`API 응답: ${response.status()} ${response.url()}`);
            const responseText = await response.text().catch(() => '응답 텍스트 읽기 실패');
            console.log(`응답 내용: ${responseText}`);
          }
        } catch (error) {
          console.log(`응답 대기 실패: ${error}`);
        }
        
        await page.waitForTimeout(3000);
      }

      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-08-after-save.png',
        fullPage: true 
      });

      // 7. 에러 메시지 확인
      console.log('8. 에러 메시지 확인');
      
      // 에러 메시지 요소들 찾기
      const errorSelectors = [
        '.error',
        '.alert-error',
        '.text-red-500',
        '.text-danger',
        '[role="alert"]',
        '.toast-error',
        '.notification-error',
        '.error-message'
      ];

      let foundErrors = false;
      for (const selector of errorSelectors) {
        const errorElements = page.locator(selector);
        const count = await errorElements.count();
        
        if (count > 0) {
          foundErrors = true;
          for (let i = 0; i < count; i++) {
            const errorText = await errorElements.nth(i).textContent();
            console.log(`에러 메시지 (${selector}): ${errorText}`);
          }
        }
      }

      // 개발자 도구 열기
      console.log('9. 개발자 도구에서 추가 정보 확인');
      await page.evaluate(() => {
        console.log('=== 현재 상태 확인 ===');
        console.log('Local Storage:', localStorage);
        console.log('Session Storage:', sessionStorage);
        console.log('Current URL:', window.location.href);
        console.log('Document Ready State:', document.readyState);
      });

      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-09-final-state.png',
        fullPage: true 
      });

      // 8. 결과 요약
      console.log('\n=== 타로 지침 저장 에러 확인 결과 ===');
      console.log(`Console messages: ${consoleMessages.length}`);
      console.log(`Failed requests: ${failedRequests.length}`);
      console.log(`Page errors: ${errors.length}`);
      console.log(`Found error messages: ${foundErrors}`);

      if (consoleMessages.length > 0) {
        console.log('\n--- Console Messages ---');
        consoleMessages.forEach((msg, index) => {
          console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
        });
      }

      if (failedRequests.length > 0) {
        console.log('\n--- Failed Requests ---');
        failedRequests.forEach((req, index) => {
          console.log(`${index + 1}. ${req.status} ${req.statusText}: ${req.url}`);
        });
      }

      if (errors.length > 0) {
        console.log('\n--- Page Errors ---');
        errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error.message}`);
          if (error.stack) {
            console.log(`   Stack: ${error.stack}`);
          }
        });
      }

    } catch (error) {
      console.error('테스트 실행 중 오류:', error);
      
      // 오류 발생 시에도 스크린샷 저장
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-error-final-error.png',
        fullPage: true 
      });
      
      throw error;
    }
  });
});