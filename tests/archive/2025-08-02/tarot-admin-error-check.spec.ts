import { test, expect } from '@playwright/test';

test.describe('타로 지침 저장 에러 확인', () => {
  test('관리자 계정으로 타로 지침 저장 기능 에러 확인', async ({ page }) => {
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
      // 1. Vercel 배포 페이지에 접속
      console.log('1. 관리자 페이지 접속');
      await page.goto('https://test-studio-firebase.vercel.app/admin');
      
      // 페이지 로딩 대기
      await page.waitForLoadState('networkidle');
      
      // 초기 화면 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/admin-login-page.png',
        fullPage: true 
      });

      // 2. 로그인 시도 (Google 로그인 버튼 찾기)
      console.log('2. 로그인 시도');
      
      // Google 로그인 버튼 찾기
      const googleLoginButton = page.locator('button:has-text("Google로 로그인")');
      if (await googleLoginButton.isVisible()) {
        await googleLoginButton.click();
        await page.waitForTimeout(3000);
      }

      // 로그인 후 화면 대기
      await page.waitForTimeout(5000);
      
      // 로그인 후 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/after-login.png',
        fullPage: true 
      });

      // 3. 타로 지침 탭으로 이동
      console.log('3. 타로 지침 탭으로 이동');
      
      // 타로 지침 탭 찾기
      const tarotTab = page.locator('text=타로 지침').or(page.locator('[role="tab"]:has-text("타로 지침")')).or(page.locator('button:has-text("타로 지침")'));
      
      if (await tarotTab.isVisible()) {
        await tarotTab.click();
        await page.waitForTimeout(2000);
      }

      // 타로 지침 탭 화면 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/tarot-guidelines-tab.png',
        fullPage: true 
      });

      // 4. "새 지침 생성" 버튼 클릭
      console.log('4. 새 지침 생성 버튼 클릭');
      
      const newGuidelineButton = page.locator('button:has-text("새 지침 생성")').or(page.locator('text=새 지침 생성')).or(page.locator('[data-testid="new-guideline-button"]'));
      
      if (await newGuidelineButton.isVisible()) {
        await newGuidelineButton.click();
        await page.waitForTimeout(2000);
      }

      // 새 지침 생성 폼 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/new-guideline-form.png',
        fullPage: true 
      });

      // 5. 기본 정보 입력 시도
      console.log('5. 기본 정보 입력');
      
      // 제목 입력
      const titleInput = page.locator('input[name="title"]').or(page.locator('input[placeholder*="제목"]')).or(page.locator('#title'));
      if (await titleInput.isVisible()) {
        await titleInput.fill('테스트 타로 지침');
      }

      // 설명 입력
      const descriptionInput = page.locator('textarea[name="description"]').or(page.locator('textarea[placeholder*="설명"]')).or(page.locator('#description'));
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('테스트용 타로 지침 설명입니다.');
      }

      // 카테고리 선택 (있다면)
      const categorySelect = page.locator('select[name="category"]').or(page.locator('#category'));
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
      }

      // 입력 후 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/form-filled.png',
        fullPage: true 
      });

      // 6. 저장 버튼 클릭 시 에러 확인
      console.log('6. 저장 버튼 클릭');
      
      const saveButton = page.locator('button:has-text("저장")').or(page.locator('button[type="submit"]')).or(page.locator('[data-testid="save-button"]'));
      
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // 에러 메시지 대기
        await page.waitForTimeout(3000);
      }

      // 저장 시도 후 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/after-save-attempt.png',
        fullPage: true 
      });

      // 7. 에러 메시지 확인
      console.log('7. 에러 메시지 확인');
      
      // 에러 메시지 요소들 찾기
      const errorElements = page.locator('.error, .alert-error, .text-red-500, .text-danger, [role="alert"]');
      const errorCount = await errorElements.count();
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorElements.nth(i).textContent();
          console.log(`Error message ${i + 1}: ${errorText}`);
        }
      }

      // 토스트 메시지 확인
      const toastMessages = page.locator('[role="status"], .toast, .notification');
      const toastCount = await toastMessages.count();
      
      if (toastCount > 0) {
        for (let i = 0; i < toastCount; i++) {
          const toastText = await toastMessages.nth(i).textContent();
          console.log(`Toast message ${i + 1}: ${toastText}`);
        }
      }

      // 최종 화면 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/final-state.png',
        fullPage: true 
      });

      // 8. 결과 요약
      console.log('\n=== 에러 확인 결과 요약 ===');
      console.log(`Console messages: ${consoleMessages.length}`);
      console.log(`Failed requests: ${failedRequests.length}`);
      console.log(`Page errors: ${errors.length}`);

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
        path: '/mnt/e/project/test-studio-firebase/error-state.png',
        fullPage: true 
      });
      
      throw error;
    }
  });
});