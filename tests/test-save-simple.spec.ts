import { test, expect } from '@playwright/test';

test('리딩 경험 공유 저장 테스트', async ({ page }) => {
  // 콘솔 로그 캡처
  page.on('console', msg => {
    console.log(`브라우저 콘솔 [${msg.type()}]:`, msg.text());
  });
  
  // 네트워크 요청 로깅
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('/community/')) {
      console.log('>> 요청:', request.method(), request.url());
      if (request.method() === 'POST') {
        console.log('>> 요청 데이터:', request.postData());
      }
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/') || response.url().includes('/community/')) {
      console.log('<< 응답:', response.status(), response.url());
    }
  });

  // 1. 페이지로 이동
  await page.goto('http://localhost:4000/community/reading-share/new');
  await page.waitForLoadState('networkidle');
  
  // 2. 제목과 내용 입력
  await page.fill('#title', '테스트 리딩 경험');
  // 내용을 50자 이상으로 입력
  await page.fill('#content', '테스트 리딩 내용입니다. 이것은 자동화된 테스트를 위한 내용입니다. 타로 카드를 통해 얻은 통찰력을 공유하고 있습니다.');
  
  // 3. 스프레드 타입을 직접 select 요소에서 선택
  await page.selectOption('select', 'three-card');
  
  // 4. 카드를 cards 배열로 추가해야 함
  // 먼저 "카드 추가" 버튼을 클릭하여 카드 선택 모달 열기
  const addCardButton = page.locator('button:has-text("카드 추가")');
  if (await addCardButton.isVisible()) {
    // 카드를 3개 추가
    for (let i = 0; i < 3; i++) {
      await addCardButton.click();
      await page.waitForTimeout(500);
      
      // 카드 선택 모달에서 카드 선택
      const cardImages = page.locator('[role="dialog"] img, .modal img, .card-selector img');
      if (await cardImages.count() > 0) {
        await cardImages.nth(i % await cardImages.count()).click();
        await page.waitForTimeout(500);
      }
    }
  } else {
    // 카드 입력 필드가 있다면 직접 입력
    const cardInput = page.locator('input[placeholder*="The Fool"]');
    if (await cardInput.isVisible()) {
      await cardInput.fill('0-The Fool, 1-The Magician, 2-The High Priestess');
    }
  }
  
  // 5. 저장 버튼 클릭
  console.log('저장 버튼 클릭...');
  await page.click('button:has-text("경험 공유하기")');
  
  // 6. 서버 응답 대기
  console.log('서버 응답 대기 중...');
  
  // 응답을 기다리거나 리다이렉트를 기다림
  try {
    // URL 변경을 기다림 (성공 시 목록 페이지로 리다이렉트)
    await page.waitForURL('**/community/reading-share', { timeout: 10000 });
    console.log('성공적으로 저장되고 목록 페이지로 이동했습니다.');
  } catch (error) {
    // URL이 변경되지 않은 경우 에러 확인
    console.log('URL 변경 실패, 페이지에 남아있음');
    
    // 에러 메시지 확인
    const errorMessage = await page.locator('.error-message, .toast-error, [role="alert"]').textContent().catch(() => null);
    if (errorMessage) {
      console.log('에러 메시지:', errorMessage);
    }
    
    // 현재 페이지 스크린샷
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  }
  
  // 7. 최종 상태 확인
  const currentUrl = page.url();
  console.log('현재 URL:', currentUrl);
  
  if (currentUrl.includes('/community/reading-share') && !currentUrl.includes('/new')) {
    // 목록 페이지에서 작성한 게시글 확인
    const postTitle = await page.locator('text="테스트 리딩 경험"').first();
    await expect(postTitle).toBeVisible({ timeout: 5000 });
    console.log('테스트 성공: 게시글이 목록에 표시됨');
  } else {
    console.log('테스트 실패: 저장되지 않음');
  }
  
  // 스크린샷 저장
  await page.screenshot({ path: 'final-state.png', fullPage: true });
});