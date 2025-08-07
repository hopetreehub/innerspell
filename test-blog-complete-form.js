const { chromium } = require('playwright');

(async () => {
  console.log('블로그 포스트 완전한 폼 입력 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 응답 모니터링
  page.on('response', response => {
    if (response.url().includes('/api/blog/mdx-posts') && response.request().method() === 'POST') {
      console.log(`POST 응답: ${response.status()}`);
    }
  });

  try {
    // 1. 관리자 페이지 접속
    console.log('1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 2. 블로그 관리 탭 클릭
    console.log('2. 블로그 관리 탭 클릭...');
    const blogTab = await page.locator('button:has-text("블로그 관리")').first();
    await blogTab.click();
    await page.waitForTimeout(2000);
    
    // 3. 새 포스트 버튼 클릭
    console.log('3. 새 포스트 버튼 클릭...');
    const newPostButton = await page.locator('button:has-text("새 포스트")').first();
    await newPostButton.click();
    await page.waitForTimeout(2000);
    
    // 4. 모든 필드 입력
    console.log('4. 폼 필드 입력...');
    
    // 제목 입력
    const titleInput = await page.locator('input[placeholder*="제목"]').first();
    await titleInput.fill('CSRF 수정 후 테스트 포스트');
    console.log('제목 입력 완료');
    
    // 요약은 본문에서 자동 생성되므로 스킵
    
    // 카테고리 선택
    console.log('카테고리 선택...');
    const categoryDropdown = await page.locator('button[role="combobox"]').first();
    await categoryDropdown.click();
    await page.waitForTimeout(500);
    
    // 카테고리 옵션 선택 (타로, 초보자, 가이드 등)
    const categoryOption = await page.locator('[role="option"]').first();
    if (await categoryOption.isVisible()) {
      await categoryOption.click();
      console.log('카테고리 선택 완료');
    }
    
    // 본문 입력
    const contentTextarea = await page.locator('textarea').first();
    await contentTextarea.fill('# CSRF 문제 해결 완료!\n\n이제 블로그 포스트를 정상적으로 저장할 수 있습니다.\n\n## 수정 내용\n\n- CSRF 미들웨어 수정\n- API 라우트 예외 처리 추가\n- 정상 작동 확인');
    console.log('본문 입력 완료');
    
    // 태그 입력
    const tagsInput = await page.locator('input[placeholder*="태그"]').first();
    if (await tagsInput.isVisible()) {
      await tagsInput.fill('테스트, CSRF, 블로그');
      console.log('태그 입력 완료');
    }
    
    // 이미지 URL은 선택사항이므로 스킵
    
    // 주장 포스트 체크박스는 선택사항
    
    await page.waitForTimeout(1000);
    
    // 입력 완료 스크린샷
    await page.screenshot({ 
      path: 'screenshots/complete-form-filled.png',
      fullPage: true 
    });
    console.log('완전한 폼 입력 스크린샷 저장됨');
    
    // 5. 저장 버튼 클릭
    console.log('5. 저장 버튼 클릭...');
    const saveButton = await page.locator('button:has-text("저장")').first();
    
    // 응답 대기와 함께 저장
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/blog/mdx-posts') && 
                  response.request().method() === 'POST',
      { timeout: 10000 }
    );
    
    await saveButton.click();
    console.log('저장 버튼 클릭됨');
    
    try {
      const response = await responsePromise;
      console.log(`\n✅ API 응답 상태: ${response.status()}`);
      
      if (response.status() === 200 || response.status() === 201) {
        console.log('🎉 포스트 저장 성공!');
        const responseData = await response.json();
        console.log('저장된 포스트 ID:', responseData.id);
        console.log('저장된 포스트 제목:', responseData.title);
      } else {
        console.log('❌ 저장 실패');
        const responseText = await response.text();
        console.log('에러 응답:', responseText);
      }
    } catch (error) {
      console.log('API 응답 대기 중 타임아웃 또는 에러:', error.message);
    }
    
    // 6. 결과 확인
    await page.waitForTimeout(3000);
    
    // 성공 메시지 또는 에러 메시지 확인
    const toastMessage = await page.locator('[role="status"]').first();
    if (await toastMessage.isVisible()) {
      const messageText = await toastMessage.textContent();
      console.log('토스트 메시지:', messageText);
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'screenshots/final-save-result.png',
      fullPage: true 
    });
    console.log('최종 결과 스크린샷 저장됨');
    
    // 7. 포스트 목록 확인
    console.log('\n6. 포스트 목록 확인...');
    
    // 모달이 닫혔는지 확인
    const modal = await page.locator('[role="dialog"]').first();
    if (await modal.isVisible()) {
      // X 버튼이나 취소 버튼 클릭하여 모달 닫기
      const closeButton = await page.locator('button[aria-label="Close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        const cancelButton = await page.locator('button:has-text("취소")').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
      await page.waitForTimeout(1000);
    }
    
    // 블로그 탭 다시 클릭하여 목록 새로고침
    await blogTab.click();
    await page.waitForTimeout(2000);
    
    // 새로 추가된 포스트 확인
    const newPost = await page.locator('text="CSRF 수정 후 테스트 포스트"').first();
    if (await newPost.isVisible()) {
      console.log('✅ 새 포스트가 목록에 추가됨!');
    } else {
      console.log('⚠️ 새 포스트가 목록에 보이지 않음');
    }
    
    // 목록 스크린샷
    await page.screenshot({ 
      path: 'screenshots/blog-list-after-save.png',
      fullPage: true 
    });
    console.log('블로그 목록 스크린샷 저장됨');
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    
    await page.screenshot({ 
      path: 'screenshots/test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n테스트 완료');
  }
})();