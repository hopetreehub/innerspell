import { test, expect } from '@playwright/test';

test('리딩 경험 공유 전체 흐름 테스트', async ({ page }) => {
  // 콘솔 로그 캡처
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`브라우저 콘솔 에러:`, msg.text());
    }
  });
  
  // 네트워크 요청 로깅
  page.on('request', request => {
    if (request.url().includes('/community/reading-share') && request.method() === 'POST') {
      console.log('>> POST 요청 발생:', request.url());
      console.log('>> 요청 데이터:', request.postData());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/community/reading-share') && response.request().method() === 'POST') {
      console.log('<< POST 응답:', response.status(), response.url());
    }
  });

  // 1. 페이지로 이동
  console.log('1. 리딩 경험 공유 페이지로 이동...');
  await page.goto('http://localhost:4000/community/reading-share/new');
  await page.waitForLoadState('networkidle');
  
  // 2. 제목 입력
  console.log('2. 제목 입력...');
  await page.fill('#title', '테스트 리딩 경험 - Playwright 자동화 테스트');
  
  // 3. 스프레드 타입 선택
  console.log('3. 스프레드 타입 선택...');
  await page.selectOption('select', 'three-card');
  
  // 4. 내용 입력 (50자 이상)
  console.log('4. 내용 입력...');
  const content = `이것은 자동화 테스트를 위한 리딩 경험 공유입니다. 
타로 카드를 통해 얻은 통찰력을 공유하고 있습니다. 
Three of Cups는 축하와 우정을, The Fool은 새로운 시작을, 
The Magician은 의지와 창조력을 나타냅니다.`;
  await page.fill('#content', content);
  
  // 5. 카드 추가 (3개)
  console.log('5. 카드 추가...');
  const cards = ['The Fool', 'The Magician', 'Three of Cups'];
  const cardInput = page.locator('input[placeholder*="The Fool"]');
  
  for (const card of cards) {
    await cardInput.fill(card);
    
    // "사용한 카드들" 레이블을 찾고 그 석션 내의 버튼 찾기
    const cardSectionLabel = page.locator('text="사용한 카드들 *"');
    const cardInputSection = cardSectionLabel.locator('..').locator('..');
    const addButton = cardInputSection.locator('div:has(input[placeholder*="The Fool"]) button[type="button"]:has(svg)');
    
    // 또는 직접 5번째 버튼 클릭 (위 에러에서 5번째가 카드 추가 버튼)
    const allButtons = page.locator('button:has(svg)');
    await allButtons.nth(4).click(); // 0-based index, so 4 is the 5th button
    
    await page.waitForTimeout(500); // 카드 추가 애니메이션 대기
    
    // 카드가 추가되었는지 확인
    const cardBadges = page.locator('div').filter({ hasText: card }).filter({ has: page.locator('svg') });
    const badgeCount = await cardBadges.count();
    if (badgeCount > 0) {
      console.log(`  - ${card} 추가됨`);
    } else {
      console.log(`  - ${card} 추가 실패`);
    }
  }
  
  // 6. 태그 추가 (선택사항)
  console.log('6. 태그 추가...');
  await page.click('text="첫리딩"'); // 추천 태그 클릭
  await page.click('text="적중"'); // 추천 태그 클릭
  
  // 7. 저장 버튼 클릭
  console.log('7. 저장 버튼 클릭...');
  await page.click('button:has-text("경험 공유하기")');
  
  // 8. 응답 대기 및 결과 확인
  console.log('8. 서버 응답 대기...');
  
  try {
    // 성공 시 목록 페이지로 리다이렉트
    await page.waitForURL('**/community/reading-share', { timeout: 10000 });
    console.log('✅ 성공적으로 저장되고 목록 페이지로 이동했습니다.');
    
    // 목록에서 방금 작성한 게시글 확인
    const postTitle = page.locator('text="테스트 리딩 경험 - Playwright 자동화 테스트"').first();
    await expect(postTitle).toBeVisible({ timeout: 5000 });
    console.log('✅ 게시글이 목록에 표시됩니다.');
    
    // 성공 스크린샷
    await page.screenshot({ path: 'test-success.png', fullPage: true });
    
  } catch (error) {
    console.log('❌ 저장 실패 또는 리다이렉트 실패');
    
    // 에러 메시지 확인
    const toastError = page.locator('.toast-error, [role="alert"]');
    if (await toastError.isVisible()) {
      const errorText = await toastError.textContent();
      console.log('에러 메시지:', errorText);
    }
    
    // 실패 스크린샷
    await page.screenshot({ path: 'test-failed.png', fullPage: true });
    
    // 서버 로그 확인을 위해 잠시 대기
    await page.waitForTimeout(2000);
    
    throw error;
  }
  
  console.log('테스트 완료!');
});