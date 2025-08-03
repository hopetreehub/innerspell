import { test, expect } from '@playwright/test';

test.describe('타로리딩 저장 및 공유 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // Vercel 배포 URL로 이동
    await page.goto('https://test-studio-firebase.vercel.app');
    
    // 로그인 상태 확인을 위해 프로필 버튼 찾기
    const profileButton = page.locator('[aria-label="프로필"]');
    if (await profileButton.isVisible()) {
      console.log('이미 로그인 상태입니다.');
    } else {
      // 로그인 페이지로 이동
      await page.click('text=로그인');
      await page.waitForURL('**/sign-in**');
      
      // 테스트 계정으로 로그인 (실제 테스트 계정 필요)
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword123');
      await page.click('button:has-text("로그인")');
      
      // 로그인 성공 대기
      await page.waitForURL('https://test-studio-firebase.vercel.app');
    }
  });

  test('타로리딩 저장하기 기능 테스트', async ({ page }) => {
    // 타로 리딩 페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'tests/screenshots/tarot-reading-page.png', fullPage: true });
    
    // 질문 입력
    await page.fill('textarea[placeholder*="질문을 입력"]', '오늘의 운세는 어떤가요?');
    
    // 스프레드 선택 (기본값 사용)
    
    // 카드 뽑기 시작
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(1000);
    
    // 카드 선택 (첫 번째 카드 클릭)
    const cards = page.locator('.card-stack').first();
    await cards.click();
    await page.waitForTimeout(500);
    
    // AI 해석 받기
    await page.click('button:has-text("AI 해석 받기")');
    
    // 해석 완료 대기 (최대 30초)
    await page.waitForSelector('text=해석 다시 보기', { timeout: 30000 });
    
    // 저장하기 버튼 찾기 및 클릭
    const saveButton = page.locator('button:has-text("리딩 저장")');
    await saveButton.screenshot({ path: 'tests/screenshots/save-button.png' });
    
    // 저장하기 클릭
    await saveButton.click();
    
    // 에러 메시지 캡처
    await page.waitForTimeout(2000);
    const toastError = page.locator('[role="status"]');
    if (await toastError.isVisible()) {
      const errorText = await toastError.textContent();
      console.log('저장 오류 메시지:', errorText);
      await toastError.screenshot({ path: 'tests/screenshots/save-error.png' });
    }
    
    // 콘솔 에러 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('콘솔 에러:', msg.text());
      }
    });
    
    // 전체 페이지 스크린샷
    await page.screenshot({ path: 'tests/screenshots/after-save-attempt.png', fullPage: true });
  });
  
  test('타로리딩 공유하기 기능 테스트', async ({ page }) => {
    // 타로 리딩 페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    
    // 이전과 동일한 과정으로 해석까지 진행
    await page.fill('textarea[placeholder*="질문을 입력"]', '내일의 계획은?');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(1000);
    
    const cards = page.locator('.card-stack').first();
    await cards.click();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("AI 해석 받기")');
    await page.waitForSelector('text=해석 다시 보기', { timeout: 30000 });
    
    // 공유하기 버튼 클릭
    const shareButton = page.locator('button:has-text("리딩 공유")');
    await shareButton.click();
    
    // 공유 가이드 다이얼로그 대기
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // 공유 가이드 스크린샷
    await page.screenshot({ path: 'tests/screenshots/share-guide-dialog.png', fullPage: true });
    
    // 복사된 URL 확인
    const shareUrlInput = page.locator('input[readonly]').first();
    const shareUrl = await shareUrlInput.inputValue();
    console.log('공유 URL:', shareUrl);
    
    // 각 SNS 탭 확인
    const tabs = ['kakao', 'instagram', 'facebook', 'twitter'];
    for (const tab of tabs) {
      await page.click(`button[value="${tab}"]`);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `tests/screenshots/share-guide-${tab}.png` });
    }
  });
  
  test('경험저장하기 폼 오류 테스트', async ({ page }) => {
    // 경험 페이지로 이동 (URL 확인 필요)
    await page.goto('https://test-studio-firebase.vercel.app/experiences');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    
    // 경험저장하기 버튼 찾기
    const saveExperienceButton = page.locator('button:has-text("경험저장하기")');
    if (await saveExperienceButton.isVisible()) {
      await saveExperienceButton.click();
      
      // 폼 오류 캡처
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/experience-form-error.png', fullPage: true });
      
      // 콘솔 에러 로그
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('경험저장 에러:', msg.text());
        }
      });
    }
  });
});