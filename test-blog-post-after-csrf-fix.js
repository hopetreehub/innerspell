const { chromium } = require('playwright');

(async () => {
  console.log('CSRF 수정 후 블로그 포스트 저장 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 메시지 로깅
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('브라우저 콘솔 에러:', msg.text());
    }
  });
  
  // 네트워크 요청 모니터링
  page.on('response', response => {
    if (response.url().includes('/api/') && response.status() !== 200) {
      console.log(`API 응답: ${response.url()} - 상태: ${response.status()}`);
    }
  });

  try {
    // 1. 관리자 페이지 접속
    console.log('1. 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(2000);
    
    // 2. 블로그 관리 탭 찾기 및 클릭
    console.log('2. 블로그 관리 탭 클릭...');
    const blogTab = await page.locator('button:has-text("블로그 관리")').first();
    await blogTab.click();
    await page.waitForTimeout(1000);
    
    // 3. 새 포스트 버튼 클릭
    console.log('3. 새 포스트 버튼 클릭...');
    const newPostButton = await page.locator('button:has-text("새 포스트")').first();
    await newPostButton.click();
    await page.waitForTimeout(1000);
    
    // 4. 폼 필드 입력
    console.log('4. 포스트 정보 입력...');
    
    // 제목 입력
    const titleInput = await page.locator('input[placeholder*="제목"]').first();
    await titleInput.fill('CSRF 수정 후 테스트');
    
    // 요약 입력
    const summaryInput = await page.locator('input[placeholder*="요약"]').first();
    await summaryInput.fill('미들웨어 수정 후 포스트 저장 테스트');
    
    // 본문 입력 (textarea)
    const contentTextarea = await page.locator('textarea').first();
    await contentTextarea.fill('# 성공!\n\nCSRF 문제가 해결되었습니다.\n\n이제 블로그 포스트를 정상적으로 저장할 수 있습니다.');
    
    await page.waitForTimeout(500);
    
    // 5. 저장 버튼 클릭 전 스크린샷
    await page.screenshot({ 
      path: 'screenshots/blog-post-form-filled.png',
      fullPage: true 
    });
    console.log('폼 입력 완료 스크린샷 저장됨');
    
    // 6. 저장 버튼 클릭
    console.log('5. 저장 버튼 클릭...');
    const saveButton = await page.locator('button:has-text("저장")').first();
    
    // 네트워크 응답 대기
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/blog/mdx-posts') && 
        response.request().method() === 'POST',
        { timeout: 10000 }
      ),
      saveButton.click()
    ]);
    
    console.log(`저장 API 응답 상태: ${response.status()}`);
    
    if (response.status() === 200 || response.status() === 201) {
      console.log('✅ 포스트 저장 성공!');
      const responseData = await response.json();
      console.log('응답 데이터:', JSON.stringify(responseData, null, 2));
    } else {
      console.log('❌ 포스트 저장 실패');
      console.log('응답 상태:', response.status());
      const responseText = await response.text();
      console.log('응답 내용:', responseText);
    }
    
    // 7. 결과 대기
    await page.waitForTimeout(2000);
    
    // 8. 성공 메시지 확인
    const successMessage = await page.locator('text=/성공|저장되었습니다|완료/i').first();
    if (await successMessage.isVisible()) {
      console.log('✅ 성공 메시지 확인됨');
    }
    
    // 9. 최종 스크린샷
    await page.screenshot({ 
      path: 'screenshots/blog-post-save-result.png',
      fullPage: true 
    });
    console.log('최종 결과 스크린샷 저장됨');
    
    // 10. 포스트 목록 확인
    console.log('6. 포스트 목록 확인...');
    // 블로그 관리 탭 다시 클릭하여 목록 새로고침
    await blogTab.click();
    await page.waitForTimeout(2000);
    
    // 새로 추가된 포스트 확인
    const newPost = await page.locator('text="CSRF 수정 후 테스트"').first();
    if (await newPost.isVisible()) {
      console.log('✅ 새 포스트가 목록에 표시됨!');
      
      // 목록 스크린샷
      await page.screenshot({ 
        path: 'screenshots/blog-post-list-after-save.png',
        fullPage: true 
      });
      console.log('포스트 목록 스크린샷 저장됨');
    } else {
      console.log('⚠️ 새 포스트가 목록에 보이지 않음');
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    
    // 에러 발생 시 스크린샷
    await page.screenshot({ 
      path: 'screenshots/blog-post-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('테스트 완료');
  }
})();