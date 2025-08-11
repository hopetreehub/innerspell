import { test, expect } from '@playwright/test';

test('리딩 경험 공유 저장 및 목록 확인', async ({ page }) => {
  // 1. 리딩 경험 공유 페이지로 이동
  await page.goto('http://localhost:4000/community/reading-share/new');
  
  // 페이지 로드 대기
  await page.waitForLoadState('networkidle');
  
  // 2. 폼에 테스트 데이터 입력
  // 제목 입력 - id="title" 사용
  await page.fill('#title', '테스트 리딩 경험');
  
  // 내용 입력 - id="content" 사용
  await page.fill('#content', '테스트 리딩 내용입니다. 이것은 자동화된 테스트를 위한 내용입니다.');
  
  // 스프레드 타입 선택 - 버튼을 클릭하여 드롭다운 열기
  const spreadButton = page.locator('button:has-text("스프레드를 선택하세요")');
  await spreadButton.click();
  
  // 드롭다운 메뉴가 나타날 때까지 대기
  await page.waitForTimeout(500);
  
  // 3카드 스프레드 선택
  await page.click('text="3카드 스프레드"');
  
  // 선택된 카드 입력 필드에 카드 이름 입력
  const cardInput = page.locator('input[placeholder*="The Fool, Three of Cups"]');
  await cardInput.fill('The Fool, The Magician, The High Priestess');
  
  // 콘솔 로그 캡처 설정
  page.on('console', msg => {
    console.log(`브라우저 콘솔 [${msg.type()}]:`, msg.text());
  });
  
  // 네트워크 요청 로깅
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('>> API 요청:', request.method(), request.url());
      if (request.method() === 'POST' || request.method() === 'PUT') {
        console.log('>> 요청 데이터:', request.postData());
      }
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log('<< API 응답:', response.status(), response.url());
    }
  });
  
  // 3. 저장 버튼 클릭
  console.log('저장 버튼 클릭 시작...');
  const saveButton = page.locator('button:has-text("경험 공유하기")');
  await saveButton.click();
  
  // 4. 서버 로그를 확인하기 위해 3초 대기
  console.log('서버 응답 대기 중...');
  await page.waitForTimeout(3000);
  
  // API 응답이나 리다이렉트 대기
  await page.waitForLoadState('networkidle');
  
  // 5. 리딩 경험 목록 페이지로 이동
  console.log('목록 페이지로 이동...');
  await page.goto('http://localhost:4000/community/reading-share');
  
  // 페이지 로드 대기
  await page.waitForLoadState('networkidle');
  
  // 6. 방금 작성한 게시글이 목록에 나타나는지 확인
  console.log('게시글 확인 중...');
  const postTitle = await page.locator('text="테스트 리딩 경험"').first();
  
  // 게시글이 존재하는지 확인
  await expect(postTitle).toBeVisible({ timeout: 10000 });
  
  console.log('테스트 완료: 게시글이 성공적으로 저장되고 목록에 표시됨');
  
  // 스크린샷 저장
  await page.screenshot({ path: 'reading-share-list-result.png', fullPage: true });
});